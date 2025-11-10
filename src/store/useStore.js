import { create } from 'zustand';
import { 
  statsAPI, 
  emailsAPI, 
  booksAPI, 
  reservationsAPI,
  recommendationsAPI 
} from '@/lib/api';

const useStore = create((set, get) => ({
  // ===================================
  // 🎯 ESTADO INICIAL
  // ===================================
  
  // Estadísticas
  stats: {
    totalEmails: 0,
    processedToday: 0,
    pendingEmails: 0,
    averageResponseTime: '0s',
    successRate: 0,
  },
  
  // Sistema
  systemStatus: {
    emailMonitoring: 'inactive',
    llmProcessing: 'inactive',
    databaseConnection: 'inactive',
    lastCheck: null,
  },
  
  // Correos
  emails: [],
  emailsLoading: false,
  emailsError: null,
  
  // Libros
  books: [],
  booksLoading: false,
  booksError: null,
  
  // Reservas
  reservations: [],
  reservationsLoading: false,
  reservationsError: null,
  
  // UI
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
        systemStatus: {
          ...data,
          lastCheck: new Date().toLocaleTimeString()
        }
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
      // En caso de error, marcar todo como inactivo
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
      set({ 
        emailsError: error.message, 
        emailsLoading: false 
      });
    }
  },
  
  sendTestEmail: async (emailData) => {
    try {
      const response = await emailsAPI.sendTestEmail(emailData);
      
      // Agregar el correo al estado
      const newEmail = {
        id: response.id || Date.now(),
        ...emailData,
        receivedAt: new Date().toLocaleString(),
        status: 'processing',
        response: null,
        processedAt: null,
      };
      
      set(state => ({
        emails: [newEmail, ...state.emails]
      }));
      
      // Actualizar estadísticas
      get().fetchStats();
      
      return response;
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  },
  
  updateEmailStatus: (emailId, status, response = null) => {
    set(state => ({
      emails: state.emails.map(email =>
        email.id === emailId
          ? {
              ...email,
              status,
              response,
              processedAt: response ? new Date().toLocaleString() : null
            }
          : email
      )
    }));
  },
  
  // ===================================
  // 📚 ACCIONES - LIBROS
  // ===================================
  
  fetchBooks: async (params = {}) => {
    set({ booksLoading: true, booksError: null });
    try {
      const data = await booksAPI.getBooks(params);
      set({ books: data, booksLoading: false });
    } catch (error) {
      set({ 
        booksError: error.message, 
        booksLoading: false 
      });
    }
  },
  
  createBook: async (bookData) => {
    try {
      const newBook = await booksAPI.createBook(bookData);
      set(state => ({
        books: [...state.books, newBook]
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
      set(state => ({
        books: state.books.map(book =>
          book.id === id ? updatedBook : book
        )
      }));
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
        books: state.books.filter(book => book.id !== id)
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
      set({ 
        reservationsError: error.message, 
        reservationsLoading: false 
      });
    }
  },
  
  createReservation: async (reservationData) => {
    try {
      const newReservation = await reservationsAPI.createReservation(reservationData);
      set(state => ({
        reservations: [...state.reservations, newReservation]
      }));
      
      // Actualizar disponibilidad del libro
      set(state => ({
        books: state.books.map(book =>
          book.id === reservationData.bookId
            ? { ...book, available: false }
            : book
        )
      }));
      
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },
  
  renewReservation: async (id) => {
    try {
      const renewed = await reservationsAPI.renewReservation(id);
      set(state => ({
        reservations: state.reservations.map(reservation =>
          reservation.id === id ? renewed : reservation
        )
      }));
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
        reservations: state.reservations.filter(r => r.id !== id),
        // Actualizar disponibilidad del libro
        books: state.books.map(book =>
          book.id === reservation?.bookId
            ? { ...book, available: true }
            : book
        )
      }));
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
      const response = await recommendationsAPI.sendRecommendations(email, category);
      return response;
    } catch (error) {
      console.error('Error sending recommendations:', error);
      throw error;
    }
  },
  
  // ===================================
  // 🎨 ACCIONES - UI
  // ===================================
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // ===================================
  // 🔄 ACCIONES - UTILIDADES
  // ===================================
  
  // Refrescar todos los datos
  refreshAll: async () => {
    const { fetchStats, fetchSystemStatus, fetchEmails, fetchBooks, fetchReservations } = get();
    await Promise.all([
      fetchStats(),
      fetchSystemStatus(),
      fetchEmails(),
      fetchBooks(),
      fetchReservations(),
    ]);
  },
  
  // Reset del store
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