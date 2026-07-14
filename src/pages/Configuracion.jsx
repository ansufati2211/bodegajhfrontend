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
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <div className="p-8 flex-1">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Settings className="text-blue-600"/> Configuración del Sistema
            </h2>
            <p className="text-slate-500 text-sm mt-1">Gestión de usuarios y accesos a la plataforma.</p>
          </div>
          <button type="button" onClick={() => { setUsuarioSeleccionado(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 border-none cursor-pointer">
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Usuario (Login)</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map(u => (
                <tr key={u.idUsuario} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-700">{u.nombreCompleto}</td>
                  <td className="px-6 py-4 text-slate-600">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded w-fit">
                      <Shield size={12}/> {u.rol?.nombre || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${u.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.estado ? 'ACTIVO' : 'BLOQUEADO'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    <button type="button" onClick={() => { setUsuarioSeleccionado(u); setIsModalOpen(true); }} className="text-amber-500 hover:text-amber-600 border-none bg-transparent cursor-pointer" title="Editar">
                      <Edit size={18}/>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleToggleEstado(u)} 
                      className={`border-none bg-transparent cursor-pointer transition-colors ${u.estado ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-emerald-500'}`} 
                      title={u.estado ? "Bloquear" : "Reactivar"}
                    >
                      {u.estado ? <Trash2 size={18}/> : <RefreshCw size={18}/>}
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