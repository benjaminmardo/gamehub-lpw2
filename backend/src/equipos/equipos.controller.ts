import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearEquipoDto, ActualizarEquipoDto } from './dto/crear-equipo.dto';
import { EquiposService } from './equipos.service';
@ApiTags('Equipos')
@Controller('equipos')
export class EquiposController {
 constructor(private readonly equipos: EquiposService) {}
 @Get() findAll() { return this.equipos.findAll(); }
 @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.equipos.findOne(id); }
 @Post() @UseGuards(JwtAuthGuard) @ApiBearerAuth() create(@Body() dto: CrearEquipoDto, @Req() req: { user: Usuario }) { return this.equipos.create(dto, req.user); }
 @Patch(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() update(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarEquipoDto, @Req() req: { user: Usuario }) { return this.equipos.update(id, dto, req.user); }
 @Delete(':id') @UseGuards(JwtAuthGuard) @ApiBearerAuth() remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: Usuario }) { return this.equipos.remove(id, req.user); }
}
