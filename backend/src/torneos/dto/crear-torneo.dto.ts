import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EstadoTorneo, ModalidadTorneo } from '../entities/torneo.entity';
export class CrearTorneoDto {
  @ApiProperty({ example: 'Copa IPVG', minLength: 2, maxLength: 120 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(120) nombre: string;
  @ApiProperty({ example: 'Valorant', minLength: 2, maxLength: 80 })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MinLength(2) @MaxLength(80) videojuego: string;
  @ApiProperty({ enum: ModalidadTorneo, example: ModalidadTorneo.LIGA })
  @IsEnum(ModalidadTorneo) modalidad: ModalidadTorneo;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-02-01T18:00:00.000Z', description: 'Inicio en ISO 8601; enviar zona horaria explícita' })
  @IsDateString({ strict: true }) fechaInicio: string;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-01-31T18:00:00.000Z', description: 'Debe ser anterior o igual al inicio; nuevas inscripciones se rechazan desde este instante' })
  @IsDateString({ strict: true }) cierreInscripcion: string;
  @ApiProperty({ type: 'integer', minimum: 2, maximum: 256, example: 8 })
  @IsInt() @Min(2) @Max(256) cupoMaximo: number;
  @ApiPropertyOptional({ enum: EstadoTorneo, default: EstadoTorneo.ABIERTO })
  @IsOptional() @IsEnum(EstadoTorneo) estado?: EstadoTorneo;
  @ApiPropertyOptional({ default: true, description: 'Si es false, se rechazan los resultados con puntajes iguales' })
  @IsOptional() @IsBoolean() permiteEmpate?: boolean;
}
export class ActualizarTorneoDto extends PartialType(CrearTorneoDto) {}
