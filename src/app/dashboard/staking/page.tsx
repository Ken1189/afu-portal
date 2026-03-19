'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Coins,
  Clock,
  TrendingUp,
  Lock,
  Unlock,
  Wallet,
  ExternalLink,
  Zap,
  Shield,
  Flame,
  Award,
} from 'lucide-react';
import { useWallet, useStaking, STAKING_TIERS, BUY_EDM_URL, EDM_PRESALE_PRICE, TOKENOMICS, EDMA_STAKING_URL } from '@/lib/blockchain/hooks';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

export default function StakingPage() {
  const { address, isConnected, connect } = useWallet();
  const staking = useStaking(address);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">EDM Staking</h1>
          <p className="text-sm text-gray-500 mt-0.5">Earn rewards while supporting the EDMA network</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Wallet className="w-4 h-4" />
            My Wallet
          </Link>
          <a
            href={BUY_EDM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Zap className="w-4 h-4" />
            Buy $EDM at ${EDM_PRESALE_PRICE}
          </a>
        </div>
      </motion.div>

      {/* My Staking Summary */}
      <motion.div variants={card} className="bg-gradient-to-br from-navy via-navy to-[#1a3a6a] rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-4">My Staking</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Staked</p>
            <p className="text-xl font-bold">{staking.stakedAmount} EDM</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Rewards Earned</p>
            <p className="text-xl font-bold text-green-400">{staking.rewardsEarned} EDM</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Current Tier</p>
            <p className="text-xl font-bold">{staking.currentTier || 'None'}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Status</p>
            <p className="text-xl font-bold">{staking.stakingStartDate ? 'Active' : 'Not Staking'}</p>
          </div>
        </div>
        {!isConnected && (
          <button
            onClick={connect}
            className="mt-4 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            Connect Wallet to Stake
          </button>
        )}
      </motion.div>

      {/* How It Works */}
      <motion.div variants={card} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">How Staking Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Connect Wallet', desc: 'Connect the wallet that holds your $EDM tokens', icon: <Wallet className="w-5 h-5" /> },
            { step: '02', title: 'Lock EDM', desc: 'Stake EDM for a fixed period to start earning', icon: <Lock className="w-5 h-5" /> },
            { step: '03', title: 'Earn 2% Monthly', desc: 'Earn 2% EDM rewards during the presale period', icon: <TrendingUp className="w-5 h-5" /> },
            { step: '04', title: 'Unstake & Claim', desc: 'Unlock your staked EDM along with rewards', icon: <Unlock className="w-5 h-5" /> },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-[#FF4500]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-[#FF4500]">{item.icon}</span>
              </div>
              <p className="text-[#FF4500] text-xs font-bold mb-1">{item.step}</p>
              <p className="font-semibold text-navy text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Staking Tiers */}
      <motion.div variants={fadeUp}>
        <h2 className="text-lg font-bold text-navy mb-4">Staking Tiers & Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAKING_TIERS.map((tier) => (
            <motion.div
              key={tier.id}
              variants={card}
              className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                tier.active ? 'border-[#FF4500] shadow-sm' : 'border-gray-100'
              }`}
            >
              {tier.active && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#FF4500] text-white px-2 py-0.5 rounded-full font-semibold mb-3">
                  <Zap className="w-3 h-3" /> Active Now
                </span>
              )}
              <h3 className="font-bold text-navy">{tier.label}</h3>
              <p className="text-xs text-gray-500 mb-4">{tier.duration}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">EDM Reward</span>
                  <span className="text-sm font-bold text-navy">{tier.edmReward}</span>
                </div>
                {tier.cleReward && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">CLE Reward</span>
                    <span className="text-sm font-bold text-teal">{tier.cleReward}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Min Stake</span>
                  <span className="text-sm font-medium text-gray-700">{tier.minStake.toLocaleString()} EDM</span>
                </div>
              </div>

              <a
                href={EDMA_STAKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  tier.active
                    ? 'bg-[#FF4500] hover:bg-[#FF4500]/90 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                {tier.active ? 'Stake Now' : 'Coming After Presale'}
              </a>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tokenomics */}
      <motion.div variants={card} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">EDM Tokenomics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {TOKENOMICS.map((item) => (
            <div key={item.category} className="bg-cream rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{item.category}</p>
              <p className="text-lg font-bold text-navy">{item.percent}%</p>
              <p className="text-[10px] text-gray-400">{formatNumber(item.allocation)}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Benefits */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <TrendingUp className="w-5 h-5" />, title: 'Passive Income', desc: 'Earn additional $EDM rewards just by staking', color: 'text-green-600 bg-green-50' },
          { icon: <Shield className="w-5 h-5" />, title: 'Network Security', desc: 'Locked tokens ensure network integrity and trust', color: 'text-navy bg-blue-50' },
          { icon: <Flame className="w-5 h-5" />, title: 'Deflationary', desc: '50% of fees burned until 100M supply reached', color: 'text-[#FF4500] bg-[#FF4500]/10' },
          { icon: <Award className="w-5 h-5" />, title: 'Exclusive Perks', desc: 'Long-term stakers receive governance rights', color: 'text-gold bg-amber-50' },
        ].map((benefit, i) => (
          <motion.div key={i} variants={card} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className={`w-10 h-10 ${benefit.color} rounded-xl flex items-center justify-center mb-3`}>
              {benefit.icon}
            </div>
            <h3 className="font-semibold text-navy text-sm mb-1">{benefit.title}</h3>
            <p className="text-xs text-gray-500">{benefit.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div variants={card} className="bg-gradient-to-r from-[#FF4500] to-[#FF6B35] rounded-2xl p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Join the EDMA Presale</h2>
        <p className="text-white/80 text-sm mb-4 max-w-lg mx-auto">
          Take $EDM today and earn 2% monthly while supporting renewable energy and real-world asset verification.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={BUY_EDM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#FF4500] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Buy $EDM at ${EDM_PRESALE_PRICE}
          </a>
          <a
            href="https://edma.app"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2"
          >
            Learn More <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
