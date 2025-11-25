import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  create(createAuditoriaDto: CreateAuditoriaDto): Promise<Auditoria> {
    const auditoria = this.auditoriaRepository.create(createAuditoriaDto);
    return this.auditoriaRepository.save(auditoria);
  }

  findAll(): Promise<Auditoria[]> {
    return this.auditoriaRepository.find();
  }

  async findOne(id: string): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOneBy({ id });
    if (!auditoria) {
      throw new NotFoundException(`Auditoria con el id #${id} no encontrada.`);
    }
    return auditoria;
  }

  async update(id: string, updateAuditoriaDto: UpdateAuditoriaDto): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.preload({
      id: id,
      ...updateAuditoriaDto,
    });
    if (!auditoria) {
      throw new NotFoundException(`Auditoria con el id #${id} no encontrada.`);
    }
    return this.auditoriaRepository.save(auditoria);
  }

  async remove(id: string) {
    const auditoria = await this.findOne(id);
    await this.auditoriaRepository.remove(auditoria);
  }
}
