import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedor.service';
import ProveedorModal from '../components/ProveedorModal';

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
    autoTable(doc, { head: [['Empresa', 'Contacto', 'Teléfono', 'Días de Visita']], body: tableData, startY: 20 });
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

  const handleDesactivar = async (proveedor) => {
    const confirmacion = await Swal.fire({
      title: '¿Desactivar Proveedor?',
      text: "El proveedor pasará a estado INACTIVO. Sus productos registrados no se verán afectados.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
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
    <div className="flex h-full items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="animate-[spinPulse_1s_ease-in-out_infinite] rounded-full h-14 w-14 mx-auto mb-5" style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#93c5fd' }}></div>
        <p className="text-slate-500 font-semibold tracking-wide text-sm">Cargando directorio de proveedores...</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <header className="h-20 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shrink-0" style={{ boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}>
        <h1 className="text-base lg:text-lg font-extrabold text-slate-800 uppercase tracking-wide">
          SISTEMA DE VENTAS E INVENTARIO - ADMIN
        </h1>
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por empresa o vendedor"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-11 pr-4 py-2.5 rounded-xl text-sm w-64 lg:w-80 font-medium text-slate-700 outline-none"
              style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
            />
          </div>
          <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Gabriel Yllescas</p>
              <p className="text-xs text-slate-500 font-medium">Administrador</p>
            </div>
            <img src="https://ui-avatars.com/api/?name=Gabriel+Yllescas&background=0D8ABC&color=fff" className="w-10 h-10 rounded-full" alt="avatar" style={{ boxShadow: 'var(--neu-shadow-card)' }} />
          </div>
        </div>
      </header>

      <section className="p-4 lg:p-8">
        {error && <div className="mb-6 p-4 rounded-xl border text-sm font-bold bg-red-50/80 border-red-100/60 text-red-700" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>{error}</div>}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800">GESTIÓN DE PROVEEDORES</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleOpenCrear} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#eff6ff', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
              <Plus size={18} /> Añadir Proveedor
            </button>
            <button onClick={exportarExcel} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#ecfdf5', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
              <Download size={18} /> Excel
            </button>
            <button onClick={exportarPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#fef2f2', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
              <Download size={18} /> PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-[var(--neu-shadow-card)] border border-white/50">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-slate-50 to-white">
            <h3 className="text-lg font-extrabold text-slate-800">Directorio de Contactos</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl" style={{ boxShadow: 'var(--neu-shadow-input)' }}>
              Total: {proveedoresFiltrados.length} proveedores
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Empresa</th>
                  <th className="px-6 py-4">Contacto (Vendedor)</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4 text-center">Días de Visita</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {proveedoresFiltrados.length > 0 ? proveedoresFiltrados.map((p, idx) => (
                  <tr key={p.idProveedor} className="row-enter transition-all duration-200 hover:bg-slate-50/80 hover:translate-x-1" style={{ animationDelay: `${idx * 35}ms` }}>
                    <td className="px-6 py-4 font-bold text-slate-700">{p.empresa}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{p.nombreVendedor}</td>
                    <td className="px-6 py-4 text-slate-600">{p.telefono}</td>
                    <td className="px-6 py-4 text-center text-slate-600 font-semibold">{p.diasVisita || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${p.estado ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/60' : 'bg-red-50/80 text-red-700 border border-red-100/60'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>
                        {p.estado ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 text-slate-400">
                        <button onClick={() => handleOpenEditar(p)} className="icon-btn hover:text-amber-500 bg-transparent border-none cursor-pointer" title="Editar Proveedor"><Edit size={18} /></button>
                        <button onClick={() => handleDesactivar(p)} className="icon-btn hover:text-red-500 bg-transparent border-none cursor-pointer" title="Desactivar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
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