import axios from 'axios';

const API_URL = 'http://localhost:8080/api/ventas';

// Configuración para incluir el Token de seguridad en cada petición
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const registrarVenta = async (datosVenta) => {
  const response = await axios.post(API_URL, datosVenta, { headers: getAuthHeader() });
  return response.data;
};

// 👇 NUEVA FUNCIÓN PARA EL HISTORIAL 👇
export const obtenerHistorialVentas = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data; // Esto traerá la lista con ID, total, fecha, pagoEfectivo, pagoYape, etc.
};