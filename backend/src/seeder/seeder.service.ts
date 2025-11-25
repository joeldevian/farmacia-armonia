import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(InventarioKardex)
    private readonly inventarioKardexRepository: Repository<InventarioKardex>,
    @InjectRepository(AlertaStock)
    private readonly alertaStockRepository: Repository<AlertaStock>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private readonly ventaDetalleRepository: Repository<VentaDetalle>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') {
      this.logger.log('Seeding no se ejecuta en producción.');
      return;
    }
    
    this.logger.log('Limpiando y poblando la base de datos de desarrollo...');
    await this.cleanDatabase();
    await this.seedData();
  }

  private async cleanDatabase() {
    this.logger.log('Limpiando la base de datos con TRUNCATE...CASCADE...');
    await this.productoRepository.query(
      'TRUNCATE TABLE "ventas_detalle", "ventas", "usuarios_roles", "roles_permisos", "usuarios", "roles", "permisos", "auditorias", "inventario_kardex", "alertas_stock", "lotes", "productos", "marcas", "categorias", "clientes", "proveedores" RESTART IDENTITY CASCADE;',
    );
    this.logger.log('Base de datos limpiada.');
  }

  private async seedData() {
    this.logger.log('Iniciando la carga de datos de muestra...');

    // 1. Seed Permisos
    const permisosData = [
      { nombre: 'Gestionar Usuarios', codigo: 'users:manage', descripcion: 'Permite crear, editar y eliminar usuarios' },
      { nombre: 'Gestionar Roles', codigo: 'roles:manage', descripcion: 'Permite crear, editar y eliminar roles' },
      { nombre: 'Gestionar Permisos', codigo: 'permisos:manage', descripcion: 'Permite crear, editar y eliminar permisos' },
      { nombre: 'Ver Productos', codigo: 'products:view', descripcion: 'Permite ver la lista y detalles de productos' },
      { nombre: 'Crear Productos', codigo: 'products:create', descripcion: 'Permite crear nuevos productos' },
      { nombre: 'Editar Productos', codigo: 'products:edit', descripcion: 'Permite editar productos existentes' },
      { nombre: 'Eliminar Productos', codigo: 'products:delete', descripcion: 'Permite eliminar productos' },
      { nombre: 'Gestionar Lotes', codigo: 'lotes:manage', descripcion: 'Permite gestionar lotes de productos' },
      { nombre: 'Ver Auditoría', codigo: 'audits:view', descripcion: 'Permite ver los registros de auditoría' },
    ];
    const createdPermisos: Permiso[] = [];
    for (const data of permisosData) {
      const permiso = this.permisoRepository.create(data);
      createdPermisos.push(await this.permisoRepository.save(permiso));
    }
    this.logger.log(`Creados ${createdPermisos.length} permisos.`);

    // 2. Seed Roles
    const adminPermisos = createdPermisos; // Admin gets all permissions
    const empleadoPermisos = createdPermisos.filter(p => p.codigo === 'products:view' || p.codigo === 'products:create');

    const adminRole = this.roleRepository.create({
      nombre: 'Administrador',
      descripcion: 'Rol con acceso total al sistema',
      permisos: adminPermisos,
    });
    const savedAdminRole = await this.roleRepository.save(adminRole);
    this.logger.log('Creado rol: Administrador');

    const empleadoRole = this.roleRepository.create({
      nombre: 'Empleado',
      descripcion: 'Rol con permisos limitados para operaciones diarias',
      permisos: empleadoPermisos,
    });
    const savedEmpleadoRole = await this.roleRepository.save(empleadoRole);
    this.logger.log('Creado rol: Empleado');
    
    // 3. Seed Users
    const adminUser = this.usuarioRepository.create({
      nombres: 'Admin',
      apellidos: 'Principal',
      email: 'admin@armonia.com',
      contrasena: 'admin123', // Will be hashed by entity hook
      telefono: '999888777',
      roles: [savedAdminRole],
    });
    await this.usuarioRepository.save(adminUser);
    this.logger.log('Creado usuario: admin@armonia.com');

    const empleadoUser = this.usuarioRepository.create({
      nombres: 'Maria',
      apellidos: 'Perez',
      email: 'empleado@armonia.com',
      contrasena: 'empleado123', // Will be hashed by entity hook
      telefono: '999111222',
      roles: [savedEmpleadoRole],
    });
    await this.usuarioRepository.save(empleadoUser);
    this.logger.log('Creado usuario: empleado@armonia.com');

    // 4. Seed Clientes
    this.logger.log('Creando clientes de muestra...');
    const clientesData = [
      { tipo_documento: 'DNI', numero_documento: '78945612', nombres: 'Carlos', apellidos: 'Ruiz', telefono: '987654321', direccion: 'Av. Las Flores 123', email: 'carlos.ruiz@example.com', estado: true },
      { tipo_documento: 'DNI', numero_documento: '12345678', nombres: 'Ana', apellidos: 'Gomez', telefono: '912345678', direccion: 'Jr. Los Girasoles 456', email: 'ana.gomez@example.com', estado: true },
      { tipo_documento: 'RUC', numero_documento: '20123456789', nombres: 'Farmacia Salud', apellidos: 'S.A.C.', telefono: '014567890', direccion: 'Calle Real 789', email: 'salud@example.com', estado: true },
    ];
    for (const data of clientesData) {
      const cliente = this.clienteRepository.create(data);
      await this.clienteRepository.save(cliente);
    }
    this.logger.log(`Creados ${clientesData.length} clientes.`);

    // 5. Seed Proveedores
    this.logger.log('Creando proveedores de muestra...');
    const proveedoresData = [
      { razon_social: 'Distribuidora FarmaCorp SAC', ruc: '20100200301', direccion: 'Av. El Sol 100', telefono: '012345678', email: 'ventas@farmacorp.com', representante: 'Gerardo Salas', estado: true },
      { razon_social: 'Laboratorios Vida Pura', ruc: '20300400502', direccion: 'Jr. Los Andes 200', telefono: '019876543', email: 'contacto@vidapura.com', representante: 'Silvia Rojas', estado: true },
      { razon_social: 'Quimica Salud SA', ruc: '20500600703', direccion: 'Calle Mercaderes 300', telefono: '011122334', email: 'pedidos@quimicasalud.com', representante: 'Roberto Vera', estado: true },
    ];
    for (const data of proveedoresData) {
      const proveedor = this.proveedorRepository.create(data);
      await this.proveedorRepository.save(proveedor);
    }
    this.logger.log(`Creados ${proveedoresData.length} proveedores.`);

    // Existing Seeding: Marcas, Categorias, Productos, Lotes
    const marcasData = [
      { nombre: 'Bayer', descripcion: 'Productos farmacéuticos Bayer' },
      { nombre: 'Pfizer', descripcion: 'Productos farmacéuticos Pfizer' },
      { nombre: 'Roche', descripcion: 'Productos farmacéuticos Roche' },
      { nombre: 'Johnson & Johnson', descripcion: 'Productos de salud Johnson & Johnson' },
      { nombre: 'Laboratorios Genéricos de Perú', descripcion: 'Laboratorios Nacionales' },
    ];
    const createdMarcas: Marca[] = [];
    for (const data of marcasData) {
      const marca = this.marcaRepository.create(data);
      createdMarcas.push(await this.marcaRepository.save(marca));
    }
    this.logger.log(`Creadas ${createdMarcas.length} marcas.`);

    const categoriasData = [
      { nombre: 'Analgésicos', descripcion: 'Medicamentos para el dolor' },
      { nombre: 'Antibióticos', descripcion: 'Medicamentos para infecciones bacterianas' },
      { nombre: 'Antiinflamatorios', descripcion: 'Medicamentos para reducir la inflamación' },
      { nombre: 'Vitaminas y Suplementos', descripcion: 'Suplementos vitamínicos' },
      { nombre: 'Dermatología', descripcion: 'Productos para la piel' },
    ];
    const createdCategorias: Categoria[] = [];
    for (const data of categoriasData) {
      const categoria = this.categoriaRepository.create(data);
      createdCategorias.push(await this.categoriaRepository.save(categoria));
    }
    this.logger.log(`Creadas ${createdCategorias.length} categorías.`);

    const productosToCreate = 20;
    this.logger.log(`Creando ${productosToCreate} productos de muestra...`);

    const baseProductNames = [
      `Tabletas Analgésicas`, `Jarabe para la Tos`, `Crema Antifúngica`,
      `Cápsulas Multivitamínicas`, `Inyección Antibiótica`, `Pomada Antiinflamatoria`,
      `Gotas para Ojos Secos`, `Pastillas para Alergias`, `Suplemento Calcio`,
      `Gel Antiácido`, `Sprays Nasales`, `Pastillas para la Garganta`,
    ];

    for (let i = 0; i < productosToCreate; i++) {
      const randomMarca = createdMarcas[i % createdMarcas.length];
      const randomCategoria = createdCategorias[i % createdCategorias.length];
      const selectedBaseName = baseProductNames[i % baseProductNames.length];
      
      const nombreCompletoProducto = `${selectedBaseName} ${randomMarca.nombre.split(' ')[0]}`; // Ej: "Tabletas Analgésicas Bayer"
      const descripcionProducto = `Producto ${selectedBaseName} de la reconocida marca ${randomMarca.nombre}, ideal para la categoría de ${randomCategoria.nombre}.`;
      const principioActivo = `Principio Activo ${selectedBaseName.split(' ')[0]} ${i + 1}`;
      const concentracion = `${(i % 5) * 50 + 250}mg/ml`;
      const presentacion = i % 2 === 0 ? 'Caja x 30 Tabletas' : 'Frasco x 120ml';

      const producto = this.productoRepository.create({
        nombre: nombreCompletoProducto,
        descripcion: descripcionProducto,
        principio_activo: principioActivo,
        concentracion: concentracion,
        presentacion: presentacion,
        categoria: randomCategoria,
        marca: randomMarca,
        codigo_barra: `7750${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}${i.toString().padStart(2, '0')}`, // Código de barra más realista
        codigo_interno: `P-${(i+1).toString().padStart(4, '0')}`,
        precio_compra: parseFloat((Math.random() * 20 + 5).toFixed(2)),
        precio_venta: parseFloat((Math.random() * 30 + 15).toFixed(2)),
        stock_minimo: Math.floor(Math.random() * 10) + 10,
        estado: true,
      });
      const savedProducto = await this.productoRepository.save(producto);

      // Create a Lote for each product
      const fechaFabricacion = new Date();
      fechaFabricacion.setMonth(fechaFabricacion.getMonth() - (Math.floor(Math.random() * 12) + 1));
      const fechaVencimiento = new Date(fechaFabricacion);
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + Math.floor(Math.random() * 3) + 2);

      const lote = this.loteRepository.create({
        producto: savedProducto,
        numero_lote: `LOTE-FARMA-${Math.floor(Math.random() * 100000)}`,
        fecha_fabricacion: fechaFabricacion,
        fecha_vencimiento: fechaVencimiento,
        stock: Math.floor(Math.random() * 200) + 50,
        estado: true,
      });
      await this.loteRepository.save(lote);
    }
    this.logger.log(`Creados ${productosToCreate} productos y sus lotes.`);
    
    await this.seedVentas();

    this.logger.log('Proceso de seeding finalizado.');
  }

  private async seedVentas() {
    this.logger.log('Creando ventas de muestra...');
    const productos = await this.productoRepository.find({ relations: ['lotes'] });
    const clientes = await this.clienteRepository.find();
    let ventaCounter = 1;

    if (productos.length === 0) {
      this.logger.warn('No hay productos para crear ventas de muestra.');
      return;
    }

    for (let i = 0; i < 15; i++) {
      const clienteAleatorio = clientes.length > 0 ? clientes[i % clientes.length] : null;
      const detallesVenta: VentaDetalle[] = [];
      let subtotalVenta = 0;

      const numProductosEnVenta = Math.floor(Math.random() * 4) + 1;
      const productosDisponibles = [...productos.filter(p => p.lotes.some(l => l.stock > 0))];

      for (let j = 0; j < numProductosEnVenta; j++) {
        if (productosDisponibles.length === 0) break;

        const productoIndex = Math.floor(Math.random() * productosDisponibles.length);
        const productoSeleccionado = productosDisponibles[productoIndex];
        
        productosDisponibles.splice(productoIndex, 1);

        const loteActivo = productoSeleccionado.lotes.find(l => l.stock > 0);
        if (!loteActivo) continue;

        const cantidad = Math.floor(Math.random() * Math.min(loteActivo.stock, 5)) + 1;
        const precioUnitario = productoSeleccionado.precio_venta;
        const subtotalDetalle = cantidad * precioUnitario;
        
        const detalle = this.ventaDetalleRepository.create({
            producto: productoSeleccionado,
            lote: loteActivo,
            cantidad: cantidad,
            precio_unitario: precioUnitario,
            subtotal: subtotalDetalle,
            descuento: 0,
        });
        detallesVenta.push(detalle);
        subtotalVenta += subtotalDetalle;

        loteActivo.stock -= cantidad;
        await this.loteRepository.save(loteActivo);
      }

      if (detallesVenta.length === 0) continue;

      const impuestos = subtotalVenta * 0.18; // IGV 18%
      const total = subtotalVenta + impuestos;

      const venta = this.ventaRepository.create({
        cliente: clienteAleatorio,
        tipo_comprobante: i % 2 === 0 ? 'BOLETA' : 'FACTURA',
        numero_serie: 'B001',
        numero_correlativo: ventaCounter.toString().padStart(8, '0'),
        metodo_pago: 'EFECTIVO',
        subtotal: subtotalVenta,
        impuestos,
        total,
        detalles: detallesVenta,
        fecha_venta: new Date(new Date().setDate(new Date().getDate() - (15 - i))),
      });
      
      await this.ventaRepository.save(venta);
      ventaCounter++;
    }

    this.logger.log(`Creadas ${ventaCounter - 1} ventas de muestra.`);
  }
}
