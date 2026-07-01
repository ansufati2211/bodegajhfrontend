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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          {esEdicion ? <Edit size={20} className="text-amber-500" /> : null}
          {esEdicion ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="nombres" className="block text-sm font-medium mb-1 text-slate-700">Nombres</label>
                <input 
                  id="nombres" type="text" required 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.nombres || ''}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})} 
                  placeholder="Ej. Juan"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="apellidos" className="block text-sm font-medium mb-1 text-slate-700">Apellidos</label>
                <input 
                  id="apellidos" type="text" required 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.apellidos || ''}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})} 
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dni" className="block text-sm font-medium mb-1 text-slate-700">DNI / RUC</label>
              <input 
                id="dni" type="text" required maxLength="11"
                className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dni || ''}
                onChange={(e) => setFormData({...formData, dni: e.target.value})} 
                placeholder="Ej. 76543210"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label htmlFor="telefono" className="block text-sm font-medium mb-1 text-slate-700">Teléfono</label>
                <input 
                  id="telefono" type="text" 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
                  placeholder="Ej. 987654321"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="correo" className="block text-sm font-medium mb-1 text-slate-700">Correo (Opcional)</label>
                <input 
                  id="correo" type="email" 
                  className="w-full border border-slate-300 p-2 rounded bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.correo || ''}
                  onChange={(e) => setFormData({...formData, correo: e.target.value})} 
                  placeholder="correo@ejemplo.com"
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

ClienteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  clienteAEditar: PropTypes.object
};

export default ClienteModal;