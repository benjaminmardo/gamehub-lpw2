import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, SesionDto, UsuarioPublicoDto } from '../common/dto/api-respuestas.dto';
import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('registro')
  @ApiOperation({ summary: 'Registrar un estudiante', description: 'El rol siempre es estudiante; no se aceptan roles administrativos en el cuerpo. El correo y alias deben ser únicos.' })
  @ApiBody({ type: RegistroDto })
  @ApiResponse({ status: 201, description: 'Usuario creado sin contraseña ni hash', type: UsuarioPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  registro(@Body() dto: RegistroDto) { return this.auth.registro(dto); }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión con correo y contraseña', description: 'Comprueba que el usuario esté activo y devuelve un JWT Bearer válido por ocho horas.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Sesión autenticada', type: SesionDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }
}
