import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
 constructor(config: ConfigService, @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {
  super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow<string>('JWT_SECRET') });
 }
 async validate(payload: { sub: number }) {
  const usuario = await this.usuarios.findOne({ where: { id: payload.sub, activo: true } });
  if (!usuario) throw new UnauthorizedException('La cuenta no está activa');
  return usuario;
 }
}
