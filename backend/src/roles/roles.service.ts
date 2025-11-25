import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Permiso } from '../permisos/entities/permiso.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { permiso_ids, ...rest } = createRoleDto;

    const role = this.roleRepository.create(rest);

    if (permiso_ids && permiso_ids.length > 0) {
      // Usar find({ where: { id IN (...) }}) para buscar múltiples IDs
      const permisos = await this.permisoRepository.find({ where: { id: In(permiso_ids) } });
      if (permisos.length !== permiso_ids.length) {
        throw new BadRequestException('Algunos IDs de permiso no son válidos.');
      }
      role.permisos = permisos;
    }
    
    return this.roleRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({ relations: ['permisos'] });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permisos'] });
    if (!role) {
      throw new NotFoundException(`Rol con el id #${id} no encontrado.`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const { permiso_ids, ...rest } = updateRoleDto;

    const role = await this.roleRepository.preload({
      id: id,
      ...rest,
    });

    if (!role) {
      throw new NotFoundException(`Rol con el id #${id} no encontrado.`);
    }

    if (permiso_ids !== undefined) { // If permiso_ids is provided, update the relations
      if (permiso_ids.length > 0) {
        const permisos = await this.permisoRepository.find({ where: { id: In(permiso_ids) } });
        if (permisos.length !== permiso_ids.length) {
          throw new BadRequestException('Algunos IDs de permiso no son válidos.');
        }
        role.permisos = permisos;
      } else {
        role.permisos = []; // Clear all permissions if empty array is provided
      }
    }
    
    return this.roleRepository.save(role);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
}
