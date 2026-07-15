import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Edit } from 'lucide-react';

const estadoInicial = {
  empresa: '',
  nombreVendedor: '',
  telefono: '',
  diasVisita: '',
  estado: true
};

const ProveedorModal = ({ isOpen, onClose, onSave, proveedorAEditar }) => {
  const [formData, setFormData] = useState(estadoInicial);

  useEffect(() => {
    if (proveedorAEditar) {
      setFormData(proveedorAEditar);
    } else {
      setFormData(estadoInicial);
    }
  }, [proveedorAEditar, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const esEdicion = !!proveedorAEditar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" style={{ background: 'rgba(15,23,42,.6)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md modal-enter shadow-[var(--classic-shadow-lg)]">
        <h2 className="text-xl font-extrabold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="empresa" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">
                Empresa / Razón Social
              </label>
              <input
                id="empresa"
                type="text"
                required
                className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                placeholder="Ej. Distribuidora Andina E.I.R.L."
              />
            </div>

            <div>
              <label htmlFor="nombreVendedor" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">
                Nombre del Vendedor (Contacto)
              </label>
              <input
                id="nombreVendedor"
                type="text"
                required
                className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                value={formData.nombreVendedor}
                onChange={(e) => setFormData({ ...formData, nombreVendedor: e.target.value })}
                placeholder="Ej. Carlos Ramos"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="telefono" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="telefono"
                  type="text"
                  required
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej. 987654321"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="diasVisita" className="block text-[11px] font-black mb-1.5 text-slate-500 uppercase tracking-wide">
                  Días de Visita
                </label>
                <input
                  id="diasVisita"
                  type="text"
                  className="w-full rounded-xl p-2.5 text-sm font-medium outline-none"
                  style={{ background: '#f0f2f5', boxShadow: 'var(--neu-shadow-input)', border: 'none' }}
                  value={formData.diasVisita}
                  onChange={(e) => setFormData({ ...formData, diasVisita: e.target.value })}
                  placeholder="Ej. Lunes y Jueves"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="estadoProveedor"
                checked={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="estadoProveedor" className="text-sm font-medium text-slate-700 cursor-pointer">
                Proveedor Activo (Mostrar en el sistema)
              </label>
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

ProveedorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  proveedorAEditar: PropTypes.object
};

export default ProveedorModal;