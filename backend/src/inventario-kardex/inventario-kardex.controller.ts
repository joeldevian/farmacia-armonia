import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioKardexService } from './inventario-kardex.service';
import { CreateInventarioKardexDto } from './dto/create-inventario-kardex.dto';
import { UpdateInventarioKardexDto } from './dto/update-inventario-kardex.dto';

@Controller('inventario-kardex')
export class InventarioKardexController {
  constructor(private readonly inventarioKardexService: InventarioKardexService) {}

  @Post()
  create(@Body() createInventarioKardexDto: CreateInventarioKardexDto) {
    return this.inventarioKardexService.create(createInventarioKardexDto);
  }

  @Get()
  findAll() {
    return this.inventarioKardexService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioKardexService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioKardexDto: UpdateInventarioKardexDto) {
    return this.inventarioKardexService.update(id, updateInventarioKardexDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioKardexService.remove(id);
  }
}
