import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Equipo } from '../equipos/entities/equipo.entity';
import { EstadoTorneo, Torneo } from '../torneos/entities/torneo.entity';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { Inscripcion } from './entities/inscripcion.entity';
import { InscripcionesService } from './inscripciones.service';

describe('InscripcionesService', () => {
  const manager = { findOne: jest.fn(), count: jest.fn(), create: jest.fn(), save: jest.fn() };
  let service: InscripcionesService;
  const actor = { id: 8, rol: RolUsuario.ESTUDIANTE } as Usuario;
  const dto = { torneoId: 2, equipoId: 4 };
  let torneo: Torneo;
  let equipo: Equipo;
  beforeEach(() => {
    jest.resetAllMocks();
    torneo = { id: 2, estado: EstadoTorneo.ABIERTO, cierreInscripcion: new Date(Date.now() + 86_400_000), cupoMaximo: 2 } as Torneo;
    equipo = { id: 4, capitanId: actor.id } as Equipo;
    manager.findOne.mockImplementation(async (entity: unknown) => entity === Torneo ? torneo : entity === Equipo ? equipo : null);
    manager.count.mockResolvedValue(0);
    manager.create.mockImplementation((_entity, datos) => datos);
    manager.save.mockImplementation(async (_entity, datos) => ({ id: 12, ...datos }));
    const source = { transaction: jest.fn(async (callback: (em: EntityManager) => unknown) => callback(manager as unknown as EntityManager)) };
    service = new InscripcionesService({} as Repository<Inscripcion>, source as unknown as DataSource);
  });
  it('bloquea el torneo antes de contar y crea una inscripción confirmada', async () => {
    const resultado = await service.create(dto, actor);
    expect(manager.findOne.mock.calls[0]).toEqual([Torneo, { where: { id: 2 }, lock: { mode: 'pessimistic_write' } }]);
    expect(resultado).toMatchObject({ torneoId: 2, equipoId: 4, estado: 'CONFIRMADA' });
    expect(manager.findOne.mock.invocationCallOrder[0]).toBeLessThan(manager.count.mock.invocationCallOrder[0]);
  });
  it('rechaza torneo inexistente', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('rechaza a otro capitán sin persistir', async () => {
    equipo.capitanId = 99;
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rechaza un torneo cerrado', async () => {
    torneo.estado = EstadoTorneo.FINALIZADO;
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(BadRequestException);
  });
  it('rechaza el límite exacto de cierre de inscripción', async () => {
    torneo.cierreInscripcion = new Date(Date.now() - 1);
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rechaza duplicados antes de ocupar otro cupo', async () => {
    manager.findOne.mockImplementation(async (entity: unknown) => entity === Torneo ? torneo : entity === Equipo ? equipo : { id: 6 });
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(ConflictException);
    expect(manager.count).not.toHaveBeenCalled();
  });
  it('rechaza cupo lleno sin guardar', async () => {
    manager.count.mockResolvedValue(2);
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('permite al administrador inscribir un equipo ajeno', async () => {
    equipo.capitanId = 99;
    await expect(service.create(dto, { ...actor, rol: RolUsuario.ADMIN })).resolves.toMatchObject({ id: 12 });
  });
  it('traduce la restricción única a conflicto', async () => {
    manager.save.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
    await expect(service.create(dto, actor)).rejects.toBeInstanceOf(ConflictException);
  });
});
