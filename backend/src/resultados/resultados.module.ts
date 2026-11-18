import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Partido } from '../partidos/entities/partido.entity';
import { Resultado } from './entities/resultado.entity';
import { ResultadosController } from './resultados.controller';
import { ResultadosService } from './resultados.service';
@Module({ imports: [AuthModule, TypeOrmModule.forFeature([Resultado, Partido])], controllers: [ResultadosController], providers: [ResultadosService] })
export class ResultadosModule {}
