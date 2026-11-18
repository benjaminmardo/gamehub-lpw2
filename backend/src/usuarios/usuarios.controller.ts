import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, UsuarioPublicoDto } from '../common/dto/api-respuestas.dto';
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
  @Get('perfil')
  @ApiOperation({ summary: 'Consultar mi perfil', description: 'Obtiene la identidad del JWT validado; no admite un ID de otro usuario.' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario autenticado', type: UsuarioPublicoDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  perfil(@Req() req: { user: Usuario }) { return this.usuarios.findById(req.user.id); }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar usuarios activos (Admin)', description: 'Lista sin contraseñas ni hashes; exige rol admin.' })
  @ApiResponse({ status: 200, description: 'Usuarios activos', type: UsuarioPublicoDto, isArray: true })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  findAll() { return this.usuarios.findAll(); }
}
