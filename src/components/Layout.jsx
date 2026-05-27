import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Box, ShoppingCart, Users, Truck, 
  BarChart3, Settings, LogOut, ChevronDown 
} from 'lucide-react';

// Componente inteligente para cada botón del menú
const NavItem = ({ icon, label, path, hasArrow = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sabe si la ruta actual coincide para iluminarse en azul
  const active = location.pathname === path;

  return (
    <div 
      onClick={() => navigate(path)} 
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
      {hasArrow && <ChevronDown size={14} className="opacity-50" />}
    </div>
  );
};

const Layout = ({ onLogout }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR COMPLETO */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col sticky top-0 h-screen">
        
        {/* LOGO / CABECERA DEL MENÚ */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-500 p-1 rounded shadow-lg shadow-blue-500/20">
            <Box size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold leading-tight text-white uppercase tracking-wider">
            Sistema de Ventas<br />e Inventario - SQMIN
          </span>
        </div>

        {/* BOTONES DEL MENÚ (Todos los que tenías antes restaurados) */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" path="/dashboard" />
          <NavItem icon={<Box size={20} />} label="Inventario" path="/inventario" />
          
          {/* Los siguientes botones visualmente están perfectos, pero apuntan a rutas que aún no existen */}
          <NavItem icon={<ShoppingCart size={20} />} label="Ventas" path="/ventas" hasArrow />
          <NavItem icon={<Users size={20} />} label="Clientes" path="/clientes" />
          <NavItem icon={<Truck size={20} />} label="Proveedores" path="/proveedores" />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" path="/reportes" />
          <NavItem icon={<Settings size={20} />} label="Configuración" path="/configuracion" />
        </nav>

        {/* BOTÓN DE LOGOUT */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={onLogout} 
            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white transition-colors w-full rounded-lg hover:bg-white/5"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO DE LAS PÁGINAS (DASHBOARD O INVENTARIO) */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Outlet /> 
      </main>

    </div>
  );
};

export default Layout;