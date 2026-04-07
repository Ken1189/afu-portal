'use client';

import { AlertCircle } from 'lucide-react';

interface LegalDisclaimerProps {
  type: 'banking' | 'insurance' | 'finance' | 'investment' | 'research' | 'legal' | 'medical' | 'general';
  variant?: 'banner' | 'footnote' | 'inline';
}

const DISCLAIMERS = {
  banking: 'AFU Bank is currently in development and pending regulatory approval. Banking services described on this page are part of our planned offering and are not yet available. AFU is not a licensed bank or financial institution. References to banking products represent our future operating model.',
  insurance: 'Insurance products described on this site are part of AFU\'s planned service offering and are pending regulatory approval and underwriter partnerships. AFU is not a licensed insurance provider. Coverage details, premiums, and product features are illustrative and subject to change. No insurance contract is formed by viewing this page.',
  finance: 'Financing products described on this page are part of AFU\'s planned offering. AFU is in the process of establishing partnerships with licensed financial institutions. Loan amounts, interest rates, and terms shown are illustrative and subject to credit approval, regulatory licensing, and partner agreements. No commitment to lend is made.',
  investment: 'This is not an offer to sell securities or a solicitation of an offer to buy securities. Any investment opportunity described on this site will only be available to qualified accredited investors through appropriate offering documents in accordance with applicable securities laws. Past performance is not indicative of future results. All investments carry risk of loss.',
  research: 'Research content, data, and statistics on this page are provided for informational purposes only. AFU makes no warranty as to the accuracy, completeness, or reliability of this information. Statistics may be from third-party sources or AFU\'s own preliminary research. Decisions should not be made solely based on this information.',
  legal: 'AFU\'s legal assistance services are provided through partnerships with independent licensed attorneys and law firms. AFU itself does not provide legal advice. Information on this page is general in nature and does not constitute legal advice. Consult a qualified attorney for legal matters specific to your situation.',
  medical: 'Veterinary services described are provided through independent licensed veterinarians. AFU does not provide veterinary care directly. Information on this page is for educational purposes only and is not a substitute for professional veterinary advice.',
  general: 'AFU is currently building infrastructure across multiple service areas. Some services described on this site are part of our planned offering and may not yet be operational. Specific products, pricing, and features are illustrative and subject to change.',
};

export default function LegalDisclaimer({ type, variant = 'banner' }: LegalDisclaimerProps) {
  const text = DISCLAIMERS[type];

  if (variant === 'footnote') {
    return (
      <p className="text-[10px] text-gray-400 italic mt-4 leading-relaxed">
        <strong className="text-gray-500">Important:</strong> {text}
      </p>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-400 px-4 py-3 my-4 rounded-r-lg">
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Notice:</strong> {text}
        </p>
      </div>
    );
  }

  // Default: banner
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 my-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-900 mb-1">Important Notice</p>
          <p className="text-xs text-amber-800 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}
