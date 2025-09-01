import api from './api';

// Servicio de Pruebas Estadísticas que se conecta con el backend
class PruebasService {
  // Ejecutar prueba estadística usando el endpoint /pruebas del backend
  async ejecutarPrueba(tipo, datos) {
    try {
      const response = await api.post('/pruebas', {
        tipo,
        datos
      });
      
      // Extraer el resultado del wrapper del backend
      return response.data.resultado || response.data;
    } catch (error) {
      console.error(`Error en prueba ${tipo}:`, error);
      throw new Error(error.response?.data?.message || `Error al ejecutar prueba ${tipo}`);
    }
  }

  // Ejecutar prueba de Shapiro-Wilk
  async pruebaShapiro(datos) {
    return await this.ejecutarPrueba('shapiro', datos);
  }

  // Ejecutar prueba de Levene
  async pruebaLevene(datos) {
    return await this.ejecutarPrueba('levene', datos);
  }

  // Ejecutar ANOVA
  async pruebaAnova(datos) {
    return await this.ejecutarPrueba('anova', datos);
  }

  // Ejecutar prueba de Duncan
  async pruebaDuncan(datos) {
    return await this.ejecutarPrueba('duncan', datos);
  }

  // Ejecutar todas las pruebas estadísticas
  async ejecutarTodasLasPruebas(datos) {
    try {
      const [shapiro, levene, anova, duncan] = await Promise.all([
        this.pruebaShapiro(datos),
        this.pruebaLevene(datos),
        this.pruebaAnova(datos),
        this.pruebaDuncan(datos)
      ]);

      return {
        shapiro,
        levene,
        anova,
        duncan
      };
    } catch (error) {
      throw new Error('Error al ejecutar las pruebas estadísticas: ' + error.message);
    }
  }

  // Formatear datos para las pruebas (convertir de formato frontend a backend)
  formatearDatos(tratamientos) {
    // Convertir array de tratamientos a formato DatosDto esperado por backend
    return tratamientos.map(tratamiento => ({
      nombretto: tratamiento.nombretto,
      valortto: tratamiento.valortto,
      resultado: tratamiento.resultado || tratamiento.valortto, // Usar resultado si existe, sino valortto
      prueba: 'individual'
    }));
  }

  // Procesar resultados completos con datos y pruebas estadísticas
  async procesarResultadosCompletos(tratamientos) {
    try {
      const datosFormateados = this.formatearDatos(tratamientos);
      const pruebasEstadisticas = await this.ejecutarTodasLasPruebas(datosFormateados);
      
      return {
        datos: tratamientos,
        estadisticas: pruebasEstadisticas,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error('Error al procesar resultados completos: ' + error.message);
    }
  }
}

const pruebasService = new PruebasService();
export default pruebasService;