import { IsString, IsNumber, IsUUID, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVentaDetalleDto {
  @IsUUID()
  productoId: string;

  @IsOptional()
  @IsUUID()
  loteId?: string; // Opcional, si el manejo de lotes es detallado

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precio_unitario: number;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  descuento?: number;
}

export class CreateVentaDto {
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsString()
  tipo_comprobante: string;

  @IsString()
  metodo_pago: string;

  @IsNumber()
  subtotal: number;

  @IsNumber()
  impuestos: number;

  @IsNumber()
  total: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  detalles: CreateVentaDetalleDto[];
}