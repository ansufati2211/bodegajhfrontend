import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, ShoppingCart, ToggleLeft, ToggleRight, FileText, Banknote, Smartphone, CreditCard, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { obtenerProductos } from '../services/inventory.service.js';
import { registrarVenta } from '../services/sales.service.js';
import { verificarCaja, abrirCaja, cerrarCaja } from '../services/turno.service.js';
import { obtenerClientes } from '../services/cliente.service.js';

const NEO_SHADOW = 'var(--neu-shadow)';
const NEO_PRESSED = 'var(--neu-shadow-pressed)';

const NewSale = () => {
  const [productosBase, setProductosBase] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sunatActivo, setSunatActivo] = useState(false);
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [pagoEfectivo, setPagoEfectivo] = useState('');
  const [pagoYape, setPagoYape] = useState('');
  const [pagoPlin, setPagoPlin] = useState('');
  const [pagoTarjeta, setPagoTarjeta] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ticketImprimir, setTicketImprimir] = useState(null);
  const lectorRef = useRef(null);

  const [clientesLista, setClientesLista] = useState([]);
  const [idCliente, setIdCliente] = useState('');
  const [esCredito, setEsCredito] = useState(false);
  const [diasPlazo, setDiasPlazo] = useState(15);

  const [turnoActivo, setTurnoActivo] = useState(null);
  const [cajaBloqueada, setCajaBloqueada] = useState(true);
  const [verificandoCaja, setVerificandoCaja] = useState(true);
  const [montoApertura, setMontoApertura] = useState('');
  const [montoCierreDeclarado, setMontoCierreDeclarado] = useState('');
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const inicializarPantalla = async () => {
      try {
        const usuarioGuardado = localStorage.getItem('usuario');
        let usuario = { idUsuario: 1, nombreCompleto: 'Usuario Temporal', rol: { nombre: 'CAJERO' } };

        if (usuarioGuardado && usuarioGuardado !== 'undefined') {
          try {
            usuario = JSON.parse(usuarioGuardado);
          } catch (e) {
            console.warn("JSON inválido en localStorage, usando usuario temporal.");
          }
        }

        setUsuarioActual(usuario);

        const datosTurno = await verificarCaja(usuario.idUsuario);
        if (datosTurno.mensaje === "CAJA_CERRADA") {
          setCajaBloqueada(true);
        } else {
          setTurnoActivo(datosTurno);
          setCajaBloqueada(false);
        }

        const dataProd = await obtenerProductos();
        setProductosBase(dataProd);

        const dataClientes = await obtenerClientes();
        setClientesLista(dataClientes.filter(c => c.estado === true));

      } catch (error) {
        console.error("Error al inicializar:", error);
        toast.error("Error de conexión con el servidor.");
      } finally {
        setVerificandoCaja(false);
      }
    };

    inicializarPantalla();
  }, []);

  useEffect(() => {
    if (!cajaBloqueada && !verificandoCaja && lectorRef.current) {
      lectorRef.current.focus();
    }
  }, [cajaBloqueada, verificandoCaja]);

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    if (montoApertura === '' || Number(montoApertura) < 0) {
      return toast.error("Ingresa un monto inicial válido (0 o mayor).");
    }
    try {
      const nuevoTurno = { idUsuario: usuarioActual.idUsuario, nombreCajero: usuarioActual.nombreCompleto, montoInicial: Number(montoApertura) };
      const turnoCreado = await abrirCaja(nuevoTurno);
      setTurnoActivo(turnoCreado);
      setCajaBloqueada(false);
      toast.success("¡Caja abierta exitosamente!");
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo abrir la caja.");
    }
  };

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    if (montoCierreDeclarado === '' || Number(montoCierreDeclarado) < 0) return toast.error("Ingresa el monto físico");
    try {
      await cerrarCaja(turnoActivo.idTurno, { montoFinal: Number(montoCierreDeclarado), totalVentas: turnoActivo.totalVentas || 0 });
      toast.success("¡Turno cerrado y guardado correctamente!");
      setMostrarModalCierre(false); setTurnoActivo(null); setCajaBloqueada(true); setMontoApertura(''); setMontoCierreDeclarado('');
    } catch (error) { toast.error("Hubo un error al cerrar la caja."); }
  };

  const handleBusquedaProducto = (e) => {
    e.preventDefault();
    const valorTermino = busqueda.trim().toLowerCase();
    if (!valorTermino) return;
    let productoEncontrado = productosBase.find(p => p.codigoBarras === valorTermino && p.estado) ||
      productosBase.find(p => p.nombre.toLowerCase() === valorTermino && p.estado) ||
      productosBase.find(p => p.nombre.toLowerCase().includes(valorTermino) && p.estado);
    if (productoEncontrado) agregarAlCarrito(productoEncontrado);
    else toast.error("Producto no encontrado o sin stock");
    setBusqueda('');
    lectorRef.current.focus();
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(item => item.idProducto === producto.idProducto);
      if (existe) {
        if (existe.cantidad >= producto.stock) { toast.error("Stock máximo alcanzado"); return carritoActual; }
        return carritoActual.map(item => item.idProducto === producto.idProducto ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioVenta } : item);
      }
      return [...carritoActual, { idProducto: producto.idProducto, nombre: producto.nombre, precioVenta: producto.precioVenta, cantidad: 1, subtotal: producto.precioVenta, stockMax: producto.stock }];
    });
  };

  const eliminarDelCarrito = (id) => setCarrito(carrito.filter(item => item.idProducto !== id));

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const numEfectivo = Number.parseFloat(pagoEfectivo) || 0;
  const numYape = Number.parseFloat(pagoYape) || 0;
  const numPlin = Number.parseFloat(pagoPlin) || 0;
  const numTarjeta = Number.parseFloat(pagoTarjeta) || 0;
  const totalIngresado = numEfectivo + numYape + numPlin + numTarjeta;
  const saldoRestante = total - totalIngresado;

  const handleProcesarVenta = async () => {
    if (carrito.length === 0) return toast.error("El carrito está vacío");
    if (procesando) return;

    if (esCredito && !idCliente) return toast.error("Seleccione un cliente para realizar el fiado.");
    if (!esCredito && Math.abs(saldoRestante) > 0.01 && saldoRestante > 0) return toast.error(`Falta cubrir S/ ${saldoRestante.toFixed(2)}`);

    let finalEfectivo = numEfectivo;
    if (!esCredito && totalIngresado === 0) finalEfectivo = total;
    if (esCredito && totalIngresado === 0) finalEfectivo = 0;

    const datosVenta = {
      documentoCliente: documentoCliente || 'CLIENTE GENÉRICO',
      tipoComprobante: sunatActivo ? tipoComprobante : 'TICKET',
      total: total,
      enviarSunat: sunatActivo,
      pagoEfectivo: finalEfectivo,
      pagoYape: numYape,
      pagoPlin: numPlin,
      pagoTarjeta: numTarjeta,
      idTurno: turnoActivo?.idTurno || null,
      idCliente: idCliente ? Number(idCliente) : null,
      esCredito: esCredito,
      diasPlazo: esCredito ? Number(diasPlazo) : null,
      detalles: carrito.map(item => ({ idProducto: item.idProducto, cantidad: item.cantidad, precioUnitario: item.precioVenta }))
    };

    try {
      setProcesando(true);
      await registrarVenta(datosVenta);
      toast.success("¡Venta registrada con éxito!");
      if (turnoActivo) setTurnoActivo(prev => ({ ...prev, totalVentas: (prev.totalVentas || 0) + total }));

      setTicketImprimir({
        tipo: sunatActivo ? tipoComprobante : 'TICKET DE VENTA',
        cliente: idCliente ? clientesLista.find(c => c.idCliente === Number(idCliente))?.nombres : (documentoCliente || 'Público General'),
        fecha: new Date().toLocaleString(),
        items: [...carrito],
        total: total,
        pagos: { efectivo: finalEfectivo, yape: numYape, plin: numPlin, tarjeta: numTarjeta, vuelto: saldoRestante < 0 ? Math.abs(saldoRestante) : 0 },
        cajero: usuarioActual?.nombreCompleto || 'Caja'
      });
      setCarrito([]); setDocumentoCliente(''); setPagoEfectivo(''); setPagoYape(''); setPagoPlin(''); setPagoTarjeta(''); setIdCliente(''); setEsCredito(false);
      setTimeout(() => { globalThis.print(); }, 500);
    } catch (error) {
      toast.error(error.response?.data?.error || "No se pudo registrar la venta.");
    } finally {
      setProcesando(false);
    }
  };

  const renderMensajeSaldo = () => {
    if (esCredito) return <span>Venta a Crédito. Deuda: S/ {saldoRestante.toFixed(2)}</span>;
    if (saldoRestante > 0) return <span>Falta cubrir: S/ {saldoRestante.toFixed(2)}</span>;
    if (saldoRestante < 0) return <span>Vuelto a entregar: S/ {Math.abs(saldoRestante).toFixed(2)}</span>;
    return <span>¡Monto exacto cubierto! S/ {totalIngresado.toFixed(2)}</span>;
  };

  if (verificandoCaja) {
    return (
      <div className="flex h-full items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="animate-[spinPulse_1s_ease-in-out_infinite] rounded-full h-14 w-14 mx-auto mb-5" style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#93c5fd' }}></div>
          <p className="text-slate-500 font-semibold tracking-wide text-sm">Verificando estado de caja...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print { 
          body * { visibility: hidden; margin: 0; padding: 0; } 
          #zona-impresion, #zona-impresion * { visibility: visible; } 
          #zona-impresion { 
            position: absolute; 
            left: 0; top: 0; 
            width: 80mm; 
            padding: 5mm; 
            font-family: 'Courier New', Courier, monospace; 
            color: #000; 
            font-size: 12px;
          } 
          .ticket-divider { border-bottom: 1px dashed #000; margin: 8px 0; }
        }
      `}</style>

      <div id="zona-impresion" className="hidden print:block bg-white text-black">
        {ticketImprimir && (
          <div className="w-full">
            <div className="text-center mb-4">
              <h2 className="font-extrabold text-xl mb-1 tracking-widest">BODEGA JH</h2>
              <p className="text-xs">Av. Abraham Valdelomar M-15</p>
              <p className="text-xs">Parcona, Ica</p>
              <p className="text-xs">RUC: 10215019875</p>
            </div>

            <div className="ticket-divider"></div>

            <div className="mb-3 text-xs leading-tight">
              <p><span className="font-bold">{ticketImprimir.tipo}</span> {esCredito ? '- CRÉDITO' : ''}</p>
              <p>COMP: <span className="font-bold">{turnoActivo?.idTurno ? `T-${String(turnoActivo.idTurno).padStart(5, '0')}` : '---'}</span></p>
              <p>FECHA: {ticketImprimir.fecha}</p>
              <p>CAJERO: {ticketImprimir.cajero.toUpperCase()}</p>
              <p>CLIENTE: {ticketImprimir.cliente.toUpperCase()}</p>
            </div>

            <div className="ticket-divider"></div>

            <table className="w-full text-left text-xs mb-2 border-collapse">
              <thead>
                <tr className="border-b border-dashed border-black">
                  <th className="pb-1 w-8">CANT</th>
                  <th className="pb-1">DESCRIPCIÓN</th>
                  <th className="pb-1 text-right">IMP.</th>
                </tr>
              </thead>
              <tbody>
                {ticketImprimir.items.map((item) => (
                  <tr key={item.idProducto}>
                    <td className="align-top py-1 font-bold">{item.cantidad}</td>
                    <td className="align-top py-1 pr-1">{item.nombre}</td>
                    <td className="align-top py-1 text-right">S/{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ticket-divider"></div>

            <div className="flex justify-between font-extrabold text-sm mb-1">
              <span>TOTAL A PAGAR:</span>
              <span>S/ {ticketImprimir.total.toFixed(2)}</span>
            </div>

            <div className="text-xs text-right mt-2 space-y-1">
              {ticketImprimir.pagos.efectivo > 0 && <p>EFECTIVO: S/ {ticketImprimir.pagos.efectivo.toFixed(2)}</p>}
              {ticketImprimir.pagos.yape > 0 && <p>YAPE: S/ {ticketImprimir.pagos.yape.toFixed(2)}</p>}
              {ticketImprimir.pagos.plin > 0 && <p>PLIN: S/ {ticketImprimir.pagos.plin.toFixed(2)}</p>}
              {ticketImprimir.pagos.tarjeta > 0 && <p>TARJETA: S/ {ticketImprimir.pagos.tarjeta.toFixed(2)}</p>}
              {ticketImprimir.pagos.vuelto > 0 && <p className="font-bold mt-1">VUELTO: S/ {ticketImprimir.pagos.vuelto.toFixed(2)}</p>}
            </div>

            <div className="ticket-divider mt-4"></div>

            <div className="text-center mt-3">
              <p className="text-[11px] font-bold">¡GRACIAS POR SU COMPRA!</p>
              <p className="text-[10px] mt-1">Conserve su ticket</p>
            </div>
          </div>
        )}
      </div>

      {cajaBloqueada && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.85)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center modal-enter shadow-[var(--classic-shadow-lg)]">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.05), inset -2px -2px 5px rgba(255,255,255,.8)' }}><Lock className="text-blue-600 w-10 h-10 drop-shadow-sm" /></div>
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Hola, {usuarioActual?.nombreCompleto?.split(' ')[0] || 'Cajero'}</h2>
            <p className="text-slate-500 mb-8 font-medium">Apertura tu turno para registrar ventas.</p>
            <form onSubmit={handleAbrirCaja}>
              <div className="text-left mb-6">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Sencillo Inicial de Caja (S/)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">S/</span>
                  <input type="number" step="0.10" min="0" required autoFocus value={montoApertura} onChange={(e) => setMontoApertura(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-xl text-xl font-bold text-slate-800 outline-none" placeholder="0.00" style={{ background: '#f0f2f5', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.08)' }} />
                </div>
              </div>
              <button type="submit" className="w-full text-white font-extrabold py-4 rounded-xl text-lg border-none cursor-pointer flex justify-center items-center gap-2 transition-all" style={{ background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)'}><Unlock size={20} /> Iniciar Turno</button>
            </form>
          </div>
        </div>
      )}

      {mostrarModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,.8)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md modal-enter shadow-[var(--classic-shadow-lg)]">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 border-b border-slate-100 pb-4">Cierre de Turno</h2>
            <div className="rounded-xl p-5 mb-6 bg-slate-50" style={{ boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.05)' }}>
              <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold text-slate-500">Monto Base (Inicio):</span><span className="text-sm font-bold text-slate-800">S/ {turnoActivo?.montoInicial?.toFixed(2)}</span></div>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200"><span className="text-sm font-bold text-slate-500">Ventas Totales:</span><span className="text-sm font-bold text-emerald-600">+ S/ {turnoActivo?.totalVentas?.toFixed(2) || '0.00'}</span></div>
              <div className="flex justify-between items-center"><span className="text-base font-extrabold text-slate-800">Total Esperado:</span><span className="text-xl font-extrabold text-blue-600">S/ {((turnoActivo?.montoInicial || 0) + (turnoActivo?.totalVentas || 0)).toFixed(2)}</span></div>
            </div>
            <form onSubmit={handleCerrarCaja}>
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-2">Efectivo Físico en Caja (Cuadre)</label>
                <input type="number" step="0.10" min="0" required value={montoCierreDeclarado} onChange={(e) => setMontoCierreDeclarado(e.target.value)} className="w-full px-4 py-3 rounded-xl text-lg font-bold outline-none" placeholder="S/ 0.00" style={{ background: '#f0f2f5', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.08)' }} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setMostrarModalCierre(false)} className="flex-1 py-3 text-slate-600 font-bold rounded-xl cursor-pointer border-none transition-all" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cancelar</button>
                <button type="submit" className="flex-1 py-3 text-white font-bold rounded-xl cursor-pointer border-none transition-all" style={{ background: '#dc2626', boxShadow: '4px 4px 8px rgba(220,38,38,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(220,38,38,.2), -2px -2px 4px rgba(255,255,255,.6)'}>Confirmar Cierre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={`flex flex-col lg:flex-row h-full min-h-screen font-sans print:hidden transition-all duration-500 ${cajaBloqueada ? 'blur-sm pointer-events-none opacity-50' : ''}`} style={{ background: 'var(--bg-page)' }}>
        <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
          <h1 className="text-base lg:text-lg font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-2"><ShoppingCart className="text-blue-600 drop-shadow-sm" size={22} /> PUNTO DE VENTA</h1>
          {!cajaBloqueada && turnoActivo && (
            <button onClick={() => setMostrarModalCierre(true)} className="flex items-center gap-2 px-4 lg:px-5 py-2 rounded-xl text-sm font-extrabold border-none cursor-pointer transition-all duration-200" style={{ background: '#fef2f2', color: '#dc2626', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
              <Lock size={16} /> Cerrar Turno
            </button>
          )}
        </header>

        {/* En móvil apila verticalmente; en lg, lado a lado */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-4 lg:gap-6 h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex-1 flex flex-col bg-white rounded-2xl p-4 lg:p-6 shadow-[var(--neu-shadow-card)] border border-white/50 overflow-hidden">
            <form onSubmit={handleBusquedaProducto} className="mb-4 lg:mb-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input ref={lectorRef} type="text" list="productos-sugeridos" placeholder="Buscar código o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} disabled={cajaBloqueada} className="pl-12 pr-4 py-3 rounded-xl text-lg font-medium text-slate-700 outline-none w-full" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} />
                <datalist id="productos-sugeridos">
                  {productosBase.filter(p => p.estado).map((prod) => (<option key={prod.idProducto} value={prod.nombre}>{prod.codigoBarras ? `SKU: ${prod.codigoBarras}` : 'S/N'} - Stock: {prod.stock}</option>))}
                </datalist>
              </div>
              <button type="submit" disabled={cajaBloqueada} className="text-white px-5 lg:px-6 py-3 rounded-xl text-sm font-extrabold border-none cursor-pointer transition-all flex items-center justify-center" style={{ background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => !cajaBloqueada && (e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)')} onMouseLeave={(e) => !cajaBloqueada && (e.currentTarget.style.boxShadow = '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)')}>Agregar</button>
            </form>
            <div className="flex-1 overflow-y-auto rounded-xl" style={{ boxShadow: 'inset 2px 2px 6px rgba(0,0,0,.04)' }}>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200 sticky top-0">
                  <tr><th className="px-3 lg:px-4 py-3">Producto</th><th className="px-3 lg:px-4 py-3 text-center">Precio</th><th className="px-3 lg:px-4 py-3 text-center">Cant.</th><th className="px-3 lg:px-4 py-3 text-right">Subtotal</th><th className="px-3 lg:px-4 py-3 text-center">Acción</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {carrito.length > 0 ? carrito.map((item, idx) => (
                    <tr key={item.idProducto} className="row-enter transition-all duration-200 hover:bg-slate-50/80" style={{ animationDelay: `${idx * 40}ms` }}>
                      <td className="px-3 lg:px-4 py-3 font-medium text-slate-700 text-sm">{item.nombre}</td>
                      <td className="px-3 lg:px-4 py-3 text-center text-slate-600 text-sm">S/{item.precioVenta.toFixed(2)}</td>
                      <td className="px-3 lg:px-4 py-3 text-center text-slate-800 font-bold">{item.cantidad}</td>
                      <td className="px-3 lg:px-4 py-3 text-right font-bold text-slate-700">S/{item.subtotal.toFixed(2)}</td>
                      <td className="px-3 lg:px-4 py-3 text-center"><button type="button" onClick={() => eliminarDelCarrito(item.idProducto)} className="icon-btn text-red-500 bg-red-50 hover:bg-red-100 border-none cursor-pointer" title="Eliminar"><Trash2 size={18} /></button></td>
                    </tr>
                  )) : (<tr><td colSpan="5" className="px-4 py-20 text-center text-slate-400 font-medium">Esperando productos...</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panel de pagos — en móvil full width; en lg ancho fijo */}
          <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col gap-4 overflow-y-auto pr-1 shrink-0">
            <div className="bg-white rounded-2xl p-4 lg:p-5 shadow-[var(--neu-shadow-card)] border border-white/50">

              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-500" /> Comprobante y Cliente</h3>

              <div className="flex items-center justify-between p-2.5 rounded-xl mb-3 bg-slate-50" style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,.04)' }}>
                <span className="text-xs font-bold text-slate-700">Venta a Crédito (Fiado)</span>
                <button type="button" onClick={() => setEsCredito(!esCredito)} className="bg-transparent border-none cursor-pointer toggle-pill rounded-full p-1">
                  {esCredito ? <ToggleRight size={38} className="text-amber-500" /> : <ToggleLeft size={38} className="text-slate-400" />}
                </button>
              </div>

              <div className="space-y-3 mb-4 border-b border-slate-100 pb-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Cliente Asociado</label>
                  <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)} className="w-full rounded-xl p-2.5 text-xs font-medium outline-none neo-select">
                    <option value="">-- Cliente General --</option>
                    {clientesLista.map(c => <option key={c.idCliente} value={c.idCliente}>{c.nombres} {c.apellidos} - {c.dni}</option>)}
                  </select>
                </div>

                {esCredito && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 mt-2">Días de Plazo para el pago</label>
                    <input type="number" min="1" value={diasPlazo} onChange={(e) => setDiasPlazo(e.target.value)} className="w-full rounded-xl p-2.5 text-xs font-medium outline-none" style={{ background: '#fffbeb', boxShadow: 'inset 1px 1px 3px rgba(245,158,11,.1)' }} />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl mb-3 bg-slate-50" style={{ boxShadow: 'inset 1px 1px 3px rgba(0,0,0,.04)' }}>
                <span className="text-xs font-bold text-slate-700">Enviar a SUNAT</span>
                <button type="button" onClick={() => setSunatActivo(!sunatActivo)} className="bg-transparent border-none cursor-pointer toggle-pill rounded-full p-1">
                  {sunatActivo ? <ToggleRight size={38} className="text-emerald-500" /> : <ToggleLeft size={38} className="text-slate-400" />}
                </button>
              </div>

              {sunatActivo && (
                <div className="space-y-3 mb-4 border-b border-slate-100 pb-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTipoComprobante('BOLETA')} className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`} style={tipoComprobante === 'BOLETA' ? { boxShadow: 'inset 1px 1px 3px rgba(37,99,235,.1)' } : {}}>BOLETA</button>
                    <button type="button" onClick={() => setTipoComprobante('FACTURA')} className={`flex-1 py-2 text-xs font-black rounded-xl border transition-all ${tipoComprobante === 'FACTURA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`} style={tipoComprobante === 'FACTURA' ? { boxShadow: 'inset 1px 1px 3px rgba(37,99,235,.1)' } : {}}>FACTURA</button>
                  </div>
                  <input type="text" placeholder={tipoComprobante === 'BOLETA' ? "DNI (8 dígitos)" : "RUC (11 dígitos)"} value={documentoCliente} onChange={(e) => setDocumentoCliente(e.target.value)} className="px-3 py-2 rounded-xl text-xs w-full font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} />
                </div>
              )}

              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mt-4 mb-3 border-t border-slate-100 pt-3 flex items-center gap-2"><Banknote size={15} className="text-emerald-500" /> Pagos</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100"><label className="text-[10px] font-black text-emerald-600 flex items-center gap-1 mb-1"><Banknote size={12} /> Efectivo (S/)</label><input type="number" min="0" value={pagoEfectivo} onChange={(e) => setPagoEfectivo(e.target.value)} className="w-full bg-white rounded-lg px-2 py-1 text-sm font-semibold outline-none" style={{ boxShadow: 'inset 1px 1px 3px rgba(16,185,129,.1)' }} /></div>
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100"><label className="text-[10px] font-black text-purple-600 flex items-center gap-1 mb-1"><Smartphone size={12} /> Yape (S/)</label><input type="number" min="0" value={pagoYape} onChange={(e) => setPagoYape(e.target.value)} className="w-full bg-white rounded-lg px-2 py-1 text-sm font-semibold outline-none text-purple-800" style={{ boxShadow: 'inset 1px 1px 3px rgba(168,85,247,.1)' }} /></div>
                <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-100"><label className="text-[10px] font-black text-cyan-600 flex items-center gap-1 mb-1"><Smartphone size={12} /> Plin (S/)</label><input type="number" min="0" value={pagoPlin} onChange={(e) => setPagoPlin(e.target.value)} className="w-full bg-white rounded-lg px-2 py-1 text-sm font-semibold outline-none text-cyan-800" style={{ boxShadow: 'inset 1px 1px 3px rgba(6,182,212,.1)' }} /></div>
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100"><label className="text-[10px] font-black text-blue-600 flex items-center gap-1 mb-1"><CreditCard size={12} /> Tarjeta (S/)</label><input type="number" min="0" value={pagoTarjeta} onChange={(e) => setPagoTarjeta(e.target.value)} className="w-full bg-white rounded-lg px-2 py-1 text-sm font-semibold outline-none" style={{ boxShadow: 'inset 1px 1px 3px rgba(37,99,235,.1)' }} /></div>
              </div>

              {total > 0 && <div className={`mt-4 p-2.5 rounded-xl text-center text-xs font-black border ${saldoRestante > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>{renderMensajeSaldo()}</div>}
            </div>

            <div className="text-white rounded-2xl p-5 shadow-[var(--classic-shadow)]" style={{ background: 'linear-gradient(160deg,#1e293b,#0f172a)', border: '1px solid rgba(255,255,255,.05)' }}>
              <div className="flex justify-between text-xs text-slate-400 mb-2"><span>Subtotal</span><span>S/ {(total / 1.18).toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-3"><span>IGV (18%)</span><span>S/ {(total - (total / 1.18)).toFixed(2)}</span></div>
              <div className="flex justify-between items-baseline mb-4 mt-4"><span className="text-sm font-bold text-slate-400">TOTAL:</span><span className="text-2xl lg:text-3xl font-extrabold text-blue-400" style={{ textShadow: '0 0 12px rgba(59,130,246,.4)' }}>S/ {total.toFixed(2)}</span></div>
              <button onClick={handleProcesarVenta} disabled={procesando || cajaBloqueada} className={`w-full text-white py-3.5 rounded-xl font-extrabold border-none cursor-pointer transition-all ${esCredito ? '' : ''}`} style={esCredito ? { background: '#d97706', boxShadow: '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)' } : { background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => !procesando && !cajaBloqueada && (e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)')} onMouseLeave={(e) => !procesando && !cajaBloqueada && (e.currentTarget.style.boxShadow = esCredito ? '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)' : '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)')}>
                {procesando ? 'Procesando...' : (esCredito ? 'Registrar Fiado' : (sunatActivo ? 'Emitir Comprobante' : 'Cobrar e Imprimir'))}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewSale;