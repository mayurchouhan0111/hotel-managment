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

  let btnColor = 'bg-rose-600 hover:bg-rose-700 text-white';
  let iconBg = 'bg-rose-50 text-rose-600 border border-rose-200';

  if (actualVariant === 'warning') {
    btnColor = 'bg-amber-600 hover:bg-amber-700 text-white';
    iconBg = 'bg-amber-50 text-amber-600 border border-amber-200';
  } else if (actualVariant === 'primary') {
    btnColor = 'bg-zinc-900 hover:bg-zinc-800 text-white';
    iconBg = 'bg-zinc-100 text-zinc-700 border border-zinc-200';
  }

  return (
    <AnimatePresence>
      <div
        id="confirmation-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white max-w-md w-full p-5 rounded-2xl border border-zinc-200 shadow-xl space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs pt-2">
            <button
              id="confirm-modal-cancel-btn"
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer font-medium"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-modal-action-btn"
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-1.5 font-medium rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${btnColor}`}
            >
              {isLoading && (
                <span className="inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              )}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
