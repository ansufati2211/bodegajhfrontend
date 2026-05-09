import { useState, useEffect } from 'react';
import Login from './components/Login'; // Ajusta la ruta si es necesario
import Inventory from './pages/Inventory'; // Ajusta la ruta si es necesario

function App() {
  // Verificamos si ya hay un token al recargar la página
  const [estaLogueado, setEstaLogueado] = useState(!!localStorage.getItem('token'));

  // Esta función se ejecuta cuando el Login.jsx responde con éxito
  const manejarIngresoExitoso = () => {
    setEstaLogueado(true);
  };

  // Si no está logueado, muestra el Login. Si lo está, muestra el Inventario.
  return (
    <>
      {estaLogueado ? (
        <Inventory /> 
      ) : (
        <Login onLoginSuccess={manejarIngresoExitoso} />
      )}
    </>
  );
}

export default App;