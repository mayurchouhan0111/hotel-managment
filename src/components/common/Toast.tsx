import React from 'react';
import { useHotel } from '../../context/HotelContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHotel();

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4 font-mono select-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="w-4 h-4 text-white shrink-0" />;
          let borderClass = 'border-white/30 bg-[#0a0a0a] text-white';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-[#00ff41] shrink-0" />;
            borderClass = 'border-[#00ff41]/50 bg-[#0a0a0a] text-white';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-[#ff3e00] shrink-0" />;
            borderClass = 'border-[#ff3e00]/50 bg-[#0a0a0a] text-white';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
            borderClass = 'border-amber-500/50 bg-[#0a0a0a] text-white';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 border shadow-2xl ${borderClass}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase text-white tracking-wider leading-tight">{toast.title}</h4>
                {toast.message && (
                  <p className="text-[11px] text-neutral-400 mt-1 uppercase leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
