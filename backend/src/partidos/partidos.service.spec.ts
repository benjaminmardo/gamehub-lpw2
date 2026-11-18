import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { EstadoInscripcion, Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { EstadoTorneo, Torneo } from '../torneos/entities/torneo.entity';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { Partido } from './entities/partido.entity';
import { PartidosService } from './partidos.service';

describe('Programación de partidos', () => {
  const manager = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn() };
  const repo = { findOne: jest.fn(), find: jest.fn() };
  const transaction = jest.fn();
  const dto: CrearPartidoDto = { torneoId: 5, equipoLocalId: 1, equipoVisitanteId: 2, fechaHora: '2027-02-02T18:00:00Z', ronda: 'Jornada 1' };
  let service: PartidosService;
  let torneo: Torneo;
  beforeEach(() => {
    jest.resetAllMocks();
    torneo = { id: 5, estado: EstadoTorneo.ABIERTO, fechaInicio: new Date('2027-02-01T18:00:00Z') } as Torneo;
    manager.findOne.mockResolvedValue(torneo);
    manager.find.mockResolvedValue([{ equipoId: 1 }, { equipoId: 2 }]);
    manager.create.mockImplementation((_entidad, datos) => datos);
    manager.save.mockImplementation(async (partido) => ({ id: 20, ...partido }));
    repo.findOne.mockResolvedValue({ id: 20, ...dto, fechaHora: new Date(dto.fechaHora) });
    transaction.mockImplementation(async (callback: (em: EntityManager) => unknown) => callback(manager as unknown as EntityManager));
    service = new PartidosService(repo as unknown as Repository<Partido>, { transaction } as unknown as DataSource);
  });
  it('rechaza un enfrentamiento del equipo contra sí mismo', async () => {
    await expect(service.create({ ...dto, equipoVisitanteId: 1 })).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });
  it('rechaza torneos que no existen', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it.each([EstadoTorneo.CANCELADO, EstadoTorneo.FINALIZADO])('rechaza programación para torneo %s', async (estado) => {
    torneo.estado = estado;
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rechaza un partido anterior al inicio del torneo', async () => {
    await expect(service.create({ ...dto, fechaHora: '2027-01-01T18:00:00Z' })).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.find).not.toHaveBeenCalled();
  });
  it('exige que ambos equipos tengan inscripción confirmada en ese torneo', async () => {
    manager.find.mockResolvedValue([{ equipoId: 1 }]);
    await expect(service.create(dto)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.find).toHaveBeenCalledWith(Inscripcion, { where: { torneoId: 5, equipoId: expect.anything(), estado: EstadoInscripcion.CONFIRMADA } });
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('bloquea el torneo y guarda una programación válida', async () => {
    const partido = await service.create(dto);
    expect(manager.findOne.mock.calls[0]).toEqual([Torneo, { where: { id: 5 }, lock: { mode: 'pessimistic_write' } }]);
    expect(manager.create).toHaveBeenCalledWith(Partido, expect.objectContaining({ ...dto, fechaHora: new Date(dto.fechaHora), estado: 'PROGRAMADO' }));
    expect(partido.id).toBe(20);
    expect(transaction).toHaveBeenCalledTimes(1);
  });
  it('consulta un partido desconocido como 404', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
