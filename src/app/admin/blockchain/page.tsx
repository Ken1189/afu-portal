'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Coins,
  Users,
  TrendingUp,
  Gift,
  Lock,
  ShieldCheck,
  AlertCircle,
  Activity,
  Layers,
  Package,
  FileCode2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  EDM_TOKEN,
  EDSD_TOKEN,
  STAKING_CONTRACT,
  REFERRAL_CONTRACT,
  COMMODITY_TOKEN,
  STAKING_TIERS,
  TOKENOMICS,
  ZERO_ADDRESS,
  EDM_PRESALE_PRICE,
} from '@/lib/blockchain/config';

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Helpers ──
function isDeployed(address: string) {
  return address !== ZERO_ADDRESS;
}

function shortAddress(address: string) {
  if (!isDeployed(address)) return 'Not Deployed';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ── Static data ──
const tokenomicsColors: Record<string, string> = {
  Presale: 'bg-[#1B2A4A]',
  Staking: 'bg-[#8CB89C]',
  Liquidity: 'bg-[#D4A843]',
  Treasury: 'bg-blue-500',
  Marketing: 'bg-purple-500',
  Team: 'bg-pink-500',
  Giveaway: 'bg-orange-400',
};

const stakingLockDays: Record<string, number> = {
  presale: 30,
  '3month': 90,
  '6month': 180,
  '12month': 365,
  '24month': 730,
};

const stakingMonthlyReward: Record<string, number> = {
  presale: 2,
  '3month': 3,
  '6month': 4,
  '12month': 5,
  '24month': 6,
};

const contracts = [
  {
    name: 'EDM Token',
    description: 'ERC-20 governance & utility token',
    address: EDM_TOKEN.address,
    icon: <Coins className="w-4 h-4" />,
  },
  {
    name: 'EDSD Token',
    description: 'ERC-20 settlement stablecoin',
    address: EDSD_TOKEN.address,
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    name: 'Staking',
    description: 'Lock EDM and earn rewards',
    address: STAKING_CONTRACT.address,
    icon: <Lock className="w-4 h-4" />,
  },
  {
    name: 'Referral',
    description: '10% cashback referral program',
    address: REFERRAL_CONTRACT.address,
    icon: <Gift className="w-4 h-4" />,
  },
  {
    name: 'Commodity Token (ERC-1155)',
    description: 'Real-world asset tokenization',
    address: COMMODITY_TOKEN.address,
    icon: <Package className="w-4 h-4" />,
  },
];

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminBlockchainPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">EDMA Blockchain</h1>
              <p className="text-gray-500 text-sm mt-0.5">Token, staking, referral & RWA tokenization</p>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Contracts pending deployment
        </div>
      </motion.div>

      {/* ── Stats Cards Row ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* EDM Token Price */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center text-[#1B2A4A]">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.5%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">${EDM_PRESALE_PRICE.toFixed(3)}</p>
          <p className="text-xs text-gray-400 mt-0.5">EDM Token Price (Presale)</p>
        </div>

        {/* Total Staked */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#8CB89C]/10 rounded-lg flex items-center justify-center text-[#8CB89C]">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">0 EDM</p>
          <p className="text-xs text-gray-400 mt-0.5">Total Staked</p>
          <p className="text-[10px] text-gray-300 mt-1">Will show real data when contracts deployed</p>
        </div>

        {/* Active Stakers */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-[#D4A843]/10 rounded-lg flex items-center justify-center text-[#D4A843]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">0</p>
          <p className="text-xs text-gray-400 mt-0.5">Active Stakers</p>
          <p className="text-[10px] text-gray-300 mt-1">members</p>
        </div>

        {/* Referral Cashback */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">$0</p>
          <p className="text-xs text-gray-400 mt-0.5">Referral Cashback Paid</p>
        </div>
      </motion.div>

      {/* ── Token Overview ── */}
      <motion.div variants={cardVariants}>
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2">
          <Coins className="w-4 h-4" /> Token Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* EDM Token */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">EDM</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">EDM Token</h3>
                <p className="text-xs text-gray-400">EDMA Token</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Supply', value: '500,000,000' },
                { label: 'Token Type', value: 'ERC-20' },
                { label: 'Network', value: 'EDMA L2' },
                { label: 'Presale Allocation', value: '44%' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-[#1B2A4A]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* EDSD Settlement Token */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#8CB89C] rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">EDSD</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">EDSD Settlement Token</h3>
                <p className="text-xs text-gray-400">EDMA Settlement Dollar</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Token Type', value: 'Stablecoin ERC-20' },
                { label: 'Purpose', value: 'Cross-border settlement' },
                { label: 'Backing', value: 'Reserve-backed' },
                { label: 'Network', value: 'EDMA L2' },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-[#1B2A4A]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Staking Tiers Table ── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Staking Tiers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tier</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Lock Period</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Monthly Reward</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Min Stake</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {STAKING_TIERS.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-[#1B2A4A]">{tier.label}</div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {stakingLockDays[tier.id]} days
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-[#8CB89C]">{stakingMonthlyReward[tier.id]}% / month</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {tier.minStake.toLocaleString()} EDM
                  </td>
                  <td className="py-3">
                    {tier.active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Post-Presale
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Tokenomics Allocation ── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4" /> Tokenomics Allocation
        </h2>
        <div className="space-y-3">
          {TOKENOMICS.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${tokenomicsColors[item.category] ?? 'bg-gray-400'}`}
                  />
                  <span className="text-gray-600 font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{item.allocation.toLocaleString()} EDM</span>
                  <span className="font-semibold text-[#1B2A4A] w-8 text-right">{item.percent}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${tokenomicsColors[item.category] ?? 'bg-gray-400'} transition-all`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-4">Total Supply: 500,000,000 EDM</p>
      </motion.div>

      {/* ── Recent On-Chain Activity ── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Recent On-Chain Activity
        </h2>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-8 mb-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Activity className="w-8 h-8 text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-medium">No activity yet</p>
          <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
            Activity will appear here once EDMA L2 contracts are deployed
          </p>
        </div>

        {/* Placeholder table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Type', 'From', 'To', 'Amount', 'TX Hash'].map((col) => (
                  <th
                    key={col}
                    className="text-left py-2 pr-4 font-semibold text-gray-400 uppercase tracking-wide"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-300 text-xs italic">
                  — No transactions recorded —
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Smart Contract Status ── */}
      <motion.div variants={cardVariants}>
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-3 flex items-center gap-2">
          <FileCode2 className="w-4 h-4" /> Smart Contract Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {contracts.map((contract) => {
            const deployed = isDeployed(contract.address);
            return (
              <div
                key={contract.name}
                className={`bg-white rounded-xl border p-4 ${
                  deployed ? 'border-green-100' : 'border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      deployed
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {contract.icon}
                  </div>
                  {deployed ? (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Deployed
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertCircle className="w-2.5 h-2.5" /> Pending
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#1B2A4A] leading-tight">{contract.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-2">{contract.description}</p>
                <p
                  className={`text-[10px] font-mono break-all ${
                    deployed ? 'text-green-600' : 'text-gray-300'
                  }`}
                >
                  {shortAddress(contract.address)}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── RWA Tokenization Overview ── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
          <Package className="w-4 h-4" /> RWA Tokenization Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#1B2A4A]">0</p>
            <p className="text-xs text-gray-400 mt-1">Assets Tokenized</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#8CB89C]">$0</p>
            <p className="text-xs text-gray-400 mt-1">Total Value (USD)</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#D4A843]">0</p>
            <p className="text-xs text-gray-400 mt-1">Pending Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-600">
            RWA tokenization via the ERC-1155 Commodity Token contract will be available once the EDMA L2
            network and contracts are deployed. Tokenized assets will include agricultural commodities,
            minerals, and trade receivables.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}
