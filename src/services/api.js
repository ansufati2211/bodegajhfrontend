import axios from 'axios';

// Creamos una instancia de axios preconfigurada
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Asegúrate de que sea el puerto de tu Spring Boot
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;