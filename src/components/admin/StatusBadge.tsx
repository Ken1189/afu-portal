'use client';

const STATUS_STYLES: Record<string, string> = {
  // Generic
  active: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  inactive: 'bg-gray-100 text-gray-600',
  draft: 'bg-gray-100 text-gray-500',
  planning: 'bg-amber-100 text-amber-700',
  disbursed: 'bg-teal-100 text-teal-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',

  // Tiers
  free: 'bg-gray-100 text-gray-600',
  smallholder: 'bg-green-100 text-green-700',
  commercial: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
  partner: 'bg-amber-100 text-amber-700',

  // Categories
  agronomy: 'bg-emerald-100 text-emerald-700',
  livestock: 'bg-orange-100 text-orange-700',
  technology: 'bg-purple-100 text-purple-700',
  climate: 'bg-sky-100 text-sky-700',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/[\s_-]+/g, '');
  const style = STATUS_STYLES[key] || 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${style} ${className}`}>
      {status}
    </span>
  );
}
