import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VentaDetalleService } from './ventas-detalle.service';
import { CreateVentaDetalleDto } from './dto/create-ventas-detalle.dto';
import { UpdateVentaDetalleDto } from './dto/update-ventas-detalle.dto';

@Controller('ventas-detalle')
export class VentaDetalleController {
  constructor(private readonly ventaDetalleService: VentaDetalleService) {}

  @Post()
  create(@Body() createVentaDetalleDto: CreateVentaDetalleDto) {
    return this.ventaDetalleService.create(createVentaDetalleDto);
  }

  @Get()
  findAll() {
    return this.ventaDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventaDetalleService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDetalleDto: UpdateVentaDetalleDto) {
    return this.ventaDetalleService.update(id, updateVentaDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventaDetalleService.remove(id);
  }
}
