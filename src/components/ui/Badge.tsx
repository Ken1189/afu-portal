'use client';

import React from 'react';

// S6.9: Badge variant naming convention:
// - Semantic (for status): success, warning, error, info, neutral
// - Brand (for decoration): teal, navy, gold
type BadgeVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'teal'
  | 'navy'
  | 'gold';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: {
    badge: 'bg-green-50 text-green-700 ring-green-600/20',
    dot: 'bg-green-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  error: {
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
    dot: 'bg-red-500',
  },
  info: {
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    dot: 'bg-blue-500',
  },
  neutral: {
    badge: 'bg-gray-50 text-gray-600 ring-gray-500/20',
    dot: 'bg-gray-400',
  },
  teal: {
    badge: 'bg-teal-light text-teal-dark ring-teal/20',
    dot: 'bg-teal',
  },
  navy: {
    badge: 'bg-navy/10 text-navy ring-navy/20',
    dot: 'bg-navy',
  },
  gold: {
    badge: 'bg-gold/10 text-gold ring-gold/30',
    dot: 'bg-gold',
  },
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

function Badge({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  const styles = variantClasses[variant];

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset',
        styles.badge,
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
