'use client';

import React from 'react';
import { AlertCircle, X } from 'lucide-react';

/**
 * S6.8: Consistent error message display component.
 * Use for form errors, API errors, and inline error states.
 */

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'inline' | 'banner';
}

function ErrorMessage({ message, onDismiss, className = '', variant = 'inline' }: ErrorMessageProps) {
  if (!message) return null;

  if (variant === 'banner') {
    return (
      <div
        className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 ${className}`}
        role="alert"
      >
        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
        <span className="flex-1">{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Dismiss">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <p className={`text-xs text-red-600 mt-1 ${className}`} role="alert">
      {message}
    </p>
  );
}

export { ErrorMessage };
export type { ErrorMessageProps };
