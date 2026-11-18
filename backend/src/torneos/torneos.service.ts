import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrearTorneoDto, ActualizarTorneoDto } from './dto/crear-torneo.dto';
import { Torneo } from './entities/torneo.entity';

@Injectable()
export class TorneosService {
  constructor(@InjectRepository(Torneo) private readonly torneos: Repository<Torneo>) {}

  findAll() { return this.torneos.find({ order: { fechaInicio: 'ASC', id: 'ASC' } }); }

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
    const torneo = await this.findOne(id);
    const { fechaInicio, cierreInscripcion, ...datos } = dto;
    Object.assign(torneo, datos);
    if (fechaInicio !== undefined) torneo.fechaInicio = new Date(fechaInicio);
    if (cierreInscripcion !== undefined) torneo.cierreInscripcion = new Date(cierreInscripcion);
    this.validarFechas(torneo);
    return this.torneos.save(torneo);
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
