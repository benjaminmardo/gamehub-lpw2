import { Body, Controller, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiErrorDto, ResultadoPublicoDto } from '../common/dto/api-respuestas.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearResultadoDto } from './dto/crear-resultado.dto';
import { ResultadosService } from './resultados.service';
@ApiTags('Resultados')
@Controller('resultados')
export class ResultadosController {
  constructor(private readonly resultados: ResultadosService) {}
  @Get()
  @ApiOperation({ summary: 'Consultar resultados oficiales', description: 'Consulta pública de marcadores y equipos ganadores.' })
  @ApiQuery({ name: 'partidoId', required: false, type: Number, example: 1, description: 'Filtrar por un partido' })
  @ApiResponse({ status: 200, description: 'Resultados registrados', type: ResultadoPublicoDto, isArray: true })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  findAll(@Query('partidoId', new ParseIntPipe({ optional: true })) partidoId?: number) { return this.resultados.findAll(partidoId); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registrar resultado oficial (Admin)', description: 'Acepta puntajes enteros no negativos. El servidor calcula el ganador y toma registradoPor del JWT. Rechaza duplicados y empates prohibidos; guarda el resultado y finaliza el partido en una misma transacción. El ranking se calcula desde estos resultados.' })
  @ApiBody({ type: CrearResultadoDto })
  @ApiResponse({ status: 201, description: 'Resultado oficial registrado', type: ResultadoPublicoDto })
  @ApiResponse({ status: 400, description: 'Datos o parámetros inválidos', type: ApiErrorDto })
  @ApiResponse({ status: 401, description: 'JWT ausente, inválido o vencido', type: ApiErrorDto })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes', type: ApiErrorDto })
  @ApiResponse({ status: 404, description: 'Recurso no encontrado', type: ApiErrorDto })
  @ApiResponse({ status: 409, description: 'Conflicto con el estado actual o un registro existente', type: ApiErrorDto })
  create(@Body() dto: CrearResultadoDto, @Req() req: { user: Usuario }) { return this.resultados.create(dto, req.user.id); }
}
