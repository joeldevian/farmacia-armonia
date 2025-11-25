import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { VentaDetalle } from '../../ventas-detalle/entities/ventas-detalle.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente | null;

  @Column({ type: 'varchar', nullable: true })
  cliente_id: string | null; // Columna para almacenar el ID del cliente, si existe

  @Column({ type: 'varchar' })
  tipo_comprobante: string; // Ej: 'BOLETA', 'FACTURA'

  @Column({ type: 'varchar' })
  numero_serie: string;

  @Column({ type: 'varchar' })
  numero_correlativo: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_venta: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar' })
  metodo_pago: string; // Ej: 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;

  @OneToMany(() => VentaDetalle, (ventaDetalle) => ventaDetalle.venta, { cascade: true })
  detalles: VentaDetalle[];
}