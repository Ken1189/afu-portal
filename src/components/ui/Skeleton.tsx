'use client';

import React from 'react';

interface SkeletonBaseProps {
  className?: string;
}

interface SkeletonTextProps extends SkeletonBaseProps {
  lines?: number;
  widths?: string[];
}

interface SkeletonAvatarProps extends SkeletonBaseProps {
  size?: 'sm' | 'md' | 'lg';
}

interface SkeletonCardProps extends SkeletonBaseProps {
  hasImage?: boolean;
  lines?: number;
}

interface SkeletonTableProps extends SkeletonBaseProps {
  rows?: number;
  columns?: number;
}

const shimmerClass =
  'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded';

function SkeletonBlock({ className = '', style }: SkeletonBaseProps & { style?: React.CSSProperties }) {
  return <div className={`${shimmerClass} ${className}`} style={style} aria-hidden="true" />;
}

function SkeletonText({
  lines = 3,
  widths,
  className = '',
}: SkeletonTextProps) {
  const defaultWidths = ['100%', '90%', '75%', '85%', '60%'];

  return (
    <div
      className={`space-y-2.5 ${className}`}
      role="status"
      aria-label="Loading text"
    >
      {Array.from({ length: lines }).map((_, i) => {
        const width = widths?.[i] ?? defaultWidths[i % defaultWidths.length];
        return (
          <SkeletonBlock
            key={i}
            className="h-4"
            style={{ width }}
          />
        );
      })}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// S6.11: Removed duplicate SkeletonBlockStyled (identical to SkeletonBlock)
// and SkeletonTextWithWidths (identical to SkeletonText)

const avatarSizeClasses: Record<string, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

function SkeletonAvatar({ size = 'md', className = '' }: SkeletonAvatarProps) {
  return (
    <div role="status" aria-label="Loading avatar">
      <SkeletonBlock
        className={`rounded-full ${avatarSizeClasses[size]} ${className}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function SkeletonCard({
  hasImage = false,
  lines = 3,
  className = '',
}: SkeletonCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
      role="status"
      aria-label="Loading card"
    >
      {hasImage && <SkeletonBlock className="h-48 w-full rounded-none" />}
      <div className="p-6 space-y-4">
        <SkeletonBlock className="h-5 w-2/3" />
        <div className="space-y-2.5">
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonBlock
              key={i}
              className="h-4"
              style={{
                width: `${85 - i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className = '',
}: SkeletonTableProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}
      role="status"
      aria-label="Loading table"
    >
      <div className="border-b border-gray-200 px-6 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBlock
            key={`header-${i}`}
            className="h-4 flex-1"
          />
        ))}
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="px-6 py-4 flex gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <SkeletonBlock
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-4 flex-1"
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export {
  SkeletonBlock,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
};
export type {
  SkeletonBaseProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonTableProps,
};
