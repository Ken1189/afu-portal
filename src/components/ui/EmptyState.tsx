'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-teal-light text-teal mb-4">
        {icon ?? <FolderOpen className="h-8 w-8" aria-hidden="true" />}
      </div>

      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      )}

      {action && <div>{action}</div>}
    </motion.div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
