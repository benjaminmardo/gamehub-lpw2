import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { EstadoTorneo, ModalidadTorneo } from '../entities/torneo.entity';

export class CrearTorneoDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(120) nombre: string;
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(80) videojuego: string;
  @IsEnum(ModalidadTorneo) modalidad: ModalidadTorneo;
  @IsDateString({ strict: true }) fechaInicio: string;
  @IsDateString({ strict: true }) cierreInscripcion: string;
  @IsInt() @Min(2) @Max(256) cupoMaximo: number;
  @IsOptional() @IsEnum(EstadoTorneo) estado?: EstadoTorneo;
  @IsOptional() @IsBoolean() permiteEmpate?: boolean;
}

export class ActualizarTorneoDto extends PartialType(CrearTorneoDto) {}
