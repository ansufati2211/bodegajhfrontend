import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login'; 
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard'; 

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
        <Route 
          path="/login" 
          element={estaLogueado ? <Navigate to="/inventario" /> : <Login onLoginSuccess={() => setEstaLogueado(true)} />} 
        />

        {/* 2. RUTAS PROTEGIDAS (El sistema con Sidebar) */}
        {/* Si NO está logueado y entra aquí, lo pateamos al /login */}
        <Route 
          path="/" 
          element={estaLogueado ? <Layout onLogout={manejarCierreSesion} /> : <Navigate to="/login" />}
        >
          {/* Si entran a la raíz "/", los redirigimos al inventario automáticamente */}
          <Route index element={<Navigate to="/inventario" />} />
          
          {/* Las pantallas que se inyectan en el Layout */}
          <Route path="inventario" element={<Inventory />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* 3. RUTA DE SEGURIDAD (Error 404) */}
        {/* Si escriben cualquier URL rara, los mandamos al inicio */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;