import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit } from 'lucide-react';

const estadoInicial = {
  nombres: '',
  apellidos: '',
  dni: '',
  telefono: '',
  correo: '',
  estado: true
};

const ClienteModal = ({ isOpen, onClose, onSave, clienteAEditar }) => {
  const [prevCliente, setPrevCliente] = useState(clienteAEditar);
  const [formData, setFormData] = useState(clienteAEditar || estadoInicial);

  if (clienteAEditar !== prevCliente) {
    setPrevCliente(clienteAEditar);
    setFormData(clienteAEditar || estadoInicial);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const esEdicion = !!clienteAEditar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md modal-enter shadow-[var(--classic-shadow-lg)]">
        <h2 className="text-xl font-extrabold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="nombres" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Nombres</label>
                <input
                  id="nombres" type="text" required
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.nombres || ''}
                  onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                  placeholder="Ej. Juan"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="apellidos" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Apellidos</label>
                <input
                  id="apellidos" type="text" required
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.apellidos || ''}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dni" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">DNI / RUC</label>
              <input
                id="dni" type="text" required maxLength="11"
                className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                value={formData.dni || ''}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej. 76543210"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="telefono" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Teléfono</label>
                <input
                  id="telefono" type="text"
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej. 987654321"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="correo" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">Correo (Opcional)</label>
                <input
                  id="correo" type="email"
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.correo || ''}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-bold text-slate-600 rounded-xl border-none cursor-pointer transition-all" style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow-pressed)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--neu-shadow)'}>Cancelar</button>
            <button type="submit" className={`px-4 py-2.5 text-sm font-bold text-white rounded-xl border-none cursor-pointer transition-all ${esEdicion ? '' : ''}`} style={esEdicion ? { background: '#d97706', boxShadow: '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)' } : { background: '#2563eb', boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(0,0,0,.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = esEdicion ? '4px 4px 8px rgba(217,119,6,.2), -2px -2px 4px rgba(255,255,255,.6)' : '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6)'}>
              {esEdicion ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ClienteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  clienteAEditar: PropTypes.object
};

export default ClienteModal;