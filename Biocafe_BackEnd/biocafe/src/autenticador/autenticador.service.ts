import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AutenticadorDto } from './autenticador.dto';
import { IAutenticador } from './autenticador.modelo';
import { EmailService } from '../email/email.service';

@Injectable()
export class AutenticadorService {
  constructor(
    @InjectModel('Autenticador') private autenticadorModel: Model<IAutenticador>,
    private emailService: EmailService
  ) {}

  // MÉTODO PARA REGISTRAR USUARIO
  async registrarUsuario(autenticadorDto: AutenticadorDto): Promise<IAutenticador> {
    const { usuario, password } = autenticadorDto;
    
    // Encriptar contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);
    
    const nuevoUsuario = new this.autenticadorModel({
      usuario,
      password: passwordEncriptada,
      token: "" // Se generará al hacer login
    });

    const usuarioGuardado = await nuevoUsuario.save();
    
    // Enviar correo de bienvenida
    try {
      await this.emailService.enviarCorreoBienvenida(usuario, usuario.split('@')[0]);
      console.log(`Correo de bienvenida enviado a: ${usuario}`);
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      // No fallar el registro si el correo no se puede enviar
    }

    return usuarioGuardado;
  }

  // MÉTODO PARA INICIAR SESIÓN
  async iniciarSesion(autenticadorDto: AutenticadorDto): Promise<{ token: string, usuario: any } | null> {
    const { usuario, password } = autenticadorDto;

    const usuarioEncontrado = await this.autenticadorModel.findOne({ usuario }).exec();
    if (!usuarioEncontrado) {
      return null;
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuarioEncontrado.password);
    if (!passwordValida) {
      return null;
    }

    // Generar token JWT
    const token = jwt.sign({ usuario: usuarioEncontrado.usuario }, 'clave_secreta', { expiresIn: '1h' });

    // Guardar el token en la base de datos
    usuarioEncontrado.token = token;
    await usuarioEncontrado.save();

    return {
      token,
      usuario: {
        usuario: usuarioEncontrado.usuario,
        _id: usuarioEncontrado._id
      }
    };
  }

  // MÉTODO PARA OLVIDO DE CONTRASEÑA
  async olvidoContraseña(email: string): Promise<string | null> {
    const usuarioEncontrado = await this.autenticadorModel.findOne({ usuario: email }).exec();
    if (!usuarioEncontrado) {
      return null;
    }

    // Generar token temporal para recuperación
    const resetToken = jwt.sign({ usuario: usuarioEncontrado.usuario, reset: true }, 'clave_secreta', { expiresIn: '1h' });
    
    // Guardar el token en la base de datos
    usuarioEncontrado.token = resetToken;
    await usuarioEncontrado.save();

    return resetToken;
  }

  // MÉTODO PARA RESTABLECER CONTRASEÑA
  async restablecerContraseña(token: string, nuevaContraseña: string): Promise<boolean> {
    try {
      // Verificar el token
      const decoded = jwt.verify(token, 'clave_secreta') as any;
      if (!decoded.reset) {
        return false;
      }

      const usuarioEncontrado = await this.autenticadorModel.findOne({ 
        usuario: decoded.usuario,
        token: token 
      }).exec();
      
      if (!usuarioEncontrado) {
        return false;
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordEncriptada = await bcrypt.hash(nuevaContraseña, salt);
      
      // Actualizar contraseña y limpiar token
      usuarioEncontrado.password = passwordEncriptada;
      usuarioEncontrado.token = "";
      await usuarioEncontrado.save();

      return true;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      return false;
    }
  }
}