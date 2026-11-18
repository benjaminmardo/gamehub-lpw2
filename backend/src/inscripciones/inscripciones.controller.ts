import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, InscripcionPublicaDto } from '../common/dto/api-respuestas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ConsultarInscripcionesDto, CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { InscripcionesService } from './inscripciones.service';
@ApiTags('Inscripciones')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripciones: InscripcionesService) {}
  @Get()
  @ApiOperation({ summary: 'Listar inscripciones', description: 'Consulta pública con información del equipo y torneo.' })
  @ApiQuery({ name: 'torneoId', required: false, type: Number, example: 1, description: 'ID positivo del torneo para filtrar' })
  @ApiResponse({ status: 200, description: 'Inscripciones registradas', type: InscripcionPublicaDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  findAll(@Query() query: ConsultarInscripcionesDto) { return this.inscripciones.findAll(query.torneoId); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscribir un equipo (capitán o Admin)', description: 'La inscripción queda CONFIRMADA. Una transacción bloquea el torneo, valida plazo y estado, rechaza duplicados y protege el cupo máximo incluso ante solicitudes simultáneas.' })
  @ApiBody({ type: CrearInscripcionDto })
  @ApiResponse({ status: 201, description: 'Inscripción confirmada', type: InscripcionPublicaDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  create(@Body() dto: CrearInscripcionDto, @Req() req: { user: Usuario }) { return this.inscripciones.create(dto, req.user); }
}
