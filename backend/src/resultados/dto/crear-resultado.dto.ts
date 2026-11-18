import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CrearResultadoDto {
  @ApiProperty({ type: 'integer', minimum: 1, example: 1, description: 'Un solo resultado oficial por partido' }) @IsInt() @Min(1) partidoId: number;
  @ApiProperty({ type: 'integer', minimum: 0, example: 3 }) @IsInt() @Min(0) puntajeLocal: number;
  @ApiProperty({ type: 'integer', minimum: 0, example: 1 }) @IsInt() @Min(0) puntajeVisitante: number;
}
