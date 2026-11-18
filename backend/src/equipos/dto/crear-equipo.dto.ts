import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CrearEquipoDto {
 @IsString() @MinLength(2) @MaxLength(80) nombre: string;
 @IsString() @MinLength(2) @MaxLength(80) videojuego: string;
 @IsOptional() @IsString() @MaxLength(500) descripcion?: string;
 @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true }) integranteIds?: number[];
}
export class ActualizarEquipoDto extends PartialType(CrearEquipoDto) {}
