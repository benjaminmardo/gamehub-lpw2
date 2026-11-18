import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({ example: 400 }) statusCode: number;
  @ApiProperty({ oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }], example: 'Revisa los datos enviados' }) message: string | string[];
  @ApiPropertyOptional({ example: 'Bad Request' }) error?: string;
}
export class MensajeDto {
  @ApiProperty({ example: 'Operación realizada' }) mensaje: string;
}
export class UsuarioPublicoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Camila Pérez' }) nombre: string;
  @ApiProperty({ example: 'camiplay' }) alias: string;
  @ApiProperty({ example: 'camila@ipvg.cl', format: 'email' }) correo: string;
  @ApiProperty({ enum: ['admin', 'estudiante'], example: 'estudiante' }) rol: string;
  @ApiProperty({ example: true }) activo: boolean;
  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2026-11-18T15:00:00.000Z' }) creadoEn?: string;
}
export class SesionDto {
  @ApiProperty({ description: 'JWT Bearer con vencimiento de ocho horas', example: 'eyJhbGciOiJIUzI1NiJ9...' }) access_token: string;
  @ApiProperty({ type: UsuarioPublicoDto }) usuario: UsuarioPublicoDto;
}
export class EquipoPublicoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Cóndores IPVG', maxLength: 80 }) nombre: string;
  @ApiProperty({ example: 'Valorant', maxLength: 80 }) videojuego: string;
  @ApiProperty({ example: 'Equipo de la comunidad IPVG', maxLength: 500 }) descripcion: string;
  @ApiProperty({ example: 1 }) capitanId: number;
  @ApiPropertyOptional({ type: UsuarioPublicoDto, description: 'Incluido cuando se consulta la relación' }) capitan?: UsuarioPublicoDto;
  @ApiPropertyOptional({ type: [UsuarioPublicoDto], description: 'Incluye al capitán; disponible en consultas de equipos' }) integrantes?: UsuarioPublicoDto[];
  @ApiPropertyOptional({ type: String, format: 'date-time' }) creadoEn?: string;
}
export class TorneoPublicoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 'Copa IPVG', maxLength: 120 }) nombre: string;
  @ApiProperty({ example: 'Valorant', maxLength: 80 }) videojuego: string;
  @ApiProperty({ enum: ['LIGA', 'ELIMINACION'], example: 'LIGA' }) modalidad: string;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-02-01T18:00:00.000Z' }) fechaInicio: string;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-01-31T18:00:00.000Z' }) cierreInscripcion: string;
  @ApiProperty({ type: 'integer', minimum: 2, maximum: 256, example: 8 }) cupoMaximo: number;
  @ApiProperty({ enum: ['ABIERTO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO'], example: 'ABIERTO' }) estado: string;
  @ApiProperty({ example: true }) permiteEmpate: boolean;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) creadoEn?: string;
}
export class InscripcionPublicaDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 1 }) torneoId: number;
  @ApiProperty({ example: 2 }) equipoId: number;
  @ApiProperty({ type: String, format: 'date-time', example: '2026-11-18T15:30:00.000Z' }) fecha: string;
  @ApiProperty({ enum: ['CONFIRMADA', 'CANCELADA'], example: 'CONFIRMADA' }) estado: string;
  @ApiPropertyOptional({ type: EquipoPublicoDto, description: 'Incluido al listar inscripciones' }) equipo?: EquipoPublicoDto;
  @ApiPropertyOptional({ type: TorneoPublicoDto, description: 'Incluido al listar inscripciones' }) torneo?: TorneoPublicoDto;
}
export class PartidoPublicoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 1 }) torneoId: number;
  @ApiProperty({ example: 2 }) equipoLocalId: number;
  @ApiProperty({ example: 3 }) equipoVisitanteId: number;
  @ApiProperty({ type: String, format: 'date-time', example: '2027-02-02T18:00:00.000Z' }) fechaHora: string;
  @ApiProperty({ example: 'Jornada 1', maxLength: 80 }) ronda: string;
  @ApiProperty({ enum: ['PROGRAMADO', 'FINALIZADO'], example: 'PROGRAMADO' }) estado: string;
  @ApiPropertyOptional({ type: TorneoPublicoDto }) torneo?: TorneoPublicoDto;
  @ApiPropertyOptional({ type: EquipoPublicoDto }) equipoLocal?: EquipoPublicoDto;
  @ApiPropertyOptional({ type: EquipoPublicoDto }) equipoVisitante?: EquipoPublicoDto;
}
export class ResultadoPublicoDto {
  @ApiProperty({ example: 1 }) id: number;
  @ApiProperty({ example: 1 }) partidoId: number;
  @ApiProperty({ type: 'integer', minimum: 0, example: 3 }) puntajeLocal: number;
  @ApiProperty({ type: 'integer', minimum: 0, example: 1 }) puntajeVisitante: number;
  @ApiProperty({ type: Number, nullable: true, example: 2, description: 'Calculado por el servidor; null si hay empate' }) ganadorId: number | null;
  @ApiProperty({ example: 1, description: 'ID del administrador autenticado que registró el resultado' }) registradoPor: number;
  @ApiPropertyOptional({ type: EquipoPublicoDto, nullable: true, description: 'Incluido al listar resultados; null en empate' }) ganador?: EquipoPublicoDto | null;
  @ApiPropertyOptional({ type: String, format: 'date-time' }) creadoEn?: string;
}
export class FilaRankingDto {
  @ApiProperty({ example: 2 }) equipoId: number;
  @ApiProperty({ example: 'Cóndores IPVG' }) nombre: string;
  @ApiProperty({ example: 3 }) jugados: number;
  @ApiProperty({ example: 2 }) victorias: number;
  @ApiProperty({ example: 1 }) empates: number;
  @ApiProperty({ example: 0 }) derrotas: number;
  @ApiProperty({ example: 7, description: '3 por victoria, 1 por empate y 0 por derrota' }) puntos: number;
  @ApiProperty({ example: 9 }) aFavor: number;
  @ApiProperty({ example: 3 }) enContra: number;
  @ApiProperty({ example: 6, description: 'Puntaje a favor menos puntaje en contra' }) diferencia: number;
}
