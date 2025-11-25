import { IsString, IsOptional, MinLength, IsBoolean } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  descripcion?: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;
}
