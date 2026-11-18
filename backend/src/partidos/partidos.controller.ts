import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearPartidoDto } from './dto/crear-partido.dto';
import { PartidosService } from './partidos.service';
@ApiTags('Partidos')
@Controller('partidos')
export class PartidosController {
 constructor(private readonly partidos: PartidosService) {}
 @Get() findAll(@Query('torneoId', new ParseIntPipe({ optional: true })) torneoId?: number) { return this.partidos.findAll(torneoId); }
 @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.partidos.findOne(id); }
 @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
 create(@Body() dto: CrearPartidoDto) { return this.partidos.create(dto); }
}
