'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  padding?: CardPadding;
  hover?: boolean;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

function Card({
  children,
  padding = 'md',
  hover = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={
        hover
          ? { y: -4, boxShadow: '0 12px 24px -4px rgba(27, 42, 74, 0.12)' }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={[
        'bg-white rounded-xl border border-gray-200 shadow-sm',
        'transition-colors duration-200',
        paddingClasses[padding],
        hover ? 'cursor-pointer' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ children, className = '', actions }: CardHeaderProps) {
  return (
    <div
      className={[
        'flex items-center justify-between pb-4 mb-4 border-b border-gray-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  );
}

function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div
      className={[
        'pt-4 mt-4 border-t border-gray-100',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardFooter };
export type { CardProps, CardHeaderProps, CardFooterProps, CardPadding };
