import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductosModule } from './productos/productos.module';
import { MarcasModule } from './marcas/marcas.module';
import { CategoriasModule } from './categorias/categorias.module';
import { LotesModule } from './lotes/lotes.module';
import { SeederModule } from './seeder/seeder.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { PermisosModule } from './permisos/permisos.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { InventarioKardexModule } from './inventario-kardex/inventario-kardex.module';
import { AlertasStockModule } from './alertas-stock/alertas-stock.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { VentasModule } from './ventas/ventas.module';
import { VentasDetalleModule } from './ventas-detalle/ventas-detalle.module';
import { DevolucionesModule } from './devoluciones/devoluciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true, // Hace que ConfigService esté disponible en toda la app
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // En desarrollo. Para producción, usar migraciones.
      }),
    }),
    ProductosModule,
    MarcasModule,
    CategoriasModule,
    LotesModule,
    SeederModule,
    UsuariosModule,
    RolesModule,
    PermisosModule,
    AuditoriaModule,
    AuthModule,
    InventarioKardexModule,
    AlertasStockModule,
    ClientesModule,
    ProveedoresModule,
    VentasModule,
    VentasDetalleModule,
    DevolucionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
