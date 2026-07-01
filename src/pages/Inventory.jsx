import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Eye, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from '../services/inventory.service';

// 1. IMPORTAMOS LAS LIBRERÍAS MODERNAS
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Inventory = () => {
  // --- 1. ESTADOS DE LA APLICACIÓN ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para los Modales
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [mostrarModalVer, setMostrarModalVer] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  
  // Estados para guardar los datos del producto
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [nuevoProducto, setNuevoProducto] = useState({
    codigoBarras: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0, idCategoria: 1, idProveedor: 1, estado: true
  });

  // --- 2. CARGA DE DATOS DESDE SPRING BOOT ---
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await obtenerProductos();
      setProducts(data);
    } catch (err) {
      setError("Error al conectar con el servidor de Spring Boot");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    fetchInventory(); 
  }, []);

  // --- 3. LÓGICA DEL BUSCADOR ---
  const productosFiltrados = products.filter(producto => 
    (producto.nombre?.toLowerCase().includes(busqueda.toLowerCase())) || 
    (producto.codigoBarras?.includes(busqueda))
  );

  // --- 4. LÓGICA DE EXPORTACIÓN ---
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
    doc.text("Reporte de Inventario - SQMIN", 14, 10);
    const tableData = productosFiltrados.map(p => [
      p.codigoBarras || 'N/A', p.nombre, `$${(p.precioVenta || 0).toFixed(2)}`, p.stock
    ]);
    doc.autoTable({ head: [['SKU', 'Nombre', 'Precio Venta', 'Stock']], body: tableData, startY: 20 });
    doc.save("Reporte_Inventario.pdf");
  };

  // --- 5. LÓGICA DE ACCIONES ---
  
  // Crear (MODIFICADO)
  const handleGuardarProducto = async (e) => {
    e.preventDefault(); 
    try {
      await crearProducto(nuevoProducto);
      setMostrarModalCrear(false); 
      setNuevoProducto({
        codigoBarras: '', nombre: '', precioCompra: 0, precioVenta: 0, stock: 0, idCategoria: 1, idProveedor: 1, estado: true
      });
      await fetchInventory(); 
      toast.success("¡Producto añadido con éxito!"); // Cambio aquí
    } catch (err) {
      toast.error("Hubo un error al guardar el producto."); // Cambio aquí
      console.error(err);
    }
  };

  const abrirModalVer = (producto) => {
    setProductoSeleccionado(producto);
    setMostrarModalVer(true);
  };

  const abrirModalEditar = (producto) => {
    setProductoSeleccionado({ ...producto }); 
    setMostrarModalEditar(true);
  };

  // Actualizar (MODIFICADO)
  const handleActualizarProducto = async (e) => {
    e.preventDefault();
    try {
      const id = productoSeleccionado.idProducto;
      await actualizarProducto(id, productoSeleccionado);
      setMostrarModalEditar(false);
      await fetchInventory(); 
      toast.success("¡Producto actualizado con éxito!"); // Cambio aquí
    } catch (err) {
      toast.error("Hubo un error al actualizar el producto."); // Cambio aquí
      console.error(err);
    }
  };

  // Eliminar (MODIFICADO CON SWEETALERT2)
  const handleEliminarProducto = async (id) => {
    const confirmacion = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer y el producto será eliminado del inventario.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await eliminarProducto(id);
        await fetchInventory(); 
        toast.success("¡Producto eliminado con éxito!");
      } catch (err) {
        toast.error("No se pudo eliminar el producto por seguridad de la base de datos.");
        console.error(err);
      }
    }
  };

  // --- 6. PANTALLA DE CARGA ---
  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Sincronizando con la base de datos...</p>
      </div>
    </div>
  );

  // --- 7. INTERFAZ GRÁFICA ---
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      
      {/* ... (El resto de tu código HTML/JSX queda exactamente igual) ... */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          SISTEMA DE VENTAS E INVENTARIO - ADMIN
        </h1>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar productos por nombre o SKU" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm w-80 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Gabriel Yllescas</p>
              <p className="text-xs text-slate-500">Administrador</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=Gabriel+Yllescas&background=0D8ABC&color=fff" className="w-10 h-10 rounded-full" alt="avatar" />
          </div>
        </div>
      </header>

      <section className="p-8">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800">GESTIÓN DE INVENTARIO</h2>
          <div className="flex gap-3">
            <button onClick={() => setMostrarModalCrear(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md">
              <Plus size={18} /> Añadir Producto
            </button>
            <button onClick={exportarExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md">
              <Download size={18} /> Excel
            </button>
            <button onClick={exportarPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md">
              <Download size={18} /> PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Lista de Productos</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
              Total: {productosFiltrados.length} ítems
            </span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Precio Venta</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productosFiltrados.length > 0 ? productosFiltrados.map((p) => (
                <tr key={p.idProducto} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{p.codigoBarras || 'N/A'}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{p.nombre}</td>
                  <td className="px-6 py-4 text-slate-500">{p.categoria?.nombre || 'General'}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700">
                    ${(p.precioVenta || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 font-semibold">{p.stock}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {p.stock > 10 ? 'EN STOCK' : 'BAJO STOCK'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-slate-400">
                      <button type="button" onClick={() => abrirModalVer(p)} className="hover:text-blue-600 border-none bg-transparent cursor-pointer" title="Ver Detalles">
                        <Eye size={18} />
                      </button>
                      <button type="button" onClick={() => abrirModalEditar(p)} className="hover:text-amber-600 border-none bg-transparent cursor-pointer" title="Editar Precio">
                        <Edit size={18} />
                      </button>
                      <button type="button" onClick={() => handleEliminarProducto(p.idProducto)} className="hover:text-red-600 border-none bg-transparent cursor-pointer" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                    No se encontraron productos en la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- MODALES --- */}

      {/* Modal Crear */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Añadir Nuevo Producto</h2>
            <form onSubmit={handleGuardarProducto}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="crear-nombre" className="block text-sm font-medium mb-1 text-slate-700">Nombre del Producto</label>
                  <input id="crear-nombre" type="text" required className="w-full border border-slate-300 p-2 rounded"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="crear-sku" className="block text-sm font-medium mb-1 text-slate-700">Código de Barras (SKU)</label>
                  <input id="crear-sku" type="text" className="w-full border border-slate-300 p-2 rounded"
                    value={nuevoProducto.codigoBarras}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, codigoBarras: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="crear-precioCompra" className="block text-sm font-medium mb-1 text-slate-700">Precio Compra ($)</label>
                    <input id="crear-precioCompra" type="number" step="0.01" required className="w-full border border-slate-300 p-2 rounded"
                      value={nuevoProducto.precioCompra}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, precioCompra: e.target.value ? Number.parseFloat(e.target.value) : ''})} />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="crear-precioVenta" className="block text-sm font-medium mb-1 text-slate-700">Precio Venta ($)</label>
                    <input id="crear-precioVenta" type="number" step="0.01" required className="w-full border border-slate-300 p-2 rounded"
                      value={nuevoProducto.precioVenta}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, precioVenta: e.target.value ? Number.parseFloat(e.target.value) : ''})} />
                  </div>
                </div>
                <div>
                  <label htmlFor="crear-stock" className="block text-sm font-medium mb-1 text-slate-700">Stock Inicial</label>
                  <input id="crear-stock" type="number" required className="w-full border border-slate-300 p-2 rounded"
                    value={nuevoProducto.stock}
                    onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value ? Number.parseInt(e.target.value, 10) : ''})} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setMostrarModalCrear(false)} className="px-4 py-2 text-slate-600 border rounded hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {mostrarModalVer && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Detalles del Producto</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${productoSeleccionado.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {productoSeleccionado.stock > 10 ? 'ACTIVO' : 'ALERTA STOCK'}
              </span>
            </div>
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p><strong className="text-slate-600">Nombre:</strong> {productoSeleccionado.nombre}</p>
              <p><strong className="text-slate-600">SKU:</strong> {productoSeleccionado.codigoBarras || 'N/A'}</p>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <p><strong className="text-slate-600">Precio Compra:</strong> ${productoSeleccionado.precioCompra?.toFixed(2) || '0.00'}</p>
                <p className="text-blue-600"><strong className="text-slate-600">Precio Venta:</strong> ${productoSeleccionado.precioVenta?.toFixed(2) || '0.00'}</p>
              </div>
              <p className="border-t border-slate-200 pt-2 mt-2"><strong className="text-slate-600">Stock Actual:</strong> {productoSeleccionado.stock} unidades</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setMostrarModalVer(false)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {mostrarModalEditar && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Edit size={20}/> Editar Producto</h2>
            <form onSubmit={handleActualizarProducto}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="editar-nombre" className="block text-sm font-medium mb-1 text-slate-700">Nombre del Producto</label>
                  <input id="editar-nombre" type="text" required className="w-full border border-slate-300 p-2 rounded bg-slate-50"
                    value={productoSeleccionado.nombre}
                    onChange={(e) => setProductoSeleccionado({...productoSeleccionado, nombre: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label htmlFor="editar-precioCompra" className="block text-sm font-medium mb-1 text-amber-700 font-bold">Precio Compra ($)</label>
                    <input id="editar-precioCompra" type="number" step="0.01" required className="w-full border border-amber-300 p-2 rounded focus:ring-amber-500"
                      value={productoSeleccionado.precioCompra || ''}
                      onChange={(e) => setProductoSeleccionado({...productoSeleccionado, precioCompra: e.target.value ? Number.parseFloat(e.target.value) : ''})} />
                  </div>
                  <div className="w-1/2">
                    <label htmlFor="editar-precioVenta" className="block text-sm font-medium mb-1 text-blue-700 font-bold">Precio Venta ($)</label>
                    <input id="editar-precioVenta" type="number" step="0.01" required className="w-full border border-blue-300 p-2 rounded focus:ring-blue-500"
                      value={productoSeleccionado.precioVenta || ''}
                      onChange={(e) => setProductoSeleccionado({...productoSeleccionado, precioVenta: e.target.value ? Number.parseFloat(e.target.value) : ''})} />
                  </div>
                </div>
                <div>
                  <label htmlFor="editar-stock" className="block text-sm font-medium mb-1 text-slate-700">Stock Actual</label>
                  <input id="editar-stock" type="number" required className="w-full border border-slate-300 p-2 rounded bg-slate-50"
                    value={productoSeleccionado.stock}
                   onChange={(e) => setProductoSeleccionado({...productoSeleccionado, stock: e.target.value ? Number.parseInt(e.target.value, 10) : ''})} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setMostrarModalEditar(false)} className="px-4 py-2 text-slate-600 border rounded hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 font-bold">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}        
    </div>
  );
};

export default Inventory;