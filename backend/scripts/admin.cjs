// Ejecutar después de registrar una cuenta: node --env-file=.env scripts/admin.cjs correo
const mysql = require('mysql2/promise');
async function main() {
  const correo = process.argv[2]?.trim().toLowerCase();
  if (!correo || !correo.includes('@')) throw new Error('Indica el correo de una cuenta existente');
  const db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, database: process.env.DB_DATABASE });
  try {
    const [resultado] = await db.execute("UPDATE usuarios SET rol = 'admin' WHERE correo = ? AND activo = true", [correo]);
    if (!resultado.affectedRows) throw new Error('No se encontró una cuenta activa con ese correo');
    console.log('Cuenta promovida a administrador. Inicia sesión de nuevo.');
  } finally { await db.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
