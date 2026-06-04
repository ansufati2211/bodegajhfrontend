import axios from 'axios';

// Configuración de la URL base de tu API de Spring Boot
const API_URL = 'http://localhost:8080/api/ventas';

export const registrarVenta = async (datosVenta) => {
  try {
    const token = localStorage.getItem('token');
    
    // Enviamos la estructura de la venta junto con el token en las cabeceras
    const respuesta = await axios.post(API_URL, datosVenta, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return respuesta.data;
  } catch (error) {
    console.error("Error en el servicio de ventas al conectar con el backend:", error);
    throw error;
  }
};