'use client';

import { motion } from 'framer-motion';
import {
  Zap, Wheat, TreePine, Rabbit, UsersRound, ShoppingBag,
  Shield, CreditCard, Ship, Scale, Stethoscope, Warehouse,
  Brain, Leaf, Coins, ArrowLeftRight, Handshake, Truck, Clock,
} from 'lucide-react';
import { COMING_SOON_FEATURES } from '@/lib/farmer-tiers';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wheat, TreePine, Rabbit, UsersRound, ShoppingBag,
  Shield, CreditCard, Ship, Scale, Stethoscope, Warehouse,
  Brain, Leaf, Coins, ArrowLeftRight, Handshake, Truck,
};

export default function ComingSoonPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Coming Soon</h1>
            <p className="text-sm text-gray-500">Features we are building for you</p>
          </div>
        </div>
        <div className="bg-[#5DB347]/5 border border-[#5DB347]/20 rounded-xl p-4 mt-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#5DB347] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1B2A4A]">We are working hard to bring you these features</p>
              <p className="text-xs text-gray-500 mt-1">
                AFU is building Africa&apos;s most comprehensive farming platform. These features are in active
                development and will be rolled out progressively. Your feedback helps us prioritise what comes next.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMING_SOON_FEATURES.map((feature, i) => {
          const Icon = ICON_MAP[feature.icon] || Zap;
          return (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-[#5DB347]/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-[#5DB347]/10 flex items-center justify-center transition-colors">
                  <Icon className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#5DB347] transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1B2A4A]">{feature.label}</h3>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback CTA */}
      <div className="mt-10 bg-gradient-to-r from-[#1B2A4A] to-[#243556] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">What should we build next?</h2>
        <p className="text-sm text-white/60 mb-5 max-w-md mx-auto">
          Your input shapes our roadmap. Let us know which features matter most to your farm.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Share Your Feedback
        </a>
      </div>
    </div>
  );
}
