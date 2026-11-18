import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ModalidadTorneo { LIGA = 'LIGA', ELIMINACION = 'ELIMINACION' }
export enum EstadoTorneo { ABIERTO = 'ABIERTO', EN_CURSO = 'EN_CURSO', FINALIZADO = 'FINALIZADO', CANCELADO = 'CANCELADO' }

@Entity('torneos')
export class Torneo {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) nombre: string;
  @Column({ length: 80 }) videojuego: string;
  @Column({ type: 'enum', enum: ModalidadTorneo, default: ModalidadTorneo.LIGA }) modalidad: ModalidadTorneo;
  @Column({ type: 'datetime' }) fechaInicio: Date;
  @Column({ type: 'datetime' }) cierreInscripcion: Date;
  @Column({ type: 'int', unsigned: true }) cupoMaximo: number;
  @Column({ type: 'enum', enum: EstadoTorneo, default: EstadoTorneo.ABIERTO }) estado: EstadoTorneo;
  @Column({ default: true }) permiteEmpate: boolean;
  @CreateDateColumn() creadoEn: Date;
}
