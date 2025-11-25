import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Marca } from '../marcas/entities/marca.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { Permiso } from '../permisos/entities/permiso.entity';
import { Role } from '../roles/entities/role.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { InventarioKardex } from '../inventario-kardex/entities/inventario-kardex.entity';
import { AlertaStock } from '../alertas-stock/entities/alertas-stock.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { VentaDetalle } from '../ventas-detalle/entities/ventas-detalle.entity';
import { Devolucion } from '../devoluciones/entities/devolucione.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Marca, Categoria, Producto, Lote, Permiso, Role, Usuario, InventarioKardex, AlertaStock, Cliente, Proveedor, Venta, VentaDetalle, Devolucion]),
  ],
  providers: [SeederService],
  exports: [SeederService], // Export so it can be used by AppModule
})
export class SeederModule {}
