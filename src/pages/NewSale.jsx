import React, { useState, useEffect, useRef } from 'react';
// Solución S1128: Se quitó User que no se usaba
import { Search, Trash2, ShoppingCart, ToggleLeft, ToggleRight, FileText, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { obtenerProductos } from '../services/inventory.service.js';
import { registrarVenta } from '../services/sales.service.js';

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

  useEffect(() => {
    const cargarProductos = async () => {
      const data = await obtenerProductos();
      setProductosBase(data);
    };
    cargarProductos();
    if (lectorRef.current) lectorRef.current.focus();
  }, []);

  const handleBusquedaProducto = (e) => {
    e.preventDefault();
    const valorTermino = busqueda.trim().toLowerCase();
    if (!valorTermino) return;

    let productoEncontrado = productosBase.find(p => p.codigoBarras === valorTermino && p.estado === true) || 
                             productosBase.find(p => p.nombre.toLowerCase() === valorTermino && p.estado === true) ||
                             productosBase.find(p => p.nombre.toLowerCase().includes(valorTermino) && p.estado === true);

    if (productoEncontrado) agregarAlCarrito(productoEncontrado);
    else alert("Producto no encontrado o sin stock.");

    setBusqueda('');
    lectorRef.current.focus();
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(item => item.idProducto === producto.idProducto);
      if (existe) {
        if (existe.cantidad >= producto.stock) { alert(`Stock máximo alcanzado`); return carritoActual; }
        return carritoActual.map(item => item.idProducto === producto.idProducto ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioVenta } : item);
      }
      return [...carritoActual, { idProducto: producto.idProducto, nombre: producto.nombre, precioVenta: producto.precioVenta, cantidad: 1, subtotal: producto.precioVenta, stockMax: producto.stock }];
    });
  };

  const eliminarDelCarrito = (id) => setCarrito(carrito.filter(item => item.idProducto !== id));
  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  // Solución S7773: Uso de Number.parseFloat
  const numEfectivo = Number.parseFloat(pagoEfectivo) || 0;
  const numYape = Number.parseFloat(pagoYape) || 0;
  const numPlin = Number.parseFloat(pagoPlin) || 0;
  const numTarjeta = Number.parseFloat(pagoTarjeta) || 0;
  const totalIngresado = numEfectivo + numYape + numPlin + numTarjeta;
  const saldoRestante = total - totalIngresado;

  const handleProcesarVenta = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    if (procesando) return;

    let finalEfectivo = numEfectivo;
    let finalYape = numYape;
    let finalPlin = numPlin;
    let finalTarjeta = numTarjeta;

    if (totalIngresado === 0) {
      finalEfectivo = total;
    } else if (Math.abs(saldoRestante) > 0.01 && saldoRestante > 0) {
      return alert(`Monto incompleto. Falta cubrir S/ ${saldoRestante.toFixed(2)} del total.`);
    }

    const datosVenta = {
      documentoCliente: documentoCliente || 'CLIENTE GENÉRICO',
      tipoComprobante: sunatActivo ? tipoComprobante : 'TICKET',
      total: total,
      enviarSunat: sunatActivo,
      pagoEfectivo: finalEfectivo,
      pagoYape: finalYape,
      pagoPlin: finalPlin,
      pagoTarjeta: finalTarjeta,
      detalles: carrito.map(item => ({ idProducto: item.idProducto, cantidad: item.cantidad, precioUnitario: item.precioVenta }))
    };

    try {
      setProcesando(true);
      await registrarVenta(datosVenta);
      
      setTicketImprimir({
        tipo: sunatActivo ? tipoComprobante : 'TICKET DE VENTA',
        cliente: documentoCliente || 'Público General',
        fecha: new Date().toLocaleString(),
        items: [...carrito],
        total: total,
        pagos: {
          efectivo: finalEfectivo,
          yape: finalYape,
          plin: finalPlin,
          tarjeta: finalTarjeta,
          vuelto: saldoRestante < 0 ? Math.abs(saldoRestante) : 0
        }
      });

      setCarrito([]);
      setDocumentoCliente('');
      setPagoEfectivo('');
      setPagoYape('');
      setPagoPlin('');
      setPagoTarjeta('');
      
      setTimeout(() => {
        // Solución S7764: Usar globalThis.print
        globalThis.print();
      }, 500);

    } catch (error) {
      // Solución S2486 y no-unused-vars: Manejo del error
      console.error("Error al procesar la venta:", error);
      alert("No se pudo registrar la venta.");
    } finally {
      setProcesando(false);
    }
  };

  // Solución S3358: Extracción de ternarios anidados a funciones
  const renderMensajeSaldo = () => {
    if (saldoRestante > 0) return <span>Falta cubrir: S/ {saldoRestante.toFixed(2)}</span>;
    if (saldoRestante < 0) return <span>Vuelto a entregar: S/ {Math.abs(saldoRestante).toFixed(2)}</span>;
    return <span>¡Monto exacto cubierto! S/ {totalIngresado.toFixed(2)}</span>;
  };

  const getTextoBotonVenta = () => {
    if (procesando) return 'Procesando Venta...';
    if (sunatActivo) return 'Emitir Comprobante';
    return 'Imprimir Ticket';
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #zona-impresion, #zona-impresion * { visibility: visible; }
            #zona-impresion { position: absolute; left: 0; top: 0; width: 80mm; padding: 10px; font-family: monospace; color: black; }
          }
        `}
      </style>

      {/* TICKET DE IMPRESIÓN */}
      <div id="zona-impresion" className="hidden print:block bg-white text-xs">
        {ticketImprimir && (
          <div className="w-full">
            <h2 className="text-center font-bold text-lg mb-1">BODEGA JH</h2>
            <p className="text-center mb-4">Av. Principal 123, Ica</p>
            
            <p className="font-bold border-b border-black border-dashed pb-2 mb-2">
              {ticketImprimir.tipo} <br />
              Fecha: {ticketImprimir.fecha} <br />
              Cliente: {ticketImprimir.cliente}
            </p>

            <table className="w-full text-left mb-2">
              <thead>
                <tr className="border-b border-black border-dashed">
                  <th>CANT</th>
                  <th>DESCRIPCIÓN</th>
                  <th className="text-right">IMPORTE</th>
                </tr>
              </thead>
              <tbody>
                {/* Solución S6479: Uso de item.idProducto como key en lugar del index del map */}
                {ticketImprimir.items.map((item) => (
                  <tr key={item.idProducto}>
                    <td className="align-top py-1">{item.cantidad}</td>
                    <td className="align-top py-1 pr-1">{item.nombre}</td>
                    <td className="align-top py-1 text-right">S/{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-bold text-sm border-t border-black border-dashed pt-2 mb-2">
              <span>TOTAL A PAGAR:</span>
              <span>S/ {ticketImprimir.total.toFixed(2)}</span>
            </div>

            <div className="text-[10px] border-b border-black border-dashed pb-2 mb-2">
              <p className="font-bold">Forma de Pago:</p>
              {ticketImprimir.pagos.efectivo > 0 && <div className="flex justify-between"><span>- Efectivo:</span><span>S/ {ticketImprimir.pagos.efectivo.toFixed(2)}</span></div>}
              {ticketImprimir.pagos.yape > 0 && <div className="flex justify-between"><span>- Yape:</span><span>S/ {ticketImprimir.pagos.yape.toFixed(2)}</span></div>}
              {ticketImprimir.pagos.plin > 0 && <div className="flex justify-between"><span>- Plin:</span><span>S/ {ticketImprimir.pagos.plin.toFixed(2)}</span></div>}
              {ticketImprimir.pagos.tarjeta > 0 && <div className="flex justify-between"><span>- Tarjeta:</span><span>S/ {ticketImprimir.pagos.tarjeta.toFixed(2)}</span></div>}
              {ticketImprimir.pagos.vuelto > 0 && <div className="flex justify-between font-bold mt-1"><span>Vuelto:</span><span>S/ {ticketImprimir.pagos.vuelto.toFixed(2)}</span></div>}
            </div>
            
            <p className="text-center mt-4 text-[10px]">¡Gracias por su compra!</p>
          </div>
        )}
      </div>

      <div className="flex flex-col h-full bg-slate-100 font-sans print:hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={22} /> PUNTO DE VENTA (SISTEMA DE VENTAS)
          </h1>
        </header>

        <div className="flex-1 flex p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden">
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
            <form onSubmit={handleBusquedaProducto} className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input ref={lectorRef} type="text" list="productos-sugeridos" placeholder="Escanee código de barras o escriba el nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium" />
                <datalist id="productos-sugeridos">
                  {productosBase.filter(p => p.estado === true).map((prod) => (
                    <option key={prod.idProducto} value={prod.nombre}>
                      {prod.codigoBarras ? `SKU: ${prod.codigoBarras}` : 'S/N'} - Stock: {prod.stock}
                    </option>
                  ))}
                </datalist>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Agregar</button>
            </form>

            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-center">Precio</th>
                    <th className="px-4 py-3 text-center">Cant.</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {carrito.length > 0 ? carrito.map((item) => (
                    <tr key={item.idProducto} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                      <td className="px-4 py-3 text-center text-slate-600">S/{item.precioVenta.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center text-slate-800 font-semibold">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-700">S/{item.subtotal.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <button type="button" onClick={() => eliminarDelCarrito(item.idProducto)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-4 py-20 text-center text-slate-400">Esperando productos...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-[420px] flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText size={16} /> Comprobante y Facturación
              </h3>
              
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 mb-3">
                <span className="text-xs font-semibold text-slate-700">Enviar a SUNAT</span>
                <button type="button" onClick={() => setSunatActivo(!sunatActivo)} className="focus:outline-none transition-colors border-none bg-transparent cursor-pointer">
                  {sunatActivo ? <ToggleRight size={38} className="text-green-500" /> : <ToggleLeft size={38} className="text-slate-400" />}
                </button>
              </div>

              {sunatActivo && (
                <div className="space-y-3 mb-4 border-b border-slate-100 pb-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setTipoComprobante('BOLETA')} className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>BOLETA</button>
                    <button type="button" onClick={() => setTipoComprobante('FACTURA')} className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'FACTURA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>FACTURA</button>
                  </div>
                  <div>
                    <label htmlFor="doc-cliente" className="sr-only">Documento del Cliente</label>
                    <input id="doc-cliente" type="text" placeholder={tipoComprobante === 'BOLETA' ? "DNI del Cliente (8 dígitos)" : "RUC de la Empresa (11 dígitos)"} value={documentoCliente} onChange={(e) => setDocumentoCliente(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-md text-xs w-full outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-3 border-t border-slate-100 pt-3 flex items-center gap-2">
                <Banknote size={15} /> Desglose de Pago Combinado
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 relative">
                  <label htmlFor="pago-efectivo" className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                    <Banknote size={12} className="text-green-600" /> Efectivo (S/)
                  </label>
                  <input id="pago-efectivo" type="number" min="0" placeholder="0.00" value={pagoEfectivo} onChange={(e) => setPagoEfectivo(e.target.value)} className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold outline-none text-slate-800" />
                </div>

                <div className="bg-purple-50 p-2 rounded-lg border border-purple-200 relative">
                  <label htmlFor="pago-yape" className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1 mb-1">
                    <Smartphone size={12} className="text-purple-600" /> Yape (S/)
                  </label>
                  <input id="pago-yape" type="number" min="0" placeholder="0.00" value={pagoYape} onChange={(e) => setPagoYape(e.target.value)} className="w-full bg-white border border-purple-300 rounded px-2 py-1 text-sm font-semibold outline-none text-purple-800" />
                </div>

                <div className="bg-cyan-50 p-2 rounded-lg border border-cyan-200 relative">
                  <label htmlFor="pago-plin" className="text-[10px] font-bold text-cyan-600 uppercase flex items-center gap-1 mb-1">
                    <Smartphone size={12} className="text-cyan-600" /> Plin (S/)
                  </label>
                  <input id="pago-plin" type="number" min="0" placeholder="0.00" value={pagoPlin} onChange={(e) => setPagoPlin(e.target.value)} className="w-full bg-white border border-cyan-300 rounded px-2 py-1 text-sm font-semibold outline-none text-cyan-800" />
                </div>

                <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 relative">
                  <label htmlFor="pago-tarjeta" className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1 mb-1">
                    <CreditCard size={12} className="text-blue-600" /> Tarjeta (S/)
                  </label>
                  <input id="pago-tarjeta" type="number" min="0" placeholder="0.00" value={pagoTarjeta} onChange={(e) => setPagoTarjeta(e.target.value)} className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm font-semibold outline-none text-slate-800" />
                </div>
              </div>

              {total > 0 && (
                <div className={`mt-4 p-2.5 rounded-lg text-center text-xs font-bold border ${saldoRestante > 0 ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'}`}>
                  {renderMensajeSaldo()}
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-white rounded-xl shadow-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Subtotal</span><span>S/ {(total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                  <span>IGV (18%)</span><span>S/ {(total - (total / 1.18)).toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-sm font-bold text-slate-400">TOTAL:</span>
                  <span className="text-3xl font-extrabold text-blue-400">S/ {total.toFixed(2)}</span>
                </div>
                <button 
                  type="button"
                  onClick={handleProcesarVenta} 
                  disabled={procesando}
                  className={`w-full text-white text-center py-3.5 rounded-xl font-bold text-base transition-all shadow-md border-none cursor-pointer ${procesando ? 'bg-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  {getTextoBotonVenta()}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default NewSale;