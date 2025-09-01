import api from './api';

// Servicio de Datos que se ajusta a los DTOs del backend
class DatosService {
  // Crear un dato individual usando DatosDto
  async crearDato(nombretto, valortto, prueba, resultado = null, archivo = null) {
    try {
      const datosDto = {
        nombretto,
        valortto,
        prueba,
        resultado,
        Archivo: archivo
      };
      
      const response = await api.post('/datos', datosDto);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear dato');
    }
  }

  // Cargar datos desde Excel usando el endpoint específico
  async cargarDesdeExcel(archivoBuffer) {
    try {
      const formData = new FormData();
      formData.append('file', archivoBuffer);
      
      const response = await api.post('/datos/cargar-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al cargar archivo Excel');
    }
  }

  // Obtener todos los datos
  async obtenerTodos() {
    try {
      const response = await api.get('/datos');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener datos');
    }
  }

  // Obtener dato por ID
  async obtenerPorId(id) {
    try {
      const response = await api.get(`/datos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener dato');
    }
  }

  // Actualizar dato
  async actualizar(id, datosActualizados) {
    try {
      const response = await api.patch(`/datos/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar dato');
    }
  }

  // Eliminar dato
  async eliminar(id) {
    try {
      const response = await api.delete(`/datos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar dato');
    }
  }

  // Crear múltiples datos (para carga masiva)
  async crearMultiples(datosArray) {
    try {
      const promesas = datosArray.map(dato => 
        this.crearDato(dato.nombretto, dato.valortto, dato.prueba || 'general', dato.resultado)
      );
      
      const resultados = await Promise.all(promesas);
      return resultados;
    } catch (error) {
      throw new Error('Error al crear múltiples datos: ' + error.message);
    }
  }
}

const datosService = new DatosService();
export default datosService;