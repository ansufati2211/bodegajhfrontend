import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Box, ShoppingCart, Users, Truck, 
  BarChart3, Settings, LogOut, ChevronDown, ChevronUp, 
  PlusCircle, History 
} from 'lucide-react';

const NavItem = ({ icon, label, path, hasSubmenu, isOpen, onToggle, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detecta si estamos en la ruta exacta, o si estamos dentro de un submenú (ej. /ventas/...)
  const active = path ? location.pathname === path : location.pathname.startsWith('/ventas');

  const handleClick = () => {
    if (hasSubmenu) {
      onToggle(); // Abre o cierra el acordeón
    } else if (path) {
      navigate(path); // Navega a la ruta
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        onClick={handleClick} 
        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${
          active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'hover:bg-white/5 text-slate-300 hover:text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {hasSubmenu && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} className="opacity-50" />)}
      </div>
      
      {/* Aquí renderizamos las sub-opciones si está abierto */}
      {hasSubmenu && isOpen && (
        <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Componente para los botones pequeñitos dentro del submenú
const SubNavItem = ({ icon, label, path }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <div 
      onClick={() => navigate(path)}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all ${
        active ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

const Layout = ({ onLogout }) => {
  // Estado para controlar si el menú de ventas está abierto
  const [ventasAbierto, setVentasAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-500 p-1 rounded shadow-lg shadow-blue-500/20">
            <Box size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold leading-tight text-white uppercase tracking-wider">
            Sistema de Ventas<br />e Inventario
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" />
          <NavItem icon={<Box size={20} />} label="Inventario" path="/inventario" />
          
          {/* BOTÓN DESPLEGABLE DE VENTAS */}
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="Ventas" 
            hasSubmenu 
            isOpen={ventasAbierto} 
            onToggle={() => setVentasAbierto(!ventasAbierto)}
          >
            <SubNavItem icon={<PlusCircle size={16} />} label="Nueva Venta" path="/ventas/nueva" />
            <SubNavItem icon={<History size={16} />} label="Historial" path="/ventas/historial" />
          </NavItem>

          <NavItem icon={<Users size={20} />} label="Clientes" path="/clientes" />
          <NavItem icon={<Truck size={20} />} label="Proveedores" path="/proveedores" />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" path="/reportes" />
          <NavItem icon={<Settings size={20} />} label="Configuración" path="/configuracion" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors w-full rounded-lg hover:bg-white/5">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;