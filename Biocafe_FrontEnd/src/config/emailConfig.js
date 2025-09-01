// Configuración de EmailJS para el envío de correos
// Para configurar EmailJS:
// 1. Regístrate en https://www.emailjs.com/
// 2. Crea un servicio de email (Gmail, Outlook, etc.)
// 3. Crea un template de email
// 4. Obtén tu Public Key
// 5. Reemplaza los valores a continuación

export const emailConfig = {
  // Service ID de EmailJS
  serviceId: 'service_2iasioj',
  
  // Template ID de EmailJS para correo de bienvenida
  templateId: 'template_anffnyc',
  
  // Template ID de EmailJS para recuperación de contraseña
  forgotPasswordTemplateId: 'template_hp2hkvn',
  
  // Public Key de EmailJS
  publicKey: '_tsT4kDlJPgy04U1t'
};

// Template de ejemplo para EmailJS:
// Nombre del template: template_welcome
// Variables a usar en el template:
// - {{to_email}} - Email del destinatario
// - {{to_name}} - Nombre del destinatario
// - {{user_email}} - Email/usuario para login
// - {{user_password}} - Contraseña para login
// - {{company_name}} - Nombre de la empresa (BioCafe)
// - {{message}} - Mensaje completo de bienvenida

// Ejemplo de template HTML para EmailJS:
/*
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B4513; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .credentials { background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a {{company_name}}! ☕🌱</h1>
        </div>
        <div class="content">
            <h2>¡Hola {{to_name}}!</h2>
            <p>¡Nos encanta que hagas parte de BioCafe! 🌱☕</p>
            
            <div class="credentials">
                <h3>Tus credenciales de acceso:</h3>
                <p><strong>📧 Usuario:</strong> {{user_email}}</p>
                <p><strong>🔐 Contraseña:</strong> {{user_password}}</p>
            </div>
            
            <p>Ahora puedes iniciar sesión en nuestra plataforma y comenzar a disfrutar de todos los beneficios que BioCafe tiene para ofrecerte.</p>
            
            <p>¡Bienvenido a la familia BioCafe!</p>
        </div>
        <div class="footer">
            <p>Saludos cordiales,<br>El equipo de BioCafe</p>
        </div>
    </div>
</body>
</html>
*/

export default emailConfig;