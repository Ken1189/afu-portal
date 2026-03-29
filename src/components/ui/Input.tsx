'use client';

import React, { forwardRef } from 'react';

/**
 * S6.1: Reusable Input component with consistent styling.
 * Matches the project's design system (teal focus ring, rounded-xl, etc.)
 */

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-4 py-3 text-base rounded-xl',
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', error, leftIcon, rightIcon, className = '', ...props },
  ref
) {
  return (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={[
          'w-full border bg-white transition-colors duration-150',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent',
          error
            ? 'border-red-300 focus:ring-red-500/50'
            : 'border-gray-200 focus:ring-teal/50',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
          sizeClasses[size],
          leftIcon ? 'pl-10' : '',
          rightIcon ? 'pr-10' : '',
          className,
        ].filter(Boolean).join(' ')}
        aria-invalid={!!error}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
          {rightIcon}
        </span>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
});

export { Input };
export type { InputProps, InputSize };
