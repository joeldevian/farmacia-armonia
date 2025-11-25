import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm'; // Import DataSource for transactions
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { InventarioKardexService } from '../inventario-kardex/inventario-kardex.service'; // Inject Kardex Service
import { TipoMovimientoKardex } from '../inventario-kardex/entities/inventario-kardex.entity';
import { VentaDetalle } from '../ventas-detalle/entities/ventas-detalle.entity';

@Injectable()
export class VentaService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    private readonly inventarioKardexService: InventarioKardexService,
    private dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { clienteId, detalles, ...rest } = createVentaDto;

      let cliente: Cliente | null = null;
      if (clienteId) {
        cliente = await this.clienteRepository.findOneBy({ id: clienteId });
        if (!cliente) {
          throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado.`);
        }
      }

      // Generar numero_serie y numero_correlativo
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      // const day = now.getDate().toString().padStart(2, '0'); // No usado directamente en el formato de serie

      // Ejemplo simplificado: "VENTA-YYYYMM"
      const numeroSerie = `V-${year}${month}`; 
      
      // Obtener el último correlativo para este numeroSerie o empezar en 1
      const lastVenta = await this.ventaRepository.findOne({
        where: { numero_serie: numeroSerie },
        order: { numero_correlativo: 'DESC' },
      });
      // Asegurarse de que numero_correlativo no sea undefined antes de intentar split
      const lastCorrelativoPart = lastVenta?.numero_correlativo?.split('-').pop();
      const lastCorrelativo = lastCorrelativoPart ? parseInt(lastCorrelativoPart) : 0;
      const numeroCorrelativo = `${numeroSerie}-${(lastCorrelativo + 1).toString().padStart(4, '0')}`;


      const venta = this.ventaRepository.create({
        ...rest,
        ...(cliente && { cliente }), // Asignar cliente solo si no es null
        cliente_id: clienteId || null, // Asegurarse de que cliente_id sea string o null
        numero_serie: numeroSerie,
        numero_correlativo: numeroCorrelativo,
        fecha_venta: new Date(),
        detalles: [],
      });

      // Initialize totals
      venta.subtotal = 0;
      venta.impuestos = 0;
      venta.total = 0;

      const savedVenta = await queryRunner.manager.save(venta) as Venta; // Aserción de tipo forzada

      for (const detalleDto of detalles) {
        const producto = await this.productoRepository.findOneBy({ id: detalleDto.productoId });
        if (!producto) {
          throw new NotFoundException(`Producto con ID ${detalleDto.productoId} no encontrado.`);
        }
        
        // Find available lotes (simplistic: just pick the first one with enough stock)
        const lotesDisponibles = await this.loteRepository.find({
          where: { producto: { id: producto.id }, stock: MoreThanOrEqual(detalleDto.cantidad) },
          order: { fecha_vencimiento: 'ASC' },
        });

        if (lotesDisponibles.length === 0) {
          throw new BadRequestException(`No hay suficiente stock disponible para el producto ${producto.nombre}.`);
        }
        
        const loteSeleccionado = lotesDisponibles[0];

        // Decrement stock
        loteSeleccionado.stock -= detalleDto.cantidad;
        await queryRunner.manager.save(loteSeleccionado);

        // Crear InventarioKardex entry (SALIDA)
        await this.inventarioKardexService.create({
          producto_id: producto.id,
          lote_id: loteSeleccionado.id,
          tipo_movimiento: TipoMovimientoKardex.SALIDA,
          cantidad: detalleDto.cantidad,
          costo_unitario: producto.precio_venta, // Usamos el precio de venta del producto para el Kardex
          costo_total: detalleDto.cantidad * producto.precio_venta,
          descripcion: `Salida por Venta #${savedVenta.numero_serie}-${savedVenta.numero_correlativo}`,
        });

        const totalDetalle = producto.precio_venta * detalleDto.cantidad;

        const ventaDetalle = queryRunner.manager.create(VentaDetalle, {
          ...detalleDto,
          precio_unitario: producto.precio_venta, // Precio autoritativo
          subtotal: totalDetalle, // El subtotal de la línea es el total porque precio_venta incluye IGV
          venta: savedVenta,
          producto: producto,
          lote: loteSeleccionado,
        });

        await queryRunner.manager.save(ventaDetalle);

        // Acumulamos al total de la venta. El desglose se hará al final.
        savedVenta.total += totalDetalle;
      }

      // Con el total correcto, ahora desglosamos la base imponible (subtotal) y los impuestos.
      const IGV_DIVISOR = 1.18;
      savedVenta.subtotal = savedVenta.total / IGV_DIVISOR;
      savedVenta.impuestos = savedVenta.total - savedVenta.subtotal;

      await queryRunner.manager.save(savedVenta); // Update totals

      await queryRunner.commitTransaction();
      return savedVenta;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Error al procesar la venta.');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: { page: number, limit: number }): Promise<{ data: Venta[], total: number, page: number, lastPage: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.ventaRepository.findAndCount({
      relations: ['cliente', 'detalles', 'detalles.producto', 'detalles.lote'],
      skip: skip,
      take: limit,
      order: { fecha_venta: 'DESC' },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({ where: { id }, relations: ['cliente', 'detalles', 'detalles.producto', 'detalles.lote'] });
    if (!venta) {
      throw new NotFoundException(`Venta con el id #${id} no encontrada.`);
    }
    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const { clienteId, detalles, ...rest } = updateVentaDto; // Cambiado cliente_id a clienteId

    const venta = await this.ventaRepository.preload({
      id: id,
      ...rest,
    });

    if (!venta) {
      throw new NotFoundException(`Venta con el id #${id} no encontrado.`);
    }

    if (clienteId !== undefined) { // Cambiado cliente_id a clienteId
      const cliente = clienteId ? await this.clienteRepository.findOneBy({ id: clienteId }) : null; // Cambiado cliente_id a clienteId
      if (clienteId && !cliente) { // Cambiado cliente_id a clienteId
        throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado.`);
      }
      venta.cliente = cliente;
    }
    
    return this.ventaRepository.save(venta);
  }

  async remove(id: string) {
    // Al anular una venta, debemos revertir el stock y registrarlo en Kardex.
    // Esto es complejo y excede el alcance de un CRUD básico.
    // Por simplicidad, solo marcaremos la venta como anulada.
    const venta = await this.findOne(id);
    venta.estado = false;
    await this.ventaRepository.save(venta);
    // TODO: Implementar lógica de Kardex para reversión de stock al anular la venta.
  }
}
