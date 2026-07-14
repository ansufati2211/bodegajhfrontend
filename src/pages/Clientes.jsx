import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Edit, Trash2, Wallet, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { obtenerClientes, crearCliente, actualizarCliente } from '../services/cliente.service';
import ClienteModal from '../components/ClienteModal';

// 1. Importamos nuestras librerías modernas
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

  // NUEVO: Función para Activar o Desactivar
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
    <div className="flex h-full items-center justify-center bg-slate-50 min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Cargando directorio de clientes...</p>
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
              placeholder="Buscar por DNI o Nombre" 
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
          <h2 className="text-3xl font-extrabold text-slate-800">GESTIÓN DE CLIENTES</h2>
          <div className="flex gap-3">
            <button onClick={handleOpenCrear} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors">
              <Plus size={18} /> Añadir Cliente
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
            <h3 className="text-lg font-bold text-slate-800">Directorio de Clientes</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Total: {clientesFiltrados.length} registrados
            </span>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">DNI / RUC</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4 text-center">Deuda (Fiados)</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesFiltrados.length > 0 ? clientesFiltrados.map((c) => (
                <tr key={c.idCliente} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{c.dni}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{`${c.nombres} ${c.apellidos}`}</td>
                  <td className="px-6 py-4 text-slate-600">{c.telefono || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`flex items-center justify-center gap-1 font-bold ${
                      (c.deudaTotal > 0) ? 'text-red-600' : 'text-slate-400'
                    }`}>
                      <Wallet size={16} />
                      S/ {c.deudaTotal ? c.deudaTotal.toFixed(2) : '0.00'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      c.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.estado ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-slate-400">
                      <button type="button" onClick={() => handleOpenEditar(c)} className="hover:text-amber-500 transition-colors bg-transparent border-none cursor-pointer" title="Editar Cliente">
                        <Edit size={18} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleToggleEstado(c)} 
                        className={`transition-colors bg-transparent border-none cursor-pointer ${c.estado ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'}`} 
                        title={c.estado ? "Desactivar" : "Reactivar"}
                      >
                        {c.estado ? <Trash2 size={18} /> : <RefreshCw size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
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