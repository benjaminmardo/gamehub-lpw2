import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class LoginDto {
  @ApiProperty({ example: 'camila@ipvg.cl', format: 'email' }) @IsEmail() correo: string;
  @ApiProperty({ example: 'ClaveDemo2027', format: 'password', writeOnly: true }) @IsString() password: string;
}
