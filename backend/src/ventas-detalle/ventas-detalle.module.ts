import { Module } from '@nestjs/common';
import { VentaDetalleService } from './ventas-detalle.service';
import { VentaDetalleController } from './ventas-detalle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaDetalle } from './entities/ventas-detalle.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';


@Module({
  imports: [TypeOrmModule.forFeature([VentaDetalle, Venta, Producto, Lote])],
  controllers: [VentaDetalleController],
  providers: [VentaDetalleService],
})
export class VentasDetalleModule {}
