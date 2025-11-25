import {
  IsUUID,
  IsInt,
  Min,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CreateVentaDetalleDto {
  @IsUUID('4', { message: 'El ID de la venta debe ser un UUID válido.' })
  venta_id: string;

  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsUUID('4', { message: 'El ID del lote debe ser un UUID válido.' })
  @IsOptional()
  lote_id?: string;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  cantidad: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio unitario debe ser un número con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El precio unitario debe ser positivo.' })
  precio_unitario: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El subtotal debe ser un número con máximo 2 decimales.' },
  )
  @Min(0, { message: 'El subtotal no puede ser negativo.' })
  subtotal: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El descuento debe ser un número con máximo 2 decimales.' },
  )
  @Min(0, { message: 'El descuento no puede ser negativo.' })
  @IsOptional()
  descuento?: number = 0;
}
