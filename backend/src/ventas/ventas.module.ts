import { Module } from '@nestjs/common';
import { VentaService } from './ventas.service';
import { VentaController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { VentaDetalle } from '../ventas-detalle/entities/ventas-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { InventarioKardexModule } from '../inventario-kardex/inventario-kardex.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Cliente, VentaDetalle, Producto, Lote]),
    InventarioKardexModule,
  ],
  controllers: [VentaController],
  providers: [VentaService],
  exports: [VentaService] // Exportar VentaService si otros módulos lo van a usar
})
export class VentasModule {}
