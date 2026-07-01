import api from './api';

export const obtenerClientes = async () => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.get('/clientes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    throw error;
  }
};

export const crearCliente = async (nuevoCliente) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.post('/clientes', nuevoCliente, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al crear cliente:", error);
    throw error;
  }
};

export const actualizarCliente = async (id, clienteActualizado) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.put(`/clientes/${id}`, clienteActualizado, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    throw error;
  }
};

export const eliminarCliente = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const respuesta = await api.delete(`/clientes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    throw error;
  }
};