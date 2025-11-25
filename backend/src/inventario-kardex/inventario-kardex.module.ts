import { Module } from '@nestjs/common';
import { InventarioKardexService } from './inventario-kardex.service';
import { InventarioKardexController } from './inventario-kardex.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioKardex } from './entities/inventario-kardex.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { AlertaStock } from '../alertas-stock/entities/alertas-stock.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioKardex, Producto, Lote, AlertaStock])],
  controllers: [InventarioKardexController],
  providers: [InventarioKardexService],
  exports: [InventarioKardexService],
})
export class InventarioKardexModule {}
