import api from './api';
export const verificarCaja = async (idUsuario) => {
  const response = await fetch(`${API_URL}/verificar/${idUsuario}`);
  if (!response.ok) throw new Error('Error al verificar la caja');
  return response.json();
};

export const abrirCaja = async (datosTurno) => {
  const response = await fetch(`${API_URL}/abrir`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosTurno)
  });
  if (!response.ok) throw new Error('Error al abrir la caja');
  return response.json();
};

export const cerrarCaja = async (idTurno, datosCierre) => {
  const response = await fetch(`${API_URL}/cerrar/${idTurno}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosCierre)
  });
  if (!response.ok) throw new Error('Error al cerrar la caja');
  return response.json();
};