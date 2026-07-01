import React, { useState } from 'react';
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
  const [prevProveedor, setPrevProveedor] = useState(proveedorAEditar);
  const [formData, setFormData] = useState(proveedorAEditar || estadoInicial);

  // Sincronización del estado para cuando se abre el modal en modo edición
  if (proveedorAEditar !== prevProveedor) {
    setPrevProveedor(proveedorAEditar);
    setFormData(proveedorAEditar || estadoInicial);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  const esEdicion = !!proveedorAEditar;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium mb-1 text-slate-700">
                Empresa / Razón Social
              </label>
              <input 
                id="empresa"
                type="text" 
                required 
                className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})} 
                placeholder="Ej. Distribuidora Andina E.I.R.L."
              />
            </div>
            
            <div>
              <label htmlFor="nombreVendedor" className="block text-sm font-medium mb-1 text-slate-700">
                Nombre del Vendedor (Contacto)
              </label>
              <input 
                id="nombreVendedor"
                type="text" 
                required 
                className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.nombreVendedor}
                onChange={(e) => setFormData({...formData, nombreVendedor: e.target.value})} 
                placeholder="Ej. Carlos Ramos"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="telefono" className="block text-sm font-medium mb-1 text-slate-700">
                  Teléfono / WhatsApp
                </label>
                <input 
                  id="telefono"
                  type="text" 
                  required 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                  placeholder="Ej. 987654321"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="diasVisita" className="block text-sm font-medium mb-1 text-slate-700">
                  Días de Visita
                </label>
                <input 
                  id="diasVisita"
                  type="text" 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.diasVisita}
                  onChange={(e) => setFormData({...formData, diasVisita: e.target.value})} 
                  placeholder="Ej. Lunes y Jueves"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 border border-slate-300 rounded hover:bg-slate-100 font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" className={`px-4 py-2 text-white rounded font-bold shadow-md transition-colors ${esEdicion ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
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