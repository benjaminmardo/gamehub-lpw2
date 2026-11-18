import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CrearTorneoDto } from './dto/crear-torneo.dto';
import { EstadoTorneo, ModalidadTorneo, Torneo } from './entities/torneo.entity';
import { TorneosService } from './torneos.service';

describe('TorneosService', () => {
  const repo = { findOne: jest.fn(), find: jest.fn(), create: jest.fn(), save: jest.fn(), remove: jest.fn() };
  let service: TorneosService;
  const dto: CrearTorneoDto = { nombre: 'Copa IPVG', videojuego: 'Valorant', modalidad: ModalidadTorneo.LIGA, fechaInicio: '2027-02-01T18:00:00Z', cierreInscripcion: '2027-01-31T18:00:00Z', cupoMaximo: 8 };
  beforeEach(() => {
    jest.resetAllMocks();
    service = new TorneosService(repo as unknown as Repository<Torneo>);
    repo.create.mockImplementation((datos) => ({ id: 1, estado: EstadoTorneo.ABIERTO, permiteEmpate: true, ...datos }));
    repo.save.mockImplementation(async (torneo) => torneo);
  });
  it('rechaza cierre posterior al comienzo y no persiste', async () => {
    await expect(service.create({ ...dto, cierreInscripcion: '2027-02-02T18:00:00Z' })).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.save).not.toHaveBeenCalled();
  });
  it('persiste fechas como Date', async () => {
    const torneo = await service.create(dto);
    expect(torneo.fechaInicio).toEqual(new Date(dto.fechaInicio));
    expect(torneo.cierreInscripcion).toEqual(new Date(dto.cierreInscripcion));
  });
  it('informa 404 para ID desconocido', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
  it('traduce las dependencias del torneo a un conflicto', async () => {
    repo.findOne.mockResolvedValue({ id: 1 });
    repo.remove.mockRejectedValue({ code: 'ER_ROW_IS_REFERENCED_2' });
    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });
});
