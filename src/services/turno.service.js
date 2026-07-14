import api from './api';

// Usamos la instancia 'api' (axios) ya configurada con baseURL + token,
// en vez de fetch con una API_URL que nunca existió.

export const verificarCaja = async (idUsuario) => {
  const respuesta = await api.get(`/turnos/verificar/${idUsuario}`);
  return respuesta.data;
};

export const abrirCaja = async (datosTurno) => {
  const respuesta = await api.post('/turnos/abrir', datosTurno);
  return respuesta.data;
};

export const cerrarCaja = async (idTurno, datosCierre) => {
  const respuesta = await api.put(`/turnos/cerrar/${idTurno}`, datosCierre);
  return respuesta.data;
};