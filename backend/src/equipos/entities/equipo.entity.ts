import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
@Entity('equipos')
export class Equipo {
 @PrimaryGeneratedColumn() id: number;
 @Column({ unique: true, length: 80 }) nombre: string;
 @Column({ length: 80 }) videojuego: string;
 @Column({ length: 500, default: '' }) descripcion: string;
 @Column() capitanId: number;
 @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' }) capitan: Usuario;
 @ManyToMany(() => Usuario) @JoinTable({ name: 'equipo_integrantes' }) integrantes: Usuario[];
 @CreateDateColumn() creadoEn: Date;
}
