import {
  IsUUID,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateAlertaStockDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsString({ message: 'El tipo de alerta debe ser un texto.' })
  @MaxLength(100, { message: 'El tipo de alerta no debe exceder los 100 caracteres.' })
  tipo_alerta: string;

  @IsString({ message: 'El mensaje debe ser un texto.' })
  @MaxLength(255, { message: 'El mensaje no debe exceder los 255 caracteres.' })
  mensaje: string;
}
