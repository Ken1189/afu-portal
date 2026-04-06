'use client';

import Link from 'next/link';
import { Lock, ArrowUpRight } from 'lucide-react';
import { hasFeatureAccess, getTierName, getUpgradeTier, type FeatureKey } from '@/lib/tier-permissions';

// Pricing info for upgrade prompts
const TIER_PRICING: Record<string, string> = {
  smallholder: '$4.99/mo',
  commercial: '$49/mo',
  enterprise: 'Contact us',
};

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
  const upgradePrice = upgradeTo ? TIER_PRICING[upgradeTo] : null;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">
        Upgrade to Access This Feature
      </h3>
      <p className="text-gray-500 text-sm max-w-md mb-4">
        This feature is available on the {upgradeName} plan and above.
      </p>
      {upgradeTo && upgradePrice && (
        <div className="bg-[#EBF7E5] border border-[#5DB347]/20 rounded-xl px-6 py-4 mb-6 max-w-sm">
          <p className="text-sm font-semibold text-[#1B2A4A]">
            {upgradeName} Plan
          </p>
          <p className="text-lg font-bold text-[#5DB347]">{upgradePrice}</p>
          <p className="text-xs text-gray-500 mt-1">Unlock this feature and more</p>
        </div>
      )}
      <Link
        href={`/memberships${upgradeTo ? `?upgrade=${upgradeTo}` : ''}`}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#5DB347] to-[#449933] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-[#5DB347]/20"
      >
        Upgrade to {upgradeName}
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
