import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../services/inventory.service';
import { obtenerProveedores } from '../services/proveedor.service';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [proveedoresLista, setProveedoresList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    codigoBarras: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0, idCategoria: 1, idProveedor: '', estado: true
  });

  const fetchInventory = async (isInitial = false) => {
    try {
      if (!isInitial) setLoading(true);
      const data = await obtenerProductos();
      setProducts(data);
    } catch (err) {
      console.error("Error al conectar con la base de datos:", err);
      setError("Error al conectar con el servidor de Spring Boot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(true);
    const cargarProveedores = async () => {
      try {
        const data = await obtenerProveedores();
        setProveedoresList(data.filter(p => p.estado === true));
      } catch (err) {
        console.error("Error al cargar la lista de proveedores", err);
      }
    };
    cargarProveedores();
  }, []);

  const productosFiltrados = products.filter(producto =>
    (producto.nombre?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (producto.codigoBarras?.includes(busqueda))
  );

  const exportarExcel = () => {
    const dataExcel = productosFiltrados.map(p => ({
      SKU: p.codigoBarras || 'N/A',
      Nombre: p.nombre,
      'Precio Compra': p.precioCompra || 0,
      'Precio Venta': p.precioVenta || 0,
      Stock: p.stock,
      Estado: p.stock > 10 ? 'EN STOCK' : 'BAJO STOCK'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, "Reporte_Inventario.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Inventario - BODEGA JH", 14, 10);
    const tableData = productosFiltrados.map(p => [p.codigoBarras || 'N/A', p.nombre, `S/ ${(p.precioVenta || 0).toFixed(2)}`, p.stock]);
    autoTable(doc, { head: [['SKU', 'Nombre', 'Precio Venta', 'Stock']], body: tableData, startY: 20 });
    doc.save("Reporte_Inventario.pdf");
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    try {
      await crearProducto(nuevoProducto);
      setMostrarModalCrear(false);
      setNuevoProducto({ codigoBarras: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0, idCategoria: 1, idProveedor: '', estado: true });
      await fetchInventory();
      toast.success("¡Producto añadido con éxito!");
    } catch (err) {
      const mensajeError = err.response?.data?.error || err.response?.data?.mensaje || "Verifica los datos del producto.";
      Swal.fire({
        icon: 'error',
        title: 'Operación rechazada',
        text: mensajeError,
        confirmButtonColor: '#3b82f6'
      });
      console.warn("⚠️ Validación del sistema:", mensajeError);
    }
  };

  const abrirModalVer = (producto) => { setProductoSeleccionado(producto); setMostrarModalVer(true); };
  const abrirModalEditar = (producto) => { setProductoSeleccionado({ ...producto }); setMostrarModalEditar(true); };

  const handleActualizarProducto = async (e) => {
    e.preventDefault();
    try {
      await actualizarProducto(productoSeleccionado.idProducto, productoSeleccionado);
      setMostrarModalEditar(false);
      await fetchInventory();
      toast.success("¡Producto actualizado con éxito!");
    } catch (err) {
      const mensajeError = err.response?.data?.error || err.response?.data?.mensaje || "Verifica los datos del producto.";
      Swal.fire({
        icon: 'error',
        title: 'Actualización rechazada',
        text: mensajeError,
        confirmButtonColor: '#3b82f6'
      });
      console.warn("⚠️ Validación del sistema:", mensajeError);
    }
  };
  const handleEliminarProducto = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?', text: "Se eliminará el producto del inventario.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#94a3b8', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    });
    if (confirmacion.isConfirmed) {
      try {
        await eliminarProducto(id);
        await fetchInventory();
        toast.success("¡Producto eliminado con éxito!");
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        toast.error("No se pudo eliminar por restricciones en la base de datos.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="animate-[spinPulse_1s_ease-in-out_infinite] rounded-full h-14 w-14 mx-auto mb-5"
          style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#93c5fd' }}></div>
        <p className="text-slate-500 font-semibold tracking-wide text-sm">Sincronizando base de datos...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
        <h1 className="text-base lg:text-lg font-extrabold text-slate-800 uppercase tracking-wide">
          SISTEMA DE VENTAS E INVENTARIO
        </h1>
      </header>
      <section className="p-4 lg:p-8 overflow-y-auto">
        {error && <div className="mb-6 p-4 rounded-xl border text-sm font-bold bg-red-50/80 border-red-100/60 text-red-700" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>{error}</div>}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6 gap-4">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800">INVENTARIO</h2>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <button onClick={() => setMostrarModalCrear(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-blue-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#eff6ff', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}><Plus size={18} /> Añadir</button>
            <button onClick={exportarExcel} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#ecfdf5', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}><Download size={18} /> Excel</button>
            <button onClick={exportarPDF} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#fef2f2', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}><Download size={18} /> PDF</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-[var(--neu-shadow-card)] border border-white/50">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" aria-label="Buscar productos" placeholder="Buscar por nombre o SKU..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="pl-11 pr-4 py-2.5 rounded-xl text-sm w-full font-medium text-slate-700 outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} />
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl whitespace-nowrap" style={{ boxShadow: 'var(--neu-shadow-input)' }}>Total: {productosFiltrados.length} ítems</span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200">
                <tr><th className="px-6 py-4">SKU</th><th className="px-6 py-4">Nombre</th><th className="px-6 py-4">Categoría</th><th className="px-6 py-4 text-right">Precio</th><th className="px-6 py-4 text-center">Stock</th><th className="px-6 py-4 text-center">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productosFiltrados.length > 0 ? productosFiltrados.map((p, idx) => (
                  <tr key={p.idProducto} className="row-enter transition-all duration-200 hover:bg-slate-50/80 hover:translate-x-1" style={{ animationDelay: `${idx * 35}ms` }}>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.codigoBarras || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.nombre}</td>
                    <td className="px-6 py-4 text-slate-500">{p.categoria?.nombre || 'General'}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">S/ {(p.precioVenta || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">{p.stock}</td>
                    <td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.stock > 10 ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/60' : 'bg-orange-50/80 text-orange-700 border border-orange-100/60'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>{p.stock > 10 ? 'EN STOCK' : 'BAJO STOCK'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 text-slate-400">
                        <button onClick={() => abrirModalVer(p)} className="icon-btn hover:text-blue-600 bg-transparent border-none cursor-pointer" title="Ver"><Eye size={18} /></button>
                        <button onClick={() => abrirModalEditar(p)} className="icon-btn hover:text-amber-600 bg-transparent border-none cursor-pointer" title="Editar"><Edit size={18} /></button>
                        <button onClick={() => handleEliminarProducto(p.idProducto)} className="icon-btn hover:text-red-600 bg-transparent border-none cursor-pointer" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (<tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400 font-medium">No se encontraron productos.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {mostrarModalCrear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter shadow-[var(--classic-shadow-lg)]">
            <h2 className="text-xl font-extrabold mb-4 text-slate-800">Añadir Nuevo Producto</h2>
            <form onSubmit={handleGuardarProducto}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="crear-nombre" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Nombre</label>
                  <input id="crear-nombre" type="text" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={nuevoProducto.nombre} onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="crear-sku" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Código de Barras (SKU)</label>
                  <input id="crear-sku" type="text" className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={nuevoProducto.codigoBarras} onChange={(e) => setNuevoProducto({ ...nuevoProducto, codigoBarras: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="crear-precioCompra" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Precio Compra (S/)</label>
                    <input id="crear-precioCompra" type="number" step="0.01" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={nuevoProducto.precioCompra} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioCompra: e.target.value ? Number.parseFloat(e.target.value) : '' })} />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="crear-precioVenta" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Precio Venta (S/)</label>
                    <input id="crear-precioVenta" type="number" step="0.01" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={nuevoProducto.precioVenta} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precioVenta: e.target.value ? Number.parseFloat(e.target.value) : '' })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="crear-stock" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Stock Inicial</label>
                  <input id="crear-stock" type="number" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={nuevoProducto.stock} onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value ? Number.parseInt(e.target.value, 10) : '' })} />
                </div>
                <div>
                  <label htmlFor="crear-proveedor" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Conectar a Proveedor</label>
                  <select
                    id="crear-proveedor"
                    required
                    className="w-full rounded-xl p-2.5 text-sm font-medium outline-none neo-select"
                    value={nuevoProducto.idProveedor}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, idProveedor: Number(e.target.value) })}
                  >
                    <option value="" disabled>-- Seleccione un Proveedor --</option>
                    {proveedoresLista.map((prov) => (
                      <option key={prov.idProveedor} value={prov.idProveedor}>{prov.empresa}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setMostrarModalCrear(false)} className="px-4 py-2.5 text-sm font-bold text-slate-600 rounded-xl border-none cursor-pointer transition-all" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cancelar</button>
                <button type="submit" className="px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer transition-all" style={{ background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)'}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalEditar && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-enter shadow-[var(--classic-shadow-lg)]">
            <h2 className="text-xl font-extrabold mb-4 text-slate-800 flex items-center gap-2"><Edit size={20} className="text-amber-500" /> Editar Producto</h2>
            <form onSubmit={handleActualizarProducto}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editar-nombre" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Nombre</label>
                  <input id="editar-nombre" type="text" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={productoSeleccionado.nombre} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, nombre: e.target.value })} />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="editar-precioCompra" className="block text-xs font-black mb-1.5 text-amber-600 uppercase tracking-wide">Precio Compra (S/)</label>
                    <input id="editar-precioCompra" type="number" step="0.01" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#fffbeb', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={productoSeleccionado.precioCompra || ''} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, precioCompra: e.target.value ? Number.parseFloat(e.target.value) : '' })} />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="editar-precioVenta" className="block text-xs font-black mb-1.5 text-blue-600 uppercase tracking-wide">Precio Venta (S/)</label>
                    <input id="editar-precioVenta" type="number" step="0.01" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#eff6ff', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={productoSeleccionado.precioVenta || ''} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, precioVenta: e.target.value ? Number.parseFloat(e.target.value) : '' })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="editar-stock" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Stock Actual</label>
                  <input id="editar-stock" type="number" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }} value={productoSeleccionado.stock} onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, stock: e.target.value ? Number.parseInt(e.target.value, 10) : '' })} />
                </div>
                <div>
                  <label htmlFor="editar-proveedor" className="block text-xs font-black mb-1.5 text-slate-500 uppercase tracking-wide">Actualizar Proveedor</label>
                  <select
                    id="editar-proveedor"
                    required
                    className="w-full rounded-xl p-2.5 text-sm font-medium outline-none neo-select"
                    value={productoSeleccionado.idProveedor || ''}
                    onChange={(e) => setProductoSeleccionado({ ...productoSeleccionado, idProveedor: Number(e.target.value) })}
                  >
                    <option value="" disabled>-- Seleccione un Proveedor --</option>
                    {proveedoresLista.map((prov) => (
                      <option key={prov.idProveedor} value={prov.idProveedor}>{prov.empresa}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setMostrarModalEditar(false)} className="px-4 py-2.5 text-sm font-bold text-slate-600 rounded-xl border-none cursor-pointer transition-all" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cancelar</button>
                <button type="submit" className="px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer transition-all" style={{ background: '#d97706', boxShadow: '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)'}>Actualizar Datos</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalVer && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm modal-enter shadow-[var(--classic-shadow-lg)]">
            <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-extrabold text-slate-800">Ficha de Producto</h2></div>
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm" style={{ boxShadow: 'var(--neu-shadow-input)' }}>
              <p><strong className="text-slate-500 uppercase text-[11px] font-black block tracking-wide">Nombre:</strong> <span className="font-bold text-slate-800">{productoSeleccionado.nombre}</span></p>
              <p><strong className="text-slate-500 uppercase text-[11px] font-black block tracking-wide">SKU:</strong> <span className="font-bold text-slate-800">{productoSeleccionado.codigoBarras || 'N/A'}</span></p>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <p><strong className="text-slate-500 uppercase text-[11px] font-black block tracking-wide">Compra:</strong> S/ {productoSeleccionado.precioCompra?.toFixed(2) || '0.00'}</p>
                <p className="text-right"><strong className="text-blue-500 uppercase text-[11px] font-black block tracking-wide">Venta:</strong> <span className="font-bold text-blue-700 text-lg">S/ {productoSeleccionado.precioVenta?.toFixed(2) || '0.00'}</span></p>
              </div>
              <p className="border-t border-slate-200 pt-2 mt-2"><strong className="text-slate-500 uppercase text-[11px] font-black block tracking-wide">Stock en Almacén:</strong> <span className="font-black text-slate-700">{productoSeleccionado.stock} unidades</span></p>
            </div>
            <div className="mt-6"><button onClick={() => setMostrarModalVer(false)} className="w-full py-2.5 text-white rounded-xl font-bold border-none cursor-pointer transition-all" style={{ background: '#334155', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cerrar Ficha</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;