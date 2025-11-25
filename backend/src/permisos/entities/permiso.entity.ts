import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string; // e.g., 'productos:create', 'usuarios:view'

  @Column({ type: 'text', nullable: true })
  descripcion: string;
}
