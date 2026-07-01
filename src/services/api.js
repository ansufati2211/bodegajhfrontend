import axios from 'axios';

// Creamos una instancia de axios preconfigurada
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Asegúrate de que sea el puerto de tu Spring Boot
  headers: {
    'Content-Type': 'application/json'
  }
});

// 1. INTERCEPTOR DE PETICIONES (Lo que ya tenías)
// Inyecta el token de ida al backend
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

// 2. INTERCEPTOR DE RESPUESTAS (¡Lo Nuevo!)
// Revisa las respuestas del backend y actúa si hay error de sesión (401 o 403)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta fue exitosa (200 OK), simplemente la dejamos pasar
    return response;
  },
  (error) => {
    // Si hubo un error, verificamos si fue por problemas de autorización/token caducado
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");

      // Borramos el token inválido o caducado del navegador
      localStorage.removeItem('token');
      
      // (Opcional) Si guardas los datos del usuario, también bórralos
      // localStorage.removeItem('usuario'); 

      // Redirigimos forzosamente a la pantalla de login
      window.location.href = '/login';
    }

    // Si es otro tipo de error (ej. 404 No Encontrado o 500 Error de Servidor),
    // lo dejamos pasar para que la pantalla correspondiente lo maneje
    return Promise.reject(error);
  }
);

export default api;