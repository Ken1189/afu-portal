'use client';

import React from 'react';
import { Printer, FileText, Award, Package } from 'lucide-react';

type PrintDocType = 'invoice' | 'receipt' | 'certificate';

interface PrintButtonProps {
  /** Document type to generate */
  type: PrintDocType;
  /** Record ID (order ID, receipt ID, or enrollment ID) */
  id: string;
  /** Optional button label override */
  label?: string;
  /** Optional: 'sm' | 'md' (default: 'md') */
  size?: 'sm' | 'md';
  /** Optional: 'primary' | 'outline' | 'ghost' (default: 'outline') */
  variant?: 'primary' | 'outline' | 'ghost';
  /** Additional CSS classes */
  className?: string;
}

const typeIcons: Record<PrintDocType, React.ReactNode> = {
  invoice: <FileText className="h-4 w-4" />,
  receipt: <Package className="h-4 w-4" />,
  certificate: <Award className="h-4 w-4" />,
};

const typeLabels: Record<PrintDocType, string> = {
  invoice: 'Invoice',
  receipt: 'Receipt',
  certificate: 'Certificate',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
};

const variantClasses = {
  primary: 'bg-green text-white hover:bg-green-dark',
  outline: 'border border-gray-300 text-navy hover:bg-gray-50',
  ghost: 'text-navy hover:bg-gray-100',
};

export default function PrintButton({
  type,
  id,
  label,
  size = 'md',
  variant = 'outline',
  className = '',
}: PrintButtonProps) {
  function handleClick() {
    const url = `/pdf/${type}?id=${encodeURIComponent(id)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center rounded-lg font-medium transition-colors cursor-pointer
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      title={`Print ${typeLabels[type]}`}
    >
      {typeIcons[type] || <Printer className="h-4 w-4" />}
      <span>{label || typeLabels[type]}</span>
    </button>
  );
}
