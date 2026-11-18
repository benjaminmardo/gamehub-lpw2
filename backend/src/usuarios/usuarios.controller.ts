import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
 constructor(private readonly usuarios: UsuariosService) {}
 @Get('perfil') perfil(@Req() req: { user: Usuario }) { return this.usuarios.findById(req.user.id); }
 @Get() @Roles('admin') findAll() { return this.usuarios.findAll(); }
}
