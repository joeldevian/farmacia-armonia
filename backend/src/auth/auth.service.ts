import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usuariosService.findByEmail(email);
    if (user && user.contrasena && (await bcrypt.compare(pass, user.contrasena))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { contrasena, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Usuario) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      roles: user.roles ? user.roles.map(role => role.nombre) : [] 
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
