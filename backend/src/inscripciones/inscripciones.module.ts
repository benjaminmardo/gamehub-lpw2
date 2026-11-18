import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Equipo } from '../equipos/entities/equipo.entity';
import { Torneo } from '../torneos/entities/torneo.entity';
import { Inscripcion } from './entities/inscripcion.entity';
import { InscripcionesController } from './inscripciones.controller';
import { InscripcionesService } from './inscripciones.service';

@Module({ imports: [TypeOrmModule.forFeature([Inscripcion, Torneo, Equipo]), AuthModule], controllers: [InscripcionesController], providers: [InscripcionesService], exports: [InscripcionesService, TypeOrmModule] })
export class InscripcionesModule {}
