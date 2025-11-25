import {
  IsString,
  IsUUID,
  IsInt,
  IsBoolean,
  IsOptional,
  IsISO8601,
  Min,
} from 'class-validator';

export class CreateLoteDto {
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido.' })
  producto_id: string;

  @IsString({ message: 'El número de lote debe ser un texto.' })
  numero_lote: string;

  @IsISO8601({}, { message: 'La fecha de fabricación debe ser una fecha ISO 8601 válida.' })
  fecha_fabricacion: string; // Se recibirá como string ISO 8601

  @IsISO8601({}, { message: 'La fecha de vencimiento debe ser una fecha ISO 8601 válida.' })
  fecha_vencimiento: string; // Se recibirá como string ISO 8601

  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock: number;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;
}
