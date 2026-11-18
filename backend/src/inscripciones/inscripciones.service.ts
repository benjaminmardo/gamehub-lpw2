import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Equipo } from '../equipos/entities/equipo.entity';
import { EstadoTorneo, Torneo } from '../torneos/entities/torneo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { EstadoInscripcion, Inscripcion } from './entities/inscripcion.entity';

@Injectable()
export class InscripcionesService {
  constructor(@InjectRepository(Inscripcion) private readonly inscripciones: Repository<Inscripcion>, private readonly dataSource: DataSource) {}

  findAll(torneoId?: number) {
    return this.inscripciones.find({ where: torneoId ? { torneoId } : {}, relations: { equipo: { capitan: true }, torneo: true }, order: { fecha: 'ASC', id: 'ASC' } });
  }

  async create(dto: CrearInscripcionDto, actor: Usuario) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // All requests for the same tournament serialize on this row before checking available places.
        const torneo = await manager.findOne(Torneo, { where: { id: dto.torneoId }, lock: { mode: 'pessimistic_write' } });
        if (!torneo) throw new NotFoundException('Torneo no encontrado');
        const equipo = await manager.findOne(Equipo, { where: { id: dto.equipoId } });
        if (!equipo) throw new NotFoundException('Equipo no encontrado');
        if (equipo.capitanId !== actor.id && actor.rol !== 'admin') throw new ForbiddenException('Solo el capitán puede inscribir este equipo');
        if (torneo.estado !== EstadoTorneo.ABIERTO) throw new BadRequestException('El torneo no está abierto a inscripciones');
        if (Date.now() >= torneo.cierreInscripcion.getTime()) throw new BadRequestException('El plazo de inscripción terminó');
        const existente = await manager.findOne(Inscripcion, { where: { torneoId: dto.torneoId, equipoId: dto.equipoId } });
        if (existente) throw new ConflictException('Este equipo ya está inscrito en el torneo');
        const ocupados = await manager.count(Inscripcion, { where: { torneoId: dto.torneoId, estado: EstadoInscripcion.CONFIRMADA } });
        if (ocupados >= torneo.cupoMaximo) throw new ConflictException('Cupo lleno: no quedan plazas disponibles');
        const inscripcion = manager.create(Inscripcion, { ...dto, estado: EstadoInscripcion.CONFIRMADA });
        return manager.save(Inscripcion, inscripcion);
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ConflictException('Este equipo ya está inscrito en el torneo');
      throw error;
    }
  }
}
