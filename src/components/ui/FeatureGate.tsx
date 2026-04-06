'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { hasFeatureAccess, getTierName, getUpgradeTier, type FeatureKey } from '@/lib/tier-permissions';

interface FeatureGateProps {
  feature: FeatureKey;
  tier: string | null | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional custom locked message
}

export default function FeatureGate({ feature, tier, children, fallback }: FeatureGateProps) {
  if (hasFeatureAccess(tier, feature)) {
    return <>{children}</>;
  }

  const upgradeTo = getUpgradeTier(tier);
  const upgradeName = upgradeTo ? getTierName(upgradeTo) : 'a higher';

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
        Upgrade to Access This Feature
      </h3>
      <p className="text-gray-500 text-sm max-w-md mb-6">
        This feature is available on the {upgradeName} plan and above.
        Upgrade your membership to unlock it.
      </p>
      <Link
        href="/memberships"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
      >
        View Plans
      </Link>
    </div>
  );
}
