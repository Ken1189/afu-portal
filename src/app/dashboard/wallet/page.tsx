'use client';

import ComingSoon from '@/components/ComingSoon';
import { Wallet } from 'lucide-react';

export default function WalletPage() {
  return (
    <ComingSoon
      title="Digital Wallet"
      description="Manage your AFU digital wallet, view balances, and make peer-to-peer transfers. The wallet will integrate with mobile money providers across all 20 countries."
      backLink="/dashboard"
      backLabel="Back to Dashboard"
      icon={<Wallet className="w-8 h-8 text-[#5DB347]" />}
    />
  );
}
