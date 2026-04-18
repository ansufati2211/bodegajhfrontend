import api from './api';

// Función para obtener todos los productos (GET)
export const obtenerProductos = async () => {
  try {
    const respuesta = await api.get('/productos');
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

// Función para crear un nuevo producto (POST)
export const crearProducto = async (nuevoProducto) => {
  try {
    const respuesta = await api.post('/productos', nuevoProducto);
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};