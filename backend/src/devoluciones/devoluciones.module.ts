import { Module } from '@nestjs/common';
import { DevolucionService } from './devoluciones.service';
import { DevolucionController } from './devoluciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Devolucion } from './entities/devolucione.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/entities/producto.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Devolucion, Venta, Producto])],
  controllers: [DevolucionController],
  providers: [DevolucionService],
})
export class DevolucionesModule {}
