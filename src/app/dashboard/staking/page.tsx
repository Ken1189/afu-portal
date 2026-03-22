'use client';

import ComingSoon from '@/components/ComingSoon';
import { Coins } from 'lucide-react';

export default function StakingPage() {
  return (
    <ComingSoon
      title="Staking & Yield"
      description="Stake AFU tokens and earn yield on your agricultural investments. This feature is being developed with our blockchain partners and will launch in a future update."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      icon={<Coins className="w-8 h-8 text-[#5DB347]" />}
    />
  );
}
