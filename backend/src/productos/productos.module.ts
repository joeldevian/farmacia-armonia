import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Marca } from '../marcas/entities/marca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria, Marca])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
