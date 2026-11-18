import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const repo = { findOne: jest.fn(), find: jest.fn() };
  const usuario = {
    id: 3, nombre: 'Capitana', alias: 'capitana', correo: 'capitana@ipvg.cl',
    password: 'hash-privado', rol: RolUsuario.ESTUDIANTE, activo: true,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsuariosService, { provide: getRepositoryToken(Usuario), useValue: repo }],
    }).compile();
    service = module.get(UsuariosService);
  });

  it('devuelve perfil por ID sin exponer hash', async () => {
    repo.findOne.mockResolvedValue(usuario);
    const perfil = await service.findById(3);
    expect(repo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 3 } }));
    expect(perfil).toMatchObject({ id: 3, correo: usuario.correo });
    expect(perfil).not.toHaveProperty('password');
  });

  it('responde con 404 para usuario inexistente', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lista únicamente activos y elimina todos los hashes', async () => {
    repo.find.mockResolvedValue([usuario, { ...usuario, id: 4, alias: 'otra' }]);
    const listado = await service.findAll();
    expect(repo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { activo: true } }));
    expect(listado).toHaveLength(2);
    expect(listado.every((item) => !('password' in item))).toBe(true);
  });
});
