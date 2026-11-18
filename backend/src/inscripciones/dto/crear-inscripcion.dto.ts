import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CrearInscripcionDto {
  @ApiProperty({ type: 'integer', minimum: 1, example: 1 }) @IsInt() @Min(1) torneoId: number;
  @ApiProperty({ type: 'integer', minimum: 1, example: 2, description: 'El usuario autenticado debe ser su capitán o administrador' }) @IsInt() @Min(1) equipoId: number;
}
export class ConsultarInscripcionesDto {
  @ApiPropertyOptional({ type: 'integer', minimum: 1, example: 1, description: 'Limita el listado al torneo indicado' })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) torneoId?: number;
}
