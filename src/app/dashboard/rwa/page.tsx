'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  Shield,
  Package,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  Wallet,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useWallet } from '@/lib/blockchain/hooks';

/* ------------------------------------------------------------------ */
/* Mock tokenized assets                                               */
/* ------------------------------------------------------------------ */
const mockTokenizedAssets = [
  {
    id: 'tk-001',
    tokenId: 1001,
    commodity: 'Maize',
    icon: '\u{1F33D}',
    quantity: 50,
    unit: 'tonnes',
    grade: 'A',
    valueUsd: 12500,
    valuePer: 250,
    status: 'active' as const,
    tokenizedDate: '2026-01-15',
    farmPlot: 'North Field',
    txHash: '0x7f3b...4a2e',
    collateralizedFor: null as string | null,
  },
  {
    id: 'tk-002',
    tokenId: 1002,
    commodity: 'Sorghum',
    icon: '\u{1F33E}',
    quantity: 20,
    unit: 'tonnes',
    grade: 'B',
    valueUsd: 4800,
    valuePer: 240,
    status: 'active' as const,
    tokenizedDate: '2026-02-08',
    farmPlot: 'South Field',
    txHash: '0x2c9a...8f1d',
    collateralizedFor: 'LOAN-2026-003',
  },
  {
    id: 'tk-003',
    tokenId: 1003,
    commodity: 'Coffee',
    icon: '\u2615',
    quantity: 5,
    unit: 'tonnes',
    grade: 'A',
    valueUsd: 18750,
    valuePer: 3750,
    status: 'pending' as const,
    tokenizedDate: '2026-03-10',
    farmPlot: 'Highland Plot',
    txHash: null,
    collateralizedFor: null,
  },
];

/* ------------------------------------------------------------------ */
/* Animation                                                           */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function RwaPage() {
  const { t } = useLanguage();
  const { isConnected, shortAddress, connect } = useWallet();

  const stats = useMemo(() => {
    const active = mockTokenizedAssets.filter((a) => a.status === 'active');
    return {
      totalAssets: mockTokenizedAssets.length,
      activeAssets: active.length,
      totalValue: mockTokenizedAssets.reduce((s, a) => s + a.valueUsd, 0),
      collateralized: mockTokenizedAssets.filter((a) => a.collateralizedFor).length,
    };
  }, []);

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">Real World Assets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your tokenized agricultural commodities on the EDMA blockchain
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 text-teal text-xs font-semibold">
              <Wallet className="w-3.5 h-3.5" />
              {shortAddress}
            </div>
          ) : (
            <button
              onClick={connect}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy/90 transition-colors min-h-[40px]"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Assets', value: stats.totalAssets.toString(), icon: Layers, color: 'bg-blue-50 text-blue-600' },
          { label: 'Portfolio Value', value: `$${stats.totalValue.toLocaleString()}`, icon: TrendingUp, color: 'bg-teal/10 text-teal' },
          { label: 'Active Tokens', value: stats.activeAssets.toString(), icon: Coins, color: 'bg-green-50 text-green-600' },
          { label: 'As Collateral', value: stats.collateralized.toString(), icon: Shield, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">{stat.label}</p>
            <p className="text-lg font-bold text-navy">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Tokenized Assets List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-navy">Tokenized Commodities</h2>
          <Link
            href="/farm/tokenize"
            className="text-sm font-semibold text-teal hover:text-teal-dark transition-colors flex items-center gap-1"
          >
            Tokenize New
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {mockTokenizedAssets.map((asset) => (
            <motion.div
              key={asset.id}
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {asset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-navy text-sm">{asset.commodity}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      asset.status === 'active'
                        ? 'bg-teal/10 text-teal'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {asset.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                    {asset.collateralizedFor && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        Collateral
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Quantity</span>
                      <p className="font-semibold text-navy">{asset.quantity} {asset.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Token ID</span>
                      <p className="font-semibold text-navy">#{asset.tokenId}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Value</span>
                      <p className="font-semibold text-navy">${asset.valueUsd.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Grade</span>
                      <p className="font-semibold text-navy">{asset.grade}</p>
                    </div>
                  </div>
                  {asset.txHash && (
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-teal" />
                      TX: {asset.txHash}
                    </p>
                  )}
                  {!asset.txHash && (
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Awaiting admin verification
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-navy to-teal rounded-2xl p-5 sm:p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Tokenize Your Next Harvest</h3>
            <p className="text-sm opacity-85 mb-4 leading-relaxed">
              Convert your verified agricultural commodities into blockchain tokens. Use them as collateral
              for loans, trade on the marketplace, or hold for price appreciation.
            </p>
            <Link
              href="/farm/tokenize"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
            >
              <Coins className="w-4 h-4" />
              Start Tokenizing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
