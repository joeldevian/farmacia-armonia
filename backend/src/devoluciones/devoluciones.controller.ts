import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevolucionService } from './devoluciones.service';
import { CreateDevolucionDto } from './dto/create-devolucione.dto';
import { UpdateDevolucionDto } from './dto/update-devolucione.dto';

@Controller('devoluciones')
export class DevolucionController {
  constructor(private readonly devolucionService: DevolucionService) {}

  @Post()
  create(@Body() createDevolucionDto: CreateDevolucionDto) {
    return this.devolucionService.create(createDevolucionDto);
  }

  @Get()
  findAll() {
    return this.devolucionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devolucionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDevolucionDto: UpdateDevolucionDto) {
    return this.devolucionService.update(id, updateDevolucionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devolucionService.remove(id);
  }
}
