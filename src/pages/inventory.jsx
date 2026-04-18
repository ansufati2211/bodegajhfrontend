import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Box, ShoppingCart, Users, Truck, 
  BarChart3, Settings, LogOut, Search, Plus, 
  Filter, Download, Eye, Edit, Trash2, ChevronDown 
} from 'lucide-react';
// Importamos la función que hace la petición al backend
import { obtenerProductos } from '../services/inventory.service';

const Inventory = () => {
  // Estado para almacenar los productos de la BD
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hook para disparar la carga de datos al montar el componente
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const data = await obtenerProductos();
        setProducts(data);
      } catch (err) {
        setError("Error al conectar con el servidor de Spring Boot");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Sincronizando con la base de datos...</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-500 p-1 rounded shadow-lg shadow-blue-500/20">
            <Box size={24} className="text-white" />
          </div>
          <span className="text-xs font-bold leading-tight text-white uppercase tracking-wider">
            Sistema de Ventas<br />e Inventario - SQMIN
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem icon={<Box size={20} />} label="Inventario" active />
          <NavItem icon={<ShoppingCart size={20} />} label="Ventas" hasArrow />
          <NavItem icon={<Users size={20} />} label="Clientes" />
          <NavItem icon={<Truck size={20} />} label="Proveedores" />
          <NavItem icon={<BarChart3 size={20} />} label="Reportes" />
          <NavItem icon={<Settings size={20} />} label="Configuración" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 px-4 py-3 text-sm hover:text-white transition-colors w-full">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col">
        
        {/* Header con Buscador */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            SISTEMA DE VENTAS E INVENTARIO - ADMIN
          </h1>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar productos por nombre o SKU" 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm w-80 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">Juan Pérez</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <img src="https://ui-avatars.com/api/?name=Juan+Perez" className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </header>

        {/* Sección de la Tabla */}
        <section className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800">GESTIÓN DE INVENTARIO</h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md">
                <Plus size={18} /> Añadir Producto
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                <Filter size={18} /> Filtros
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50">
                <Download size={18} /> Exportar
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Lista de Productos</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Total: {products.length} ítems
              </span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-right">Precio</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length > 0 ? products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{p.sku || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.nombre}</td>
                    <td className="px-6 py-4 text-slate-500">{p.categoria || 'General'}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                      ${p.precio?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">{p.stock}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {p.stock > 10 ? 'EN STOCK' : 'BAJO STOCK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 text-slate-400">
                        <button className="hover:text-blue-600"><Eye size={18} /></button>
                        <button className="hover:text-amber-600"><Edit size={18} /></button>
                        <button className="hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                      No se encontraron productos en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, hasArrow = false }) => (
  <div className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${
    active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white/5 hover:text-white'
  }`}>
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {hasArrow && <ChevronDown size={14} className="opacity-50" />}
  </div>
);

export default Inventory;