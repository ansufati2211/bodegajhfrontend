import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Edit } from 'lucide-react';
import { obtenerRoles } from '../services/usuario.service';

const estadoInicial = { nombreCompleto: '', username: '', contrasena: '', idRol: 2, estado: true };

const UsuarioModal = ({ isOpen, onClose, onSave, usuarioAEditar }) => {
  const [formData, setFormData] = useState(estadoInicial);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (isOpen) {
      obtenerRoles().then(setRoles).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (usuarioAEditar) {
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

    const payloadParaSpringBoot = {
      ...formData,
      rol: { idRol: formData.idRol }
    };

    onSave(payloadParaSpringBoot);
  };

  if (!isOpen) return null;
  const esEdicion = !!usuarioAEditar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md modal-enter shadow-[var(--classic-shadow-lg)]">
        <h2 className="text-xl font-extrabold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label htmlFor="nombreCompleto" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Nombre Completo</label>
            <input id="nombreCompleto" type="text" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
              style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
              value={formData.nombreCompleto}
              onChange={e => setFormData({ ...formData, nombreCompleto: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Usuario (Login)</label>
            <input id="username" type="text" required className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
              style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              disabled={esEdicion}
            />
          </div>

          {!esEdicion && (
            <div>
              <label htmlFor="contrasena" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Contraseña</label>
              <input id="contrasena" type="password" required minLength="6" className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                value={formData.contrasena}
                onChange={e => setFormData({ ...formData, contrasena: e.target.value })}
              />
            </div>
          )}

          <div>
            <label htmlFor="idRol" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Rol de Acceso</label>
            <select id="idRol" className="w-full rounded-xl p-2.5 text-sm font-medium outline-none neo-select"
              value={formData.idRol}
              onChange={e => setFormData({ ...formData, idRol: Number.parseInt(e.target.value, 10) })}>
              {roles.map(r => <option key={r.idRol} value={r.idRol}>{r.nombre}</option>)}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-600 rounded-xl border-none cursor-pointer transition-all" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cancelar</button>
            <button type="submit" className="px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer transition-all" style={{ background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)'}>
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