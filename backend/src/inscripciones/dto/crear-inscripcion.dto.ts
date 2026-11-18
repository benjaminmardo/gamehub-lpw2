import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CrearInscripcionDto {
  @IsInt() @Min(1) torneoId: number;
  @IsInt() @Min(1) equipoId: number;
}

export class ConsultarInscripcionesDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) torneoId?: number;
}
