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

  @IsOptional()
  @IsNumber()
  precio_unitario?: number;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

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

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  impuestos?: number;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  detalles: CreateVentaDetalleDto[];
}