import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types'; 
import { 
  LayoutDashboard, Box, ShoppingCart, Users, Truck, 
  BarChart3, Settings, LogOut, ChevronDown, ChevronUp, 
  PlusCircle, History, Menu, X 
} from 'lucide-react';

const NavItem = ({ icon, label, path, hasSubmenu, isOpen, onToggle, children, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const active = path ? location.pathname === path : location.pathname.startsWith('/ventas');

  const handleClick = () => {
    if (hasSubmenu) {
      if (onToggle) onToggle();
    } else if (path) {
      navigate(path);
      if (onNavigate) onNavigate(); // Cierra el menú en móvil tras navegar
    }
  };

  return (
    <div className="flex flex-col">
      <button 
        type="button"
        onClick={handleClick} 
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all border-none outline-none focus:ring-2 focus:ring-blue-500/50 ${
          active 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
            : 'hover:bg-white/5 text-slate-300 hover:text-white bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {hasSubmenu && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} className="opacity-50" />)}
      </button>
      
      {hasSubmenu && isOpen && (
        <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string,
  hasSubmenu: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  children: PropTypes.node,
  onNavigate: PropTypes.func
};

const SubNavItem = ({ icon, label, path, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <button 
      type="button"
      onClick={() => {
        navigate(path);
        if (onNavigate) onNavigate(); // Cierra el menú en móvil tras navegar
      }}
      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all border-none outline-none focus:ring-2 focus:ring-blue-500/50 ${
        active ? 'text-white font-bold bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5 bg-transparent'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

SubNavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  onNavigate: PropTypes.func
};

const Layout = ({ onLogout }) => {
  const [ventasAbierto, setVentasAbierto] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para cerrar el menú en dispositivos móviles
  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeSidebar();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* CABECERA MÓVIL (Solo visible en pantallas pequeñas) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1e293b] text-white z-50 flex justify-between items-center px-4 shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 p-1.5 rounded shadow-lg shadow-blue-500/20">
            <Box size={20} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">BODEGA JH</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 focus:outline-none hover:bg-white/10 rounded-lg transition-colors border-none bg-transparent cursor-pointer text-white"
        >
          {sidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* OVERLAY FONDO OSCURO EN MÓVIL (Cierra el menú al hacer clic fuera) */}
      {sidebarOpen && (
        <button 
          type="button"
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" 
          onClick={closeSidebar} 
          onKeyDown={handleOverlayKeyDown}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* SIDEBAR RESPONSIVO */}
      <aside className={`
        fixed md:relative z-50 w-64 bg-[#1e293b] text-slate-300 flex flex-col h-screen transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* LOGO VERSIÓN ESCRITORIO */}
        <div className="hidden md:flex p-6 items-center gap-3">
          <div className="bg-blue-500 p-1 rounded shadow-lg shadow-blue-500/20">
            <Box size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold leading-tight text-white uppercase tracking-wider">
            Sistema de Ventas<br />e Inventario
          </span>
        </div>

        {/* ESPACIADOR VERSIÓN MÓVIL (Para no chocar con la cabecera fija) */}
        <div className="md:hidden h-16 w-full border-b border-slate-700/50 flex items-center px-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menú de Navegación</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" onNavigate={closeSidebar} />
          <NavItem icon={<Box size={20} />} label="Inventario" path="/inventario" onNavigate={closeSidebar} />
          
          <NavItem 
            icon={<ShoppingCart size={20} />} 
            label="Ventas" 
            hasSubmenu 
            isOpen={ventasAbierto} 
            onToggle={() => setVentasAbierto(!ventasAbierto)}
          >
            <SubNavItem icon={<PlusCircle size={16} />} label="Nueva Venta" path="/ventas/nueva" onNavigate={closeSidebar} />
            <SubNavItem icon={<History size={16} />} label="Historial" path="/ventas/historial" onNavigate={closeSidebar} />
          </NavItem>

          <NavItem icon={<Users size={20} />} label="Clientes" path="/clientes" onNavigate={closeSidebar} />
          <NavItem icon={<Truck size={20} />} label="Proveedores" path="/proveedores" onNavigate={closeSidebar} />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" path="/reportes" onNavigate={closeSidebar} />
          <NavItem icon={<Settings size={20} />} label="Configuración" path="/configuracion" onNavigate={closeSidebar} />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            type="button" 
            onClick={onLogout} 
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors w-full rounded-lg hover:bg-red-500/20 hover:text-red-400 border-none outline-none focus:ring-2 focus:ring-red-500/50 bg-transparent cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (Con margen superior en móvil para la cabecera fija) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full pt-16 md:pt-0 relative bg-slate-50">
        <Outlet /> 
      </main>
    </div>
  );
};

Layout.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Layout;