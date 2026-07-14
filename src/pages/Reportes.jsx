import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CreditCard, Banknote, PackageOpen, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { obtenerHistorialVentas } from '../services/sales.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'];

const Reportes = () => {
  const [kpis, setKpis] = useState({ totalRecaudado: 0, totalVentas: 0, ticketPromedio: 0 });
  const [dataGrafico, setDataGrafico] = useState([]);
  const [dataPagos, setDataPagos] = useState([]);
  const [historialCompleto, setHistorialCompleto] = useState([]);

  useEffect(() => {
    const procesarReportes = async () => {
      try {
        const historial = await obtenerHistorialVentas();
        setHistorialCompleto(historial); // Guardamos la data para exportarla

        const ingresos = historial.reduce((sum, v) => sum + v.total, 0);
        setKpis({
          totalRecaudado: ingresos,
          totalVentas: historial.length,
          ticketPromedio: historial.length ? (ingresos / historial.length) : 0
        });

        const ventasPorDia = {};
        historial.forEach(v => {
          const fecha = v.fechaVenta.substring(0, 10);
          ventasPorDia[fecha] = (ventasPorDia[fecha] || 0) + v.total;
        });

        const chartData = Object.keys(ventasPorDia).slice(-7).map(fecha => ({ fecha, Ingresos: ventasPorDia[fecha] }));
        setDataGrafico(chartData);

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

  const exportarExcel = () => {
    const dataExcel = historialCompleto.map(v => ({
      'Comprobante': v.numeroComprobante || `#00${v.idVenta}`,
      'Fecha': new Date(v.fechaVenta).toLocaleString(),
      'Total (S/)': v.total,
      'Efectivo': v.pagoEfectivo,
      'Yape': v.pagoYape,
      'Plin': v.pagoPlin,
      'Tarjeta': v.pagoTarjeta,
      'Crédito': v.esCredito ? 'SÍ' : 'NO'
    }));
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, "Reporte_Finanzas.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte Financiero de Ventas", 14, 10);
    const tableData = historialCompleto.map(v => [
      v.numeroComprobante || `#00${v.idVenta}`,
      new Date(v.fechaVenta).toLocaleDateString(),
      `S/ ${v.total.toFixed(2)}`,
      v.esCredito ? 'CRÉDITO' : 'CONTADO'
    ]);
    autoTable(doc, { head: [['Comprobante', 'Fecha', 'Total', 'Tipo']], body: tableData, startY: 20 });
    doc.save("Reporte_Finanzas.pdf");
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen p-4 lg:p-8">
      <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 flex items-center gap-3"><BarChart3 className="text-blue-600"/> Inteligencia de Negocios (BI)</h2>
          <p className="text-slate-500 text-sm mt-1">Análisis financiero y estadísticas de rendimiento general.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"><Download size={16}/> Excel</button>
          <button onClick={exportarPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"><Download size={16}/> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Banknote size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ingresos Totales</p><p className="text-2xl font-black text-slate-800">S/ {kpis.totalRecaudado.toFixed(2)}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-emerald-100 p-3 rounded-full text-emerald-600"><PackageOpen size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ventas Realizadas</p><p className="text-2xl font-black text-slate-800">{kpis.totalVentas}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500 hover:-translate-y-1 hover:shadow-md transition-all">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><TrendingUp size={24}/></div>
          <div><p className="text-sm font-bold text-slate-500 uppercase">Ticket Promedio</p><p className="text-2xl font-black text-slate-800">S/ {kpis.ticketPromedio.toFixed(2)}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18}/> Evolución de Ingresos (7 días)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="fecha" tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `S/${val}`} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} formatter={(value) => [`S/ ${value}`, 'Ingresos']} />
                <Bar dataKey="Ingresos" fill="url(#colorIngresos)" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="col-span-1 bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><CreditCard size={18}/> Métodos de Pago</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataPagos} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                </Pie>
                <Tooltip formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Monto']} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {dataPagos.map((p, i) => (
              <span key={p.name} className="text-xs font-bold flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
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