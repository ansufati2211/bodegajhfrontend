import api from './api';

export const iniciarSesion = async (email, password) => {
  try {
    // IMPORTANTE: Asegúrate de que esta ruta coincida con el endpoint de tu Spring Boot
    const respuesta = await api.post('/auth/login', { email, password });
    
    // Si el backend nos devuelve un token, lo guardamos en el LocalStorage
    if (respuesta.data.token) {
      localStorage.setItem('token', respuesta.data.token);
      // Opcional: guardar datos del usuario
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario));
    }
    
    return respuesta.data;
  } catch (error) {
    console.error("Error en el login", error);
    throw error; // Lanzamos el error para que la pantalla de Login lo atrape
  }
};

export const cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};