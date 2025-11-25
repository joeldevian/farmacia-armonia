import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDetalleDto } from './create-ventas-detalle.dto';

export class UpdateVentaDetalleDto extends PartialType(CreateVentaDetalleDto) {}
