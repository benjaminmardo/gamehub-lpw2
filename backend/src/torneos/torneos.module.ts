import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Torneo } from './entities/torneo.entity';
import { TorneosController } from './torneos.controller';
import { TorneosService } from './torneos.service';
import { RankingService } from './ranking.service';
import { Inscripcion } from '../inscripciones/entities/inscripcion.entity';
import { Resultado } from '../resultados/entities/resultado.entity';

@Module({ imports: [TypeOrmModule.forFeature([Torneo, Inscripcion, Resultado]), AuthModule], controllers: [TorneosController], providers: [TorneosService, RankingService], exports: [TorneosService, TypeOrmModule] })
export class TorneosModule {}
