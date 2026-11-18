import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Torneo } from '../torneos/entities/torneo.entity';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { Partido } from './entities/partido.entity';
import { PartidosController } from './partidos.controller';
import { PartidosService } from './partidos.service';
@Module({ imports: [AuthModule, TypeOrmModule.forFeature([Partido, Torneo, Inscripcion])], controllers: [PartidosController], providers: [PartidosService] })
export class PartidosModule {}
