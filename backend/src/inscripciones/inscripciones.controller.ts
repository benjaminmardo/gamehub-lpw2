import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ConsultarInscripcionesDto, CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { InscripcionesService } from './inscripciones.service';

@ApiTags('Inscripciones')
@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly inscripciones: InscripcionesService) {}
  @Get() findAll(@Query() query: ConsultarInscripcionesDto) { return this.inscripciones.findAll(query.torneoId); }
  @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  create(@Body() dto: CrearInscripcionDto, @Req() req: { user: Usuario }) { return this.inscripciones.create(dto, req.user); }
}
