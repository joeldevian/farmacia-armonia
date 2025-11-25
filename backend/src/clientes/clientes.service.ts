import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const cliente = this.clienteRepository.create(createClienteDto);
    return this.clienteRepository.save(cliente);
  }

  findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOneBy({ id });
    if (!cliente) {
      throw new NotFoundException(`Cliente con el id #${id} no encontrado.`);
    }
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.preload({
      id: id,
      ...updateClienteDto,
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con el id #${id} no encontrado.`);
    }
    return this.clienteRepository.save(cliente);
  }

  async remove(id: string) {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
  }

  async search(term: string): Promise<Cliente[]> {
    if (!term) {
      return [];
    }

    return this.clienteRepository
      .createQueryBuilder('cliente')
      .where('cliente.nombres ILIKE :term', { term: `%${term}%` })
      .orWhere('cliente.apellidos ILIKE :term', { term: `%${term}%` })
      .orWhere('cliente.numero_documento ILIKE :term', { term: `%${term}%` })
      .getMany();
  }
}
