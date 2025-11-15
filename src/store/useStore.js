import { create } from 'zustand';
import { 
  statsAPI, 
  emailsAPI, 
  booksAPI, 
  reservationsAPI,
  recommendationsAPI,
  usersAPI 
} from '@/lib/api';
import { updateById } from '@/utils/helpers';

const useStore = create((set, get) => ({
  // ===================================
  // 🎯 ESTADO INICIAL
  // ===================================
  
  stats: {
    totalEmails: 0,
    processedToday: 0,
    pendingEmails: 0,
    averageResponseTime: '0s',
    successRate: 0,
  },
  
  systemStatus: {
    emailMonitoring: 'inactive',
    llmProcessing: 'inactive',
    databaseConnection: 'inactive',
    lastCheck: null,
  },
  
  emails: [],
  emailsLoading: false,
  emailsError: null,
  
  books: [],
  booksLoading: false,
  booksError: null,
  
  reservations: [],
  reservationsLoading: false,
  reservationsError: null,
  
  user: null,
  token: null,
  isAuthenticated: false,
  
  activeTab: 'dashboard',

  // ===================================
  // 📊 ACCIONES - ESTADÍSTICAS
  // ===================================
  
  fetchStats: async () => {
    try {
      const data = await statsAPI.getStats();
      set({ stats: data });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },
  
  fetchSystemStatus: async () => {
    try {
      const data = await statsAPI.getSystemStatus();
      set({ 
        systemStatus: { ...data, lastCheck: new Date().toLocaleTimeString() }
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
      set({ 
        systemStatus: {
          emailMonitoring: 'error',
          llmProcessing: 'error',
          databaseConnection: 'error',
          lastCheck: new Date().toLocaleTimeString()
        }
      });
    }
  },

  // ===================================
  // 📧 ACCIONES - CORREOS
  // ===================================
  
  fetchEmails: async (params = {}) => {
    set({ emailsLoading: true, emailsError: null });
    try {
      const data = await emailsAPI.getEmails(params);
      set({ emails: data, emailsLoading: false });
    } catch (error) {
      set({ emailsError: error.message, emailsLoading: false });
    }
  },
  
  sendTestEmail: async (emailData) => {
    try {
      const response = await emailsAPI.sendTestEmail(emailData);
      const newEmail = {
        id: response.id || Date.now(),
        ...emailData,
        receivedAt: new Date().toLocaleString(),
        status: 'processing',
        response: null,
        processedAt: null,
      };
      set(state => ({ emails: [newEmail, ...state.emails] }));
      get().fetchStats();
      return response;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  },

  updateEmailStatus: (emailId, status, response = null) => {
    updateById(set, 'emails', emailId, (prev) => ({
      ...prev,
      status,
      response,
      processedAt: response ? new Date().toLocaleString() : null
    }));
  },

  // ===================================
  // 📚 ACCIONES - LIBROS
  // ===================================
  
  fetchBooks: async (params) => {
    set({ booksLoading: true });
    try {
      const response = await booksAPI.getBooks(params);
      set({ books: response.data, booksLoading: false });
      return response;
    } catch (error) {
      console.error('Error:', error);
      set({ booksLoading: false });
      throw error;
    }
  },
  
 createBook: async (bookData) => {
  try {
    const newBook = await booksAPI.createBook(bookData);
    set(state => ({
      books: Array.isArray(state.books)
        ? [...state.books, newBook]
        : [newBook] // Si no es array, crear uno nuevo
    }));
    return newBook;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
},

  
  updateBook: async (id, bookData) => {
    try {
      const updatedBook = await booksAPI.updateBook(id, bookData);
      updateById(set, 'books', id, updatedBook);
      return updatedBook;
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },
  
  deleteBook: async (id) => {
  try {
    await booksAPI.deleteBook(id);
    set(state => ({
      books: Array.isArray(state.books)
        ? state.books.filter(book => book.id !== id)
        : [] // Si no era un array, simplemente lo dejamos vacío
    }));
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
},

  
  searchBooks: async (query) => {
    set({ booksLoading: true });
    try {
      const results = await booksAPI.searchBooks(query);
      set({ books: results, booksLoading: false });
    } catch (error) {
      set({ booksError: error.message, booksLoading: false });
    }
  },

  // ===================================
  // 📖 ACCIONES - RESERVAS
  // ===================================
  
  fetchReservations: async (params = {}) => {
    set({ reservationsLoading: true, reservationsError: null });
    try {
      const data = await reservationsAPI.getReservations(params);
      set({ reservations: data, reservationsLoading: false });
    } catch (error) {
      set({ reservationsError: error.message, reservationsLoading: false });
    }
  },
  
  createReservation: async (reservationData) => {
    try {
      const newReservation = await reservationsAPI.createReservation(reservationData);
      set(state => ({ reservations: [...state.reservations, newReservation] }));
      updateById(set, 'books', reservationData.bookId, (prev) => ({ ...prev, available: false }));
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  renewReservation: async (id) => {
    try {
      const renewed = await reservationsAPI.renewReservation(id);
      updateById(set, 'reservations', id, renewed);
      return renewed;
    } catch (error) {
      console.error('Error renewing reservation:', error);
      throw error;
    }
  },

  cancelReservation: async (id) => {
    try {
      await reservationsAPI.cancelReservation(id);
      const reservation = get().reservations.find(r => r.id === id);
      set(state => ({
        reservations: state.reservations.filter(r => r.id !== id)
      }));
      if (reservation?.bookId) {
        updateById(set, 'books', reservation.bookId, (prev) => ({ ...prev, available: true }));
      }
    } catch (error) {
      console.error('Error canceling reservation:', error);
      throw error;
    }
  },

  // ===================================
  // ⭐ ACCIONES - RECOMENDACIONES
  // ===================================
  
  sendRecommendations: async (email, category) => {
    try {
      return await recommendationsAPI.sendRecommendationsByEmail(category, email);
    } catch (error) {
      console.error('Error sending recommendations:', error);
      throw error;
    }
  },
  
  getLLMRecommendations: async (category, limit = 5) => {
    try {
      return await recommendationsAPI.getLLMRecommendations(category, limit);
    } catch (error) {
      console.error('Error getting LLM recommendations:', error);
      throw error;
    }
  },

  getLibraryRecommendations: async (category, limit = 5) => {
    try {
      return await recommendationsAPI.getLibraryRecommendations(category, limit);
    } catch (error) {
      console.error('Error getting library recommendations:', error);
      throw error;
    }
  },

  getCombinedRecommendations: async (category, limit = 5) => {
    try {
      return await recommendationsAPI.getCombinedRecommendations(category, limit);
    } catch (error) {
      console.error('Error getting combined recommendations:', error);
      throw error;
    }
  },

  // ===================================
  // 🔐 ACCIONES - AUTENTICACIÓN
  // ===================================
  
  login: async (email, password) => {
    try {
      const response = await usersAPI.login({ email, password });
      const { access_token } = response;
      if (typeof window !== 'undefined') localStorage.setItem('access_token', access_token);
      const userData = await usersAPI.getCurrentUser();
      set({ user: userData, token: access_token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) return set({ isAuthenticated: false, user: null, token: null });
    try {
      const userData = await usersAPI.getCurrentUser();
      set({ user: userData, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('access_token');
      set({ isAuthenticated: false, user: null, token: null });
    }
  },

  // ===================================
  // 🎨 ACCIONES - UI
  // ===================================
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ===================================
  // 🔄 ACCIONES - UTILIDADES
  // ===================================
  
  refreshAll: async () => {
    const { fetchStats, fetchSystemStatus, fetchEmails, fetchBooks, fetchReservations } = get();
    await Promise.all([fetchStats(), fetchSystemStatus(), fetchEmails(), fetchBooks(), fetchReservations()]);
  },

  reset: () => set({
    stats: {
      totalEmails: 0,
      processedToday: 0,
      pendingEmails: 0,
      averageResponseTime: '0s',
      successRate: 0,
    },
    systemStatus: {
      emailMonitoring: 'inactive',
      llmProcessing: 'inactive',
      databaseConnection: 'inactive',
      lastCheck: null,
    },
    emails: [],
    books: [],
    reservations: [],
    activeTab: 'dashboard',
  }),
}));

export default useStore;
