import { ConflictException, NotFoundException } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { EstadoInscripcion, Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { Torneo } from './entities/torneo.entity';
import { TorneosService } from './torneos.service';

describe('Cambios de cupo del torneo', () => {
  const manager = { findOne: jest.fn(), count: jest.fn(), save: jest.fn(), existsBy: jest.fn() };
  let service: TorneosService;
  beforeEach(() => {
    jest.resetAllMocks();
    manager.findOne.mockResolvedValue({ id: 3, cupoMaximo: 8, fechaInicio: new Date('2027-02-01T18:00:00Z'), cierreInscripcion: new Date('2027-01-31T18:00:00Z') });
    manager.count.mockResolvedValue(4);
    manager.existsBy.mockResolvedValue(true);
    manager.save.mockImplementation(async (_entity, torneo) => torneo);
    const repo = { manager: { transaction: async (callback: (em: EntityManager) => unknown) => callback(manager as unknown as EntityManager) } };
    service = new TorneosService(repo as unknown as Repository<Torneo>);
  });
  it('impide reducir el cupo por debajo de los inscritos', async () => {
    await expect(service.update(3, { cupoMaximo: 2 })).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('usa el mismo bloqueo del proceso de inscripción y cuenta solo confirmados', async () => {
    await expect(service.update(3, { cupoMaximo: 4 })).resolves.toMatchObject({ cupoMaximo: 4 });
    expect(manager.findOne).toHaveBeenCalledWith(Torneo, { where: { id: 3 }, lock: { mode: 'pessimistic_write' } });
    expect(manager.count).toHaveBeenCalledWith(Inscripcion, { where: { torneoId: 3, estado: EstadoInscripcion.CONFIRMADA } });
  });
  it('informa 404 dentro de la transacción', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(service.update(99, { cupoMaximo: 6 })).rejects.toBeInstanceOf(NotFoundException);
  });
  it('preserva la regla de empate si ya existen partidos', async () => {
    await expect(service.update(3, { permiteEmpate: false })).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
