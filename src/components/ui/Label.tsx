'use client';

import React from 'react';

/**
 * S6.2: Reusable Label component for form fields.
 */

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  icon?: React.ReactNode;
}

function Label({ children, required, icon, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex mr-1 align-text-bottom" aria-hidden="true">{icon}</span>}
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  );
}

export { Label };
export type { LabelProps };
