'use client';

import ComingSoon from '@/components/ComingSoon';
import { Landmark } from 'lucide-react';

export default function TokenizePage() {
  return (
    <ComingSoon
      title="Asset Tokenization"
      description="Tokenize your farm assets, harvest yields, and produce into tradeable digital tokens. This feature is under development with our blockchain infrastructure partners."
      backLink="/farm"
      backLabel="Back to Farm Portal"
      icon={<Landmark className="w-8 h-8 text-[#5DB347]" />}
    />
  );
}
