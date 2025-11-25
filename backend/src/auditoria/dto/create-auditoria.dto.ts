import { IsString, IsOptional, MaxLength, IsIP } from 'class-validator';

export class CreateAuditoriaDto {
  @IsString({ message: 'El usuario debe ser un texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'El usuario no debe exceder los 255 caracteres.' })
  usuario?: string;

  @IsString({ message: 'El módulo debe ser un texto.' })
  @MaxLength(100, { message: 'El módulo no debe exceder los 100 caracteres.' })
  modulo: string;

  @IsString({ message: 'La acción debe ser un texto.' })
  @MaxLength(100, { message: 'La acción no debe exceder los 100 caracteres.' })
  accion: string;

  @IsString({ message: 'El detalle debe ser un texto.' })
  @IsOptional()
  detalle?: string;

  @IsIP('4', { message: 'La IP debe ser una dirección IPv4 válida.' }) // Assuming IPv4
  @IsOptional()
  ip?: string;
}
