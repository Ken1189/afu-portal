'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title = 'No data yet',
  description = 'There are no records to display.',
  action,
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4">
        {icon || <Inbox className="w-12 h-12 text-gray-300 mx-auto" />}
      </div>
      <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
