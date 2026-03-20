'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { X, Sprout, ArrowRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Program {
  id: string;
  country: string;
  status: string;
  [key: string]: unknown;
}

interface ProgramBannerProps {
  programs: Program[];
  onDismiss: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgramBanner({ programs, onDismiss }: ProgramBannerProps) {
  // Only show when there are open/closing-soon programs
  const activePrograms = programs.filter(
    (p) => p.status === 'open' || p.status === 'closing_soon'
  );

  if (activePrograms.length === 0) return null;

  // Find the most common country among active programs
  const countryCounts = activePrograms.reduce<Record<string, number>>((acc, p) => {
    if (p.country) acc[p.country] = (acc[p.country] || 0) + 1;
    return acc;
  }, {});
  const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const countryLabel = topCountry || 'Your Region';

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -16, height: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="overflow-hidden"
    >
      <div className="gradient-navy rounded-2xl px-4 py-3.5 md:px-5 md:py-4 flex items-center gap-3 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-12 -bottom-4 w-16 h-16 bg-teal/10 rounded-full pointer-events-none" />

        {/* Icon */}
        <div className="shrink-0 w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center relative z-10">
          <Sprout className="w-5 h-5 text-teal" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-sm font-bold text-white leading-snug">
            New Programs Available in {countryLabel}
          </p>
          <p className="text-xs text-gray-300 mt-0.5">
            {activePrograms.length} program{activePrograms.length !== 1 ? 's' : ''} open for enrollment
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Link
            href="/dashboard/programs"
            className="inline-flex items-center gap-1.5 bg-teal text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-teal/90 transition-colors whitespace-nowrap"
          >
            View Programs
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
