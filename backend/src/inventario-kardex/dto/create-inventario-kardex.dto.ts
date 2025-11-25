import {
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoMovimientoKardex } from '../entities/inventario-kardex.entity';

export class CreateInventarioKardexDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsUUID('4', { message: 'El ID del lote debe ser un UUID válido.' })
  lote_id: string;

  @IsEnum(TipoMovimientoKardex, { message: 'Tipo de movimiento no válido.' })
  tipo_movimiento: TipoMovimientoKardex;

  @IsInt({ message: 'La cantidad debe ser un número entero.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  cantidad: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo unitario debe ser un número con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El costo unitario debe ser positivo.' })
  costo_unitario: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El costo total debe ser un número con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El costo total debe ser positivo.' })
  costo_total: number;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La descripción no debe exceder los 255 caracteres.' })
  descripcion?: string;
}
