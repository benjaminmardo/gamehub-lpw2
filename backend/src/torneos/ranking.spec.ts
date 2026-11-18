import { calcularRanking } from './ranking';
describe('Ranking oficial', () => {
 const equipos = [{ id: 1, nombre: 'Alpha' }, { id: 2, nombre: 'Beta' }, { id: 3, nombre: 'Gamma' }];
 it('incluye inscritos sin partidos con cero puntos', () => {
  expect(calcularRanking(equipos, [])).toHaveLength(3);
  expect(calcularRanking(equipos, []).every(e => e.puntos === 0 && e.jugados === 0)).toBe(true);
 });
 it('asigna 3 por victoria y 0 por derrota', () => {
  const ranking = calcularRanking(equipos, [{ equipoLocalId: 1, equipoVisitanteId: 2, puntajeLocal: 3, puntajeVisitante: 1 }]);
  expect(ranking[0]).toMatchObject({ equipoId: 1, puntos: 3, victorias: 1, diferencia: 2 });
  expect(ranking.find(e => e.equipoId === 2)).toMatchObject({ puntos: 0, derrotas: 1, diferencia: -2 });
 });
 it('asigna un punto a cada equipo en empate', () => {
  const ranking = calcularRanking(equipos, [{ equipoLocalId: 2, equipoVisitanteId: 1, puntajeLocal: 2, puntajeVisitante: 2 }]);
  expect(ranking.slice(0, 2).map(e => e.puntos)).toEqual([1, 1]);
  expect(ranking[0].empates).toBe(1);
 });
 it('acumula partidos y reconoce la victoria visitante', () => {
  const ranking = calcularRanking(equipos, [{ equipoLocalId: 1, equipoVisitanteId: 2, puntajeLocal: 0, puntajeVisitante: 2 }, { equipoLocalId: 2, equipoVisitanteId: 3, puntajeLocal: 1, puntajeVisitante: 1 }]);
  expect(ranking[0]).toMatchObject({ equipoId: 2, puntos: 4, jugados: 2, victorias: 1, empates: 1 });
 });
 it('desempata por diferencia y luego nombre', () => {
  const ranking = calcularRanking(equipos, [{ equipoLocalId: 2, equipoVisitanteId: 3, puntajeLocal: 5, puntajeVisitante: 0 }, { equipoLocalId: 1, equipoVisitanteId: 3, puntajeLocal: 1, puntajeVisitante: 0 }]);
  expect(ranking.map(e => e.equipoId)).toEqual([2, 1, 3]);
  expect(calcularRanking([...equipos].reverse(), []).map(e => e.nombre)).toEqual(['Alpha', 'Beta', 'Gamma']);
 });
 it('recalcula sin mutar equipos ni duplicar puntos de ejecuciones anteriores', () => {
  const resultados = [{ equipoLocalId: 1, equipoVisitanteId: 2, puntajeLocal: 1, puntajeVisitante: 0 }];
  expect(calcularRanking(equipos, resultados)).toEqual(calcularRanking(equipos, resultados));
  expect(equipos[0]).not.toHaveProperty('puntos');
 });
});
