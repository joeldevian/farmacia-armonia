import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVentaDetalleDto } from './dto/create-ventas-detalle.dto';
import { UpdateVentaDetalleDto } from './dto/update-ventas-detalle.dto';
import { VentaDetalle } from './entities/ventas-detalle.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Lote } from '../lotes/entities/lote.entity';

@Injectable()
export class VentaDetalleService {
  constructor(
    @InjectRepository(VentaDetalle)
    private readonly ventaDetalleRepository: Repository<VentaDetalle>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) {}

  async create(createVentaDetalleDto: CreateVentaDetalleDto): Promise<VentaDetalle> {
    const { venta_id, producto_id, lote_id, ...rest } = createVentaDetalleDto;

    const venta = await this.ventaRepository.findOneBy({ id: venta_id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${venta_id} no encontrada.`);
    }

    const producto = await this.productoRepository.findOneBy({ id: producto_id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
    }

    let lote: Lote | null = null;
    if (lote_id) {
      lote = await this.loteRepository.findOneBy({ id: lote_id });
      if (!lote) {
        throw new NotFoundException(`Lote con ID ${lote_id} no encontrado.`);
      }
    }
    
    const ventaDetalle = this.ventaDetalleRepository.create({
      ...rest,
      venta,
      producto,
      lote,
    });

    return this.ventaDetalleRepository.save(ventaDetalle);
  }

  findAll(): Promise<VentaDetalle[]> {
    return this.ventaDetalleRepository.find();
  }

  async findOne(id: string): Promise<VentaDetalle> {
    const ventaDetalle = await this.ventaDetalleRepository.findOneBy({ id });
    if (!ventaDetalle) {
      throw new NotFoundException(`Detalle de Venta con el id #${id} no encontrado.`);
    }
    return ventaDetalle;
  }

  async update(id: string, updateVentaDetalleDto: UpdateVentaDetalleDto): Promise<VentaDetalle> {
    const { venta_id, producto_id, lote_id, ...rest } = updateVentaDetalleDto;

    const ventaDetalle = await this.ventaDetalleRepository.preload({
      id: id,
      ...rest,
    });

    if (!ventaDetalle) {
      throw new NotFoundException(`Detalle de Venta con el id #${id} no encontrado.`);
    }

    if (venta_id) {
      const venta = await this.ventaRepository.findOneBy({ id: venta_id });
      if (!venta) {
        throw new NotFoundException(`Venta con ID ${venta_id} no encontrada.`);
      }
      ventaDetalle.venta = venta;
    }

    if (producto_id) {
      const producto = await this.productoRepository.findOneBy({ id: producto_id });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
      }
      ventaDetalle.producto = producto;
    }

    if (lote_id !== undefined) {
      const lote = lote_id ? await this.loteRepository.findOneBy({ id: lote_id }) : null;
      if (lote_id && !lote) {
        throw new NotFoundException(`Lote con ID ${lote_id} no encontrado.`);
      }
      ventaDetalle.lote = lote;
    }
    
    return this.ventaDetalleRepository.save(ventaDetalle);
  }

  async remove(id: string) {
    const ventaDetalle = await this.findOne(id);
    await this.ventaDetalleRepository.remove(ventaDetalle);
  }
}
