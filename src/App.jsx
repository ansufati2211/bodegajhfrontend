import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SalesHistory from './pages/SalesHistory';
// Importación de tus componentes y páginas
import Login from './components/Login';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import NewSale from './pages/NewSale';

function App() {
  const [estaLogueado, setEstaLogueado] = useState(!!localStorage.getItem('token'));

  const manejarIngresoExitoso = () => {
    setEstaLogueado(true);
  };

  const manejarCierreSesion = () => {
    localStorage.removeItem('token');
    setEstaLogueado(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: Si ya está logueado, lo mandamos al inventario. Si no, le mostramos el Login y le pasamos la función */}
        <Route 
          path="/login" 
          element={!estaLogueado ? <Login onLoginSuccess={manejarIngresoExitoso} /> : <Navigate to="/inventario" />} 
        />
        
        {/* LA RUTA MADRE (Protegida): Si está logueado, dibuja el Layout y le pasa la función de salir. Si no, lo patea al login */}
        <Route 
          path="/" 
          element={estaLogueado ? <Layout onLogout={manejarCierreSesion} /> : <Navigate to="/login" />}
        >
          
          {/* LAS RUTAS HIJAS */}
          <Route index element={<Navigate to="/inventario" />} /> {/* <- Redirige por defecto al inventario */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventario" element={<Inventory />} />
          
          {/* Sub-rutas de ventas */}
          <Route path="ventas/nueva" element={<NewSale />} />
          <Route path="ventas/historial" element={<SalesHistory />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;