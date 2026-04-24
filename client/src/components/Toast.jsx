import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const CONFIG = {
  success: { icon: <CheckCircle size={18} />, cls: 'bg-emerald-900/80 border-emerald-500/30 text-emerald-200' },
  error:   { icon: <AlertCircle size={18} />, cls: 'bg-red-900/80 border-red-500/30 text-red-200' },
  warning: { icon: <AlertTriangle size={18} />, cls: 'bg-amber-900/80 border-amber-500/30 text-amber-200' },
  info:    { icon: <Info size={18} />, cls: 'bg-blue-900/80 border-blue-500/30 text-blue-200' },
};

export default function Toast({ message, type = 'info', onClose }) {
  const { icon, cls } = CONFIG[type] || CONFIG.info;

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm animate-slide-in ${cls}`}>
      {icon}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition">
        <X size={15} />
      </button>
    </div>
  );
}
