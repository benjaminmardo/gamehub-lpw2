import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, FilaRankingDto, MensajeDto, TorneoPublicoDto } from '../common/dto/api-respuestas.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FiltrarTorneosDto } from './dto/filtrar-torneos.dto';
import { CrearTorneoDto, ActualizarTorneoDto } from './dto/crear-torneo.dto';
import { EstadoTorneo, ModalidadTorneo } from './entities/torneo.entity';
import { TorneosService } from './torneos.service';
import { RankingService } from './ranking.service';
@ApiTags('Torneos')
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneos: TorneosService, private readonly rankingService: RankingService) {}
  @Get()
  @ApiOperation({ summary: 'Buscar y filtrar torneos', description: 'Todos los filtros se combinan mediante AND. El texto busca nombre o videojuego; la fecha selecciona el día UTC de inicio.' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Texto parcial del nombre o videojuego', example: 'Copa' })
  @ApiQuery({ name: 'videojuego', required: false, type: String, example: 'Valorant' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoTorneo })
  @ApiQuery({ name: 'modalidad', required: false, enum: ModalidadTorneo })
  @ApiQuery({ name: 'fecha', required: false, type: String, description: 'Día UTC con formato YYYY-MM-DD', example: '2027-02-01' })
  @ApiResponse({ status: 200, description: 'Torneos que cumplen los filtros', type: TorneoPublicoDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  findAll(@Query() filtros: FiltrarTorneosDto) { return this.torneos.findAll(filtros); }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un torneo' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Detalle del torneo', type: TorneoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.torneos.findOne(id); }

  @Get(':id/ranking')
  @ApiOperation({ summary: 'Consultar ranking automático del torneo', description: 'Incluye equipos confirmados sin partidos. Victoria: 3 puntos; empate: 1; derrota: 0. Orden: puntos, diferencia y nombre del equipo. Se calcula exclusivamente desde resultados oficiales.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Clasificación calculada', type: FilaRankingDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  ranking(@Param('id', ParseIntPipe) id: number) { return this.rankingService.ranking(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear torneo (Admin)', description: 'Valida fechas y cupo máximo antes de persistir.' })
  @ApiBody({ type: CrearTorneoDto })
  @ApiResponse({ status: 201, description: 'Torneo creado', type: TorneoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  create(@Body() dto: CrearTorneoDto) { return this.torneos.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar torneo (Admin)', description: 'El cupo no puede quedar por debajo de los equipos inscritos. Los campos omitidos mantienen su valor.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiBody({ type: ActualizarTorneoDto })
  @ApiResponse({ status: 200, description: 'Torneo actualizado', type: TorneoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTorneoDto) { return this.torneos.update(id, dto); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar torneo sin actividad (Admin)', description: 'Con inscripciones o partidos asociados responde 409; se puede actualizar su estado a CANCELADO.' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Torneo eliminado', type: MensajeDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  remove(@Param('id', ParseIntPipe) id: number) { return this.torneos.remove(id); }
}
