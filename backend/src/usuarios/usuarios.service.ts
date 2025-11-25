import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { role_ids, contrasena, ...rest } = createUsuarioDto;

    const usuario = this.usuarioRepository.create(rest);
    usuario.contrasena = contrasena; // La entidad se encargará del hash

    if (role_ids && role_ids.length > 0) {
      const roles = await this.roleRepository.find({ where: { id: In(role_ids) } });
      if (roles.length !== role_ids.length) {
        throw new BadRequestException('Algunos IDs de rol no son válidos.');
      }
      usuario.roles = roles;
    }
    
    return this.usuarioRepository.save(usuario);
  }

  findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ relations: ['roles'] });
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id }, relations: ['roles'] });
    if (!usuario) {
      throw new NotFoundException(`Usuario con el id #${id} no encontrado.`);
    }
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'role')
      .addSelect('usuario.contrasena') // Selecciona explícitamente la contraseña
      .where('usuario.email = :email', { email })
      .getOne();
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const { role_ids, contrasena, ...rest } = updateUsuarioDto;

    const usuario = await this.usuarioRepository.preload({
      id: id,
      ...rest,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con el id #${id} no encontrado.`);
    }

    if (contrasena) {
      usuario.contrasena = contrasena; // La entidad se encargará del hash
    }

    if (role_ids !== undefined) {
      if (role_ids.length > 0) {
        const roles = await this.roleRepository.find({ where: { id: In(role_ids) } });
        if (roles.length !== role_ids.length) {
          throw new BadRequestException('Algunos IDs de rol no son válidos.');
        }
        usuario.roles = roles;
      } else {
        usuario.roles = []; // Clear all roles if empty array is provided
      }
    }
    
    return this.usuarioRepository.save(usuario);
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}
