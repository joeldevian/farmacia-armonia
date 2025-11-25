import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Producto, { eager: true, onDelete: 'CASCADE' }) // Relación con Producto
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ type: 'varchar', length: 255 })
  numero_lote: string;

  @Column({ type: 'date' })
  fecha_fabricacion: Date;

  @Column({ type: 'date' })
  fecha_vencimiento: Date;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;
}

