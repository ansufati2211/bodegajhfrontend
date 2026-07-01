import api from './api';

export const obtenerUsuarios = async () => {
  const { data } = await api.get('/usuarios', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return data;
};

export const obtenerRoles = async () => {
  const { data } = await api.get('/roles', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return data;
};

export const crearUsuario = async (nuevoUsuario) => {
  const { data } = await api.post('/usuarios', nuevoUsuario, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return data;
};

export const actualizarUsuario = async (id, usuario) => {
  const { data } = await api.put(`/usuarios/${id}`, usuario, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return data;
};

export const eliminarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
  return data;
};