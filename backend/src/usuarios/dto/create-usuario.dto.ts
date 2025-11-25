import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsArray,
  IsUUID,
  IsEmail,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString({ message: 'Los nombres deben ser un texto.' })
  @MinLength(2, { message: 'Los nombres deben tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'Los nombres no deben exceder los 100 caracteres.' })
  nombres: string;

  @IsString({ message: 'Los apellidos deben ser un texto.' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres.' })
  @MaxLength(100, { message: 'Los apellidos no deben exceder los 100 caracteres.' })
  apellidos: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido.' })
  @MaxLength(255, { message: 'El email no debe exceder los 255 caracteres.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @MaxLength(255, { message: 'La contraseña no debe exceder los 255 caracteres.' })
  contrasena: string;

  @IsString({ message: 'El teléfono debe ser un texto.' })
  @IsOptional()
  @MaxLength(20, { message: 'El teléfono no debe exceder los 20 caracteres.' })
  telefono?: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;

  @IsArray({ message: 'Los IDs de roles deben ser un array.' })
  @IsUUID('4', { each: true, message: 'Cada ID de rol debe ser un UUID válido.' })
  @IsOptional()
  role_ids?: string[]; // Array de UUIDs de roles
}
