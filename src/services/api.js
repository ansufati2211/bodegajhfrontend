import axios from 'axios';

// Creamos una instancia de axios preconfigurada
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Asegúrate de que sea el puerto de tu Spring Boot
  headers: {
    'Content-Type': 'application/json'
  }
});
api.interceptors.request.use((config) => {
  // Buscamos si hay un token guardado en la memoria del navegador
  const token = localStorage.getItem('token');
  
  if (token) {
    // Si hay token, lo metemos en la cabecera de Autorización
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
export default api;