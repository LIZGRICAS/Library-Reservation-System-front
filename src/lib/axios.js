import axios from 'axios';

// Crear instancia de Axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - Agregar token si existe
axiosInstance.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar tokens de autenticación si los necesitas
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - Manejo de errores globales
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('❌ Response Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
      });

      // Manejo de errores específicos
      switch (error.response.status) {
        case 401:
          console.error('No autorizado - Redirigir al login');
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Acceso prohibido');
          break;
        case 404:
          console.error('Recurso no encontrado');
          break;
        case 500:
          console.error('Error interno del servidor');
          break;
        default:
          console.error('Error desconocido');
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('❌ No response from server:', error.request);
    } else {
      // Algo pasó al configurar la petición
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;