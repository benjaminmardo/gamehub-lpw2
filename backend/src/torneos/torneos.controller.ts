import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { FiltrarTorneosDto } from './dto/filtrar-torneos.dto';
import { CrearTorneoDto, ActualizarTorneoDto } from './dto/crear-torneo.dto';
import { TorneosService } from './torneos.service';
import { RankingService } from './ranking.service';

@ApiTags('Torneos')
@Controller('torneos')
export class TorneosController {
  constructor(private readonly torneos: TorneosService, private readonly rankingService: RankingService) {}
  @Get(':id/ranking') ranking(@Param('id', ParseIntPipe) id: number) { return this.rankingService.ranking(id); }
  @Get() findAll(@Query() filtros: FiltrarTorneosDto) { return this.torneos.findAll(filtros); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.torneos.findOne(id); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  create(@Body() dto: CrearTorneoDto) { return this.torneos.create(dto); }
  @Patch(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarTorneoDto) { return this.torneos.update(id, dto); }
  @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number) { return this.torneos.remove(id); }
}
