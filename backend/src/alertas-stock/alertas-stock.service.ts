import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertaStockDto } from './dto/create-alertas-stock.dto';
import { UpdateAlertaStockDto } from './dto/update-alertas-stock.dto';
import { AlertaStock } from './entities/alertas-stock.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class AlertaStockService {
  constructor(
    @InjectRepository(AlertaStock)
    private readonly alertaStockRepository: Repository<AlertaStock>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
  ) {}

  async create(createAlertaStockDto: CreateAlertaStockDto): Promise<AlertaStock> {
    const { producto_id, ...rest } = createAlertaStockDto;

    const producto = await this.productoRepository.findOneBy({ id: producto_id });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
    }

    const alertaStock = this.alertaStockRepository.create({
      ...rest,
      producto,
    });

    return this.alertaStockRepository.save(alertaStock);
  }

  findAll(): Promise<AlertaStock[]> {
    return this.alertaStockRepository.find();
  }

  async findOne(id: string): Promise<AlertaStock> {
    const alertaStock = await this.alertaStockRepository.findOneBy({ id });
    if (!alertaStock) {
      throw new NotFoundException(`Alerta de Stock con el id #${id} no encontrada.`);
    }
    return alertaStock;
  }

  async update(id: string, updateAlertaStockDto: UpdateAlertaStockDto): Promise<AlertaStock> {
    const { producto_id, ...rest } = updateAlertaStockDto;

    const alertaStock = await this.alertaStockRepository.preload({
      id: id,
      ...rest,
    });

    if (!alertaStock) {
      throw new NotFoundException(`Alerta de Stock con el id #${id} no encontrada.`);
    }

    if (producto_id) {
      const producto = await this.productoRepository.findOneBy({ id: producto_id });
      if (!producto) {
        throw new NotFoundException(`Producto con ID ${producto_id} no encontrado.`);
      }
      alertaStock.producto = producto;
    }
    
    return this.alertaStockRepository.save(alertaStock);
  }

  async remove(id: string) {
    const alertaStock = await this.findOne(id);
    await this.alertaStockRepository.remove(alertaStock);
  }
}
