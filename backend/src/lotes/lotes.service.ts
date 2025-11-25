import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote } from './entities/lote.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createLoteDto: CreateLoteDto): Promise<Lote> {
    const { producto_id, ...rest } = createLoteDto;

    const producto = producto_id
      ? await this.productoRepository.findOneBy({ id: producto_id })
      : null;
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
    }

    const lote = this.loteRepository.create(rest); // Crear primero con las propiedades primitivas
    if (producto) lote.producto = producto; // Asignar la relación si existe
    
    return this.loteRepository.save(lote);
  }

  findAll(): Promise<Lote[]> {
    return this.loteRepository.find();
  }

  async findOne(id: string): Promise<Lote> {
    const lote = await this.loteRepository.findOneBy({ id });
    if (!lote) {
      throw new NotFoundException(`Lote con el id #${id} no encontrado.`);
    }
    return lote;
  }

  async update(
    id: string,
    updateLoteDto: UpdateLoteDto,
  ): Promise<Lote> {
    const { producto_id, ...rest } = updateLoteDto;

    const lote = await this.loteRepository.preload({
      id: id,
      ...rest,
    });

    if (!lote) {
      throw new NotFoundException(`Lote con el id #${id} no encontrado.`);
    }

    if (producto_id) {
      const producto = await this.productoRepository.findOneBy({ id: producto_id });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
      }
      lote.producto = producto; // Asigna el producto solo si se encontró
    }
    
    return this.loteRepository.save(lote);
  }

  async remove(id: string) {
    const lote = await this.findOne(id);
    await this.loteRepository.remove(lote);
  }
}
