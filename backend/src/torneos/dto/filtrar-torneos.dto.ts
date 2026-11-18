import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoTorneo, ModalidadTorneo } from '../entities/torneo.entity';
export class FiltrarTorneosDto {
  @ApiPropertyOptional({ example: 'Copa', maxLength: 120, description: 'Texto parcial del nombre o videojuego' })
  @IsOptional() @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) @IsString() @MaxLength(120) q?: string;
  @ApiPropertyOptional({ example: 'Valorant', maxLength: 80, description: 'Coincidencia exacta del videojuego' })
  @IsOptional() @IsString() @MaxLength(80) videojuego?: string;
  @ApiPropertyOptional({ enum: EstadoTorneo }) @IsOptional() @IsEnum(EstadoTorneo) estado?: EstadoTorneo;
  @ApiPropertyOptional({ enum: ModalidadTorneo }) @IsOptional() @IsEnum(ModalidadTorneo) modalidad?: ModalidadTorneo;
  @ApiPropertyOptional({ example: '2027-02-01', format: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Día UTC de fechaInicio; se combina con los demás filtros' })
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString({ strict: true }) fecha?: string;
}
