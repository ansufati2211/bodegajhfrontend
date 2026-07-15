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
      if (onNavigate) onNavigate();
    }
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        style={active ? {
          background: '#2563eb',
          boxShadow: 'inset 2px 2px 4px rgba(0,0,0,.2), inset -1px -1px 3px rgba(255,255,255,.06), 0 4px 12px rgba(37,99,235,.3)',
          borderRadius: '12px',
          fontWeight: 700,
          transition: 'all .25s cubic-bezier(.34,1.56,.64,1)'
        } : {
          transition: 'all .2s ease',
          borderRadius: '12px'
        }}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm cursor-pointer border-none outline-none ${
          active
            ? 'text-white'
            : 'text-slate-300 hover:text-white hover:bg-white/5 bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{label}</span>
        </div>
        {hasSubmenu && (isOpen ? <ChevronUp size={14} className="text-blue-300" /> : <ChevronDown size={14} className="opacity-40" />)}
      </button>

      {hasSubmenu && isOpen && (
        <div className="ml-5 pl-4 border-l border-blue-500/20 mt-2 space-y-1">
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
        if (onNavigate) onNavigate();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-all border-none outline-none ${
        active ? 'text-white font-bold bg-blue-500/15 shadow-[inset_1px_1px_2px_rgba(0,0,0,.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5 bg-transparent'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
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

  const closeSidebar = () => setSidebarOpen(false);
  const handleOverlayKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeSidebar();
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: 'var(--bg-page)' }}>

      {/* CABECERA MÓVIL */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex justify-between items-center px-4"
        style={{
          background: '#1e293b',
          boxShadow: '0 4px 20px rgba(0,0,0,.25), inset 0 -1px 0 rgba(255,255,255,.04)'
        }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500"
            style={{ boxShadow: 'inset 1px 1px 2px rgba(0,0,0,.15), inset -1px -1px 2px rgba(255,255,255,.1), 0 0 12px rgba(37,99,235,.3)' }}>
            <Box size={20} className="text-white drop-shadow-sm" />
          </div>
          <span className="font-extrabold text-sm tracking-wide text-white">BODEGA JH</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/8 transition-all border-none bg-transparent cursor-pointer text-white"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* OVERLAY FONDO OSCURO EN MÓVIL */}
      {sidebarOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 transition-opacity border-none bg-transparent cursor-default"
          style={{ background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }}
          onClick={closeSidebar}
          onKeyDown={handleOverlayKeyDown}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* SIDEBAR RESPONSIVO — Dark Neumorphism */}
      <aside className={`fixed md:relative z-50 w-64 flex flex-col h-screen transition-transform duration-300 ease-in-out md:translate-x-0 rounded-r-2xl md:rounded-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
        style={{
          background: '#0f172a',
          boxShadow: '8px 0 32px rgba(0,0,0,.3), inset 0 0 0 1px rgba(255,255,255,.03)'
        }}>
        {/* LOGO VERSIÓN ESCRITORIO */}
        <div className="hidden md:flex p-6 items-center gap-3.5">
          <div className="p-1.5 rounded-xl bg-blue-500"
            style={{ boxShadow: 'inset 1px 1px 2px rgba(0,0,0,.2), inset -1px -1px 2px rgba(255,255,255,.08), 0 4px 16px rgba(37,99,235,.25)' }}>
            <Box size={24} className="text-white drop-shadow-sm" />
          </div>
          <span className="text-xs font-extrabold leading-tight text-slate-200 uppercase tracking-wider">
            Sistema de Ventas<br />e Inventario
          </span>
        </div>

        {/* ESPACIADOR VERSIÓN MÓVIL */}
        <div className="md:hidden h-16 w-full border-b border-white/5 flex items-center px-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menú de Navegación</span>
        </div>

        <nav className="flex-1 px-3.5 py-4 space-y-1.5 overflow-y-auto">
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

        <div className="p-4 border-t border-white/5">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm w-full rounded-xl transition-all duration-200 border-none outline-none bg-transparent cursor-pointer text-slate-400 hover:text-red-300 hover:bg-red-500/8"
            style={{ fontWeight: 600 }}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full pt-16 md:pt-0 relative" style={{ background: 'var(--bg-page)' }}>
        <Outlet />
      </main>
    </div>
  );
};

Layout.propTypes = {
  onLogout: PropTypes.func.isRequired
};

export default Layout;