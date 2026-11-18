import { Body, Controller, Get, ParseIntPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearResultadoDto } from './dto/crear-resultado.dto';
import { ResultadosService } from './resultados.service';
@ApiTags('Resultados')
@Controller('resultados')
export class ResultadosController {
 constructor(private readonly resultados: ResultadosService) {}
 @Get() findAll(@Query('partidoId', new ParseIntPipe({ optional: true })) partidoId?: number) { return this.resultados.findAll(partidoId); }
 @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @ApiBearerAuth()
 create(@Body() dto: CrearResultadoDto, @Req() req: { user: Usuario }) { return this.resultados.create(dto, req.user.id); }
}
