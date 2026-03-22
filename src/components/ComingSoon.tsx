'use client';

import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  icon?: React.ReactNode;
}

export default function ComingSoon({
  title,
  description = 'This feature is under development and will be available soon.',
  backLink = '/farm',
  backLabel = 'Back to Dashboard',
  icon,
}: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/10 flex items-center justify-center mb-4">
        {icon || <Clock className="w-8 h-8 text-[#5DB347]" />}
      </div>
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 mb-3">
        Coming Soon
      </span>
      <h1 className="text-xl font-bold text-navy mb-2">{title}</h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      <Link
        href={backLink}
        className="flex items-center gap-2 text-sm font-medium text-[#5DB347] hover:text-[#449933] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
    </div>
  );
}
