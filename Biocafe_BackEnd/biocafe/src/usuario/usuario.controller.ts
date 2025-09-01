// Importaciones generales desde NestJS, servicio y DTO del usuario
import { Controller, Post, Body } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDto } from './usuario.dto';

// Controlador asignado a la ruta base '/usuarios'
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // Ruta POST para crear un nuevo usuario con los datos recibidos en el body
  @Post()
  async crear(@Body() dto: UsuarioDto) {
    return await this.usuarioService.crear(dto);
  }
}
