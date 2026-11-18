import { IsDateString, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CrearPartidoDto {
  @ApiProperty({ type: 'integer', minimum: 1, example: 1 }) @IsInt() @Min(1) torneoId: number;
  @ApiProperty({ type: 'integer', minimum: 1, example: 2, description: 'Equipo con inscripción confirmada en el torneo' }) @IsInt() @Min(1) equipoLocalId: number;
  @ApiProperty({ type: 'integer', minimum: 1, example: 3, description: 'Debe ser distinto del local y tener inscripción confirmada' }) @IsInt() @Min(1) equipoVisitanteId: number;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-02-02T18:00:00.000Z', description: 'Fecha ISO 8601; no puede preceder al inicio del torneo' }) @IsDateString() fechaHora: string;
  @ApiProperty({ example: 'Jornada 1', minLength: 1, maxLength: 80 }) @IsString() @MinLength(1) @MaxLength(80) ronda: string;
}
