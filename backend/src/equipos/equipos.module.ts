import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Equipo } from './entities/equipo.entity';
import { EquiposController } from './equipos.controller';
import { EquiposService } from './equipos.service';
@Module({ imports: [TypeOrmModule.forFeature([Equipo, Usuario]), AuthModule], controllers: [EquiposController], providers: [EquiposService], exports: [EquiposService, TypeOrmModule] })
export class EquiposModule {}
