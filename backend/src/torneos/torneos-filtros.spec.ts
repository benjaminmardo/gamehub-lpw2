import { Brackets, Repository } from 'typeorm';
import { EstadoTorneo, ModalidadTorneo, Torneo } from './entities/torneo.entity';
import { TorneosService } from './torneos.service';

describe('Filtros combinables de torneos', () => {
  const query = { andWhere: jest.fn(), orderBy: jest.fn(), addOrderBy: jest.fn(), getMany: jest.fn() };
  let service: TorneosService;
  beforeEach(() => {
    jest.resetAllMocks();
    query.andWhere.mockReturnValue(query);
    query.orderBy.mockReturnValue(query);
    query.addOrderBy.mockReturnValue(query);
    query.getMany.mockResolvedValue([]);
    service = new TorneosService({ createQueryBuilder: () => query } as unknown as Repository<Torneo>);
  });
  it('combina texto, juego, estado, modalidad y fecha mediante AND', async () => {
    await service.findAll({ q: 'Copa', videojuego: 'Valorant', estado: EstadoTorneo.ABIERTO, modalidad: ModalidadTorneo.LIGA, fecha: '2027-02-01' });
    expect(query.andWhere).toHaveBeenCalledTimes(5);
    expect(query.andWhere).toHaveBeenCalledWith(expect.any(Brackets));
    expect(query.andWhere).toHaveBeenCalledWith('torneo.videojuego = :videojuego', { videojuego: 'Valorant' });
    expect(query.andWhere).toHaveBeenCalledWith('torneo.estado = :estado', { estado: EstadoTorneo.ABIERTO });
    expect(query.andWhere).toHaveBeenCalledWith('torneo.modalidad = :modalidad', { modalidad: ModalidadTorneo.LIGA });
    expect(query.andWhere).toHaveBeenCalledWith('torneo.fechaInicio >= :desde AND torneo.fechaInicio < :hasta', {
      desde: new Date('2027-02-01T00:00:00.000Z'), hasta: new Date('2027-02-02T00:00:00.000Z'),
    });
  });
  it('no aplica filtros vacíos', async () => {
    await service.findAll({});
    expect(query.andWhere).not.toHaveBeenCalled();
    expect(query.orderBy).toHaveBeenCalledWith('torneo.fechaInicio', 'ASC');
  });
  it('conserva texto potencialmente malicioso como parámetro', async () => {
    await service.findAll({ q: "' OR 1=1 --" });
    const bracket = query.andWhere.mock.calls[0][0] as Brackets;
    const sub = { where: jest.fn(), orWhere: jest.fn() };
    sub.where.mockReturnValue(sub);
    bracket.whereFactory(sub as never);
    expect(sub.where).toHaveBeenCalledWith('torneo.nombre LIKE :texto', { texto: "%' OR 1=1 --%" });
    expect(sub.orWhere).toHaveBeenCalledWith('torneo.videojuego LIKE :texto', { texto: "%' OR 1=1 --%" });
  });
});
