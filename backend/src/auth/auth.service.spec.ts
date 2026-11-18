import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { RolUsuario, Usuario } from '../usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;
  const repo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
  const jwt = { sign: jest.fn() };
  const registro: RegistroDto = {
    nombre: 'Estudiante', alias: 'capitan', correo: 'capitan@ipvg.cl',
    password: 'ClaveSegura123',
  };

  beforeAll(async () => { passwordHash = await bcrypt.hash(registro.password, 4); });

  beforeEach(async () => {
    jest.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Usuario), useValue: repo },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((data) => ({
      id: 7, activo: true, rol: RolUsuario.ESTUDIANTE, ...data,
    }));
    repo.save.mockImplementation(async (usuario) => usuario);
    jwt.sign.mockReturnValue('jwt-firmado');
  });

  it('normaliza correo, guarda hash verificable y nunca devuelve password', async () => {
    const usuario = await service.registro({ ...registro, correo: ' CAPITAN@IPVG.CL ' });
    const guardado = repo.save.mock.calls[0][0];
    expect(guardado.correo).toBe('capitan@ipvg.cl');
    expect(guardado.password).not.toBe(registro.password);
    expect(await bcrypt.compare(registro.password, guardado.password)).toBe(true);
    expect(usuario).not.toHaveProperty('password');
  });

  it('fuerza rol estudiante aunque un cliente intente asignarse admin', async () => {
    const malicioso = { ...registro, rol: RolUsuario.ADMIN } as RegistroDto;
    const usuario = await service.registro(malicioso);
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ rol: RolUsuario.ESTUDIANTE }));
    expect(usuario.rol).toBe(RolUsuario.ESTUDIANTE);
  });

  it('rechaza correo registrado sin crear otro usuario', async () => {
    repo.findOne.mockResolvedValue({ id: 1, correo: registro.correo });
    await expect(service.registro(registro)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('rechaza credenciales de un usuario inexistente', async () => {
    await expect(service.login(registro)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('rechaza contraseña incorrecta sin firmar un token', async () => {
    repo.findOne.mockResolvedValue({ id: 7, activo: true, password: passwordHash });
    await expect(service.login({ ...registro, password: 'incorrecta' }))
      .rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('rechaza usuario inactivo aunque conozca la contraseña', async () => {
    repo.findOne.mockResolvedValue({ id: 7, activo: false, password: passwordHash });
    await expect(service.login(registro)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('consulta hash explícito y emite JWT sin filtrar contraseña', async () => {
    repo.findOne.mockResolvedValue({
      id: 7, nombre: registro.nombre, alias: registro.alias,
      correo: registro.correo, rol: RolUsuario.ESTUDIANTE,
      activo: true, password: passwordHash,
    });
    const respuesta = await service.login({ ...registro, correo: ' CAPITAN@IPVG.CL ' });
    const consulta = repo.findOne.mock.calls[0][0];
    expect(consulta.where).toMatchObject({ correo: registro.correo });
    expect(consulta.select).toBeDefined();
    expect(jwt.sign).toHaveBeenCalledWith(expect.objectContaining({ sub: 7, rol: RolUsuario.ESTUDIANTE }));
    expect(respuesta.access_token).toBe('jwt-firmado');
    expect(respuesta.usuario.id).toBe(7);
    expect(respuesta.usuario).not.toHaveProperty('password');
  });
});
