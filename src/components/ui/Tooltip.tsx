'use client';

import React, { useState } from 'react';

/**
 * S8.3: Reusable Tooltip component.
 * Renders a hover/focus tooltip above or below the trigger element.
 */

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = position === 'top'
    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    : 'top-full left-1/2 -translate-x-1/2 mt-2';

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${positionClasses}`}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 ${
              position === 'top' ? 'top-full -mt-1' : 'bottom-full -mb-1'
            }`}
          />
        </div>
      )}
    </div>
  );
}

export { Tooltip };
export type { TooltipProps };
