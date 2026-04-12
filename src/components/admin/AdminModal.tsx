'use client';

import { X } from 'lucide-react';

interface AdminModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function AdminModal({ title, open, onClose, children, maxWidth = 'max-w-xl' }: AdminModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto p-6`}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1B2A4A]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
