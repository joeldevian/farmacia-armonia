import {
  IsUUID,
  IsInt,
  Min,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class CreateDevolucionDto {
  @IsUUID('4', { message: 'El ID de la venta debe ser un UUID válido.' })
  venta_id: string;

  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  cantidad: number;

  @IsString({ message: 'El motivo debe ser un texto.' })
  @IsOptional()
  @MaxLength(500, { message: 'El motivo no debe exceder los 500 caracteres.' })
  motivo?: string;
}
