import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, RolUsuario } from '../usuarios/entities/usuario.entity';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(@InjectRepository(Usuario) private usuariosRepo: Repository<Usuario>, private jwtService: JwtService) {}
  async registro(dto: RegistroDto) {
    const correo = dto.correo.trim().toLowerCase();
    const existe = await this.usuariosRepo.findOne({ where: [{ correo }, { alias: dto.alias.trim() }] });
    if (existe) throw new ConflictException('El correo o alias ya está registrado');
    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = this.usuariosRepo.create({ nombre: dto.nombre.trim(), alias: dto.alias.trim(), correo, password: hash, rol: RolUsuario.ESTUDIANTE });
    let guardado: Usuario;
    try { guardado = await this.usuariosRepo.save(usuario); }
    catch (error) { if ((error as { code?: string }).code === 'ER_DUP_ENTRY') throw new ConflictException('Correo o alias ya registrado'); throw error; }
    const { password, ...resultado } = guardado;
    return resultado;
  }
  async login(dto: LoginDto) {
    const usuario = await this.usuariosRepo.findOne({ where: { correo: dto.correo.trim().toLowerCase() }, select: { id: true, nombre: true, alias: true, correo: true, rol: true, activo: true, password: true } });
    if (!usuario || !usuario.activo || !(await bcrypt.compare(dto.password, usuario.password))) throw new UnauthorizedException('Credenciales inválidas');
    const { password, ...publico } = usuario;
    return { access_token: this.jwtService.sign({ sub: usuario.id, correo: usuario.correo, rol: usuario.rol }), usuario: publico };
  }
}
