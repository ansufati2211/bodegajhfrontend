import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SalesHistory from './pages/SalesHistory';
import Login from './components/Login';
import Layout from './components/Layout';
import Inventory from './pages/Inventory';
import Dashboard from './pages/Dashboard';
import NewSale from './pages/NewSale';
import Proveedores from './pages/Proveedores';
import Clientes from './pages/Clientes';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

function App() {
  const [estaLogueado, setEstaLogueado] = useState(!!localStorage.getItem('token'));

  const manejarIngresoExitoso = () => setEstaLogueado(true);
  const manejarCierreSesion = () => {
    localStorage.removeItem('token');
    setEstaLogueado(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={estaLogueado ? <Navigate to="/inventario" /> : <Login onLoginSuccess={manejarIngresoExitoso} />} />
        
        <Route path="/" element={estaLogueado ? <Layout onLogout={manejarCierreSesion} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/inventario" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventario" element={<Inventory />} />
          <Route path="ventas/nueva" element={<NewSale />} />
          <Route path="ventas/historial" element={<SalesHistory />} />
          
          {/* ¡AHORA SÍ! TODAS ESTÁN ADENTRO DEL LAYOUT */}
          <Route path="clientes" element={<Clientes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;