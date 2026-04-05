'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = true, loading = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${destructive ? 'bg-red-100' : 'bg-amber-100'}`}>
                <AlertTriangle className={`w-5 h-5 ${destructive ? 'text-red-500' : 'text-amber-500'}`} />
              </div>
              <h3 className="text-lg font-bold text-[#1B2A4A]">{title}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">{cancelLabel}</button>
              <button onClick={onConfirm} disabled={loading} className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#5DB347] hover:bg-[#449933]'}`}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
