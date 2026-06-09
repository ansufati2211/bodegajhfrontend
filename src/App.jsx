import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
        {/* 1. RUTA PÚBLICA DE LOGIN (Esta es la que faltaba y causaba el error) */}
        <Route 
          path="/login" 
          element={estaLogueado ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={manejarIngresoExitoso} />} 
        />
        
        {/* 2. RUTAS PROTEGIDAS (Solo se ven si estás logueado) */}
        <Route path="/" element={estaLogueado ? <Layout onLogout={manejarCierreSesion} /> : <Navigate to="/login" />}>
          
          {/* Si entras a la raíz "/", te manda al dashboard */}
          <Route index element={<Navigate to="/dashboard" />} />
          
          {/* Páginas principales */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventario" element={<Inventory />} />
          
          {/* Módulo de Ventas */}
          <Route path="ventas/nueva" element={<NewSale />} />
          <Route path="ventas/historial" element={<div className="p-8"><h1>Historial (En construcción)</h1></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;