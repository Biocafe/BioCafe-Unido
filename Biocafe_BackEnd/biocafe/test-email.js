// Script de prueba para verificar el envío de emails
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Configurando transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configurada***' : 'NO CONFIGURADA');

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa');

    console.log('Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'test@example.com', // Cambia por un email real para probar
      subject: 'Prueba de Email - BioCafe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B4513;">¡Prueba de Email Exitosa!</h2>
          <p>Este es un email de prueba del sistema BioCafe.</p>
          <p>Si recibes este mensaje, la configuración de email está funcionando correctamente.</p>
        </div>
      `,
    });

    console.log('✅ Email enviado exitosamente:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Solución sugerida:');
      console.log('1. Verifica que EMAIL_USER y EMAIL_PASS estén correctos en .env');
      console.log('2. Para Gmail, activa la verificación en 2 pasos');
      console.log('3. Genera una contraseña de aplicación específica');
      console.log('4. Usa esa contraseña en EMAIL_PASS, no tu contraseña normal');
    }
  }
}

testEmail();