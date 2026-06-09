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
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />
        
        {/* 1. LA RUTA MADRE (El Layout) */}
        <Route path="/" element={<Layout />}>
          
          {/* 2. LAS RUTAS HIJAS (Se renderizan en el <Outlet /> del Layout) */}
          <Route index element={<Navigate to="/dashboard" />} />
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