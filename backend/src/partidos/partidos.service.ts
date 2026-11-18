import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Partido } from './entities/partido.entity';
import { Torneo } from '../torneos/entities/torneo.entity';
import { EstadoInscripcion, Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { CrearPartidoDto } from './dto/crear-partido.dto';
@Injectable()
export class PartidosService {
 constructor(@InjectRepository(Partido) private readonly partidos: Repository<Partido>, private readonly data: DataSource) {}
 findAll(torneoId?: number) { return this.partidos.find({ where: torneoId ? { torneoId } : {}, relations: { torneo: true, equipoLocal: true, equipoVisitante: true }, order: { fechaHora: 'ASC', id: 'ASC' } }); }
 async findOne(id: number) {
  const partido = await this.partidos.findOne({ where: { id }, relations: { torneo: true, equipoLocal: true, equipoVisitante: true } });
  if (!partido) throw new NotFoundException('Partido no encontrado');
  return partido;
 }
 async create(dto: CrearPartidoDto) {
  if (dto.equipoLocalId === dto.equipoVisitanteId) throw new BadRequestException('Los equipos deben ser distintos');
  const id = await this.data.transaction(async manager => {
   const torneo = await manager.findOne(Torneo, { where: { id: dto.torneoId }, lock: { mode: 'pessimistic_write' } });
   if (!torneo) throw new NotFoundException('Torneo no encontrado');
   if (['CANCELADO', 'FINALIZADO'].includes(torneo.estado)) throw new BadRequestException('El torneo no admite nuevos partidos');
   if (new Date(dto.fechaHora) < new Date(torneo.fechaInicio)) throw new BadRequestException('El partido debe comenzar después del inicio del torneo');
   const inscripciones = await manager.find(Inscripcion, { where: { torneoId: dto.torneoId, equipoId: In([dto.equipoLocalId, dto.equipoVisitanteId]), estado: EstadoInscripcion.CONFIRMADA } });
   if (inscripciones.length !== 2) throw new BadRequestException('Ambos equipos deben estar inscritos en el torneo');
   const partido = manager.create(Partido, { ...dto, fechaHora: new Date(dto.fechaHora), estado: 'PROGRAMADO' as const });
   return (await manager.save(partido)).id;
  });
  return this.findOne(id);
 }
}
