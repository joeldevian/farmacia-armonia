import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Marca } from '../marcas/entities/marca.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { categoria_id, marca_id, ...rest } = createProductoDto;

    const categoria = categoria_id
      ? await this.categoriaRepository.findOneBy({ id: categoria_id })
      : null;
    if (categoria_id && !categoria) {
      throw new NotFoundException(`Categoría con ID ${categoria_id} no encontrada.`);
    }

    const marca = marca_id
      ? await this.marcaRepository.findOneBy({ id: marca_id })
      : null;
    if (marca_id && !marca) {
      throw new NotFoundException(`Marca con ID ${marca_id} no encontrada.`);
    }

    const producto = this.productoRepository.create(rest);
    if (categoria) producto.categoria = categoria;
    if (marca) producto.marca = marca;
    
    return this.productoRepository.save(producto);
  }

  async search(term: string): Promise<any[]> { // Cambiado a Promise<any[]> porque el retorno es un objeto con stock_total calculado
    const qb = this.productoRepository.createQueryBuilder('producto');

    qb.leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoin('producto.lotes', 'lote', 'lote.estado = :estado', { estado: true })
      .addSelect('COALESCE(SUM(lote.stock), 0)', 'stock_total')
      .where('producto.nombre LIKE :nombre AND producto.estado = :prodEstado', { nombre: `%${term}%`, prodEstado: true })
      .groupBy('producto.id, marca.id, categoria.id')
      .orderBy('producto.nombre', 'ASC')
      .take(10); // Limita los resultados

    const productosConStock = await qb.getRawAndEntities();

    // Mapea para tener el formato Producto original + stock_total
    const data = productosConStock.entities.map((p) => {
        const raw = productosConStock.raw.find(r => r.producto_id === p.id);
        return {
            ...p,
            stock_total: raw ? parseInt(raw.stock_total, 10) : 0,
        };
    });

    return data;
  }

  async findAll(options: { page: number, limit: number }): Promise<{ data: any[], total: number, page: number, lastPage: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const qb = this.productoRepository.createQueryBuilder('producto');

    qb.leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoin('producto.lotes', 'lote', 'lote.estado = :estado', { estado: true })
      .addSelect('COALESCE(SUM(lote.stock), 0)', 'stock_total')
      .groupBy('producto.id, marca.id, categoria.id')
      .orderBy('producto.nombre', 'ASC')
      .skip(skip)
      .take(limit);

    const total = await this.productoRepository.count();
    const productos = await qb.getRawAndEntities();

    const data = productos.entities.map((p) => {
        const raw = productos.raw.find(r => r.producto_id === p.id);
        return {
            ...p,
            stock_total: raw ? parseInt(raw.stock_total, 10) : 0,
        };
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    const qb = this.productoRepository.createQueryBuilder('producto');
    
    qb.where('producto.id = :id', { id })
      .leftJoinAndSelect('producto.marca', 'marca')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .leftJoin('producto.lotes', 'lote', 'lote.estado = :estado', { estado: true })
      .addSelect('COALESCE(SUM(lote.stock), 0)', 'stock_total')
      .groupBy('producto.id, marca.id, categoria.id');

    const productoData = await qb.getRawAndEntities();
    
    if (!productoData.entities.length) {
      throw new NotFoundException(`Producto con el id #${id} no encontrado.`);
    }
    
    const producto = productoData.entities[0];
    const rawData = productoData.raw[0];

    return {
        ...producto,
        stock_total: parseInt(rawData.stock_total, 10),
    };
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const { categoria_id, marca_id, ...rest } = updateProductoDto;

    const producto = await this.productoRepository.preload({
      id: id,
      ...rest,
    });

    if (!producto) {
      throw new NotFoundException(`Producto con el id #${id} no encontrado.`);
    }
    
    if (categoria_id !== undefined) {
      const categoria = categoria_id ? await this.categoriaRepository.findOneBy({ id: categoria_id }) : null;
      if (categoria_id && !categoria) {
        throw new NotFoundException(`Categoría con ID ${categoria_id} no encontrada.`);
      }
      producto.categoria = categoria;
    }

    if (marca_id !== undefined) {
      const marca = marca_id ? await this.marcaRepository.findOneBy({ id: marca_id }) : null;
      if (marca_id && !marca) {
        throw new NotFoundException(`Marca con ID ${marca_id} no encontrada.`);
      }
      producto.marca = marca;
    }
    
    return this.productoRepository.save(producto);
  }

  async remove(id: string) {
    const producto = await this.findOne(id);
    await this.productoRepository.remove(producto);
  }
}
