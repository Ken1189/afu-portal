'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

/**
 * S8.4: Consistent link styling component.
 * Handles internal (Next.js Link) and external links with consistent hover/focus styles.
 */

type LinkVariant = 'default' | 'muted' | 'nav' | 'button';

interface AppLinkProps {
  href: string;
  variant?: LinkVariant;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<LinkVariant, string> = {
  default: 'text-[var(--color-green)] hover:text-[var(--color-green-dark)] underline-offset-2 hover:underline transition-colors',
  muted: 'text-gray-500 hover:text-gray-700 transition-colors',
  nav: 'text-gray-600 hover:text-[var(--color-green)] font-medium transition-colors',
  button: 'inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-green)] text-white rounded-xl font-medium hover:bg-[var(--color-green-dark)] transition-colors',
};

function AppLink({ href, variant = 'default', external, className = '', children }: AppLinkProps) {
  const isExternal = external ?? href.startsWith('http');
  const classes = `${variantClasses[variant]} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2 ${className}`;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {variant !== 'button' && <ExternalLink className="inline w-3 h-3 ml-0.5" />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

export { AppLink };
export type { AppLinkProps, LinkVariant };
