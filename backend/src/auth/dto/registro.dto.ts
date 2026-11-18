import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegistroDto {
  @ApiProperty({ example: 'Camila Pérez', description: 'Nombre público del estudiante' })
  @IsString() nombre: string;
  @ApiProperty({ example: 'camiplay', description: 'Alias único de la comunidad' })
  @IsString() alias: string;
  @ApiProperty({ example: 'camila@ipvg.cl', format: 'email', description: 'Correo único; se normaliza a minúsculas' })
  @IsEmail() correo: string;
  @ApiProperty({ example: 'ClaveDemo2027', minLength: 6, writeOnly: true, format: 'password', description: 'Se guarda únicamente su hash bcrypt' })
  @IsString() @MinLength(6) password: string;
}
