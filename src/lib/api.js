// src/lib/api.js
import axios from './axios';

// ===================================
// 📊 ESTADÍSTICAS Y SISTEMA
// ===================================
export const statsAPI = {
  // Obtener estadísticas del sistema
  getStats: async () => {
    try {
      const response = await axios.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  // Obtener estado del sistema
  getSystemStatus: async () => {
    try {
      const response = await axios.get('/system/status');
      return response.data;
    } catch (error) {
      console.error('Error getting system status:', error);
      throw error;
    }
  },
};

// ===================================
// 📧 CORREOS (Email Processing)
// ===================================
export const emailsAPI = {
  // Obtener lista de correos procesados
  getEmails: async (params = {}) => {
    try {
      const response = await axios.get('/emails', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting emails:', error);
      throw error;
    }
  },

  // Obtener un correo específico
  getEmailById: async (id) => {
    try {
      const response = await axios.get(`/emails/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  },

  // Enviar correo de prueba
  sendTestEmail: async (emailData) => {
    try {
      const response = await axios.post('/emails/test', emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  },

  // Reprocesar un correo
  reprocessEmail: async (id) => {
    try {
      const response = await axios.post(`/emails/${id}/reprocess`);
      return response.data;
    } catch (error) {
      console.error('Error reprocessing email:', error);
      throw error;
    }
  },
};

// ===================================
// 📚 LIBROS (Books)
// ===================================
export const booksAPI = {
  // Obtener lista de libros con paginación
  getBooks: async (params = { limit: 10, offset: 0, query: null }) => {
    try {
      const response = await axios.get('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting books:', error);
      throw error;
    }
  },

  // Obtener un libro específico por ID
  getBookById: async (id) => {
    try {
      const response = await axios.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting book:', error);
      throw error;
    }
  },

  // Crear un nuevo libro (requiere admin)
  createBook: async (bookData) => {
    try {
      const response = await axios.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Actualizar un libro (requiere admin)
  updateBook: async (id, bookData) => {
    try {
      const response = await axios.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Eliminar un libro (requiere admin)
  deleteBook: async (id) => {
    try {
      const response = await axios.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Buscar libros por término
  searchBooks: async (query, limit = 10, offset = 0) => {
    try {
      const response = await axios.get('/books', { 
        params: { query, limit, offset } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },
};

// ===================================
// 📖 RESERVAS (Reservations)
// ===================================
export const reservationsAPI = {
  // Crear una reserva
  createReservation: async (reservationData) => {
    try {
      const response = await axios.post('/reservations/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  // Obtener una reserva específica
  getReservationById: async (id) => {
    try {
      const response = await axios.get(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting reservation:', error);
      throw error;
    }
  },

  // Listar todas las reservas (solo admin)
  listReservations: async () => {
    try {
      const response = await axios.get('/reservations');
      return response.data;
    } catch (error) {
      console.error('Error listing reservations:', error);
      throw error;
    }
  },

  // Actualizar una reserva (solo admin)
  updateReservation: async (id, reservationData) => {
    try {
      const response = await axios.put(`/reservations/${id}`, reservationData);
      return response.data;
    } catch (error) {
      console.error('Error updating reservation:', error);
      throw error;
    }
  },

  // Eliminar una reserva (owner o admin)
  deleteReservation: async (id) => {
    try {
      const response = await axios.delete(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting reservation:', error);
      throw error;
    }
  },

  // Renovar una reserva
  renewReservation: async (id) => {
    try {
      const response = await axios.post(`/reservations/${id}/renew`);
      return response.data;
    } catch (error) {
      console.error('Error renewing reservation:', error);
      throw error;
    }
  },

  // Listar reservas con filtros avanzados y paginación (solo admin)
  listReservationsAdvanced: async (params = {}) => {
    try {
      const response = await axios.get('/reservations/advanced', { params });
      return response.data;
    } catch (error) {
      console.error('Error listing advanced reservations:', error);
      throw error;
    }
  },
};

// ===================================
// ⭐ RECOMENDACIONES (Recommendations)
// ===================================
export const recommendationsAPI = {
  // Obtener recomendaciones generadas por LLM
  getLLMRecommendations: async (category, limit = 5) => {
    try {
      const response = await axios.get(`/recommendations/llm/${category}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting LLM recommendations:', error);
      throw error;
    }
  },

  // Obtener recomendaciones de la biblioteca local
  getLibraryRecommendations: async (category, limit = 5) => {
    try {
      const response = await axios.get(`/recommendations/library/${category}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting library recommendations:', error);
      throw error;
    }
  },

  // Obtener recomendaciones combinadas (IA + biblioteca)
  getCombinedRecommendations: async (category, limit = 5) => {
    try {
      const response = await axios.get(`/recommendations/combined/${category}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting combined recommendations:', error);
      throw error;
    }
  },

  // Enviar recomendaciones por email
  sendRecommendationsByEmail: async (category, email) => {
    try {
      const response = await axios.post(`/recommendations/email/${category}`, null, {
        params: { email }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending recommendations by email:', error);
      throw error;
    }
  },
};

// ===================================
// 👤 USUARIOS (Users)
// ===================================
export const usersAPI = {
  // Registrar un nuevo usuario
  register: async (userData, role = 'user') => {
    try {
      const response = await axios.post('/users/register', userData, {
        params: { role }
      });
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Login de usuario
  login: async (credentials) => {
    try {
      const response = await axios.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  // Obtener usuario actual autenticado
  getCurrentUser: async () => {
    try {
      const response = await axios.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  },

  // Listar todos los usuarios (solo admin)
  listUsers: async () => {
    try {
      const response = await axios.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  },

  // Obtener usuario por ID (solo admin)
  getUserById: async (id) => {
    try {
      const response = await axios.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Actualizar usuario (owner o admin)
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Eliminar usuario (solo admin)
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },
};

// ===================================
// 🔄 FUNCIONES AUXILIARES
// ===================================

// Manejo de errores consistente
export const handleAPIError = (error) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data.detail || error.response.data.message || 'Error del servidor',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      success: false,
      message: 'No se pudo conectar con el servidor',
      status: 0,
    };
  } else {
    return {
      success: false,
      message: error.message || 'Error desconocido',
      status: 0,
    };
  }
};

// Función para retry automático
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Exportar todo como objeto default
export default {
  statsAPI,
  emailsAPI,
  booksAPI,
  reservationsAPI,
  recommendationsAPI,
  usersAPI,
  handleAPIError,
  retryRequest,
};