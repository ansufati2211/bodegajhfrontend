import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Edit } from 'lucide-react';
import { obtenerRoles } from '../services/usuario.service';

const estadoInicial = { nombreCompleto: '', username: '', contrasena: '', idRol: 2, estado: true };

const UsuarioModal = ({ isOpen, onClose, onSave, usuarioAEditar }) => {
  const [formData, setFormData] = useState(estadoInicial);
  const [roles, setRoles] = useState([]);

  // Cargar los roles de la base de datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      obtenerRoles().then(setRoles).catch(console.error);
    }
  }, [isOpen]);

  // Forma correcta de llenar los datos al editar
  useEffect(() => {
    if (usuarioAEditar) {
      // Extraemos el idRol del objeto anidado 'rol' que manda Spring Boot
      setFormData({
        ...usuarioAEditar,
        idRol: usuarioAEditar.rol?.idRol || 2 
      });
    } else {
      setFormData(estadoInicial);
    }
  }, [usuarioAEditar, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // EL SECRETO ESTÁ AQUÍ: Construimos el objeto como lo espera Java
    const payloadParaSpringBoot = {
      ...formData,
      rol: { idRol: formData.idRol } // Creamos el objeto anidado
    };
    
    onSave(payloadParaSpringBoot);
  };

  if (!isOpen) return null;
  const esEdicion = !!usuarioAEditar;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label htmlFor="nombreCompleto" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
            <input id="nombreCompleto" type="text" required className="w-full border p-2 rounded bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.nombreCompleto} 
              onChange={e => setFormData({...formData, nombreCompleto: e.target.value})} 
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">Usuario (Login)</label>
            <input id="username" type="text" required className="w-full border p-2 rounded bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              disabled={esEdicion} 
            />
          </div>
          
          {!esEdicion && (
            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="contrasena" type="password" required minLength="6" className="w-full border p-2 rounded bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.contrasena} 
                onChange={e => setFormData({...formData, contrasena: e.target.value})} 
              />
            </div>
          )}

          <div>
            <label htmlFor="idRol" className="block text-sm font-medium text-slate-700">Rol de Acceso</label>
            <select id="idRol" className="w-full border p-2 rounded bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" 
              value={formData.idRol} 
              onChange={e => setFormData({...formData, idRol: Number.parseInt(e.target.value, 10)})}>
              {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-100 cursor-pointer border-none">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 cursor-pointer border-none">
              {esEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

UsuarioModal.propTypes = { isOpen: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, onSave: PropTypes.func.isRequired, usuarioAEditar: PropTypes.object };
export default UsuarioModal;