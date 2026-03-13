'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  color = 'var(--color-teal)',
  trackColor = '#e5e7eb',
  showLabel = true,
  label,
  className = '',
}: ProgressRingProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={`inline-flex flex-col items-center ${className}`}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clampedValue}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>

      {showLabel && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ width: size, height: size, position: 'relative', marginTop: -size }}
        >
          <span className="text-2xl font-bold text-navy" style={{ fontSize: size * 0.2 }}>
            {Math.round(clampedValue)}%
          </span>
          {label && (
            <span
              className="text-xs text-gray-500 mt-0.5"
              style={{ fontSize: Math.max(10, size * 0.09) }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { ProgressRing };
export type { ProgressRingProps };
