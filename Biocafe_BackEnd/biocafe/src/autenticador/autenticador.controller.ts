import { Body, Controller, Post, Get, Headers } from '@nestjs/common';
import { AutenticadorService } from './autenticador.service';
import { AutenticadorDto } from './autenticador.dto';
import * as jwt from 'jsonwebtoken';

@Controller('autenticador')
export class AutenticadorController {
  constructor(private readonly autenticadorService: AutenticadorService) { }

  @Post('registro')
  async registrarUsuario(@Body() autenticadorDto: AutenticadorDto) {
    try {
      console.log('=== DEBUG REGISTRO ===');
      console.log('Datos recibidos:', autenticadorDto);
      const respuesta = await this.autenticadorService.registrarUsuario(autenticadorDto);
      console.log('Usuario registrado exitosamente:', respuesta);
      return { ok: true, mensaje: 'Usuario registrado exitosamente. Revisa tu correo electrónico.', respuesta };
    } catch (error) {
      console.error('Error en registro:', error);
      if (error.code === 11000) {
        return { ok: false, mensaje: 'Este correo electrónico ya está registrado. Intenta iniciar sesión.' };
      }
      return { ok: false, mensaje: 'Error interno del servidor. Intenta nuevamente.' };
    }
  }

  @Post('login')
  async iniciarSesion(@Body() autenticadorDto: AutenticadorDto) {
    const resultado = await this.autenticadorService.iniciarSesion(autenticadorDto);
    if (resultado && resultado.token) {
      return { ok: true, token: resultado.token, usuario: resultado.usuario };
    }
    return { ok: false, mensaje: "Credenciales inválidas" };
  }

  @Post('forgot-password')
  async olvidoContraseña(@Body() body: { email: string }) {
    try {
      const resultado = await this.autenticadorService.olvidoContraseña(body.email);
      if (resultado) {
        return { ok: true, mensaje: 'Correo de recuperación enviado', token: resultado };
      }
      return { ok: false, mensaje: 'Usuario no encontrado' };
    } catch (error) {
      return { ok: false, mensaje: 'Error interno del servidor' };
    }
  }

  @Post('reset-password')
  async restablecerContraseña(@Body() body: { token: string, newPassword: string }) {
    try {
      const resultado = await this.autenticadorService.restablecerContraseña(body.token, body.newPassword);
      if (resultado) {
        return { ok: true, mensaje: 'Contraseña actualizada exitosamente' };
      }
      return { ok: false, mensaje: 'Token inválido o expirado' };
    } catch (error) {
      return { ok: false, mensaje: 'Error interno del servidor' };
    }
  }
}
