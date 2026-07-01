import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CreditCard, Banknote, PackageOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { obtenerHistorialVentas } from '../services/sales.service';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

const Reportes = () => {
  const [kpis, setKpis] = useState({ totalRecaudado: 0, totalVentas: 0, ticketPromedio: 0 });
  const [dataGrafico, setDataGrafico] = useState([]);
  const [dataPagos, setDataPagos] = useState([]);

  useEffect(() => {
    const procesarReportes = async () => {
      try {
        const historial = await obtenerHistorialVentas();

        // Calcular KPIs principales
        const ingresos = historial.reduce((sum, v) => sum + v.total, 0);
        setKpis({
          totalRecaudado: ingresos,
          totalVentas: historial.length,
          ticketPromedio: historial.length ? (ingresos / historial.length) : 0
        });

        // Procesar datos para gráfico de barras (Últimos 7 días)
        const ventasPorDia = {};
        historial.forEach(v => {
          const fecha = v.fechaVenta.substring(0, 10);
          ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + v.total;
        });
        const chartData = Object.keys(ventasPorDia).slice(-7).map(fecha => ({ fecha, Ingresos: ventasPorDia[fecha] }));
        setDataGrafico(chartData);

        // Procesar datos para gráfico circular (Métodos de pago)
        let ef = 0, ya = 0, pl = 0, ta = 0;
        historial.forEach(v => { ef += v.pagoEfectivo; ya += v.pagoYape; pl += v.pagoPlin; ta += v.pagoTarjeta; });
        setDataPagos([
          { name: 'Efectivo', value: ef, fill: COLORS[0] },
          { name: 'Yape', value: ya, fill: COLORS[1] },
          { name: 'Plin', value: pl, fill: COLORS[2] },
          { name: 'Tarjeta', value: ta, fill: COLORS[3] }
        ].filter(d => d.value > 0));

      } catch (error) { 
        console.error("Error al cargar reportes", error); 
      }
    };
    
    procesarReportes();
  }, []);

  return (
      <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <div className="p-8 flex-1">
        <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3"><BarChart3 className="text-blue-600"/> Inteligencia de Negocios (BI)</h2>
        <p className="text-slate-500 text-sm mt-1">Análisis financiero y estadísticas de rendimiento general.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Banknote size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ingresos Totales</p><p className="text-2xl font-black text-slate-800">S/ {kpis.totalRecaudado.toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><PackageOpen size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ventas Realizadas</p><p className="text-2xl font-black text-slate-800">{kpis.totalVentas}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><TrendingUp size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ticket Promedio</p><p className="text-2xl font-black text-slate-800">S/ {kpis.ticketPromedio.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18}/> Evolución de Ingresos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fecha" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} width={45} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard size={18}/> Métodos de Pago</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPagos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
             {/* Solución S6479: Uso de p.name como key única */}
            {dataPagos.map((p, i) => (
              <span key={p.name} className="text-xs font-bold flex items-center gap-1 text-slate-600">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reportes;