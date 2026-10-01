import { useInstagram } from '../context/InstagramContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useInstagram();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
        let borderColor = 'border-sky-500/30';
        let bgGlow = 'rgba(56, 189, 248, 0.1)';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderColor = 'border-emerald-500/30';
          bgGlow = 'rgba(52, 211, 153, 0.1)';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          borderColor = 'border-rose-500/30';
          bgGlow = 'rgba(244, 63, 94, 0.1)';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderColor = 'border-amber-500/30';
          bgGlow = 'rgba(245, 158, 11, 0.1)';
        }

        return (
          <div
            key={toast.id}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', boxShadow: `0 8px 24px -4px ${bgGlow}` }}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border ${borderColor} backdrop-blur-md text-white transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
