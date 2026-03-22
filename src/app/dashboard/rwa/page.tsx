'use client';

import ComingSoon from '@/components/ComingSoon';
import { Landmark } from 'lucide-react';

export default function RwaPage() {
  return (
    <ComingSoon
      title="Real World Assets"
      description="Tokenize your farm assets and access new financing opportunities. RWA tokenization is being developed in partnership with regulated blockchain infrastructure providers."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      icon={<Landmark className="w-8 h-8 text-[#5DB347]" />}
    />
  );
}
