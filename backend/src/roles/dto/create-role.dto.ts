import { IsString, IsOptional, MinLength, MaxLength, IsBoolean, IsArray, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'El nombre no debe exceder los 100 caracteres.' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsOptional()
  descripcion?: string;

  @IsBoolean({ message: 'El estado debe ser un valor booleano.' })
  @IsOptional()
  estado?: boolean = true;

  @IsArray({ message: 'Los IDs de permisos deben ser un array.' })
  @IsUUID('4', { each: true, message: 'Cada ID de permiso debe ser un UUID válido.' })
  @IsOptional()
  permiso_ids?: string[]; // Array de UUIDs de permisos
}
