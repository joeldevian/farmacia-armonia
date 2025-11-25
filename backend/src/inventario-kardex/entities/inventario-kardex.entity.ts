import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Lote } from '../../lotes/entities/lote.entity';

export enum TipoMovimientoKardex {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE',
}

@Entity('inventario_kardex')
export class InventarioKardex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Producto, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ManyToOne(() => Lote, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lote_id' })
  lote: Lote;

  @Column({
    type: 'enum',
    enum: TipoMovimientoKardex,
  })
  tipo_movimiento: TipoMovimientoKardex;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_unitario: number;

  @Column('decimal', { precision: 10, scale: 2 })
  costo_total: number;

  @Column('text', { nullable: true })
  descripcion: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;
}
