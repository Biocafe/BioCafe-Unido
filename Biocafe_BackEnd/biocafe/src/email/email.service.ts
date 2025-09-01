import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuración para Gmail (puedes cambiar por otro proveedor)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER') || 'tu-email@gmail.com', // Configurar en variables de entorno
        pass: this.configService.get<string>('EMAIL_PASS') || 'tu-contraseña-app', // Usar contraseña de aplicación
      },
    });
  }

  async enviarCorreoBienvenida(email: string, nombreUsuario: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'biocafe@gmail.com',
        to: email,
        subject: '¡Bienvenido a BioCafe! - Registro Exitoso',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🌱 BioCafe</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Plataforma de Análisis Estadístico para Café</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #8B4513; margin-top: 0;">¡Bienvenido ${nombreUsuario}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Tu cuenta ha sido creada exitosamente en BioCafe. Ahora puedes acceder a nuestra plataforma para realizar análisis estadísticos avanzados de tus cultivos de café.</p>
              
              <div style="background-color: #f0f8f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                <h3 style="color: #2E7D32; margin-top: 0;">¿Qué puedes hacer en BioCafe?</h3>
                <ul style="color: #333; line-height: 1.8;">
                  <li>📊 Cargar datos de tus cultivos de café</li>
                  <li>📈 Realizar análisis estadísticos (ANOVA, Duncan)</li>
                  <li>📋 Generar reportes detallados</li>
                  <li>💾 Exportar resultados en múltiples formatos</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #666;">Tu correo de acceso es:</p>
                <p style="font-size: 18px; font-weight: bold; color: #8B4513; background-color: #f5f5f5; padding: 10px; border-radius: 5px; display: inline-block;">${email}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Iniciar Sesión en BioCafe</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">Si tienes alguna pregunta, no dudes en contactarnos.<br>¡Gracias por unirte a BioCafe!</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Correo de bienvenida enviado a: ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar correo de bienvenida:', error);
      return false;
    }
  }

  async enviarCorreoRecuperacion(email: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'biocafe@gmail.com',
        to: email,
        subject: 'BioCafe - Recuperación de Contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🌱 BioCafe</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Recuperación de Contraseña</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #8B4513; margin-top: 0;">Solicitud de Recuperación</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en BioCafe asociada al correo: <strong>${email}</strong></p>
              
              <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p style="color: #856404; margin: 0; font-size: 16px;">⚠️ <strong>Importante:</strong> Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="font-size: 16px; color: #666;">Para continuar con el proceso, contacta al administrador del sistema.</p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">Este correo fue enviado automáticamente desde BioCafe.<br>No respondas a este mensaje.</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Correo de recuperación enviado a: ${email}`);
      return true;
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      return false;
    }
  }
}