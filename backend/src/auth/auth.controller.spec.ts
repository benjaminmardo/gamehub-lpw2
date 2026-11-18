import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController (HTTP)', () => {
  let app: INestApplication;
  const auth = { registro: jest.fn(), login: jest.fn() };
  const dto = { nombre: 'Capitana', alias: 'capitana', correo: 'capitana@ipvg.cl', password: 'ClaveSegura123' };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController], providers: [{ provide: AuthService, useValue: auth }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  beforeEach(() => jest.resetAllMocks());
  afterAll(async () => { await app.close(); });

  it('expone registro en POST /auth/registro', async () => {
    auth.registro.mockResolvedValue({ id: 5, correo: dto.correo, rol: 'estudiante' });
    await request(app.getHttpServer()).post('/auth/registro').send(dto).expect(201)
      .expect(({ body }) => expect(body).toMatchObject({ id: 5, rol: 'estudiante' }));
    expect(auth.registro).toHaveBeenCalledWith(expect.objectContaining(dto));
  });

  it('rechaza correo inválido y escalamiento de rol antes del servicio', async () => {
    await request(app.getHttpServer()).post('/auth/registro')
      .send({ ...dto, correo: 'sin-arroba', rol: 'admin' }).expect(400);
    expect(auth.registro).not.toHaveBeenCalled();
  });

  it('propaga 401 cuando servicio rechaza credenciales', async () => {
    auth.login.mockRejectedValue(new UnauthorizedException('Credenciales inválidas'));
    await request(app.getHttpServer()).post('/auth/login')
      .send({ correo: dto.correo, password: dto.password }).expect(401);
  });
});
