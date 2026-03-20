'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  Gift,
  DollarSign,
  TrendingUp,
  Share2,
  ExternalLink,
  Zap,
  Wallet,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { BUY_EDM_URL, EDM_PRESALE_PRICE, REFERRAL_CONFIG } from '@/lib/blockchain/hooks';

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

interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalEarnings: number;
  pendingEarnings: number;
  recentReferrals: Array<{
    name: string;
    date: string;
    amount: number;
    reward: number;
    status: string;
  }>;
}

export default function ReferralPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [data, setData] = useState<ReferralData | null>(null);

  // Generate referral code from user ID or fetch from API
  useEffect(() => {
    if (user) {
      // For now, generate a code from user ID. In production, this comes from the DB.
      const code = user.id.slice(0, 8).toUpperCase();
      setData({
        referralCode: code,
        referralCount: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
        recentReferrals: [],
      });

      // Try to fetch real data
      fetch('/api/referral')
        .then(r => r.json())
        .then(d => { if (!d.error && d.referralCode) setData(d); })
        .catch(() => {});
    }
  }, [user]);

  const referralLink = data ? `https://afu-portal.vercel.app/apply?ref=${data.referralCode}` : '';
  const edmaReferralLink = `${BUY_EDM_URL}&afuRef=${data?.referralCode || ''}`;

  const copyCode = () => {
    if (data) {
      navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Referral Programme</h1>
          <p className="text-sm text-gray-500 mt-0.5">Earn rewards for every member and EDM buyer you refer</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Wallet className="w-4 h-4" />
            My Wallet
          </Link>
        </div>
      </motion.div>

      {/* Hero Banner */}
      <motion.div variants={card} className="bg-gradient-to-br from-[#FF4500] to-[#FF6B35] rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6" />
              <span className="text-sm font-semibold bg-white/20 px-3 py-0.5 rounded-full">Up to {REFERRAL_CONFIG.cashbackPercent}% Cashback</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Earn Rewards With Every Referral</h2>
            <p className="text-white/80 text-sm mb-4">
              Share your unique referral link. When someone joins AFU or buys $EDM through your link,
              you earn up to {REFERRAL_CONFIG.cashbackPercent}% cashback in USDT, ETH, or EDM.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyLink}
                className="bg-white text-[#FF4500] px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy Referral Link'}
              </button>
              <a
                href={edmaReferralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Share EDM Presale Link
              </a>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-5 text-center min-w-[200px]">
            <p className="text-xs text-white/60 mb-1">Your Referral Code</p>
            <div className="flex items-center justify-center gap-2">
              <p className="text-2xl font-mono font-bold tracking-wider">{data?.referralCode || '...'}</p>
              <button onClick={copyCode} className="text-white/60 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: data?.referralCount || 0, icon: <Users className="w-5 h-5" />, color: 'text-[#5DB347] bg-[#5DB347]/10' },
          { label: 'Total Earned', value: `$${(data?.totalEarnings || 0).toFixed(2)}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-600 bg-green-50' },
          { label: 'Pending', value: `$${(data?.pendingEarnings || 0).toFixed(2)}`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-600 bg-amber-50' },
          { label: 'Cashback Rate', value: `${REFERRAL_CONFIG.cashbackPercent}%`, icon: <Gift className="w-5 h-5" />, color: 'text-[#FF4500] bg-[#FF4500]/10' },
        ].map((stat, i) => (
          <motion.div key={i} variants={card} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* How It Works */}
      <motion.div variants={card} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends, family, or your community.', icon: <Share2 className="w-5 h-5" /> },
            { step: '02', title: 'They Join or Buy', desc: 'When someone joins AFU or purchases $EDM through your link, the referral is tracked.', icon: <Users className="w-5 h-5" /> },
            { step: '03', title: 'Earn Cashback', desc: `Receive up to ${REFERRAL_CONFIG.cashbackPercent}% cashback in USDT, ETH, or EDM for every qualifying purchase.`, icon: <Gift className="w-5 h-5" /> },
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

      {/* Referral Tiers */}
      <motion.div variants={card} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Referral Tiers</h2>
        <div className="bg-gradient-to-r from-[#FF4500]/5 to-[#FF6B35]/5 rounded-xl p-6 border border-[#FF4500]/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-[#FF4500] rounded-xl flex items-center justify-center text-white">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{REFERRAL_CONFIG.cashbackPercent}% Cashback</p>
              <p className="text-sm text-gray-500">On every qualifying purchase of ${REFERRAL_CONFIG.minPurchase}+</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {REFERRAL_CONFIG.rewardTypes.map(type => (
              <span key={type} className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-navy border border-gray-200">
                Paid in {type}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Referrals (empty state or list) */}
      <motion.div variants={card} className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-navy mb-4">Recent Referrals</h2>
        {data?.recentReferrals && data.recentReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Referred</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Purchase</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Your Reward</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentReferrals.map((ref, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 font-medium text-navy">{ref.name}</td>
                    <td className="py-3 text-gray-500">{ref.date}</td>
                    <td className="py-3 text-right text-navy">${ref.amount}</td>
                    <td className="py-3 text-right font-semibold text-green-600">${ref.reward}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ref.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No referrals yet</p>
            <p className="text-xs text-gray-400 mb-4">Share your link to start earning rewards</p>
            <button onClick={copyLink} className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Copy Referral Link
            </button>
          </div>
        )}
      </motion.div>

      {/* CTA */}
      <motion.div variants={card} className="bg-navy rounded-2xl p-8 text-white text-center">
        <h2 className="text-xl font-bold mb-2">Double Your Earnings</h2>
        <p className="text-gray-300 text-sm mb-4 max-w-lg mx-auto">
          Refer friends to buy $EDM at the presale price of ${EDM_PRESALE_PRICE} and earn {REFERRAL_CONFIG.cashbackPercent}% cashback on every purchase.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href={edmaReferralLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Share EDM Presale Link
          </a>
          <Link
            href="/dashboard/wallet"
            className="border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2"
          >
            View Wallet <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
