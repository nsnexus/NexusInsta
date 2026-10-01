import React, { useState } from 'react';
import { useInstagram } from '../context/InstagramContext';
import { Lock, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';

export const LoginScreen: React.FC = () => {
  const { login, config } = useInstagram();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password, rememberMe);
    if (!success) {
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10 space-y-6">
        
        {/* Lock Brand Box */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-2xl">
          
          {/* Logo & Icon */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-instagram-gradient flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center">
                <InstagramIcon className="w-3 h-3 text-white" />
              </div>
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                NexusInsta Security
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Acesso Administrativo Restrito
              </p>
            </div>

            {/* Account Protection Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Protegendo: <strong className="text-white">@{config.username}</strong></span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">Senha Master do Painel:</label>
                <span className="text-slate-500 text-[11px]">Padrão: <code className="text-pink-400 font-mono">nexus2026</code></span>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Digite sua senha de acesso..."
                  autoFocus
                  className={`w-full text-sm px-4 py-3 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-600 focus:outline-none transition-all ${
                    hasError
                      ? 'border-rose-500 ring-2 ring-rose-500/30 animate-shake'
                      : 'border-slate-800 focus:border-pink-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {hasError && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 font-medium pt-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Senha incorreta! Dica padrão: nexus2026</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-500 bg-slate-900 border-slate-700 focus:ring-pink-500"
                />
                <span>Lembrar meu acesso neste dispositivo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-instagram-gradient text-white shadow-lg shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Desbloquear Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-900 text-center text-[11px] text-slate-500 leading-relaxed">
            <span>
              Tokens criptografados da Meta Graph API v21.0 protegidos com autenticação local de ponta a ponta.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
