import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { FiltrarTorneosDto } from './dto/filtrar-torneos.dto';
import { CrearTorneoDto, ActualizarTorneoDto } from './dto/crear-torneo.dto';
import { EstadoInscripcion, Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { Torneo } from './entities/torneo.entity';
import { Partido } from '../partidos/entities/partido.entity';

@Injectable()
export class TorneosService {
  constructor(@InjectRepository(Torneo) private readonly torneos: Repository<Torneo>) {}

  findAll(filtros: FiltrarTorneosDto = {}) {
    const query = this.torneos.createQueryBuilder('torneo');
    if (filtros.q) {
      query.andWhere(new Brackets((sub) => {
        sub.where('torneo.nombre LIKE :texto', { texto: '%' + filtros.q + '%' })
          .orWhere('torneo.videojuego LIKE :texto', { texto: '%' + filtros.q + '%' });
      }));
    }
    if (filtros.videojuego) query.andWhere('torneo.videojuego = :videojuego', { videojuego: filtros.videojuego });
    if (filtros.estado) query.andWhere('torneo.estado = :estado', { estado: filtros.estado });
    if (filtros.modalidad) query.andWhere('torneo.modalidad = :modalidad', { modalidad: filtros.modalidad });
    if (filtros.fecha) {
      const desde = new Date(filtros.fecha + 'T00:00:00.000Z');
      const hasta = new Date(desde.getTime() + 86_400_000);
      query.andWhere('torneo.fechaInicio >= :desde AND torneo.fechaInicio < :hasta', { desde, hasta });
    }
    return query.orderBy('torneo.fechaInicio', 'ASC').addOrderBy('torneo.id', 'ASC').getMany();
  }

  async findOne(id: number) {
    const torneo = await this.torneos.findOne({ where: { id } });
    if (!torneo) throw new NotFoundException('Torneo no encontrado');
    return torneo;
  }

  private validarFechas(torneo: Pick<Torneo, 'fechaInicio' | 'cierreInscripcion'>) {
    if (torneo.cierreInscripcion.getTime() > torneo.fechaInicio.getTime()) {
      throw new BadRequestException('El cierre de inscripción debe ser anterior o igual al inicio');
    }
  }

  async create(dto: CrearTorneoDto) {
    const torneo = this.torneos.create({ ...dto, fechaInicio: new Date(dto.fechaInicio), cierreInscripcion: new Date(dto.cierreInscripcion) });
    this.validarFechas(torneo);
    return this.torneos.save(torneo);
  }

  async update(id: number, dto: ActualizarTorneoDto) {
    return this.torneos.manager.transaction(async (manager) => {
      const torneo = await manager.findOne(Torneo, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!torneo) throw new NotFoundException('Torneo no encontrado');
      if (dto.permiteEmpate !== undefined && dto.permiteEmpate !== torneo.permiteEmpate && await manager.existsBy(Partido, { torneoId: id })) {
        throw new ConflictException('La regla de empate no puede cambiar cuando ya hay partidos programados');
      }
      const { fechaInicio, cierreInscripcion, ...datos } = dto;
      Object.assign(torneo, datos);
      if (fechaInicio !== undefined) torneo.fechaInicio = new Date(fechaInicio);
      if (cierreInscripcion !== undefined) torneo.cierreInscripcion = new Date(cierreInscripcion);
      this.validarFechas(torneo);
      const ocupados = await manager.count(Inscripcion, { where: { torneoId: id, estado: EstadoInscripcion.CONFIRMADA } });
      if (torneo.cupoMaximo < ocupados) throw new ConflictException('El cupo no puede ser menor a los equipos inscritos');
      return manager.save(Torneo, torneo);
    });
  }

  async remove(id: number) {
    const torneo = await this.findOne(id);
    try { await this.torneos.remove(torneo); }
    catch (error) {
      if ((error as { code?: string }).code === 'ER_ROW_IS_REFERENCED_2') throw new ConflictException('El torneo tiene actividad; cambia su estado a CANCELADO');
      throw error;
    }
    return { mensaje: 'Torneo eliminado' };
  }
}
