import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  MinLength,
  IsInt,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  descripcion?: string;

  @IsString({ message: 'El principio activo debe ser un texto.' })
  @IsOptional()
  principio_activo?: string;

  @IsString({ message: 'La concentración debe ser un texto.' })
  @IsOptional()
  concentracion?: string;

  @IsString({ message: 'La presentación debe ser un texto.' })
  @IsOptional()
  presentacion?: string;

  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido.' })
  @IsOptional()
  categoria_id?: string;

  @IsUUID('4', { message: 'El ID de la marca debe ser un UUID válido.' })
  @IsOptional()
  marca_id?: string;

  @IsString({ message: 'El código de barra debe ser un texto.' })
  @IsOptional()
  codigo_barra?: string;

  @IsString({ message: 'El código interno debe ser un texto.' })
  @IsOptional()
  codigo_interno?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio de compra debe ser un número con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El precio de compra debe ser un número positivo.' })
  precio_compra: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio de venta debe ser un número con máximo 2 decimales.' },
  )
  @IsPositive({ message: 'El precio de venta debe ser un número positivo.' })
  precio_venta: number;

  @IsInt({ message: 'El stock mínimo debe ser un número entero.' })
  @IsPositive({ message: 'El stock mínimo debe ser un número positivo o cero.' })
  @IsOptional()
  stock_minimo?: number = 0;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;
}
