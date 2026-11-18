import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, PartidoPublicoDto } from '../common/dto/api-respuestas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { PartidosService } from './partidos.service';
@ApiTags('Partidos')
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidos: PartidosService) {}
  @Get()
  @ApiOperation({ summary: 'Listar partidos programados y finalizados', description: 'Ordenados por fecha; incluye torneo y ambos equipos.' })
  @ApiQuery({ name: 'torneoId', required: false, type: Number, example: 1, description: 'Limita la consulta al torneo indicado' })
  @ApiResponse({ status: 200, description: 'Calendario de partidos', type: PartidoPublicoDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  findAll(@Query('torneoId', new ParseIntPipe({ optional: true })) torneoId?: number) { return this.partidos.findAll(torneoId); }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalle de un partido' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'Identificador del recurso' })
  @ApiResponse({ status: 200, description: 'Partido con equipos y torneo', type: PartidoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.partidos.findOne(id); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Programar un enfrentamiento (Admin)', description: 'Exige dos equipos distintos con inscripción CONFIRMADA en el torneo. Rechaza torneos cancelados o finalizados y fechas anteriores al inicio.' })
  @ApiBody({ type: CrearPartidoDto })
  @ApiResponse({ status: 201, description: 'Partido programado', type: PartidoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  create(@Body() dto: CrearPartidoDto) { return this.partidos.create(dto); }
}
