import React, { useState, useEffect } from 'react';
import { Calendar, Filter, FileText, RefreshCw, DollarSign, Wallet, Smartphone, CreditCard } from 'lucide-react';
import { obtenerHistorialVentas } from '../services/sales.service.js';

const SalesHistory = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados de los filtros
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [filtroMedioPago, setFiltroMedioPago] = useState('TODOS');

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      const data = await obtenerHistorialVentas();
      // Ordenamos las ventas de la más reciente a la más antigua
      const ordenadas = data.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));
      setVentas(ordenadas);
      setVentasFiltradas(ordenadas);
    } catch (error) {
      console.error("Error al recuperar el historial:", error);
      alert("No se pudo conectar con el servidor para traer las ventas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Aplicar filtros cada vez que cambien las fechas o el medio de pago seleccionado
  useEffect(() => {
    let resultado = [...ventas];

    // 1. Filtrado por rango de fechas
    if (fechaInicio) {
      resultado = resultado.filter(v => {
        const fechaVentaStr = v.fechaVenta.substring(0, 10); // Saca solo 'YYYY-MM-DD'
        return fechaVentaStr >= fechaInicio;
      });
    }
    if (fechaFin) {
      resultado = resultado.filter(v => {
        const fechaVentaStr = v.fechaVenta.substring(0, 10);
        return fechaVentaStr <= fechaFin;
      });
    }

    // 2. Filtrado por método de pago utilizado
    if (filtroMedioPago !== 'TODOS') {
      resultado = resultado.filter(v => {
        if (filtroMedioPago === 'EFECTIVO') return (v.pagoEfectivo > 0);
        if (filtroMedioPago === 'YAPE') return (v.pagoYape > 0);
        if (filtroMedioPago === 'PLIN') return (v.pagoPlin > 0);
        if (filtroMedioPago === 'TARJETA') return (v.pagoTarjeta > 0);
        if (filtroMedioPago === 'COMBINADO') {
          // Contamos cuántas formas de pago tienen saldo mayor a cero
          let conteo = 0;
          if (v.pagoEfectivo > 0) conteo++;
          if (v.pagoYape > 0) conteo++;
          if (v.pagoPlin > 0) conteo++;
          if (v.pagoTarjeta > 0) conteo++;
          return conteo > 1;
        }
        return true;
      });
    }

    setVentasFiltradas(resultado);
  }, [fechaInicio, fechaFin, filtroMedioPago, ventas]);

  // Limpiar filtros aplicados
  const limpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    setFiltroMedioPago('TODOS');
  };

  // Calcular resumen del dinero en pantalla filtrada
  const totalRecaudado = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);

  return (
    <div className="flex flex-col h-full bg-slate-100 font-sans p-6 overflow-hidden">
      {/* Cabecera del módulo */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <FileText className="text-blue-600" size={24} /> Historial de Ventas Auditadas
          </h1>
          <p className="text-xs text-slate-500">Consulta los cierres de caja por días y analiza los métodos de pago combinados.</p>
        </div>
        <button 
          onClick={cargarHistorial} 
          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={cargando ? "animate-spin" : ""} /> Actualizar Lista
        </button>
      </div>

      {/* BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
            <Calendar size={12} /> Desde Fecha
          </label>
          <input 
            type="date" 
            value={fechaInicio} 
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
            <Calendar size={12} /> Hasta Fecha
          </label>
          <input 
            type="date" 
            value={fechaFin} 
            onChange={(e) => setFechaFin(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-medium"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
            <Filter size={12} /> Método de Pago
          </label>
          <select 
            value={filtroMedioPago} 
            onChange={(e) => setFiltroMedioPago(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-700 font-bold"
          >
            <option value="TODOS">🔍 TODOS LOS PAGOS</option>
            <option value="EFECTIVO">💵 EFECTIVO SOLO</option>
            <option value="YAPE">🍇 YAPE SOLO</option>
            <option value="PLIN">🌊 PLIN SOLO</option>
            <option value="TARJETA">💳 TARJETA SOLO</option>
            <option value="COMBINADO">🔀 PAGOS COMBINADOS</option>
          </select>
        </div>

        <button 
          onClick={limpiarFiltros}
          className="text-xs font-bold text-red-500 hover:text-red-700 py-2 px-3 hover:bg-red-50 rounded-lg transition-colors ml-auto"
        >
          Borrar Filtros
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* TABLA DE HISTORIAL (Izquierda) */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3">ID / Fecha</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-center">Desglose de Pago de la Boleta</th>
                  <th className="px-5 py-3 text-right">Total Cobrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cargando ? (
                  <tr><td colSpan="4" className="text-center py-20 text-slate-400">Cargando transacciones de la base de datos...</td></tr>
                ) : ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((v) => {
                    // Contar si es un pago combinado dinámico para poner una etiqueta
                    let conteoMetodos = 0;
                    if (v.pagoEfectivo > 0) conteoMetodos++;
                    if (v.pagoYape > 0) conteoMetodos++;
                    if (v.pagoPlin > 0) conteoMetodos++;
                    if (v.pagoTarjeta > 0) conteoMetodos++;

                    return (
                      <tr key={v.idVenta} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-700">#00{v.idVenta}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(v.fechaVenta).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 align-middle">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${v.tipoComprobante === 'TICKET' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 border border-blue-200'}`}>
                            {v.tipoComprobante}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center items-center gap-2 flex-wrap max-w-md mx-auto">
                            {v.pagoEfectivo > 0 && (
                              <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium text-[11px]">
                                <DollarSign size={12} /> S/ {v.pagoEfectivo.toFixed(2)}
                              </span>
                            )}
                            {v.pagoYape > 0 && (
                              <span className="flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-medium text-[11px]">
                                <Smartphone size={12} /> S/ {v.pagoYape.toFixed(2)}
                              </span>
                            )}
                            {v.pagoPlin > 0 && (
                              <span className="flex items-center gap-1 bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded font-medium text-[11px]">
                                <Smartphone size={12} /> S/ {v.pagoPlin.toFixed(2)}
                              </span>
                            )}
                            {v.pagoTarjeta > 0 && (
                              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium text-[11px]">
                                <CreditCard size={12} /> S/ {v.pagoTarjeta.toFixed(2)}
                              </span>
                            )}
                            {conteoMetodos > 1 && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 rounded tracking-wide uppercase">
                                COMBINADO 🔀
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-slate-800 text-sm">
                          S/ {v.total.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="4" className="text-center py-20 text-slate-400">No se encontraron ventas para los filtros seleccionados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TARJETA DE RESUMEN DE FILTRO (Derecha) */}
        <div className="w-80 bg-slate-900 text-white rounded-xl shadow-lg p-5 flex flex-col justify-between h-fit">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Caja en Pantalla</h3>
            <p className="text-[11px] text-slate-400 mb-4">Este monto representa la suma total acumulada de las filas visibles según tus filtros activos.</p>
            
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Recaudado</span>
              <p className="text-3xl font-extrabold text-blue-400 mt-1">S/ {totalRecaudado.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-6 text-[11px] text-slate-500 border-t border-slate-800 pt-3 italic text-center">
            Sistema SQMIN - Registro y Auditoría.
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesHistory;