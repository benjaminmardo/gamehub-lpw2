import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { EstadoTorneo, ModalidadTorneo } from '../entities/torneo.entity';

export class FiltrarTorneosDto {
  @IsOptional() @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) @IsString() @MaxLength(120) q?: string;
  @IsOptional() @IsString() @MaxLength(80) videojuego?: string;
  @IsOptional() @IsEnum(EstadoTorneo) estado?: EstadoTorneo;
  @IsOptional() @IsEnum(ModalidadTorneo) modalidad?: ModalidadTorneo;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString({ strict: true }) fecha?: string;
}
