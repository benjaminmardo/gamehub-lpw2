import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearEquipoDto, ActualizarEquipoDto } from './dto/crear-equipo.dto';
@Injectable()
export class EquiposService {
 constructor(@InjectRepository(Equipo) private readonly equipos: Repository<Equipo>, @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}
 findAll() { return this.equipos.find({ relations: { capitan: true, integrantes: true }, order: { nombre: 'ASC' } }); }
 async findOne(id: number) {
  const equipo = await this.equipos.findOne({ where: { id }, relations: { capitan: true, integrantes: true } });
  if (!equipo) throw new NotFoundException('Equipo no encontrado');
  return equipo;
 }
 private async miembros(ids: number[], capitanId: number) {
  const unicos = [...new Set([capitanId, ...ids])];
  const miembros = await this.usuarios.find({ where: { id: In(unicos), activo: true } });
  if (miembros.length !== unicos.length) throw new BadRequestException('Uno o más integrantes no existen o no están activos');
  return miembros;
 }
 private autorizar(equipo: Equipo, actor: Usuario) {
  if (equipo.capitanId !== actor.id && actor.rol !== 'admin') throw new ForbiddenException('Solo el capitán administra este equipo');
 }
 private async guardar(equipo: Equipo) {
  try { return await this.equipos.save(equipo); }
  catch (error) { if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ConflictException('Ya existe un equipo con ese nombre'); throw error; }
 }
 async create(dto: CrearEquipoDto, actor: Usuario) {
  const { integranteIds = [], ...datos } = dto;
  const equipo = this.equipos.create({ ...datos, nombre: datos.nombre.trim(), capitanId: actor.id, integrantes: await this.miembros(integranteIds, actor.id) });
  return this.findOne((await this.guardar(equipo)).id);
 }
 async update(id: number, dto: ActualizarEquipoDto, actor: Usuario) {
  const equipo = await this.findOne(id); this.autorizar(equipo, actor);
  const { integranteIds, ...datos } = dto;
  Object.assign(equipo, datos);
  if (integranteIds) equipo.integrantes = await this.miembros(integranteIds, equipo.capitanId);
  await this.guardar(equipo); return this.findOne(id);
 }
 async remove(id: number, actor: Usuario) {
  const equipo = await this.findOne(id); this.autorizar(equipo, actor);
  try { await this.equipos.remove(equipo); }
  catch (error) { if ((error as { code?: string }).code === 'ER_ROW_IS_REFERENCED_2') throw new ConflictException('El equipo tiene actividad en torneos y no puede eliminarse'); throw error; }
  return { mensaje: 'Equipo eliminado' };
 }
}
