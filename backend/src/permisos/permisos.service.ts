import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    const permiso = this.permisoRepository.create(createPermisoDto);
    return this.permisoRepository.save(permiso);
  }

  findAll(): Promise<Permiso[]> {
    return this.permisoRepository.find();
  }

  async findOne(id: string): Promise<Permiso> {
    const permiso = await this.permisoRepository.findOneBy({ id });
    if (!permiso) {
      throw new NotFoundException(`Permiso con el id #${id} no encontrado.`);
    }
    return permiso;
  }

  async update(id: string, updatePermisoDto: UpdatePermisoDto): Promise<Permiso> {
    const permiso = await this.permisoRepository.preload({
      id: id,
      ...updatePermisoDto,
    });
    if (!permiso) {
      throw new NotFoundException(`Permiso con el id #${id} no encontrado.`);
    }
    return this.permisoRepository.save(permiso);
  }

  async remove(id: string) {
    const permiso = await this.findOne(id);
    await this.permisoRepository.remove(permiso);
  }
}
