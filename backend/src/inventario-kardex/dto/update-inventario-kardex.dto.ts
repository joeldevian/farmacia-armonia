import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioKardexDto } from './create-inventario-kardex.dto';

export class UpdateInventarioKardexDto extends PartialType(CreateInventarioKardexDto) {}
