import axios from './axios';

// ===================================
// 📊 ESTADÍSTICAS
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
// 📧 CORREOS
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
// 📚 LIBROS
// ===================================
export const booksAPI = {
  // Obtener lista de libros
  getBooks: async (params = {}) => {
    try {
      const response = await axios.get('/books', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting books:', error);
      throw error;
    }
  },

  // Obtener un libro específico
  getBookById: async (id) => {
    try {
      const response = await axios.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting book:', error);
      throw error;
    }
  },

  // Crear un nuevo libro
  createBook: async (bookData) => {
    try {
      const response = await axios.post('/books', bookData);
      return response.data;
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  },

  // Actualizar un libro
  updateBook: async (id, bookData) => {
    try {
      const response = await axios.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  // Eliminar un libro
  deleteBook: async (id) => {
    try {
      const response = await axios.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  // Buscar libros
  searchBooks: async (query) => {
    try {
      const response = await axios.get('/books/search', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },
};

// ===================================
// 📖 RESERVAS
// ===================================
export const reservationsAPI = {
  // Obtener lista de reservas
  getReservations: async (params = {}) => {
    try {
      const response = await axios.get('/reservations', { params });
      return response.data;
    } catch (error) {
      console.error('Error getting reservations:', error);
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

  // Crear una reserva
  createReservation: async (reservationData) => {
    try {
      const response = await axios.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
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

  // Cancelar una reserva
  cancelReservation: async (id) => {
    try {
      const response = await axios.delete(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  },
};

// ===================================
// ⭐ RECOMENDACIONES
// ===================================
export const recommendationsAPI = {
  // Obtener recomendaciones
  getRecommendations: async (category, limit = 5) => {
    try {
      const response = await axios.get('/recommendations/library', {
        params: { category, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Enviar recomendaciones por email
  sendRecommendations: async (email, category) => {
    try {
      const response = await axios.post('/recommendations/send', {
        email,
        category
      });
      return response.data;
    } catch (error) {
      console.error('Error sending recommendations:', error);
      throw error;
    }
  },
};

// ===================================
// 👤 USUARIOS
// ===================================
export const usersAPI = {
  // Obtener usuario por email
  getUserByEmail: async (email) => {
    try {
      const response = await axios.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    try {
      const response = await axios.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
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
    // Error de respuesta del servidor
    return {
      success: false,
      message: error.response.data.message || 'Error del servidor',
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    // No hubo respuesta
    return {
      success: false,
      message: 'No se pudo conectar con el servidor',
      status: 0,
    };
  } else {
    // Error en la configuración
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