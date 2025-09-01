// Importaciones necesarias de NestJS, Mongoose, DTO, interfaz de usuario y bcrypt para encriptación
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsuarioDto } from './usuario.dto';
import { IUsuario } from './usuario.modelo';
import * as bcrypt from 'bcrypt';

// Servicio encargado de la lógica de creación y búsqueda de usuarios
@Injectable()
export class UsuarioService {
  // Inyección del modelo Mongoose 'Usuario' para realizar operaciones en base de datos
  constructor(@InjectModel('Usuario') private usuarioModel: Model<IUsuario>) {}

  // Método para crear un nuevo usuario, encriptando la contraseña antes de guardarla
  async crear(dto: UsuarioDto): Promise<IUsuario> {
    const hashedPassword = await bcrypt.hash(dto.password, 10); // Encriptación segura
    const nuevoUsuario = new this.usuarioModel({
      email: dto.email,
      password: hashedPassword,
      rol: dto.rol ?? 'caficultor', // Asigna rol por defecto si no se especifica
    });
    return await nuevoUsuario.save(); // Guarda en la base de datos
  }

  // Método para buscar un usuario por su email
  async buscarPorEmail(email: string): Promise<IUsuario | null> {
    return await this.usuarioModel.findOne({ email }).exec();
  }

  // Método para buscar un usuario por su ID
  async buscarPorId(id: string): Promise<IUsuario | null> {
    return await this.usuarioModel.findById(id).exec();
  }
}
