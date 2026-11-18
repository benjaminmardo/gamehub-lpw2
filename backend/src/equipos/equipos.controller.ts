import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, EquipoPublicoDto, MensajeDto } from '../common/dto/api-respuestas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearEquipoDto, ActualizarEquipoDto } from './dto/crear-equipo.dto';
import { EquiposService } from './equipos.service';
@ApiTags('Equipos')
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equipos: EquiposService) {}
  @Get()
  @ApiOperation({ summary: 'Listar equipos', description: 'Consulta pública de equipos, capitanes e integrantes, sin contraseñas.' })
  @ApiResponse({ status: 200, description: 'Equipos de la comunidad', type: EquipoPublicoDto, isArray: true })
  findAll() { return this.equipos.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle de un equipo' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Equipo con capitán e integrantes', type: EquipoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.equipos.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un equipo', description: 'El usuario autenticado se convierte en capitán e integrante. Los demás integrantes deben existir y estar activos.' })
  @ApiBody({ type: CrearEquipoDto })
  @ApiResponse({ status: 201, description: 'Equipo creado', type: EquipoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  create(@Body() dto: CrearEquipoDto, @Req() req: { user: Usuario }) { return this.equipos.create(dto, req.user); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un equipo (capitán o Admin)', description: 'integranteIds reemplaza la lista de integrantes; el capitán siempre se conserva.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiBody({ type: ActualizarEquipoDto })
  @ApiResponse({ status: 200, description: 'Equipo actualizado', type: EquipoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarEquipoDto, @Req() req: { user: Usuario }) { return this.equipos.update(id, dto, req.user); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un equipo (capitán o Admin)', description: 'Se rechaza cuando existen inscripciones o partidos asociados para preservar el historial.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Equipo eliminado', type: MensajeDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: Usuario }) { return this.equipos.remove(id, req.user); }
}
