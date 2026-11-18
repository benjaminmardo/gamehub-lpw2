export interface FilaRanking {
 equipoId: number; nombre: string; jugados: number; victorias: number; empates: number; derrotas: number; puntos: number; aFavor: number; enContra: number; diferencia: number;
}
export interface Marcador { equipoLocalId: number; equipoVisitanteId: number; puntajeLocal: number; puntajeVisitante: number; }
export function calcularRanking(equipos: { id: number; nombre: string }[], resultados: Marcador[]): FilaRanking[] {
 const filas = new Map(equipos.map(equipo => [equipo.id, { equipoId: equipo.id, nombre: equipo.nombre, jugados: 0, victorias: 0, empates: 0, derrotas: 0, puntos: 0, aFavor: 0, enContra: 0, diferencia: 0 }]));
 for (const resultado of resultados) {
  const local = filas.get(resultado.equipoLocalId), visita = filas.get(resultado.equipoVisitanteId);
  if (!local || !visita) continue;
  local.jugados++; visita.jugados++;
  local.aFavor += resultado.puntajeLocal; local.enContra += resultado.puntajeVisitante;
  visita.aFavor += resultado.puntajeVisitante; visita.enContra += resultado.puntajeLocal;
  if (resultado.puntajeLocal === resultado.puntajeVisitante) { local.empates++; visita.empates++; local.puntos++; visita.puntos++; }
  else {
   const [ganador, perdedor] = resultado.puntajeLocal > resultado.puntajeVisitante ? [local, visita] : [visita, local];
   ganador.victorias++; ganador.puntos += 3; perdedor.derrotas++;
  }
 }
 return [...filas.values()].map(fila => ({ ...fila, diferencia: fila.aFavor - fila.enContra })).sort((a, b) => b.puntos - a.puntos || b.diferencia - a.diferencia || a.nombre.localeCompare(b.nombre));
}
