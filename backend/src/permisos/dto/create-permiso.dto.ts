import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePermisoDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  nombre: string;

  @IsString({ message: 'El código debe ser un texto.' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres.' })
  @MaxLength(50, { message: 'El código no debe exceder los 50 caracteres.' })
  codigo: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  descripcion?: string;
}
