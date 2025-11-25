import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Marca } from '../../marcas/entities/marca.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Lote } from '../../lotes/entities/lote.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  principio_activo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  concentracion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  presentacion: string;

  @ManyToOne(() => Categoria, { eager: true, nullable: true })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null;

  @ManyToOne(() => Marca, { eager: true, nullable: true })
  @JoinColumn({ name: 'marca_id' })
  marca: Marca | null;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  codigo_barra: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  codigo_interno: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precio_compra: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precio_venta: number;

  @Column('int', { default: 0 })
  stock_minimo: number;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => Lote, (lote) => lote.producto)
  lotes: Lote[];
}
