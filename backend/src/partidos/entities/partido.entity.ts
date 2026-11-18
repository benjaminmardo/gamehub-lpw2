import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Torneo } from '../../torneos/entities/torneo.entity';
import { Equipo } from '../../equipos/entities/equipo.entity';
@Entity('partidos')
export class Partido {
 @PrimaryGeneratedColumn() id: number;
 @Column() torneoId: number;
 @ManyToOne(() => Torneo, { onDelete: 'RESTRICT' }) torneo: Torneo;
 @Column() equipoLocalId: number;
 @ManyToOne(() => Equipo, { onDelete: 'RESTRICT' }) equipoLocal: Equipo;
 @Column() equipoVisitanteId: number;
 @ManyToOne(() => Equipo, { onDelete: 'RESTRICT' }) equipoVisitante: Equipo;
 @Column({ type: 'datetime' }) fechaHora: Date;
 @Column({ length: 80 }) ronda: string;
 @Column({ type: 'enum', enum: ['PROGRAMADO', 'FINALIZADO'], default: 'PROGRAMADO' }) estado: 'PROGRAMADO' | 'FINALIZADO';
}
