import api from './api';

// Servicio de Autenticación que se ajusta a los DTOs del backend
class AuthService {
  // Login usando AutenticadorDto (usuario, password)
  async login(usuario, password) {
    try {
      const response = await api.post('/autenticador/login', {
        usuario,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('usuario', usuario);
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en el login');
    }
  }

  // Registro usando AutenticadorDto (usuario, password)
  async registro(usuario, password) {
    try {
      const response = await api.post('/autenticador/registro', {
        usuario,
        password
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error en el registro');
    }
  }

  // Método register para compatibilidad con Register.js
  async register(userData) {
    try {
      const response = await api.post('/autenticador/registro', userData);
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.mensaje || error.response?.data?.message || 'Error en el registro');
    }
  }

  // Crear usuario completo usando UsuarioDto (email, password, rol)
  async crearUsuario(email, password, rol = 'caficultor') {
    try {
      const response = await api.post('/usuarios', {
        email,
        password,
        rol
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('usuario');
  }

  // Verificar si está autenticado
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' && 
           localStorage.getItem('authToken') !== null;
  }

  // Obtener token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Obtener usuario actual
  getCurrentUser() {
    return localStorage.getItem('usuario');
  }

  async getUserInfo() {
    try {
      const token = this.getToken();
      if (!token) {
        console.log('No hay token disponible');
        return null;
      }

      const response = await api.get('/usuarios/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener información del usuario:', error);
      // Si hay error de autenticación, limpiar el token
      if (error.response && error.response.status === 401) {
        this.logout();
      }
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;