import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('auditorias')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  usuario: string; // Puede ser el email o el ID del usuario

  @Column({ type: 'varchar', length: 100 })
  modulo: string;

  @Column({ type: 'varchar', length: 100 })
  accion: string; // CRUD (create, read, update, delete) o login/logout

  @Column({ type: 'text', nullable: true })
  detalle: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string;
}
