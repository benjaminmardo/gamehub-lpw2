/* Run from backend after npm run build: node --env-file=.env test/smoke.cjs */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const mysql = require('mysql2/promise');

const port = Number(process.env.API_PORT || 3100);
const base = `http://127.0.0.1:${port}`;
const suffix = `smk_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
const password = randomBytes(18).toString('base64url');
const users = [
  { nombre: 'Smoke Administrador', alias: `${suffix}_admin`, correo: `${suffix}_admin@example.test`, password },
  { nombre: 'Smoke Estudiante', alias: `${suffix}_est`, correo: `${suffix}_est@example.test`, password },
];
const teamNames = [1, 2, 3].map(n => `${suffix}_Equipo${n}`);
const tournamentName = `${suffix}_Torneo`;
const game = `${suffix}_Juego`;
let child, db, logs = '', checks = 0;
const cleanupErrors = [];

function check(label, condition) {
  assert.ok(condition, label);
  checks++;
}

async function send(method, endpoint, body, token) {
  const response = await fetch(base + endpoint, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(10000),
  });
  return { status: response.status, data: await response.json().catch(() => null) };
}

async function expectStatus(method, endpoint, body, token, expected) {
  const response = await send(method, endpoint, body, token);
  assert.equal(response.status, expected, `${method} ${endpoint}: esperado ${expected}, recibido ${response.status}; ${JSON.stringify(response.data).slice(0, 250)}`);
  checks++;
  return response.data;
}

function hasPassword(value) {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(([key, nested]) => /password|passwordHash|contrasena/i.test(key) || hasPassword(nested));
}

async function ensureFreePort() {
  check('API_PORT debe ser un puerto válido', Number.isInteger(port) && port > 0 && port <= 65535);
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

async function startApi() {
  await ensureFreePort();
  child = spawn(process.execPath, [path.resolve('dist/main.js')], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port) },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let launchError;
  child.once('error', error => { launchError = error; });
  const capture = chunk => { logs = (logs + chunk.toString()).slice(-40000); };
  child.stdout.on('data', capture);
  child.stderr.on('data', capture);
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (launchError) throw launchError;
    if (child.exitCode !== null) throw new Error(`La API terminó antes de iniciar (código ${child.exitCode}).`);
    try {
      const response = await fetch(`${base}/api-json`, { signal: AbortSignal.timeout(800) });
      if (response.ok) return response.json();
    } catch { /* Esperar a que Nest y MySQL terminen de iniciar. */ }
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('La API no estuvo disponible en /api-json dentro de 10 segundos.');
}

async function cleanup() {
  if (!db) return;
  // Recover IDs by exact generated names if an HTTP response failed after its INSERT.
  const [generatedUsers] = await db.execute('SELECT id FROM usuarios WHERE correo IN (?, ?) AND alias IN (?, ?)', [users[0].correo, users[1].correo, users[0].alias, users[1].alias]);
  const userIds = generatedUsers.map(row => row.id);
  const [generatedTournaments] = await db.execute('SELECT id FROM torneos WHERE nombre = ?', [tournamentName]);
  const torneoIds = generatedTournaments.map(row => row.id);
  let equipoIds = [];
  if (userIds.length) {
    const [rows] = await db.query('SELECT id FROM equipos WHERE nombre IN (?) AND capitanId IN (?)', [teamNames, userIds]);
    equipoIds = rows.map(row => row.id);
  }
  if (torneoIds.length) {
    await db.query('DELETE r FROM resultados r INNER JOIN partidos p ON p.id = r.partidoId WHERE p.torneoId IN (?)', [torneoIds]);
    await db.query('DELETE FROM partidos WHERE torneoId IN (?)', [torneoIds]);
    await db.query('DELETE FROM inscripciones WHERE torneoId IN (?)', [torneoIds]);
  }
  if (equipoIds.length) {
    const [columns] = await db.execute("SELECT COLUMN_NAME AS name FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipo_integrantes' AND REFERENCED_TABLE_NAME = 'equipos'");
    assert.equal(columns.length, 1, 'No se pudo identificar la FK de equipo_integrantes para limpiar solo los equipos de prueba');
    const column = columns[0].name;
    assert.match(column, /^[A-Za-z0-9_]+$/);
    await db.query(`DELETE FROM equipo_integrantes WHERE ${db.escapeId(column)} IN (?)`, [equipoIds]);
    await db.query('DELETE FROM equipos WHERE id IN (?)', [equipoIds]);
  }
  if (torneoIds.length) await db.query('DELETE FROM torneos WHERE id IN (?)', [torneoIds]);
  if (userIds.length) await db.query('DELETE FROM usuarios WHERE id IN (?)', [userIds]);
}

async function stopApi() {
  if (!child || child.exitCode !== null) return;
  const closed = new Promise(resolve => child.once('close', resolve));
  child.kill();
  await Promise.race([closed, new Promise(resolve => setTimeout(resolve, 3000))]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function run() {
  const swagger = await startApi();
  db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'gamehub_lpw2',
    timezone: 'Z',
  });
  const admin = await expectStatus('POST', '/auth/registro', users[0], null, 201);
  const student = await expectStatus('POST', '/auth/registro', users[1], null, 201);
  check('Registro público nunca crea administradores', admin.rol === 'estudiante' && student.rol === 'estudiante');
  check('Registro excluye contraseñas', !hasPassword(admin) && !hasPassword(student));
  await db.execute('UPDATE usuarios SET rol = ? WHERE id = ? AND correo = ?', ['admin', admin.id, users[0].correo]);
  const adminSession = await expectStatus('POST', '/auth/login', { correo: users[0].correo, password }, null, 200);
  const studentSession = await expectStatus('POST', '/auth/login', { correo: users[1].correo, password }, null, 200);
  check('JWT y roles reflejan MySQL', Boolean(adminSession.access_token) && adminSession.usuario.rol === 'admin' && studentSession.usuario.rol === 'estudiante');
  const adminToken = adminSession.access_token, studentToken = studentSession.access_token;
  await expectStatus('GET', '/usuarios/perfil', null, null, 401);
  await expectStatus('GET', '/usuarios', null, studentToken, 403);
  const teams = [];
  for (const nombre of teamNames) teams.push(await expectStatus('POST', '/equipos', { nombre, videojuego: game, descripcion: 'Datos efímeros de la prueba integral', integranteIds: [] }, adminToken, 201));
  await expectStatus('PATCH', `/equipos/${teams[0].id}`, { descripcion: 'Cambio ajeno' }, studentToken, 403);
  const allTeams = await expectStatus('GET', '/equipos', null, null, 200);
  check('Relaciones de equipos excluyen contraseñas', !hasPassword(allTeams));
  check('El capitán también es integrante', teams.every(team => team.capitanId === admin.id && team.integrantes.some(member => member.id === admin.id)));

  const now = Date.now(), hour = 3600000;
  const start = new Date(now + 48 * hour).toISOString();
  const tournamentBody = { nombre: tournamentName, videojuego: game, modalidad: 'LIGA', fechaInicio: start, cierreInscripcion: new Date(now + 24 * hour).toISOString(), cupoMaximo: 2, estado: 'ABIERTO', permiteEmpate: true };
  await expectStatus('POST', '/torneos', tournamentBody, studentToken, 403);
  const tournament = await expectStatus('POST', '/torneos', tournamentBody, adminToken, 201);
  await expectStatus('PATCH', `/torneos/${tournament.id}`, { nombre: `${tournamentName}_prohibido` }, studentToken, 403);
  await expectStatus('POST', '/inscripciones', { torneoId: tournament.id, equipoId: teams[0].id }, adminToken, 201);
  const simultaneous = await Promise.all(teams.slice(1).map(team => send('POST', '/inscripciones', { torneoId: tournament.id, equipoId: team.id }, adminToken).catch(error => ({ error }))));
  check('Las solicitudes concurrentes reciben respuesta HTTP', simultaneous.every(response => !response.error));
  assert.deepEqual(simultaneous.map(response => response.status).sort(), [201, 409], 'El último cupo debe aceptar exactamente una solicitud concurrente'); checks++;
  await expectStatus('POST', '/inscripciones', { torneoId: tournament.id, equipoId: teams[0].id }, adminToken, 409);
  const inscriptions = await expectStatus('GET', `/inscripciones?torneoId=${tournament.id}`, null, null, 200);
  check('La API mantiene exactamente dos inscripciones', inscriptions.length === 2);
  const [counts] = await db.execute('SELECT COUNT(*) AS total FROM inscripciones WHERE torneoId = ?', [tournament.id]);
  check('MySQL mantiene el cupo máximo bajo concurrencia', Number(counts[0].total) === 2);
  const localId = teams[0].id, visitorId = inscriptions.find(row => row.equipoId !== localId).equipoId;
  const outsiderId = teams.find(team => !inscriptions.some(row => row.equipoId === team.id)).id;
  const matchBody = { torneoId: tournament.id, equipoLocalId: localId, equipoVisitanteId: visitorId, fechaHora: new Date(now + 49 * hour).toISOString(), ronda: 'Jornada smoke' };
  await expectStatus('POST', '/partidos', { ...matchBody, equipoVisitanteId: localId }, adminToken, 400);
  await expectStatus('POST', '/partidos', { ...matchBody, equipoVisitanteId: outsiderId }, adminToken, 400);
  await expectStatus('POST', '/partidos', matchBody, studentToken, 403);
  const match = await expectStatus('POST', '/partidos', matchBody, adminToken, 201);
  const scoreBody = { partidoId: match.id, puntajeLocal: 3, puntajeVisitante: 1 };
  await expectStatus('POST', '/resultados', scoreBody, studentToken, 403);
  const score = await expectStatus('POST', '/resultados', scoreBody, adminToken, 201);
  check('El servidor calcula el ganador y el registrador', score.ganadorId === localId && score.registradoPor === admin.id);
  await expectStatus('POST', '/resultados', scoreBody, adminToken, 409);
  const finished = await expectStatus('GET', `/partidos/${match.id}`, null, null, 200);
  check('Guardar resultado finaliza el partido', finished.estado === 'FINALIZADO');
  let ranking = await expectStatus('GET', `/torneos/${tournament.id}/ranking`, null, null, 200);
  check('Victoria suma tres puntos y derrota cero', ranking.find(row => row.equipoId === localId)?.puntos === 3 && ranking.find(row => row.equipoId === visitorId)?.puntos === 0);
  const tiedMatch = await expectStatus('POST', '/partidos', { ...matchBody, ronda: 'Empate smoke', fechaHora: new Date(now + 50 * hour).toISOString() }, adminToken, 201);
  const tie = await expectStatus('POST', '/resultados', { partidoId: tiedMatch.id, puntajeLocal: 2, puntajeVisitante: 2 }, adminToken, 201);
  check('El empate oficial no tiene ganador', tie.ganadorId === null);
  ranking = await expectStatus('GET', `/torneos/${tournament.id}/ranking`, null, null, 200);
  check('Empate suma un punto a cada equipo', ranking.find(row => row.equipoId === localId)?.puntos === 4 && ranking.find(row => row.equipoId === visitorId)?.puntos === 1);
  check('Ranking acumula dos partidos y diferencia correcta', ranking.every(row => row.jugados === 2 && row.empates === 1) && ranking.find(row => row.equipoId === localId)?.diferencia === 2);
  const filters = new URLSearchParams({ q: suffix, videojuego: game, estado: 'ABIERTO', modalidad: 'LIGA', fecha: start.slice(0, 10) });
  const filtered = await expectStatus('GET', `/torneos?${filters}`, null, null, 200);
  check('Los cinco filtros combinables encuentran solo el torneo esperado', filtered.length === 1 && filtered[0].id === tournament.id);
  filters.set('estado', 'CANCELADO');
  const excluded = await expectStatus('GET', `/torneos?${filters}`, null, null, 200);
  check('Los filtros se combinan con AND', excluded.length === 0);
  const schemas = swagger.components?.schemas || {};
  check('Swagger incluye DTO de torneo y resultado con propiedades', Boolean(schemas.CrearTorneoDto?.properties?.cupoMaximo) && Boolean(schemas.CrearResultadoDto?.properties?.puntajeLocal));
  check('Swagger documenta seguridad y operación de resultados', Boolean(swagger.paths?.['/resultados']?.post?.summary) && Boolean(swagger.paths['/resultados'].post.security?.length));
}

(async () => {
  let failure;
  try { await run(); }
  catch (error) { failure = error; }
  finally {
    try { await cleanup(); } catch (error) { cleanupErrors.push(error.message); }
    try { if (db) await db.end(); } catch (error) { cleanupErrors.push(error.message); }
    try { await stopApi(); } catch (error) { cleanupErrors.push(error.message); }
  }
  if (failure || cleanupErrors.length) {
    if (failure) console.error(`SMOKE FAIL tras ${checks} comprobaciones: ${failure.stack || failure.message}`);
    if (cleanupErrors.length) console.error(`Limpieza incompleta (${suffix}): ${cleanupErrors.join('; ')}`);
    if (logs) console.error(`Últimos mensajes de la API:\n${logs.slice(-8000)}`);
    process.exitCode = 1;
  } else {
    console.log(`SMOKE OK: ${checks} comprobaciones HTTP/MySQL; concurrencia del último cupo, autorización, resultados, empate, ranking, filtros y Swagger. Datos efímeros eliminados.`);
  }
})();
