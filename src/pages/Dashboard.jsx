import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, TrendingUp, Users, PackageX, DollarSign, ArrowRight } from 'lucide-react';
import { obtenerProductos } from '../services/inventory.service.js';
import { obtenerClientes } from '../services/cliente.service.js';
import { obtenerHistorialVentas } from '../services/sales.service.js';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const Dashboard = () => {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [kpis, setKpis] = useState({ ventasHoy: 0, totalClientes: 0, productosRiesgo: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Obtener datos para KPIs
        const ventas = await obtenerHistorialVentas();
        const clientes = await obtenerClientes();
        const resAlertas = await api.get('/reportes/alertas-stock');
        
        // Calcular ventas exclusivamente de hoy
        const hoy = new Date().toISOString().split('T')[0];
        const totalHoy = ventas
          .filter(v => v.fechaVenta.startsWith(hoy))
          .reduce((sum, v) => sum + v.total, 0);

        setKpis({
          ventasHoy: totalHoy,
          totalClientes: clientes.length,
          productosRiesgo: resAlertas.data.length
        });

        setAlertasStock(resAlertas.data);

        // 2. Gráfico: Top 10 productos con más stock para no saturar la vista
        const productos = await obtenerProductos();
        const datosFormateados = productos
          .filter(p => p.estado)
          .sort((a, b) => b.stock - a.stock)
          .slice(0, 10)
          .map(p => ({ nombre: p.nombre, stock: p.stock }));
        
        setDatosGrafico(datosFormateados);

      } catch (error) {
        console.error("Error al cargar datos del dashboard", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Analizando métricas del negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 min-h-screen p-4 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <TrendingUp className="text-blue-600" /> Dashboard Principal
        </h2>
        <p className="text-slate-500 text-sm mt-1">Resumen operativo y alertas automáticas en tiempo real.</p>
      </div>

      {/* TARJETAS KPI (DISEÑO PROFESIONAL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600"><DollarSign size={28}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventas de Hoy</p>
            <p className="text-3xl font-black text-slate-800 mt-1">S/ {kpis.ventasHoy.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-red-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-red-100 p-4 rounded-full text-red-600"><PackageX size={28}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Crítico (≤ 5)</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{kpis.productosRiesgo} <span className="text-sm font-medium text-slate-500">ítems</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Users size={28}/></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clientes Registrados</p>
            <p className="text-3xl font-black text-slate-800 mt-1">{kpis.totalClientes}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: GRÁFICO Y TABLA DE ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO (Ocupa 2 columnas) */}
        <div className="col-span-1 lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Nivel de Stock (Top 10 Productos)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="nombre" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Unidades" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLA DE ALERTAS AUTOMÁTICAS (Ocupa 1 columna) */}
        <div className="col-span-1 bg-white p-0 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertTriangle size={18} /> Requieren Reabastecimiento
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-0 h-[320px]">
            {alertasStock.length > 0 ? (
              <ul className="divide-y divide-slate-100">
                {alertasStock.map((alerta, idx) => (
                  <li key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 text-sm">{alerta.nombre}</span>
                      <span className="bg-red-100 text-red-700 font-extrabold text-xs px-2 py-0.5 rounded animate-pulse">
                        {alerta.stock} unid.
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">SKU: {alerta.codigo_barras || 'N/A'}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-1 flex items-center gap-1">
                      Proveedor: {alerta.proveedor || 'Sin asignar'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <PackageX size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">Inventario saludable.</p>
                <p className="text-xs mt-1">Ningún producto está por debajo de las 5 unidades.</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <Link to="/inventario" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
              Ir al Inventario <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;