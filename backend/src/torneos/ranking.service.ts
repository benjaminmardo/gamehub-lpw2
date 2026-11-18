import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Torneo } from './entities/torneo.entity';
import { EstadoInscripcion, Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { Resultado } from '../resultados/entities/resultado.entity';
import { calcularRanking } from './ranking';
@Injectable()
export class RankingService {
 constructor(@InjectRepository(Torneo) private readonly torneos: Repository<Torneo>, @InjectRepository(Inscripcion) private readonly inscripciones: Repository<Inscripcion>, @InjectRepository(Resultado) private readonly resultados: Repository<Resultado>) {}
 async ranking(torneoId: number) {
  if (!(await this.torneos.existsBy({ id: torneoId }))) throw new NotFoundException('Torneo no encontrado');
  const inscritos = await this.inscripciones.find({ where: { torneoId, estado: EstadoInscripcion.CONFIRMADA }, relations: { equipo: true } });
  const resultados = await this.resultados.find({ where: { partido: { torneoId } }, relations: { partido: true } });
  return calcularRanking(inscritos.map(i => i.equipo), resultados.map(r => ({ equipoLocalId: r.partido.equipoLocalId, equipoVisitanteId: r.partido.equipoVisitanteId, puntajeLocal: r.puntajeLocal, puntajeVisitante: r.puntajeVisitante })));
 }
}
