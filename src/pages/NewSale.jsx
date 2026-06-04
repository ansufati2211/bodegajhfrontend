import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, ShoppingCart, ToggleLeft, ToggleRight, User, FileText } from 'lucide-react';
import { obtenerProductos } from '../services/inventory.service.js';
import { registrarVenta } from '../services/sales.service.js'; // El nuevo servicio

const NewSale = () => {
  const [productosBase, setProductosBase] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState(''); 
  const [sunatActivo, setSunatActivo] = useState(false);
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');

  const lectorRef = useRef(null);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductosBase(data);
      } catch (error) {
        console.error("Error al cargar productos para la venta:", error);
      }
    };
    cargarProductos();
    
    if (lectorRef.current) lectorRef.current.focus();
  }, []);

  const handleBusquedaProducto = (e) => {
    e.preventDefault();
    const valorTermino = busqueda.trim();
    if (!valorTermino) return;

    const terminoMinuscula = valorTermino.toLowerCase();

    let productoEncontrado = productosBase.find(
      p => p.codigoBarras === valorTermino && p.estado === true
    );

    if (!productoEncontrado) {
      productoEncontrado = productosBase.find(
        p => p.nombre.toLowerCase() === terminoMinuscula && p.estado === true
      );
    }

    if (!productoEncontrado) {
      productoEncontrado = productosBase.find(
        p => p.nombre.toLowerCase().includes(terminoMinuscula) && p.estado === true
      );
    }

    if (productoEncontrado) {
      agregarAlCarrito(productoEncontrado);
    } else {
      alert("Producto no encontrado o sin stock disponible.");
    }

    setBusqueda('');
    lectorRef.current.focus();
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(item => item.idProducto === producto.idProducto);
      
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert(`Stock máximo alcanzado para ${producto.nombre}`);
          return carritoActual;
        }
        return carritoActual.map(item => 
          item.idProducto === producto.idProducto 
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioVenta }
            : item
        );
      }

      return [...carritoActual, {
        idProducto: producto.idProducto,
        codigoBarras: producto.codigoBarras,
        nombre: producto.nombre,
        precioVenta: producto.precioVenta,
        cantidad: 1,
        subtotal: producto.precioVenta,
        stockMax: producto.stock
      }];
    });
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.idProducto !== id));
  };

  const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  // ESTA ES LA ÚNICA FUNCIÓN DE PROCESAR VENTA AHORA
  const handleProcesarVenta = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío");
    
    const datosVenta = {
      documentoCliente: documentoCliente || 'CLIENTE GENÉRICO',
      tipoComprobante: sunatActivo ? tipoComprobante : 'TICKET_INTERNO',
      total: total,
      enviarSunat: sunatActivo,
      detalles: carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        precioUnitario: item.precioVenta
      }))
    };

    try {
      await registrarVenta(datosVenta);
      alert(`¡Venta registrada con éxito en el sistema! ${sunatActivo ? `Comprobante electrónico enviado a SUNAT.` : 'Ticket generado.'}`);
      
      setCarrito([]);
      setDocumentoCliente('');
      if (lectorRef.current) lectorRef.current.focus();
    } catch (error) {
      alert("No se pudo registrar la venta. Verifica la conexión con el servidor backend.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 font-sans">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <ShoppingCart className="text-blue-600" size={22} /> NUEVA VENTA (PUNTO DE VENTA)
        </h1>
      </header>

      <div className="flex-1 flex p-6 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
          <form onSubmit={handleBusquedaProducto} className="mb-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                ref={lectorRef}
                type="text" 
                list="productos-sugeridos" 
                placeholder="Escanee código de barras o escriba el nombre..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
              />
              <datalist id="productos-sugeridos">
                {productosBase.filter(p => p.estado === true).map((prod) => (
                  <option key={prod.idProducto} value={prod.nombre}>
                    {prod.codigoBarras ? `SKU: ${prod.codigoBarras}` : 'Sin SKU'} - Stock: {prod.stock}
                  </option>
                ))}
              </datalist>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              Agregar
            </button>
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
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <p>{item.nombre}</p>
                      <span className="text-xs text-slate-400 font-mono">{item.codigoBarras || 'S/N'}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">${item.precioVenta.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center text-slate-800 font-semibold">{item.cantidad}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-700">${item.subtotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => eliminarDelCarrito(item.idProducto)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-20 text-center text-slate-400">
                      <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                      Esperando lectura o ingreso de productos...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-96 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={16} /> Facturación Electrónica
            </h3>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <span className="text-sm font-semibold text-slate-700">Conexión SUNAT</span>
              <button 
                type="button"
                onClick={() => setSunatActivo(!sunatActivo)} 
                className="focus:outline-none transition-colors"
              >
                {sunatActivo ? <ToggleRight size={44} className="text-green-500" /> : <ToggleLeft size={44} className="text-slate-400" />}
              </button>
            </div>

            {sunatActivo ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Comprobante</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setTipoComprobante('BOLETA')}
                      className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      BOLETA (DNI)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setTipoComprobante('FACTURA')}
                      className={`flex-1 py-2 text-xs font-bold rounded border ${tipoComprobante === 'FACTURA' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
                    >
                      FACTURA (RUC)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    {tipoComprobante === 'BOLETA' ? 'DNI del Cliente' : 'RUC de la Empresa'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder={tipoComprobante === 'BOLETA' ? 'Ej. 74589632' : 'Ej. 20123456789'}
                      value={documentoCliente}
                      onChange={(e) => setDocumentoCliente(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center">
                Modo: Ticket de control interno (Desconectado de SUNAT).
              </p>
            )}
          </div>

          <div className="bg-slate-900 text-white rounded-xl shadow-xl p-6 flex flex-col flex-1 justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Resumen de Cobro</h3>
              <div className="space-y-3 border-b border-slate-800 pb-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>${(total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>IGV (18%)</span>
                  <span>${(total - (total / 1.18)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-lg font-bold text-slate-400">TOTAL:</span>
                <span className="text-4xl font-extrabold text-blue-400">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleProcesarVenta}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-center py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-lg"
              >
                {sunatActivo ? 'Emitir Comprobante' : 'Imprimir Ticket'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSale;