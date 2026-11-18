import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Torneo } from './entities/torneo.entity';
import { TorneosController } from './torneos.controller';
import { TorneosService } from './torneos.service';

@Module({ imports: [TypeOrmModule.forFeature([Torneo]), AuthModule], controllers: [TorneosController], providers: [TorneosService], exports: [TorneosService, TypeOrmModule] })
export class TorneosModule {}
