import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Equipo } from '../../equipos/entities/equipo.entity';
import { Torneo } from '../../torneos/entities/torneo.entity';

export enum EstadoInscripcion { CONFIRMADA = 'CONFIRMADA', CANCELADA = 'CANCELADA' }

@Entity('inscripciones')
@Unique('UQ_inscripcion_torneo_equipo', ['torneoId', 'equipoId'])
export class Inscripcion {
  @PrimaryGeneratedColumn() id: number;
  @Column() torneoId: number;
  @ManyToOne(() => Torneo, { onDelete: 'RESTRICT' }) torneo: Torneo;
  @Column() equipoId: number;
  @ManyToOne(() => Equipo, { onDelete: 'RESTRICT' }) equipo: Equipo;
  @CreateDateColumn() fecha: Date;
  @Column({ type: 'enum', enum: EstadoInscripcion, default: EstadoInscripcion.CONFIRMADA }) estado: EstadoInscripcion;
}
