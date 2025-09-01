import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/emailConfig.js';
import { cloudinaryService } from './cloudinaryService';

// Inicializar EmailJS con la clave pública
if (emailConfig.publicKey) {
  emailjs.init(emailConfig.publicKey);
}

/**
 * Envía un correo de bienvenida al usuario recién registrado
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre/email del usuario
 * @param {string} userPassword - Contraseña del usuario
 * @returns {Promise} - Promesa que resuelve cuando el email se envía
 */
export const sendWelcomeEmail = async (userEmail, userName, userPassword) => {
  try {
    console.log('Iniciando envío de email...');
    console.log('Configuración EmailJS:', {
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.templateId,
      publicKey: emailConfig.publicKey ? 'Configurado' : 'No configurado'
    });
    
    // Parámetros que coinciden exactamente con el template de EmailJS
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      user_email: userEmail,
      user_password: userPassword
    };
    
    console.log('Parámetros del template:', templateParams);

    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      templateParams,
      emailConfig.publicKey
    );

    console.log('Email enviado exitosamente:', response);
    return { success: true, message: 'Correo de bienvenida enviado exitosamente' };
  } catch (error) {
    console.error('Error detallado al enviar el email:', error);
    return { success: false, message: 'Error al enviar el correo de bienvenida', error };
  }
};

/**
 * Envía un correo de recuperación de contraseña
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 * @param {string} resetLink - Enlace para restablecer la contraseña
 * @returns {Promise} - Promesa que resuelve cuando el email se envía
 */
export const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
  try {
    console.log('Iniciando envío de email de recuperación...');
    console.log('Configuración EmailJS:', {
      serviceId: emailConfig.serviceId,
      templateId: emailConfig.forgotPasswordTemplateId,
      publicKey: emailConfig.publicKey ? 'Configurado' : 'No configurado'
    });
    
    // Parámetros para el template de recuperación de contraseña
    // Obtener la URL del logo desde Cloudinary
    const logoUrl = cloudinaryService.isConfigured() 
      ? cloudinaryService.getBioCafeLogo()
      : 'https://via.placeholder.com/150x60/8B4513/F5E6D3?text=BioCafe'; // Fallback
    
    console.log('🔍 DEBUG - URL del logo:', logoUrl);
    console.log('🔍 DEBUG - Cloudinary configurado:', cloudinaryService.isConfigured());
    
    const templateParams = {
      to_name: userEmail,
      to_email: userEmail,
      user_email: userEmail,
      reset_link: resetLink,
      logo_url: logoUrl
    };
    
    console.log('Parámetros del template:', templateParams);

    const response = await emailjs.send(
      emailConfig.serviceId,
      emailConfig.forgotPasswordTemplateId,
      templateParams,
      emailConfig.publicKey
    );

    console.log('Email de recuperación enviado exitosamente:', response);
    return { success: true, message: 'Correo de recuperación enviado exitosamente' };
  } catch (error) {
    console.error('Error detallado al enviar el email de recuperación:', error);
    return { success: false, message: 'Error al enviar el correo de recuperación', error };
  }
};

/**
 * Verifica si EmailJS está configurado correctamente
 * @returns {boolean} - True si está configurado, false si no
 */
export const isEmailConfigured = () => {
  return emailConfig.publicKey && emailConfig.publicKey !== 'tu_public_key_aqui' && 
         emailConfig.serviceId && emailConfig.serviceId !== 'service_biocafe' && 
         emailConfig.templateId && emailConfig.templateId !== 'template_welcome';
};

/**
 * Verifica si el template de recuperación de contraseña está configurado
 * @returns {boolean} - True si está configurado, false si no
 */
export const isForgotPasswordConfigured = () => {
  return emailConfig.forgotPasswordTemplateId && emailConfig.forgotPasswordTemplateId !== 'template_forgot_password';
};

const emailService = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  isEmailConfigured,
  isForgotPasswordConfigured
};

export default emailService;