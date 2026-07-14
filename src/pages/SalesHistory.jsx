import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileText, RefreshCw, DollarSign, Smartphone, CreditCard, Eye, X, ShoppingCart } from 'lucide-react';
import { obtenerHistorialVentas } from '../services/sales.service.js';
import toast from 'react-hot-toast';

// Calculamos Lunes y Domingo de la semana actual por defecto
const hoy = new Date();
const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1; // Ajuste: 0=Domingo
const lunes = new Date(hoy);
lunes.setDate(hoy.getDate() - diaSemana);
const domingo = new Date(lunes);
domingo.setDate(lunes.getDate() + 6);

const strLunes = lunes.toISOString().split('T')[0];
const strDomingo = domingo.toISOString().split('T')[0];

const SalesHistory = () => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Setamos las fechas calculadas como estado inicial
  const [fechaInicio, setFechaInicio] = useState(strLunes);
  const [fechaFin, setFechaFin] = useState(strDomingo);
  const [filtroMedioPago, setFiltroMedioPago] = useState('TODOS');

  const [modalDetalle, setModalDetalle] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const data = await obtenerHistorialVentas();
      const ordenadas = data.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));
      setVentas(ordenadas);
    } catch {
      toast.error("No se pudo conectar con el servidor para traer las ventas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  let ventasFiltradas = [...ventas];
  if (fechaInicio) ventasFiltradas = ventasFiltradas.filter(v => v.fechaVenta.substring(0, 10) >= fechaInicio);
  if (fechaFin) ventasFiltradas = ventasFiltradas.filter(v => v.fechaVenta.substring(0, 10) <= fechaFin);
  if (filtroMedioPago !== 'TODOS') {
    ventasFiltradas = ventasFiltradas.filter(v => {
      if (filtroMedioPago === 'EFECTIVO') return v.pagoEfectivo > 0;
      if (filtroMedioPago === 'YAPE') return v.pagoYape > 0;
      if (filtroMedioPago === 'PLIN') return v.pagoPlin > 0;
      if (filtroMedioPago === 'TARJETA') return v.pagoTarjeta > 0;
      if (filtroMedioPago === 'COMBINADO') return (v.pagoEfectivo > 0 ? 1 : 0) + (v.pagoYape > 0 ? 1 : 0) + (v.pagoPlin > 0 ? 1 : 0) + (v.pagoTarjeta > 0 ? 1 : 0) > 1;
      return true;
    });
  }

  // Ahora resetear limpia hasta la semana actual, no vacío
  const limpiarFiltros = () => { setFechaInicio(strLunes); setFechaFin(strDomingo); setFiltroMedioPago('TODOS'); };

  const totalRecaudado = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);

  const verDetalles = (venta) => {
    setVentaSeleccionada(venta);
    setModalDetalle(true);
  };

  const renderContenidoTabla = () => {
    if (cargando) return [<tr key="loading"><td colSpan="5" className="text-center py-20 text-slate-400">Cargando transacciones...</td></tr>];
    if (ventasFiltradas.length === 0) return [<tr key="empty"><td colSpan="5" className="text-center py-20 text-slate-400">No se encontraron ventas para los filtros seleccionados.</td></tr>];
    
    return ventasFiltradas.map((v) => {
      let conteoMetodos = (v.pagoEfectivo > 0 ? 1 : 0) + (v.pagoYape > 0 ? 1 : 0) + (v.pagoPlin > 0 ? 1 : 0) + (v.pagoTarjeta > 0 ? 1 : 0);
      return (
        <tr key={v.idVenta} className="hover:bg-slate-50/80 transition-colors">
          <td className="px-5 py-3.5"><p className="font-bold text-slate-700">{v.numeroComprobante || `#00${v.idVenta}`}</p><span className="text-[10px] text-slate-400">{new Date(v.fechaVenta).toLocaleString()}</span></td>
          <td className="px-5 py-3.5"><span className={`px-2 py-0.5 rounded font-bold text-[10px] ${v.tipoComprobante === 'TICKET' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>{v.tipoComprobante}</span></td>
          <td className="px-5 py-3.5">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {v.pagoEfectivo > 0 && <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200"><DollarSign size={10} />S/ {v.pagoEfectivo.toFixed(2)}</span>}
              {v.pagoYape > 0 && <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded text-[10px] border border-purple-200"><Smartphone size={10} />S/ {v.pagoYape.toFixed(2)}</span>}
              {v.pagoPlin > 0 && <span className="flex items-center gap-1 bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded text-[10px] border border-cyan-200"><Smartphone size={10} />S/ {v.pagoPlin.toFixed(2)}</span>}
              {v.pagoTarjeta > 0 && <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] border border-blue-200"><CreditCard size={10} />S/ {v.pagoTarjeta.toFixed(2)}</span>}
              {conteoMetodos > 1 && <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 rounded uppercase mt-0.5">COMBINADO</span>}
            </div>
          </td>
          <td className="px-5 py-3.5 text-right font-bold text-slate-800 text-sm">S/ {v.total.toFixed(2)}</td>
          <td className="px-5 py-3.5 text-center">
            <button onClick={() => verDetalles(v)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors border-none cursor-pointer" title="Ver Detalles">
              <Eye size={18} />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 font-sans p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2"><FileText className="text-blue-600" size={24} /> Historial de Ventas</h1>
          <p className="text-xs text-slate-500">Consulta los cierres de caja y analiza los métodos de pago.</p>
        </div>
        <button onClick={cargarHistorial} className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer w-full md:w-auto">
          <RefreshCw size={14} className={cargando ? "animate-spin" : ""} /> Actualizar Lista
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Desde</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" /></div>
        <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Hasta</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700" /></div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Filter size={12} /> Medio de Pago</label>
          <select value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-bold">
            <option value="TODOS">- TODOS</option><option value="EFECTIVO">- EFECTIVO SOLO</option><option value="YAPE">- YAPE SOLO</option><option value="PLIN">- PLIN SOLO</option><option value="TARJETA">- TARJETA SOLO</option><option value="COMBINADO">- COMBINADOS</option>
          </select>
        </div>
        <button onClick={limpiarFiltros} className="text-xs font-bold text-red-500 hover:text-red-700 py-2 px-3 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer w-full text-center">Borrar Filtros</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 sticky top-0 z-10">
                <tr><th className="px-5 py-3">Comprobante</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Desglose de Pago</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3 text-center">Acción</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {renderContenidoTabla()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full lg:w-80 bg-slate-900 text-white rounded-xl shadow-lg p-5 flex flex-col justify-between h-fit shrink-0">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Caja en Pantalla</h3>
            <p className="text-[11px] text-slate-400 mb-4">Monto total de las filas visibles según filtros.</p>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-800"><span className="text-[10px] font-bold text-slate-400 uppercase">Total Recaudado</span><p className="text-3xl font-extrabold text-blue-400 mt-1">S/ {totalRecaudado.toFixed(2)}</p></div>
          </div>
        </div>
      </div>

      {modalDetalle && ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl modal-enter overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18}/> Detalle de Venta {ventaSeleccionada.numeroComprobante || `#00${ventaSeleccionada.idVenta}`}</h3>
              <button onClick={() => setModalDetalle(false)} className="hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"><X size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div><span className="text-slate-500 text-xs uppercase font-bold">Fecha:</span> <br/><span className="font-medium text-slate-800">{new Date(ventaSeleccionada.fechaVenta).toLocaleString()}</span></div>
                <div><span className="text-slate-500 text-xs uppercase font-bold">Comprobante:</span> <br/><span className="font-medium text-slate-800">{ventaSeleccionada.tipoComprobante}</span></div>
                {ventaSeleccionada.documentoCliente && (<div className="col-span-2"><span className="text-slate-500 text-xs uppercase font-bold">Cliente (DNI/RUC):</span> <br/><span className="font-medium text-slate-800">{ventaSeleccionada.documentoCliente}</span></div>)}
              </div>
              
              <h4 className="font-bold text-slate-700 mb-2 border-b border-slate-200 pb-1">Productos Vendidos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase">
                    <tr><th className="p-2">Producto</th><th className="p-2 text-center">Cant</th><th className="p-2 text-right">Subtotal</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ventaSeleccionada.detalles?.map((det, i) => (
                      <tr key={det.idDetalle ?? `${det.producto?.nombre ?? 'producto'}-${det.cantidad}-${det.precioUnitario}-${i}`}>
                        <td className="p-2 font-medium text-slate-700">{det.producto?.nombre || 'Producto Desconocido'}</td>
                        <td className="p-2 text-center font-bold text-slate-600">{det.cantidad}</td>
                        <td className="p-2 text-right text-slate-700">S/ {(det.cantidad * det.precioUnitario).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border-t border-blue-100 flex justify-between items-center text-lg">
              <span className="font-bold text-blue-900">Total Pagado:</span>
              <span className="font-black text-blue-600 text-2xl">S/ {ventaSeleccionada.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;