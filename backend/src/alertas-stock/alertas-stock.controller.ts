import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AlertaStockService } from './alertas-stock.service';
import { CreateAlertaStockDto } from './dto/create-alertas-stock.dto';
import { UpdateAlertaStockDto } from './dto/update-alertas-stock.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alertas-stock')
export class AlertaStockController {
  constructor(private readonly alertaStockService: AlertaStockService) {}

  @Post()
  @Roles('Administrador')
  create(@Body() createAlertaStockDto: CreateAlertaStockDto) {
    return this.alertaStockService.create(createAlertaStockDto);
  }

  @Get()
  @Roles('Administrador', 'Empleado')
  findAll() {
    return this.alertaStockService.findAll();
  }

  @Get(':id')
  @Roles('Administrador', 'Empleado')
  findOne(@Param('id') id: string) {
    return this.alertaStockService.findOne(id);
  }

  @Patch(':id')
  @Roles('Administrador')
  update(@Param('id') id: string, @Body() updateAlertaStockDto: UpdateAlertaStockDto) {
    return this.alertaStockService.update(id, updateAlertaStockDto);
  }

  @Delete(':id')
  @Roles('Administrador')
  remove(@Param('id') id: string) {
    return this.alertaStockService.remove(id);
  }
}
