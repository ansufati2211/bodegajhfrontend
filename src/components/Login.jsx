import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Box } from 'lucide-react';

const Login = () => {
  // Estados para manejar los inputs del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Manejador del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí conectarías con tu backend (ej. un fetch a tu API)
    console.log('Datos enviados:', { email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans">
      
      {/* Sección del Logo y Título */}
      <div className="flex items-center mb-8 gap-4">
        {/* Ícono representativo del logo cúbico */}
        <div className="text-blue-500">
          <Box size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 leading-tight">
          SISTEMA DE VENTAS<br />E INVENTARIO
        </h1>
      </div>

      {/* Contenedor principal de la tarjeta de Login */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-6 text-slate-800">
          INICIAR SESIÓN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Input: Correo Electrónico */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          {/* Input: Contraseña */}
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

          {/* Checkbox: Recuérdame */}
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

          {/* Botón de Ingreso */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b82f6] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors mt-2"
          >
            Ingresar
          </button>
        </form>

        {/* Enlace: Olvidaste tu contraseña */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-[#3b82f6] hover:text-blue-700 transition-colors">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;