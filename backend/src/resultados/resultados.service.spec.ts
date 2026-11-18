import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Partido } from '../partidos/entities/partido.entity';
import { EstadoTorneo } from '../torneos/entities/torneo.entity';
import { CrearResultadoDto } from './dto/crear-resultado.dto';
import { Resultado } from './entities/resultado.entity';
import { ResultadosService } from './resultados.service';

describe('Resultados oficiales', () => {
  const manager = { findOne: jest.fn(), existsBy: jest.fn(), findOneOrFail: jest.fn(), create: jest.fn(), save: jest.fn() };
  const transaction = jest.fn();
  const dto: CrearResultadoDto = { partidoId: 9, puntajeLocal: 3, puntajeVisitante: 1 };
  let service: ResultadosService;
  let partido: Partido;
  let completo: Partido;
  beforeEach(() => {
    jest.resetAllMocks();
    partido = { id: 9, torneoId: 5, equipoLocalId: 1, equipoVisitanteId: 2, estado: 'PROGRAMADO' } as Partido;
    completo = { ...partido, torneo: { estado: EstadoTorneo.EN_CURSO, permiteEmpate: true } } as Partido;
    manager.findOne.mockResolvedValue(partido);
    manager.existsBy.mockResolvedValue(false);
    manager.findOneOrFail.mockResolvedValue(completo);
    manager.create.mockImplementation((_entidad, datos) => datos);
    manager.save.mockImplementation(async (datos) => ({ id: 1, ...datos }));
    transaction.mockImplementation(async (callback: (em: EntityManager) => unknown) => callback(manager as unknown as EntityManager));
    service = new ResultadosService({} as Repository<Resultado>, { transaction } as unknown as DataSource);
  });
  it('rechaza partidos inexistentes sin guardar', async () => {
    manager.findOne.mockResolvedValue(null);
    await expect(service.create(dto, 7)).rejects.toBeInstanceOf(NotFoundException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('impide un segundo resultado para el mismo partido', async () => {
    manager.existsBy.mockResolvedValue(true);
    await expect(service.create(dto, 7)).rejects.toBeInstanceOf(ConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rechaza resultados de un torneo cancelado', async () => {
    completo.torneo.estado = EstadoTorneo.CANCELADO;
    await expect(service.create(dto, 7)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('rechaza empate cuando el torneo no lo permite', async () => {
    completo.torneo.permiteEmpate = false;
    await expect(service.create({ ...dto, puntajeVisitante: 3 }, 7)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
  });
  it('calcula ganador local y registra la identidad autenticada', async () => {
    const malicioso = { ...dto, ganadorId: 999, registradoPor: 999 };
    const resultado = await service.create(malicioso, 7);
    expect(resultado).toMatchObject({ partidoId: 9, ganadorId: 1, registradoPor: 7 });
    expect(manager.create).toHaveBeenCalledWith(Resultado, expect.objectContaining({ ganadorId: 1, registradoPor: 7 }));
  });
  it('calcula el ganador visitante cuando tiene mayor puntaje', async () => {
    await expect(service.create({ ...dto, puntajeVisitante: 5 }, 7)).resolves.toMatchObject({ ganadorId: 2 });
  });
  it('guarda ganador null para empate permitido', async () => {
    await expect(service.create({ ...dto, puntajeVisitante: 3 }, 7)).resolves.toMatchObject({ ganadorId: null });
  });
  it('guarda resultado y finaliza partido dentro de la misma transacción', async () => {
    await service.create(dto, 7);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(manager.findOne).toHaveBeenCalledWith(Partido, { where: { id: 9 }, lock: { mode: 'pessimistic_write' } });
    expect(manager.save).toHaveBeenCalledTimes(2);
    expect(manager.save.mock.calls[0][0]).toMatchObject({ partidoId: 9, ganadorId: 1 });
    expect(manager.save.mock.calls[1][0]).toMatchObject({ id: 9, estado: 'FINALIZADO' });
  });
  it('propaga fallo al finalizar para que la transacción revierta el resultado', async () => {
    const fallo = new Error('No se pudo finalizar');
    manager.save.mockResolvedValueOnce({ id: 1 }).mockRejectedValueOnce(fallo);
    await expect(service.create(dto, 7)).rejects.toBe(fallo);
  });
});
