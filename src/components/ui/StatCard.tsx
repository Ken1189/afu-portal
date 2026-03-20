'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

type TrendDirection = 'up' | 'down' | 'neutral';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  trend?: TrendDirection;
  icon?: React.ReactNode;
  sparklineData?: { value: number }[];
  sparklineColor?: string;
  className?: string;
}

function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  sparklineData,
  sparklineColor,
  className = '',
}: StatCardProps) {
  const resolvedTrend: TrendDirection =
    trend ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : 'neutral');

  const trendConfig: Record<
    TrendDirection,
    { icon: React.ElementType; color: string; bg: string; prefix: string }
  > = {
    up: {
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      prefix: '+',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50',
      prefix: '',
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-500',
      bg: 'bg-gray-50',
      prefix: '',
    },
  };

  const currentTrend = trendConfig[resolvedTrend];
  const TrendIcon = currentTrend.icon;

  const chartColor = sparklineColor ?? (resolvedTrend === 'up' ? '#22c55e' : resolvedTrend === 'down' ? '#ef4444' : '#8CB89C');

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px -4px rgba(27, 42, 74, 0.1)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm p-6',
        'transition-colors duration-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {icon && (
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-teal-light text-teal shrink-0">
                {icon}
              </div>
            )}
            <p className="text-sm font-medium text-gray-500 truncate">
              {label}
            </p>
          </div>

          <p className="text-2xl font-bold text-navy tracking-tight">
            {value}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  currentTrend.bg,
                  currentTrend.color,
                ].join(' ')}
              >
                <TrendIcon className="h-3 w-3" aria-hidden="true" />
                {currentTrend.prefix}
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 1 && (
          <div className="w-24 h-12 shrink-0 ml-4" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`grad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  fill={`url(#grad-${label.replace(/\s/g, '')})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export { StatCard };
export type { StatCardProps, TrendDirection };
