import api from './api';

// Función para obtener todos los productos (GET)
export const obtenerProductos = async () => {
  try {
    const token = localStorage.getItem('token'); // 1. Rescatamos la llave
    
    // 2. Adjuntamos la llave en los headers
    const respuesta = await api.get('/productos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

// Función para crear un nuevo producto (POST)
export const crearProducto = async (nuevoProducto) => {
  try {
    const token = localStorage.getItem('token'); // 1. Rescatamos la llave
    
    // 2. Adjuntamos la llave al enviar el nuevo producto
    const respuesta = await api.post('/productos', nuevoProducto, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};