import { Cloudinary } from 'cloudinary-core';

// Configuración de Cloudinary
const cloudinary = new Cloudinary({
  cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  secure: true
});

/**
 * Servicio para manejar imágenes con Cloudinary
 */
export const cloudinaryService = {
  /**
   * Genera la URL optimizada de una imagen desde Cloudinary
   * @param {string} publicId - ID público de la imagen en Cloudinary
   * @param {object} options - Opciones de transformación
   * @returns {string} URL de la imagen optimizada
   */
  getOptimizedImageUrl: (publicId, options = {}) => {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };
    
    return cloudinary.url(publicId, defaultOptions);
  },

  /**
   * Genera la URL del logo de BioCafe optimizada para emails
   * @param {object} options - Opciones adicionales de transformación
   * @returns {string} URL del logo optimizada
   */
  getBioCafeLogo: (options = {}) => {
    // Usar la URL directa que funciona correctamente
    return 'https://res.cloudinary.com/dfzjivxsy/image/upload/v1754956556/My%20Brand/logo_biocafe_s2fpf2.jpg';
  },

  /**
   * Genera URLs para diferentes tamaños del logo
   * @returns {object} Objeto con URLs para diferentes tamaños
   */
  getBioCafeLogoSizes: () => {
    return {
      small: cloudinary.url('My Brand/logo_biocafe_s2fpf2', { width: 100, height: 40, crop: 'fit', quality: 'auto' }),
      medium: cloudinary.url('My Brand/logo_biocafe_s2fpf2', { width: 150, height: 60, crop: 'fit', quality: 'auto' }),
      large: cloudinary.url('My Brand/logo_biocafe_s2fpf2', { width: 300, height: 120, crop: 'fit', quality: 'auto' })
    };
  },

  /**
   * Sube una imagen a Cloudinary (requiere configuración adicional del backend)
   * @param {File} file - Archivo de imagen a subir
   * @param {object} options - Opciones de subida
   * @returns {Promise} Promesa con la respuesta de Cloudinary
   */
  uploadImage: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'biocafe_preset'); // Debes crear este preset en Cloudinary
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  },

  /**
   * Valida si Cloudinary está configurado correctamente
   * @returns {boolean} True si está configurado, false si no
   */
  isConfigured: () => {
    return !!(process.env.REACT_APP_CLOUDINARY_CLOUD_NAME && 
             process.env.REACT_APP_CLOUDINARY_CLOUD_NAME !== 'tu_cloud_name');
  }
};

export default cloudinaryService;