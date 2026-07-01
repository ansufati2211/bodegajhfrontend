import api from './api';

// 1. Obtener todos los proveedores activos (GET)
export const obtenerProveedores = async () => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.get('/proveedores', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    throw error;
  }
};

// 2. Crear un nuevo proveedor (POST)
export const crearProveedor = async (nuevoProveedor) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.post('/proveedores', nuevoProveedor, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear proveedor:", error);
    throw error;
  }
};

// 3. Actualizar un proveedor existente (PUT)
export const actualizarProveedor = async (id, proveedorActualizado) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.put(`/proveedores/${id}`, proveedorActualizado, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar proveedor:", error);
    throw error;
  }
};

// 4. Eliminar proveedor (DELETE Lógico)
export const eliminarProveedor = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.delete(`/proveedores/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar proveedor:", error);
    throw error;
  }
};