'use client';

import Link from 'next/link';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: '#5DB347' }}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors" style={{ background: '#5DB347' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
