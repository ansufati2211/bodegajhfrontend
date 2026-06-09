import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, ShoppingCart, ToggleLeft, ToggleRight, User, FileText } from 'lucide-react';
import { obtenerProductos } from '../services/inventory.service.js';
import { registrarVenta } from '../services/sales.service.js';

const NewSale = () => {
  const [productosBase, setProductosBase] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sunatActivo, setSunatActivo] = useState(false);
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  
  // NUEVO: Estado para guardar el ticket que se va a imprimir
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

  // LA FUNCIÓN ACTUALIZADA CON IMPRESIÓN
  const handleProcesarVenta = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    
    const datosVenta = {
      documentoCliente: documentoCliente || 'CLIENTE GENÉRICO',
      tipoComprobante: sunatActivo ? tipoComprobante : 'TICKET', // Ajustado a TICKET
      total: total,
      enviarSunat: sunatActivo,
      detalles: carrito.map(item => ({ idProducto: item.idProducto, cantidad: item.cantidad, precioUnitario: item.precioVenta }))
    };

    try {
      await registrarVenta(datosVenta);
      
      // 1. Guardamos los datos para el ticket en pantalla
      setTicketImprimir({
        tipo: sunatActivo ? tipoComprobante : 'TICKET DE VENTA',
        cliente: documentoCliente || 'Público General',
        fecha: new Date().toLocaleString(),
        items: [...carrito],
        total: total
      });

      // 2. Limpiamos la pantalla
      setCarrito([]);
      setDocumentoCliente('');
      
      // 3. Activamos la ventana de impresión del navegador
      setTimeout(() => {
        window.print();
      }, 500); // Medio segundo para que React dibuje el ticket antes de imprimir

    } catch (error) {
      alert("No se pudo registrar la venta.");
    }
  };

  return (
    <>
      {/* ESTILOS MÁGICOS DE IMPRESIÓN 
        Ocultan todo el sistema y solo muestran el ticket cuando presionas Imprimir
      */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #zona-impresion, #zona-impresion * { visibility: visible; }
            #zona-impresion { 
              position: absolute; 
              left: 0; top: 0; 
              width: 80mm; 
              padding: 10px;
              font-family: monospace;
              color: black;
            }
          }
        `}
      </style>

      {/* TICKET DE IMPRESIÓN (Solo visible en el papel) */}
      <div id="zona-impresion" className="hidden print:block bg-white text-xs">
        {ticketImprimir && (
          <div className="w-full">
            <h2 className="text-center font-bold text-lg mb-1">SISTEMA SQMIN</h2>
            <p className="text-center mb-1">RUC: 20123456789</p>
            <p className="text-center mb-4">Av. Principal 123, Ciudad</p>
            
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
                {ticketImprimir.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="align-top py-1">{item.cantidad}</td>
                    <td className="align-top py-1 pr-1">{item.nombre}</td>
                    <td className="align-top py-1 text-right">S/{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between font-bold text-sm border-t border-black border-dashed pt-2">
              <span>TOTAL A PAGAR:</span>
              <span>S/ {ticketImprimir.total.toFixed(2)}</span>
            </div>
            
            <p className="text-center mt-6 text-[10px]">¡Gracias por su compra!</p>
            <p className="text-center text-[10px]">Conserve este ticket para devoluciones.</p>
          </div>
        )}
      </div>

      {/* --- EL RESTO DE TU PANTALLA POS INTACTA (Oculta al imprimir) --- */}
      <div className="flex flex-col h-full bg-slate-100 font-sans print:hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={22} /> NUEVA VENTA
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
                        <button onClick={() => eliminarDelCarrito(item.idProducto)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-4 py-20 text-center text-slate-400">Esperando productos...</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-96 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><FileText size={16} /> Facturación</h3>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                <span className="text-sm font-semibold text-slate-700">Conexión SUNAT</span>
                <button type="button" onClick={() => setSunatActivo(!sunatActivo)} className="focus:outline-none transition-colors">
                  {sunatActivo ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-slate-400" />}
                </button>
              </div>
              {sunatActivo ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Comprobante</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setTipoComprobante('BOLETA')} className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>BOLETA</button>
                      <button type="button" onClick={() => setTipoComprobante('FACTURA')} className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'FACTURA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>FACTURA</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Documento Cliente</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="text" placeholder="DNI o RUC" value={documentoCliente} onChange={(e) => setDocumentoCliente(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full outline-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic text-center">Ticket de control interno.</p>
              )}
            </div>

            <div className="bg-slate-900 text-white rounded-xl shadow-xl p-6 flex flex-col flex-1 justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Resumen de Cobro</h3>
                <div className="space-y-3 border-b border-slate-800 pb-4">
                  <div className="flex justify-between text-sm text-slate-400"><span>Subtotal</span><span>S/ {(total / 1.18).toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-slate-400"><span>IGV (18%)</span><span>S/ {(total - (total / 1.18)).toFixed(2)}</span></div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-lg font-bold text-slate-400">TOTAL:</span>
                  <span className="text-4xl font-extrabold text-blue-400">S/ {total.toFixed(2)}</span>
                </div>
                <button onClick={handleProcesarVenta} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-4 rounded-xl font-bold text-lg">
                  Imprimir Ticket
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