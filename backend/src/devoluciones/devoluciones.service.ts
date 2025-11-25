import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDevolucionDto } from './dto/create-devolucione.dto';
import { UpdateDevolucionDto } from './dto/update-devolucione.dto';
import { Devolucion } from './entities/devolucione.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class DevolucionService {
  constructor(
    @InjectRepository(Devolucion)
    private readonly devolucionRepository: Repository<Devolucion>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createDevolucionDto: CreateDevolucionDto): Promise<Devolucion> {
    const { venta_id, producto_id, ...rest } = createDevolucionDto;

    const venta = await this.ventaRepository.findOneBy({ id: venta_id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID ${venta_id} no encontrada.`);
    }

    const producto = await this.productoRepository.findOneBy({ id: producto_id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
    }

    const devolucion = this.devolucionRepository.create({
      ...rest,
      venta,
      producto,
    });

    return this.devolucionRepository.save(devolucion);
  }

  findAll(): Promise<Devolucion[]> {
    return this.devolucionRepository.find();
  }

  async findOne(id: string): Promise<Devolucion> {
    const devolucion = await this.devolucionRepository.findOneBy({ id });
    if (!devolucion) {
      throw new NotFoundException(`Devolución con el id #${id} no encontrada.`);
    }
    return devolucion;
  }

  async update(id: string, updateDevolucionDto: UpdateDevolucionDto): Promise<Devolucion> {
    const { venta_id, producto_id, ...rest } = updateDevolucionDto;

    const devolucion = await this.devolucionRepository.preload({
      id: id,
      ...rest,
    });

    if (!devolucion) {
      throw new NotFoundException(`Devolución con el id #${id} no encontrada.`);
    }

    if (venta_id) {
      const venta = await this.ventaRepository.findOneBy({ id: venta_id });
      if (!venta) {
        throw new NotFoundException(`Venta con ID ${venta_id} no encontrada.`);
      }
      devolucion.venta = venta;
    }

    if (producto_id) {
      const producto = await this.productoRepository.findOneBy({ id: producto_id });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
      }
      devolucion.producto = producto;
    }
    
    return this.devolucionRepository.save(devolucion);
  }

  async remove(id: string) {
    const devolucion = await this.findOne(id);
    await this.devolucionRepository.remove(devolucion);
  }
}
