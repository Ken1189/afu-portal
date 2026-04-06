'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, Sprout, DollarSign, GraduationCap, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react';

const FEATURES: Record<string, { icon: typeof Shield; title: string; description: string; benefits: string[] }> = {
  insurance: {
    icon: Shield,
    title: 'Crop & Farm Insurance',
    description: 'Protect your harvest with traditional and parametric insurance designed for African farmers.',
    benefits: ['Automatic weather-triggered payouts', 'Payout within 5 days', 'Coverage from $100 to $25,000', 'Premiums from 3.5% of coverage'],
  },
  financing: {
    icon: DollarSign,
    title: 'Agricultural Financing',
    description: 'Access input finance, crop development loans, and trade finance with repayment tied to harvest.',
    benefits: ['Interest from 8% per season', 'Approval within 48 hours', 'No traditional collateral needed', 'Repay after harvest'],
  },
  training: {
    icon: GraduationCap,
    title: 'Training & Knowledge',
    description: 'Learn modern farming techniques, financial literacy, and business planning from African agriculture experts.',
    benefits: ['Free courses on the free tier', 'Certificate on completion', 'Expert-led content', 'Available on mobile'],
  },
  marketplace: {
    icon: ShoppingCart,
    title: 'Agricultural Marketplace',
    description: 'Buy seeds, fertilizer, equipment, and more from verified suppliers with member discounts.',
    benefits: ['Up to 15% member discount', 'Verified suppliers only', 'Delivery across 9 countries', 'Input finance available'],
  },
  default: {
    icon: Sprout,
    title: 'AFU Platform Access',
    description: 'Join the African Farming Union to access financing, insurance, marketplace, training, and trading services.',
    benefits: ['Free tier available', 'No commitment required', 'Access from any device', 'Support across 9 countries'],
  },
};

export default function JoinPage() {
  const searchParams = useSearchParams();
  const feature = searchParams.get('feature') || 'default';
  const redirect = searchParams.get('redirect') || '/dashboard';

  const info = FEATURES[feature] || FEATURES.default;
  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B2A4A] to-[#2A3F6A] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#5DB347]/20 flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-[#5DB347]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">{info.title}</h1>
            <p className="text-white/60 text-sm">{info.description}</p>
          </div>

          {/* Benefits */}
          <div className="p-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">What you get</h2>
            <ul className="space-y-3 mb-8">
              {info.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5DB347] flex-shrink-0" />
                  <span className="text-sm text-gray-700">{b}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="space-y-3">
              <Link
                href={`/apply?tier=free`}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-bold text-sm transition-colors"
                style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
              >
                Join Free <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/memberships"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[#1B2A4A] font-bold text-sm border-2 border-gray-200 hover:border-[#5DB347] transition-colors"
              >
                View All Plans
              </Link>

              <Link
                href="/login"
                className="block text-center text-sm text-gray-400 hover:text-[#5DB347] transition-colors pt-2"
              >
                Already a member? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
