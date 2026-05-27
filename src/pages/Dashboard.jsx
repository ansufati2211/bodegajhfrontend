import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerProductos } from '../services/inventory.service.js';

const Dashboard = () => {
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Función para traer los datos reales de tu base de datos
    const cargarDatos = async () => {
      try {
        const productos = await obtenerProductos();
        
        // 2. Transformamos los datos para que el gráfico los entienda (Nombre y Stock)
        const datosFormateados = productos.map(p => ({
          nombre: p.nombre,
          stock: p.stock
        }));
        
        setDatosGrafico(datosFormateados);
      } catch (error) {
        console.error("Error al cargar datos para el gráfico", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          DASHBOARD PRINCIPAL
        </h1>
      </header>

      <section className="p-8">
        <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Estadísticas Generales</h2>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-6">Nivel de Stock por Producto</h3>
          
          {cargando ? (
            <div className="flex justify-center items-center h-80">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            /* 3. Aquí dibujamos el gráfico de Recharts */
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nombre" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Unidades en Stock" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;