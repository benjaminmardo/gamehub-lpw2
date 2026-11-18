import { ArrayUnique, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
export class CrearEquipoDto {
  @ApiProperty({ example: 'Cóndores IPVG', minLength: 2, maxLength: 80 })
  @IsString() @MinLength(2) @MaxLength(80) nombre: string;
  @ApiProperty({ example: 'Valorant', minLength: 2, maxLength: 80 })
  @IsString() @MinLength(2) @MaxLength(80) videojuego: string;
  @ApiPropertyOptional({ example: 'Equipo de la comunidad IPVG', maxLength: 500, default: '' })
  @IsOptional() @IsString() @MaxLength(500) descripcion?: string;
  @ApiPropertyOptional({ type: 'array', items: { type: 'integer', minimum: 1 }, uniqueItems: true, example: [2, 3], description: 'IDs de usuarios activos. El servidor incluye siempre al capitán autenticado.' })
  @IsOptional() @IsArray() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true }) integranteIds?: number[];
}
export class ActualizarEquipoDto extends PartialType(CrearEquipoDto) {}
