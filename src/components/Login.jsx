import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Mail, Lock, Eye, EyeOff, Box } from 'lucide-react';
import { iniciarSesion } from '../services/auth.service';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

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
      if (onLoginSuccess) onLoginSuccess();
      navigate('/inventario');
    } catch (err) {
      console.error("Error durante el inicio de sesión:", err);
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 font-sans"
      style={{ background: 'linear-gradient(135deg, #f0f2f5 0%, #e2e8f0 100%)' }}>

      <div className="flex items-center mb-8 gap-4">
        <div className="text-blue-500 p-2 rounded-2xl bg-white"
          style={{ boxShadow: 'var(--neu-shadow)' }}>
          <Box size={44} strokeWidth={1.5} className="drop-shadow-sm" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 leading-tight tracking-wide">
          BODEGA JH<br />
          <span className="text-sm font-bold text-slate-500 tracking-wide">SISTEMA DE VENTAS E INVENTARIO</span>
        </h1>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,.9)', boxShadow: 'var(--classic-shadow)', border: '1px solid rgba(255,255,255,.6)', backdropFilter: 'blur(8px)' }}>
        <h2 className="text-xl font-extrabold text-center mb-6 text-slate-800 tracking-wide">INICIAR SESIÓN</h2>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm font-bold text-center text-red-700 bg-red-50/80 border border-red-100/60 backdrop-blur-sm"
            style={{ boxShadow: 'inset 0 1px 2px rgba(255,255,255,.4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium text-slate-700 outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.05), inset -1px -1px 3px rgba(255,255,255,.8)', border: 'none', transition: 'all .15s ease' }}
                placeholder="usuario@ejemplo.com"
                required
                onFocus={(e) => { e.target.style.boxShadow = 'inset 1px 1px 3px rgba(59,130,246,.15), inset -1px -1px 2px rgba(255,255,255,.9), 0 0 0 3px rgba(59,130,246,.12)'; }}
                onBlur={(e) => { e.target.style.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,.05), inset -1px -1px 3px rgba(255,255,255,.8)'; }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3 rounded-xl text-sm font-medium text-slate-700 outline-none"
                style={{ background: '#f0f2f5', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,.05), inset -1px -1px 3px rgba(255,255,255,.8)', border: 'none', transition: 'all .15s ease' }}
                placeholder="••••••••"
                required
                onFocus={(e) => { e.target.style.boxShadow = 'inset 1px 1px 3px rgba(59,130,246,.15), inset -1px -1px 2px rgba(255,255,255,.9), 0 0 0 3px rgba(59,130,246,.12)'; }}
                onBlur={(e) => { e.target.style.boxShadow = 'inset 2px 2px 5px rgba(0,0,0,.05), inset -1px -1px 3px rgba(255,255,255,.8)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-white/60 transition-all bg-transparent border-none cursor-pointer"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600">
              Recuérdame
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-extrabold text-white tracking-wide transition-all duration-200 border-none cursor-pointer mt-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            style={loading ? {
              background: '#93c5fd',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,.08)'
            } : {
              background: '#2563eb',
              boxShadow: '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.6), inset 0 1px 0 rgba(255,255,255,.15)',
              transition: 'all .25s cubic-bezier(.34,1.56,.64,1)'
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.boxShadow = '3px 3px 6px rgba(37,99,235,.15), -1px -1px 3px rgba(255,255,255,.7), inset 0 1px 0 rgba(255,255,255,.15)'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { if (!loading) { e.target.style.boxShadow = '4px 4px 8px rgba(37,99,235,.2), -2px -2px 4px rgba(255,255,255,.5), inset 0 1px 0 rgba(255,255,255,.15)'; e.target.style.transform = 'translateY(0)'; }}}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => alert("Funcionalidad en desarrollo")}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-transparent border-none p-0 cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLoginSuccess: PropTypes.func
};

export default Login;