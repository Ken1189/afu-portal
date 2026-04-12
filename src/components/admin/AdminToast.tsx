'use client';

import { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AdminToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function AdminToast({ message, type, onClose, duration = 3000 }: AdminToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
        type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}
