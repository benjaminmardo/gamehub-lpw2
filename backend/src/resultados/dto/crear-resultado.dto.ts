import { IsInt, Max, Min } from 'class-validator';
export class CrearResultadoDto {
 @IsInt() @Min(1) partidoId: number;
 @IsInt() @Min(0) @Max(1000000) puntajeLocal: number;
 @IsInt() @Min(0) @Max(1000000) puntajeVisitante: number;
}
