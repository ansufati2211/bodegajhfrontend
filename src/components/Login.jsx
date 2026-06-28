import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. ¡NUEVO! Importamos el navegador
import { Mail, Lock, Eye, EyeOff, Box } from 'lucide-react';
import { iniciarSesion } from '../services/auth.service';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate(); // 2. ¡NUEVO! Preparamos el "taxi"

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true); 

    try {
      await iniciarSesion(email, password);
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // 3. ¡NUEVO! LA LÍNEA MÁGICA QUE FALTABA
      navigate('/inventario'); // <-- Esto es lo que te redirige automáticamente
      
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false); 
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
      
      <div className="flex items-center mb-8 gap-4">
        <div className="text-blue-500">
          <Box size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 leading-tight">
          SISTEMA DE VENTAS<br />E INVENTARIO
        </h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-6 text-slate-800">
          INICIAR SESIÓN
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
              Recuérdame
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors mt-2 
              ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3b82f6] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-[#3b82f6] hover:text-blue-700 transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;