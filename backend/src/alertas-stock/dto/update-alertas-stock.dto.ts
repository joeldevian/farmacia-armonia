import { PartialType } from '@nestjs/mapped-types';
import { CreateAlertaStockDto } from './create-alertas-stock.dto';

export class UpdateAlertaStockDto extends PartialType(CreateAlertaStockDto) {}
