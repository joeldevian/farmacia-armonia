import {
  IsString,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateClienteDto {
  @IsString({ message: 'El tipo de documento debe ser un texto.' })
  @MaxLength(50, { message: 'El tipo de documento no debe exceder los 50 caracteres.' })
  tipo_documento: string;

  @IsString({ message: 'El número de documento debe ser un texto.' })
  @MaxLength(50, { message: 'El número de documento no debe exceder los 50 caracteres.' })
  @MinLength(5, { message: 'El número de documento debe tener al menos 5 caracteres.' })
  numero_documento: string;

  @IsString({ message: 'Los nombres deben ser un texto.' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'Los nombres no deben exceder los 100 caracteres.' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser un texto.' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'Los apellidos no deben exceder los 100 caracteres.' })
  apellidos: string;

  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no debe exceder los 20 caracteres.' })
  telefono?: string;

  @IsString({ message: 'La dirección debe ser un texto.' })
  @IsOptional()
  @MaxLength(255, { message: 'La dirección no debe exceder los 255 caracteres.' })
  direccion?: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido.' })
  @IsOptional()
  @MaxLength(255, { message: 'El email no debe exceder los 255 caracteres.' })
  email?: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;
}
