import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
  isDangerous,
}) => {
  if (!isOpen) return null;

  const actualVariant = isDangerous ? 'danger' : variant;

  let btnColor = 'bg-rose-600 hover:bg-rose-500 text-white';
  let iconBg = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';

  if (actualVariant === 'warning') {
    btnColor = 'bg-amber-600 hover:bg-amber-500 text-white';
    iconBg = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  } else if (actualVariant === 'primary') {
    btnColor = 'bg-indigo-600 hover:bg-indigo-500 text-white';
    iconBg = 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30';
  }

  return (
    <AnimatePresence>
      <div
        id="confirmation-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 max-w-md w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-5"
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 text-xs">
            <button
              id="confirm-modal-cancel-btn"
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-medium"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-modal-action-btn"
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer ${btnColor}`}
            >
              {isLoading && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
