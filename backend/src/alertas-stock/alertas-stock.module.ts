import { Module } from '@nestjs/common';
import { AlertaStockService } from './alertas-stock.service';
import { AlertaStockController } from './alertas-stock.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertaStock } from './entities/alertas-stock.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertaStock, Producto])],
  controllers: [AlertaStockController],
  providers: [AlertaStockService],
})
export class AlertasStockModule {}
