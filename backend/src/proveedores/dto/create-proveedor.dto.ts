import {
  IsString,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateProveedorDto {
  @IsString({ message: 'La razón social debe ser un texto.' })
  @MinLength(3, { message: 'La razón social debe tener al menos 3 caracteres.' })
  @MaxLength(255, { message: 'La razón social no debe exceder los 255 caracteres.' })
  razon_social: string;

  @IsString({ message: 'El RUC debe ser un texto.' })
  @MinLength(11, { message: 'El RUC debe tener 11 caracteres.' })
  @MaxLength(11, { message: 'El RUC debe tener 11 caracteres.' })
  ruc: string;

  @IsString({ message: 'La dirección debe ser un texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La dirección no debe exceder los 255 caracteres.' })
  direccion?: string;

  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no debe exceder los 20 caracteres.' })
  telefono?: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido.' })
  @IsOptional()
  @MaxLength(255, { message: 'El email no debe exceder los 255 caracteres.' })
  email?: string;

  @IsString({ message: 'El representante debe ser un texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'El representante no debe exceder los 255 caracteres.' })
  representante?: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;
}
