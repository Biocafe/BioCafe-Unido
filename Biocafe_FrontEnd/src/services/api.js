import axios from 'axios';
import { sendWelcomeEmail, sendPasswordResetEmail } from './emailService';

// Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Solo redirigir al login si es un error 401 en rutas de autenticación
    if (error.response?.status === 401 && error.config?.url?.includes('/autenticador/')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token'); // Limpiar ambos por compatibilidad
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userInfo');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login de usuario
  login: async (usuario, password) => {
    try {
      const loginData = { usuario, password };
      const response = await api.post('/autenticador/login', loginData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userInfo', JSON.stringify(response.data.usuario));
        // Disparar evento para notificar cambios en la información del usuario
        window.dispatchEvent(new Event('userInfoUpdated'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      // Enviar solo los campos que el AutenticadorDto espera
      const registroData = {
        usuario: userData.usuario,
        password: userData.password
      };
      
      const response = await api.post('/autenticador/registro', registroData);
      
      // Si el registro fue exitoso, enviar correo de bienvenida
      if (response.data && response.data.ok) {
        try {
          const emailResult = await sendWelcomeEmail(
            userData.email || userData.usuario,
            userData.nombre || userData.usuario,
            userData.password
          );
          console.log('Resultado del envío de email:', emailResult);
        } catch (emailError) {
          console.error('Error al enviar email de bienvenida:', emailError);
          // No fallar el registro si el email falla
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // Limpiar ambos por compatibilidad
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userInfo');
    // Disparar evento para notificar cambios en la información del usuario
    window.dispatchEvent(new Event('userInfoUpdated'));
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  },

  // Obtener información del usuario
  getUserInfo: () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo || userInfo === 'undefined' || userInfo === 'null') {
      return null;
    }
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Error parsing userInfo from localStorage:', error);
      localStorage.removeItem('userInfo');
      return null;
    }
  },

  // Solicitar recuperación de contraseña
  forgotPassword: async (email) => {
    try {
      // Primero verificar si el usuario existe en el backend
      const response = await api.post('/autenticador/forgot-password', { email });
      
      if (response.data && response.data.ok) {
        // Si el backend confirma que el usuario existe, enviar email
        try {
          const resetLink = `${window.location.origin}/reset-password?token=${response.data.token || 'temp-token'}`;
          const emailResult = await sendPasswordResetEmail(
            email,
            email, // Usar email como nombre por defecto
            resetLink
          );
          console.log('Resultado del envío de email de recuperación:', emailResult);
          return { ok: true, message: 'Correo de recuperación enviado exitosamente' };
        } catch (emailError) {
          console.error('Error al enviar email de recuperación:', emailError);
          return { ok: false, message: 'Error al enviar el correo de recuperación' };
        }
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/autenticador/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error de conexión' };
    }
  }
};

// Servicios de datos
export const datosService = {
  // Crear datos individuales
  crearDatos: async (datos) => {
    try {
      const response = await api.post('/datos', datos);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear datos' };
    }
  },

  // Crear datos masivos
  crearDatosMasivos: async (formData) => {
    try {
      const response = await api.post('/datos/masivos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cargar datos masivos' };
    }
  },

  // Cargar Excel
  cargarExcel: async (formData) => {
    try {
      const response = await api.post('/datos/cargar-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cargar archivo Excel' };
    }
  },

  // Obtener datos
  obtenerDatos: async () => {
    try {
      const response = await api.get('/datos');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener datos' };
    }
  }
};

// Servicios de pruebas
export const pruebasService = {
  // Ejecutar una prueba específica
  ejecutarPrueba: async (tipo, datos) => {
  try {
    // Enviar la estructura completa que espera el backend según DatosDto
    const sane = (datos || [])
      .map(d => {
        const valor = Number(
          d.resultado ??
          d.valortto ??
          d.valor ??
          d.Score ??
          d.score ??
          d.VALOR
        );
        return {
          Archivo: null, // El backend manejará esto como Buffer vacío
          nombretto: String(d.nombretto ?? '').trim(),
          valortto: valor,
          prueba: 'analisis_masivo',
          resultado: valor
        };
      })
      .filter(x => x.nombretto && !Number.isNaN(x.resultado)); // evitar NaN y vacíos

    const response = await api.post('/pruebas', {
      tipo: tipo,
      datos: sane,
    });
    return response.data;
  } catch (error) {
    // útil para ver por qué el back rechaza
    console.error('API /pruebas error:', error?.response?.status, error?.response?.data);
    throw error.response?.data || { message: 'Error al ejecutar prueba' };
  }
},

  // Ejecutar todas las pruebas estadísticas
  ejecutarTodasLasPruebas: async (datos) => {
    try {
      const pruebas = ['shapiro', 'levene', 'anova', 'duncan'];
      const resultados = {};
      
      for (const tipo of pruebas) {
        const resultado = await pruebasService.ejecutarPrueba(tipo, datos);
        resultados[tipo] = resultado;
      }
      
      return {
        ok: true,
        resultados
      };
    } catch (error) {
      throw error.response?.data || { message: 'Error al ejecutar pruebas' };
    }
  }
};

export default api;