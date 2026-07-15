import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, Wallet, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerClientes, crearCliente, actualizarCliente } from '../services/cliente.service';
import ClienteModal from '../components/ClienteModal';

import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await obtenerClientes();
      setClientes(data);
    } catch (err) {
      setError("Error al conectar con el servidor. Verifica que el backend esté ejecutándose.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter(c =>
    (c.nombres?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (c.apellidos?.toLowerCase().includes(busqueda.toLowerCase())) ||
    (c.dni?.includes(busqueda))
  );

  const exportarExcel = () => {
    const dataExcel = clientesFiltrados.map(c => ({
      DNI: c.dni,
      Cliente: `${c.nombres} ${c.apellidos}`,
      Teléfono: c.telefono || '-',
      Deuda: c.deudaTotal || 0,
      Estado: c.estado ? 'ACTIVO' : 'INACTIVO'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    XLSX.writeFile(workbook, "Directorio_Clientes.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text("Directorio de Clientes", 14, 10);
    const tableData = clientesFiltrados.map(c => [
      c.dni, `${c.nombres} ${c.apellidos}`, c.telefono || '-', `S/${c.deudaTotal || 0}`
    ]);
    autoTable(doc, { head: [['DNI', 'Cliente', 'Teléfono', 'Deuda Acumulada']], body: tableData, startY: 20 });
    doc.save("Directorio_Clientes.pdf");
  };

  const handleOpenCrear = () => {
    setClienteSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleOpenEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setIsModalOpen(true);
  };

  const handleSaveCliente = async (datosCliente) => {
    try {
      if (clienteSeleccionado) {
        await actualizarCliente(clienteSeleccionado.idCliente, datosCliente);
        toast.success("¡Cliente actualizado con éxito!");
      } else {
        await crearCliente(datosCliente);
        toast.success("¡Cliente añadido con éxito!");
      }
      setIsModalOpen(false);
      fetchClientes();
    } catch (err) {
      toast.error("Hubo un error al guardar los datos del cliente.");
      console.error(err);
    }
  };

  const handleToggleEstado = async (cliente) => {
    const accion = cliente.estado ? 'desactivar' : 'reactivar';
    const confirmacion = await Swal.fire({
      title: `¿Deseas ${accion} a este cliente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: cliente.estado ? '#dc2626' : '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await actualizarCliente(cliente.idCliente, { ...cliente, estado: !cliente.estado });
        fetchClientes();
        toast.success(`¡Cliente ${accion}do con éxito!`);
      } catch (err) {
        toast.error("No se pudo cambiar el estado del cliente.");
        console.error(err);
      }
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="animate-[spinPulse_1s_ease-in-out_infinite] rounded-full h-14 w-14 mx-auto mb-5" style={{ border: '3px solid transparent', borderTopColor: '#3b82f6', borderRightColor: '#93c5fd' }}></div>
        <p className="text-slate-500 font-semibold tracking-wide text-sm">Cargando directorio de clientes...</p>
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
              placeholder="Buscar por DNI o Nombre"
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
          <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800">GESTIÓN DE CLIENTES</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button onClick={handleOpenCrear} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#eff6ff', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
              <Plus size={18} /> Añadir Cliente
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
            <h3 className="text-lg font-extrabold text-slate-800">Directorio de Clientes</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl" style={{ boxShadow: 'var(--neu-shadow-input)' }}>
              Total: {clientesFiltrados.length} registrados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">DNI / RUC</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4 text-center">Deuda (Fiados)</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {clientesFiltrados.length > 0 ? clientesFiltrados.map((c, idx) => (
                  <tr key={c.idCliente} className="row-enter transition-all duration-200 hover:bg-slate-50/80 hover:translate-x-1" style={{ animationDelay: `${idx * 35}ms` }}>
                    <td className="px-6 py-4 font-bold text-slate-700">{c.dni}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{`${c.nombres} ${c.apellidos}`}</td>
                    <td className="px-6 py-4 text-slate-600">{c.telefono || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`flex items-center justify-center gap-1 font-extrabold ${c.deudaTotal > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        <Wallet size={16} />
                        S/ {c.deudaTotal ? c.deudaTotal.toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${c.estado ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/60' : 'bg-red-50/80 text-red-700 border border-red-100/60'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>
                        {c.estado ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5 text-slate-400">
                        <button type="button" onClick={() => handleOpenEditar(c)} className="icon-btn hover:text-amber-500 bg-transparent border-none cursor-pointer" title="Editar Cliente"><Edit size={18} /></button>
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(c)}
                          className={`icon-btn bg-transparent border-none cursor-pointer ${c.estado ? 'hover:text-red-500' : 'hover:text-emerald-500'}`}
                          title={c.estado ? "Desactivar" : "Reactivar"}
                        >
                          {c.estado ? <Trash2 size={18} /> : <RefreshCw size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="opacity-20 mb-3" />
                        <p>No se encontraron clientes.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        clienteAEditar={clienteSeleccionado}
      />

    </div>
  );
};

export default Clientes;