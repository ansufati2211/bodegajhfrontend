import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedor.service';
import ProveedorModal from '../components/ProveedorModal';

// 1. IMPORTAMOS NUESTRAS LIBRERÍAS MODERNAS
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const data = await obtenerProveedores();
      setProveedores(data);
    } catch (err) {
      setError("Error al conectar con el servidor. Verifica que el backend esté ejecutándose.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  const proveedoresFiltrados = proveedores.filter(p => 
    (p.empresa?.toLowerCase().includes(busqueda.toLowerCase())) || 
    (p.nombreVendedor?.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const exportarExcel = () => {
    const dataExcel = proveedoresFiltrados.map(p => ({
      Empresa: p.empresa,
      'Contacto (Vendedor)': p.nombreVendedor,
      Teléfono: p.telefono,
      'Días de Visita': p.diasVisita || 'No especificado',
      Estado: p.estado ? 'ACTIVO' : 'INACTIVO'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    XLSX.writeFile(workbook, "Directorio_Proveedores.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Directorio de Proveedores - Sistema de Ventas", 14, 10);
    const tableData = proveedoresFiltrados.map(p => [
      p.empresa, p.nombreVendedor, p.telefono, p.diasVisita || '-'
    ]);
    doc.autoTable({ head: [['Empresa', 'Contacto', 'Teléfono', 'Días de Visita']], body: tableData, startY: 20 });
    doc.save("Directorio_Proveedores.pdf");
  };

  const handleOpenCrear = () => {
    setProveedorSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setIsModalOpen(true);
  };

  const handleSaveProveedor = async (datosProveedor) => {
    try {
      if (proveedorSeleccionado) {
        await actualizarProveedor(proveedorSeleccionado.idProveedor, datosProveedor);
        toast.success("¡Proveedor actualizado con éxito!");
      } else {
        await crearProveedor(datosProveedor);
        toast.success("¡Proveedor añadido con éxito!");
      }
      setIsModalOpen(false);
      fetchProveedores();
    } catch (err) {
      toast.error("Hubo un error al guardar los datos del proveedor.");
      console.error(err);
    }
  };

  // NUEVO: Función handleDesactivar (Borrado Lógico)
  const handleDesactivar = async (proveedor) => {
    const confirmacion = await Swal.fire({
      title: '¿Desactivar Proveedor?',
      text: "El proveedor pasará a estado INACTIVO. Sus productos registrados no se verán afectados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b', // Ámbar de Tailwind
      cancelButtonColor: '#94a3b8',  // Gris de Tailwind
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        // En lugar de llamar a eliminarProveedor, cambiamos su estado y lo actualizamos
        const proveedorDesactivado = { ...proveedor, estado: false };
        await actualizarProveedor(proveedor.idProveedor, proveedorDesactivado);
        
        fetchProveedores();
        toast.success("¡Proveedor desactivado con éxito!");
      } catch (err) {
        toast.error("Hubo un problema al desactivar el proveedor.");
        console.error(err);
      }
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Cargando directorio de proveedores...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          SISTEMA DE VENTAS E INVENTARIO - ADMIN
        </h1>
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por empresa o vendedor" 
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
          <h2 className="text-3xl font-extrabold text-slate-800">GESTIÓN DE PROVEEDORES</h2>
          <div className="flex gap-3">
            <button onClick={handleOpenCrear} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
              <Plus size={18} /> Añadir Proveedor
            </button>
            <button onClick={exportarExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
              <Download size={18} /> Excel
            </button>
            <button onClick={exportarPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
              <Download size={18} /> PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Directorio de Contactos</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Total: {proveedoresFiltrados.length} proveedores
            </span>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">Contacto (Vendedor)</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4 text-center">Días de Visita</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proveedoresFiltrados.length > 0 ? proveedoresFiltrados.map((p) => (
                <tr key={p.idProveedor} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{p.empresa}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{p.nombreVendedor}</td>
                  <td className="px-6 py-4 text-slate-600">{p.telefono}</td>
                  <td className="px-6 py-4 text-center text-slate-600 font-semibold">{p.diasVisita || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      p.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.estado ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-slate-400">
                      <button onClick={() => handleOpenEditar(p)} className="hover:text-amber-500 transition-colors bg-transparent border-none cursor-pointer" title="Editar Proveedor">
                        <Edit size={18} />
                      </button>
                      {/* NUEVO: Llamamos a handleDesactivar pasando todo el objeto 'p' */}
                      <button onClick={() => handleDesactivar(p)} className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer" title="Desactivar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="opacity-20 mb-3" />
                      <p>No se encontraron proveedores.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProveedorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProveedor}
        proveedorAEditar={proveedorSeleccionado}
      />
      
    </div>
  );
};

export default Proveedores;