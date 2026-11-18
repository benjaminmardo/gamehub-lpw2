import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Partido } from '../../partidos/entities/partido.entity';
import { Equipo } from '../../equipos/entities/equipo.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
@Entity('resultados')
export class Resultado {
 @PrimaryGeneratedColumn() id: number;
 @Column({ unique: true }) partidoId: number;
 @OneToOne(() => Partido, { onDelete: 'RESTRICT' }) @JoinColumn() partido: Partido;
 @Column({ type: 'int', unsigned: true }) puntajeLocal: number;
 @Column({ type: 'int', unsigned: true }) puntajeVisitante: number;
 @Column({ type: 'int', nullable: true }) ganadorId: number | null;
 @ManyToOne(() => Equipo, { nullable: true, onDelete: 'RESTRICT' }) ganador: Equipo | null;
 @Column() registradoPor: number;
 @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'registradoPor' }) registrador: Usuario;
 @CreateDateColumn() creadoEn: Date;
}
