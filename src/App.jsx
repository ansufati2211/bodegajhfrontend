import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login'; 
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard'; 
import NewSale from './pages/NewSale';
function App() {
  const [estaLogueado, setEstaLogueado] = useState(!!localStorage.getItem('token'));

  const manejarCierreSesion = () => {
    localStorage.removeItem('token');
    setEstaLogueado(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        
        {/* 1. RUTA PÚBLICA (El Login) */}
        {/* Si ya está logueado y entra aquí, lo mandamos al inventario */}
        <Route path="/" element={estaLogueado ? <Layout onLogout={manejarCierreSesion} /> : <Navigate to="/login" />}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventario" element={<Inventory />} />
        
        {/* NUEVAS RUTAS DE VENTAS */}
        <Route path="ventas/nueva" element={<NewSale />} />
          <Route path="ventas/historial" element={<div className="p-8"><h1>Historial (En construcción)</h1></div>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;