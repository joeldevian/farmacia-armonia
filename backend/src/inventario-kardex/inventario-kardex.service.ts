import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventarioKardexDto } from './dto/create-inventario-kardex.dto';
import { UpdateInventarioKardexDto } from './dto/update-inventario-kardex.dto';
import { InventarioKardex, TipoMovimientoKardex } from './entities/inventario-kardex.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';
import { AlertaStock } from '../alertas-stock/entities/alertas-stock.entity';

@Injectable()
export class InventarioKardexService {
  private readonly logger = new Logger(InventarioKardexService.name);
  constructor(
    @InjectRepository(InventarioKardex)
    private readonly inventarioKardexRepository: Repository<InventarioKardex>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(AlertaStock)
    private readonly alertaStockRepository: Repository<AlertaStock>,
  ) {}

  async create(createInventarioKardexDto: CreateInventarioKardexDto): Promise<InventarioKardex> {
    const { producto_id, lote_id, tipo_movimiento, cantidad, ...rest } = createInventarioKardexDto;

    const producto = await this.productoRepository.findOneBy({ id: producto_id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
    }

    const lote = await this.loteRepository.findOneBy({ id: lote_id });
    if (!lote) {
      throw new NotFoundException(`Lote con ID ${lote_id} no encontrado.`);
    }

    // Actualizar stock del lote
    let newLoteStock = lote.stock;
    if (tipo_movimiento === TipoMovimientoKardex.ENTRADA) {
      newLoteStock += cantidad;
    } else if (tipo_movimiento === TipoMovimientoKardex.SALIDA) {
      if (lote.stock < cantidad) {
        throw new BadRequestException(`No hay suficiente stock (${lote.stock}) en el lote ${lote.numero_lote} para esta salida (${cantidad}).`);
      }
      newLoteStock -= cantidad;
    } else if (tipo_movimiento === TipoMovimientoKardex.AJUSTE) {
      // Para un AJUSTE, asumiremos que la cantidad es la diferencia.
      // Si se quiere ajustar a un valor final, se necesitaría otro campo en el DTO (ej. stock_final_ajustado)
      // Por simplicidad, aquí lo interpretamos como una variación (+ o -)
      newLoteStock += cantidad;
    }
    
    // Guardar el lote actualizado
    lote.stock = newLoteStock;
    await this.loteRepository.save(lote);

    const inventarioKardex = this.inventarioKardexRepository.create({
      ...rest,
      producto,
      lote,
      tipo_movimiento,
      cantidad,
    });

    const savedKardex = await this.inventarioKardexRepository.save(inventarioKardex);

    // Lógica para generar alertas de stock bajo
    // 1. Recalcular stock total del producto
    const lotesProducto = await this.loteRepository.find({
      where: { producto: { id: producto.id } },
    });
    const stockTotalProducto = lotesProducto.reduce((sum, currentLote) => sum + currentLote.stock, 0);

    // 2. Verificar si está por debajo del stock mínimo
    if (stockTotalProducto < producto.stock_minimo) {
      // Verificar si ya existe una alerta activa para este producto
      const alertaExistente = await this.alertaStockRepository.findOne({
        where: { producto: { id: producto.id }, tipo_alerta: 'STOCK_BAJO' },
        order: { fecha: 'DESC' }, // Obtener la más reciente
      });

      // Crear alerta solo si no existe una reciente o si la última ya no es relevante
      // Considerar un umbral de tiempo o un cambio significativo para evitar spam de alertas
      if (!alertaExistente || (alertaExistente.mensaje !== `Stock bajo: ${stockTotalProducto} unidades. Mínimo: ${producto.stock_minimo}.`)) {
        const nuevaAlerta = this.alertaStockRepository.create({
          producto: producto,
          tipo_alerta: 'STOCK_BAJO',
          mensaje: `Stock bajo: ${stockTotalProducto} unidades. Mínimo: ${producto.stock_minimo}.`,
        });
        await this.alertaStockRepository.save(nuevaAlerta);
        this.logger.warn(`Alerta de stock bajo para ${producto.nombre}: ${stockTotalProducto} unidades.`);
      }
    }
    
    return savedKardex;
  }

  findAll(): Promise<InventarioKardex[]> {
    return this.inventarioKardexRepository.find();
  }

  async findOne(id: string): Promise<InventarioKardex> {
    const inventarioKardex = await this.inventarioKardexRepository.findOneBy({ id });
    if (!inventarioKardex) {
      throw new NotFoundException(`Movimiento de Kardex con el id #${id} no encontrado.`);
    }
    return inventarioKardex;
  }

  async update(id: string, updateInventarioKardexDto: UpdateInventarioKardexDto): Promise<InventarioKardex> {
    const { producto_id, lote_id, ...rest } = updateInventarioKardexDto;

    const inventarioKardex = await this.inventarioKardexRepository.preload({
      id: id,
      ...rest,
    });

    if (!inventarioKardex) {
      throw new NotFoundException(`Movimiento de Kardex con el id #${id} no encontrado.`);
    }

    if (producto_id) {
      const producto = await this.productoRepository.findOneBy({ id: producto_id });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
      }
      inventarioKardex.producto = producto;
    }

    if (lote_id) {
      const lote = await this.loteRepository.findOneBy({ id: lote_id });
      if (!lote) {
        throw new NotFoundException(`Lote con ID ${lote_id} no encontrado.`);
      }
      inventarioKardex.lote = lote;
    }
    
    return this.inventarioKardexRepository.save(inventarioKardex);
  }

  async remove(id: string) {
    const inventarioKardex = await this.findOne(id);
    await this.inventarioKardexRepository.remove(inventarioKardex);
  }
}
