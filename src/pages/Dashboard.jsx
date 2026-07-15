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
        const ventas = await obtenerHistorialVentas();
        const clientes = await obtenerClientes();
        const resAlertas = await api.get('/reportes/alertas-stock');

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
      <div className="flex h-full items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-[spinPulse_1s_ease-in-out_infinite] rounded-full h-14 w-14 mx-auto mb-5"
            style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#93c5fd', borderRadius: '50%' }}>
          </div>
          <p className="text-slate-500 font-semibold tracking-wide text-sm">Analizando métricas del negocio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen p-4 md:p-6 lg:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
          <span className="bg-white p-2 rounded-full shadow-[var(--neu-shadow)] ring-1 ring-blue-500/10">
            <TrendingUp className="text-blue-600 drop-shadow-sm" size={26} />
          </span>
          Dashboard Principal
        </h2>
        <p className="text-slate-500 text-sm mt-1 ml-12">Resumen operativo y alertas automáticas en tiempo real.</p>
      </div>

      {/* TARJETAS KPI — NEUMÓRFICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {/* Ventas de Hoy */}
        <div className="bg-white p-5 md:p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-blue-500 hover-lift cursor-default"
          style={{ boxShadow: 'var(--neu-shadow-card)' }}>
          <div className="p-3 md:p-4 rounded-full bg-blue-50 shadow-[inset_0_2px_4px_rgba(0,0,0,.04)] ring-1 ring-blue-100">
            <DollarSign size={26} className="text-blue-600 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ventas de Hoy</p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1" style={{ textShadow: '0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.04)' }}>
              S/ {kpis.ventasHoy.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stock Crítico */}
        <div className="bg-white p-5 md:p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-red-500 hover-lift cursor-default"
          style={{ boxShadow: 'var(--neu-shadow-card)' }}>
          <div className="p-3 md:p-4 rounded-full bg-red-50 shadow-[inset_0_2px_4px_rgba(0,0,0,.04)] ring-1 ring-red-100">
            <PackageX size={26} className="text-red-600 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Stock Crítico (≤ 5)</p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1" style={{ textShadow: '0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.04)' }}>
              {kpis.productosRiesgo} <span className="text-sm font-semibold text-slate-400">ítems</span>
            </p>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white p-5 md:p-6 rounded-2xl flex items-center gap-4 border-l-4 border-l-emerald-500 hover-lift cursor-default sm:col-span-2 md:col-span-1"
          style={{ boxShadow: 'var(--neu-shadow-card)' }}>
          <div className="p-3 md:p-4 rounded-full bg-emerald-50 shadow-[inset_0_2px_4px_rgba(0,0,0,.04)] ring-1 ring-emerald-100">
            <Users size={26} className="text-emerald-600 drop-shadow-sm" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Clientes Registrados</p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1" style={{ textShadow: '0 1px 0 #fff,0 -1px 0 rgba(0,0,0,.04)' }}>
              {kpis.totalClientes}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: GRÁFICO Y TABLA DE ALERTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* GRÁFICO (Ocupa 2 columnas) — Contenedor Glass */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl p-4 md:p-6 overflow-hidden"
          style={{ background: 'rgba(255,255,255,.85)', boxShadow: 'var(--neu-shadow-card)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(4px)' }}>
          <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,.5)]"></span>
            Nivel de Stock (Top 10 Productos)
          </h3>
          <div className="h-72 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={.95} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="nombre" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc', opacity: .6 }} contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 24px rgba(0,0,0,.1)' }} />
                <Bar dataKey="stock" fill="url(#stockGrad)" radius={[6, 6, 0, 0]} name="Unidades" barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLA DE ALERTAS */}
        <div className="col-span-1 rounded-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: 'var(--neu-shadow-card)' }}>
          <div className="p-4 md:p-5 border-b border-red-100/60 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
            <h3 className="text-sm font-extrabold text-red-600 flex items-center gap-2">
              <AlertTriangle size={18} className="drop-shadow-sm" /> Requieren Reabastecimiento
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto bg-white" style={{ maxHeight: '320px' }}>
            {alertasStock.length > 0 ? (
              <ul className="divide-y divide-slate-50">
                {alertasStock.map((alerta, idx) => (
                  <li key={idx} className="row-enter p-4 hover:bg-slate-50/80 transition-all duration-200 hover:translate-x-1"
                    style={{ animationDelay: `${idx * 40}ms` }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-slate-800 text-sm">{alerta.nombre}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-red-700 bg-red-50/80 backdrop-blur-sm border border-red-100/60 shadow-[inset_0_1px_2px_rgba(255,255,255,.4)]"
                        style={{ boxShadow: '0 0 8px rgba(239,68,68,.15)' }}>
                        {alerta.stock} unid.
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">SKU: {alerta.codigo_barras || 'N/A'}</p>
                    <p className="text-xs text-blue-600 font-bold mt-1 flex items-center gap-1">
                      Proveedor: {alerta.proveedor || 'Sin asignar'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <PackageX size={44} className="opacity-15 mb-3" />
                <p className="text-sm font-bold">Inventario saludable.</p>
                <p className="text-xs mt-1">Ningún producto está por debajo de las 5 unidades.</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white text-center">
            <Link to="/inventario" className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 transition-colors">
              Ir al Inventario <ArrowRight size={14} className="text-blue-400" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;