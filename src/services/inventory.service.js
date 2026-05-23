import api from './api';

// 1. Obtener todos los productos (GET)
export const obtenerProductos = async () => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.get('/productos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
};

// 2. Crear un nuevo producto (POST)
export const crearProducto = async (nuevoProducto) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.post('/productos', nuevoProducto, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
};

// 3. Actualizar un producto existente (PUT) - Para el lápiz
export const actualizarProducto = async (id, productoActualizado) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.put(`/productos/${id}`, productoActualizado, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
};

// 4. Eliminar producto / Borrado lógico (DELETE) - Para la papelera
export const eliminarProducto = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.delete(`/productos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
};