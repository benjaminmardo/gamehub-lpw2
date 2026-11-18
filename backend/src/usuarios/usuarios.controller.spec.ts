import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController (HTTP)', () => {
  let app: INestApplication;
  const usuarios = { findById: jest.fn(), findAll: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: usuarios }],
    })
      .overrideGuard(JwtAuthGuard).useValue({
        canActivate(context: ExecutionContext) {
          context.switchToHttp().getRequest().user = { id: 3, sub: 3, rol: 'admin' };
          return true;
        },
      })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(() => jest.resetAllMocks());
  afterAll(async () => { await app.close(); });

  it('consulta perfil de identidad autenticada e ignora ID en query', async () => {
    usuarios.findById.mockResolvedValue({ id: 3, nombre: 'Capitana' });
    await request(app.getHttpServer()).get('/usuarios/perfil?id=999').expect(200)
      .expect(({ body }) => expect(body.id).toBe(3));
    expect(usuarios.findById).toHaveBeenCalledWith(3);
  });

  it('expone lista entregada por servicio', async () => {
    usuarios.findAll.mockResolvedValue([{ id: 3, nombre: 'Capitana' }]);
    await request(app.getHttpServer()).get('/usuarios').expect(200)
      .expect([{ id: 3, nombre: 'Capitana' }]);
  });
});
