'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';

interface ImpersonationData {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  originalUserId: string;
}

export function useImpersonation() {
  const [impersonation, setImpersonation] = useState<ImpersonationData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('afu_impersonation');
    if (stored) {
      try {
        setImpersonation(JSON.parse(stored));
      } catch {
        localStorage.removeItem('afu_impersonation');
      }
    }

    // Listen for storage changes (e.g., from other tabs or manual updates)
    const handler = () => {
      const updated = localStorage.getItem('afu_impersonation');
      if (updated) {
        try {
          setImpersonation(JSON.parse(updated));
        } catch {
          setImpersonation(null);
        }
      } else {
        setImpersonation(null);
      }
    };

    window.addEventListener('storage', handler);
    // Custom event for same-tab updates
    window.addEventListener('impersonation-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('impersonation-changed', handler);
    };
  }, []);

  return impersonation;
}

export function startImpersonation(data: ImpersonationData) {
  localStorage.setItem('afu_impersonation', JSON.stringify(data));
  window.dispatchEvent(new Event('impersonation-changed'));
}

export function stopImpersonation() {
  localStorage.removeItem('afu_impersonation');
  window.dispatchEvent(new Event('impersonation-changed'));
}

export function getImpersonation(): ImpersonationData | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('afu_impersonation');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

const roleLabels: Record<string, string> = {
  member: 'Member',
  supplier: 'Supplier',
  admin: 'Admin',
  super_admin: 'Super Admin',
  warehouse_operator: 'Warehouse Operator',
  pending: 'Pending',
};

export default function ImpersonationBanner() {
  const impersonation = useImpersonation();
  const router = useRouter();

  if (!impersonation) return null;

  const handleExit = () => {
    stopImpersonation();
    router.push('/admin/members');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Eye className="w-4 h-4" />
          <span>
            Viewing as{' '}
            <strong>{impersonation.fullName}</strong>
            {' '}({roleLabels[impersonation.role] || impersonation.role})
            {' '}&mdash;{' '}
            <span className="opacity-80">{impersonation.email}</span>
          </span>
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Exit Impersonation
        </button>
      </div>
    </div>
  );
}
