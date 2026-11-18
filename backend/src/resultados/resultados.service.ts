import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Resultado } from './entities/resultado.entity';
import { Partido } from '../partidos/entities/partido.entity';
import { CrearResultadoDto } from './dto/crear-resultado.dto';
@Injectable()
export class ResultadosService {
 constructor(@InjectRepository(Resultado) private readonly resultados: Repository<Resultado>, private readonly data: DataSource) {}
 findAll(partidoId?: number) { return this.resultados.find({ where: partidoId ? { partidoId } : {}, relations: { ganador: true }, order: { id: 'ASC' } }); }
 async create(dto: CrearResultadoDto, registradoPor: number) {
  return this.data.transaction(async manager => {
   const partido = await manager.findOne(Partido, { where: { id: dto.partidoId }, lock: { mode: 'pessimistic_write' } });
   if (!partido) throw new NotFoundException('Partido no encontrado');
   if (await manager.existsBy(Resultado, { partidoId: dto.partidoId })) throw new ConflictException('El partido ya tiene un resultado oficial');
   const completo = await manager.findOneOrFail(Partido, { where: { id: partido.id }, relations: { torneo: true } });
   if (completo.torneo.estado === 'CANCELADO') throw new BadRequestException('El torneo está cancelado');
   if (dto.puntajeLocal === dto.puntajeVisitante && !completo.torneo.permiteEmpate) throw new BadRequestException('Este torneo no permite empates');
   const ganadorId = dto.puntajeLocal === dto.puntajeVisitante ? null : dto.puntajeLocal > dto.puntajeVisitante ? partido.equipoLocalId : partido.equipoVisitanteId;
   const resultado = await manager.save(manager.create(Resultado, { ...dto, ganadorId, registradoPor }));
   partido.estado = 'FINALIZADO';
   await manager.save(partido);
   return resultado;
  });
 }
}
