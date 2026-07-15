import React, { useState, useEffect } from 'react';
import { Settings, Shield, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, toggleEstadoUsuario } from '../services/usuario.service';
import UsuarioModal from '../components/UsuarioModal';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Configuracion = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const cargarDatos = async () => {
    try {
      setUsuarios(await obtenerUsuarios());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (datos) => {
    try {
      if (usuarioSeleccionado) {
        await actualizarUsuario(usuarioSeleccionado.idUsuario, datos);
        toast.success('¡Usuario actualizado con éxito!');
      } else {
        await crearUsuario(datos);
        toast.success('¡Nuevo usuario creado con éxito!');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      toast.error('Error al guardar el usuario. Verifica los datos.');
    }
  };

  const handleToggleEstado = async (usuario) => {
    const accion = usuario.estado ? 'desactivar' : 'reactivar';
    const confirmacion = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `El usuario será ${accion}do en el sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: usuario.estado ? '#dc2626' : '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        await toggleEstadoUsuario(usuario.idUsuario);
        cargarDatos();
        toast.success(`¡Usuario ${accion}do correctamente!`);
      } catch (error) {
        toast.error(`No se pudo ${accion} el usuario.`);
        console.error("Error al alternar estado:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <div className="p-4 lg:p-8 flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200/70 pb-4 gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <span className="bg-white p-2 rounded-full shadow-[var(--neu-shadow)] ring-1 ring-blue-500/10"><Settings className="text-blue-600 drop-shadow-sm" size={26} /></span>
              Configuración del Sistema
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-12">Gestión de usuarios y accesos a la plataforma.</p>
          </div>
          <button type="button" onClick={() => { setUsuarioSeleccionado(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 transition-all duration-200 border-none cursor-pointer" style={{ background: '#eff6ff', boxShadow: 'var(--neu-shadow)', fontWeight: 800 }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-hover)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-[var(--neu-shadow-card)] border border-white/50">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[.12em] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Usuario (Login)</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usuarios.map((u, idx) => (
                <tr key={u.idUsuario} className="row-enter transition-all duration-200 hover:bg-slate-50/80 hover:translate-x-1" style={{ animationDelay: `${idx * 35}ms` }}>
                  <td className="px-6 py-4 font-bold text-slate-700">{u.nombreCompleto}</td>
                  <td className="px-6 py-4 text-slate-600">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 bg-purple-50/80 text-purple-700 rounded-xl w-fit border border-purple-100/60" style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>
                      <Shield size={12} /> {u.rol?.nombre || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full ${u.estado ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/60' : 'bg-red-50/80 text-red-700 border border-red-100/60'}`} style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>
                      {u.estado ? 'ACTIVO' : 'BLOQUEADO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button type="button" onClick={() => { setUsuarioSeleccionado(u); setIsModalOpen(true); }} className="icon-btn text-amber-500 hover:text-amber-600 bg-transparent border-none cursor-pointer" title="Editar"><Edit size={18} /></button>
                    <button
                      type="button"
                      onClick={() => handleToggleEstado(u)}
                      className={`icon-btn bg-transparent border-none cursor-pointer transition-colors ${u.estado ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'}`}
                      title={u.estado ? "Bloquear" : "Reactivar"}
                    >
                      {u.estado ? <Trash2 size={18} /> : <RefreshCw size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleGuardar} usuarioAEditar={usuarioSeleccionado} />
    </div>
  );
};

export default Configuracion;