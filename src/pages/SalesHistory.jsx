import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileText, RefreshCw, DollarSign, Smartphone, CreditCard, Eye, X, ShoppingCart } from 'lucide-react';
import { obtenerHistorialVentas } from '../services/sales.service.js';
import toast from 'react-hot-toast';

const hoy = new Date();
const diaSemana = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1;
const lunes = new Date(hoy);
lunes.setDate(hoy.getDate() - diaSemana);
const domingo = new Date(lunes);
domingo.setDate(lunes.getDate() + 6);

const strLunes = lunes.toISOString().split('T')[0];
const strDomingo = domingo.toISOString().split('T')[0];

const SalesHistory = () => {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);

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

  const limpiarFiltros = () => { setFechaInicio(''); setFechaFin(''); setFiltroMedioPago('TODOS'); };
  const totalRecaudado = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);

  const verDetalles = (venta) => {
    setVentaSeleccionada(venta);
    setModalDetalle(true);
  };

  const renderContenidoTabla = () => {
    if (cargando) return [<tr key="loading"><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">Cargando transacciones...</td></tr>];
    if (ventasFiltradas.length === 0) return [<tr key="empty"><td colSpan="5" className="text-center py-20 text-slate-400 font-medium">No se encontraron ventas para los filtros seleccionados.</td></tr>];

    return ventasFiltradas.map((v, idx) => {
      let conteoMetodos = (v.pagoEfectivo > 0 ? 1 : 0) + (v.pagoYape > 0 ? 1 : 0) + (v.pagoPlin > 0 ? 1 : 0) + (v.pagoTarjeta > 0 ? 1 : 0);
      return (
        <tr key={v.idVenta} className="row-enter transition-all duration-200 hover:bg-slate-50/80 hover:translate-x-1" style={{ animationDelay: `${idx * 35}ms` }}>
          <td className="px-5 py-3.5"><p className="font-bold text-slate-700">{v.numeroComprobante || `#00${v.idVenta}`}</p><span className="text-[10px] text-slate-400 font-medium">{new Date(v.fechaVenta).toLocaleString()}</span></td>
          <td className="px-5 py-3.5"><span className={`px-2.5 py-1 rounded-full font-black text-[10px] ${v.tipoComprobante === 'TICKET' ? 'bg-slate-100 text-slate-600 border border-slate-200/60' : 'bg-blue-50/80 text-blue-600 border border-blue-200/60'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>{v.tipoComprobante}</span></td>
          <td className="px-5 py-3.5">
            <div className="flex flex-wrap gap-1 max-w-xs">
              {v.pagoEfectivo > 0 && <span className="flex items-center gap-1 bg-emerald-50/80 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-200/60"><DollarSign size={10} />S/ {v.pagoEfectivo.toFixed(2)}</span>}
              {v.pagoYape > 0 && <span className="flex items-center gap-1 bg-purple-50/80 text-purple-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-purple-200/60"><Smartphone size={10} />S/ {v.pagoYape.toFixed(2)}</span>}
              {v.pagoPlin > 0 && <span className="flex items-center gap-1 bg-cyan-50/80 text-cyan-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-cyan-200/60"><Smartphone size={10} />S/ {v.pagoPlin.toFixed(2)}</span>}
              {v.pagoTarjeta > 0 && <span className="flex items-center gap-1 bg-blue-50/80 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-200/60"><CreditCard size={10} />S/ {v.pagoTarjeta.toFixed(2)}</span>}
              {conteoMetodos > 1 && <span className="bg-amber-100/80 text-amber-800 text-[9px] font-black px-2 py-1 rounded-lg uppercase">COMBINADO</span>}
            </div>
          </td>
          <td className="px-5 py-3.5 text-right font-extrabold text-slate-800 text-sm">S/ {v.total.toFixed(2)}</td>
          <td className="px-5 py-3.5 text-center">
            <button onClick={() => verDetalles(v)} className="icon-btn text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border-none cursor-pointer" title="Ver Detalles" style={{ boxShadow: 'var(--neu-shadow-card)' }}>
              <Eye size={18} />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 lg:p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2"><FileText className="text-blue-600" size={24} /> Historial de Ventas</h1>
          <p className="text-xs text-slate-500 font-medium">Consulta los cierres de caja y analiza los métodos de pago.</p>
        </div>
        <button onClick={cargarHistorial} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all border-none cursor-pointer w-full md:w-auto" style={{ boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
          <RefreshCw size={14} className={cargando ? "animate-spin" : ""} /> Actualizar Lista
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-[var(--neu-shadow-card)] border border-white/50">
        <div><label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 flex items-center gap-1 tracking-wide"><Calendar size={12} /> Desde</label><input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-700" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} /></div>
        <div><label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 flex items-center gap-1 tracking-wide"><Calendar size={12} /> Hasta</label><input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs font-medium outline-none text-slate-700" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} /></div>
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 flex items-center gap-1 tracking-wide"><Filter size={12} /> Medio de Pago</label>
          <select value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)} className="w-full rounded-xl px-3 py-2 text-xs font-bold outline-none neo-select">
            <option value="TODOS">- TODOS</option><option value="EFECTIVO">- EFECTIVO SOLO</option><option value="YAPE">- YAPE SOLO</option><option value="PLIN">- PLIN SOLO</option><option value="TARJETA">- TARJETA SOLO</option><option value="COMBINADO">- COMBINADOS</option>
          </select>
        </div>
        <button onClick={limpiarFiltros} className="text-xs font-bold text-red-500 hover:text-red-700 py-2 px-3 hover:bg-red-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer w-full text-center" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)' }}>Borrar Filtros</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 bg-white rounded-2xl overflow-hidden flex flex-col min-h-[300px] shadow-[var(--neu-shadow-card)] border border-white/50">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200 sticky top-0 z-10">
                <tr><th className="px-5 py-4">Comprobante</th><th className="px-5 py-4">Tipo</th><th className="px-5 py-4">Desglose de Pago</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4 text-center">Acción</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {renderContenidoTabla()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full lg:w-80 rounded-2xl p-5 flex flex-col justify-between h-fit shrink-0 shadow-[var(--classic-shadow)]"
          style={{ background: 'linear-gradient(160deg,#1e293b,#0f172a)', border: '1px solid rgba(255,255,255,.04)' }}>
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Caja en Pantalla</h3>
            <p className="text-[11px] text-slate-400 mb-4 font-medium">Monto total de las filas visibles según filtros.</p>
            <div className="rounded-xl p-4 border" style={{ background: 'rgba(15,23,42,.5)', boxShadow: 'inset 2px 2px 6px rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.05)' }}><span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Recaudado</span><p className="text-3xl font-extrabold text-blue-400 mt-1" style={{ textShadow: '0 0 12px rgba(59,130,246,.4)' }}>S/ {totalRecaudado.toFixed(2)}</p></div>
          </div>
        </div>
      </div>

      {modalDetalle && ventaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg modal-enter overflow-hidden flex flex-col max-h-[90vh] shadow-[var(--classic-shadow-lg)]">
            <div className="text-white p-4 flex justify-between items-center" style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)' }}>
              <h3 className="font-extrabold flex items-center gap-2 text-sm"><ShoppingCart size={18} className="text-blue-400" /> Detalle de Venta {ventaSeleccionada.numeroComprobante || `#00${ventaSeleccionada.idVenta}`}</h3>
              <button onClick={() => setModalDetalle(false)} className="hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-1 rounded-full hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100" style={{ boxShadow: 'var(--neu-shadow-input)' }}>
                <div><span className="text-slate-500 text-[11px] uppercase font-black tracking-wide">Fecha:</span> <br /><span className="font-medium text-slate-800">{new Date(ventaSeleccionada.fechaVenta).toLocaleString()}</span></div>
                <div><span className="text-slate-500 text-[11px] uppercase font-black tracking-wide">Comprobante:</span> <br /><span className="font-medium text-slate-800">{ventaSeleccionada.tipoComprobante}</span></div>
                {ventaSeleccionada.documentoCliente && (<div className="col-span-2"><span className="text-slate-500 text-[11px] uppercase font-black tracking-wide">Cliente (DNI/RUC):</span> <br /><span className="font-medium text-slate-800">{ventaSeleccionada.documentoCliente}</span></div>)}
              </div>

              <h4 className="font-extrabold text-slate-700 mb-2 border-b border-slate-200 pb-1 text-sm">Productos Vendidos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-black tracking-wide">
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
            <div className="p-4 border-t border-blue-100 flex justify-between items-center text-lg bg-gradient-to-r from-blue-50 to-white">
              <span className="font-extrabold text-blue-900">Total Pagado:</span>
              <span className="font-black text-blue-600 text-2xl" style={{ textShadow: '0 0 10px rgba(59,130,246,.2)' }}>S/ {ventaSeleccionada.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;