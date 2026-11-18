import { IsDateString, IsInt, IsString, MaxLength, Min, MinLength } from 'class-validator';
export class CrearPartidoDto {
 @IsInt() @Min(1) torneoId: number;
 @IsInt() @Min(1) equipoLocalId: number;
 @IsInt() @Min(1) equipoVisitanteId: number;
 @IsDateString() fechaHora: string;
 @IsString() @MinLength(1) @MaxLength(80) ronda: string;
}
