'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  Coins,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useWallet, useBalances, EDM_TOKEN, EDM_PRESALE_PRICE, BUY_EDM_URL, EDMA_CHAIN } from '@/lib/blockchain/hooks';

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

export default function WalletPage() {
  const { address, shortAddress, isConnected, isConnecting, error, connect, disconnect } = useWallet();
  const { eth, edm, loading: balanceLoading, refetch } = useBalances(address);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const edmValue = parseFloat(edm) * EDM_PRESALE_PRICE;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">EDMA Wallet</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your EDM tokens and EDMA network assets</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/staking"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Coins className="w-4 h-4" />
            Stake EDM
          </Link>
          <a
            href={BUY_EDM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Zap className="w-4 h-4" />
            Buy $EDM
          </a>
        </div>
      </motion.div>

      {/* Connect Wallet Card */}
      {!isConnected ? (
        <motion.div variants={card} className="bg-gradient-to-br from-navy via-navy to-[#1a3a6a] rounded-2xl p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
            Connect your MetaMask or Web3 wallet to view your EDM balance, stake tokens, and participate in the EDMA ecosystem.
          </p>
          <button
            onClick={connect}
            disabled={isConnecting}
            className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          {error && (
            <p className="mt-4 text-red-300 text-sm">{error}</p>
          )}
          <p className="mt-4 text-gray-400 text-xs">
            Don&apos;t have EDM yet?{' '}
            <a href={BUY_EDM_URL} target="_blank" rel="noopener noreferrer" className="text-[#FF4500] hover:underline">
              Buy $EDM at ${EDM_PRESALE_PRICE}
            </a>
          </p>
        </motion.div>
      ) : (
        <>
          {/* Wallet Overview */}
          <motion.div variants={card} className="bg-gradient-to-br from-navy via-navy to-[#1a3a6a] rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{shortAddress}</p>
                    <button onClick={copyAddress} className="text-gray-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={`${EDMA_CHAIN.blockExplorer}/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={refetch} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <RefreshCw className={`w-4 h-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={disconnect} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-white/20 rounded-lg transition-colors">
                  Disconnect
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">ETH Balance</p>
                <p className="text-2xl font-bold">{eth} ETH</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">EDM Balance</p>
                <p className="text-2xl font-bold">{edm} EDM</p>
                <p className="text-xs text-gray-400">≈ ${edmValue.toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Staked EDM</p>
                <p className="text-2xl font-bold">0 EDM</p>
                <Link href="/dashboard/staking" className="text-xs text-[#FF4500] hover:underline">Start staking →</Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Buy EDM', icon: <Zap className="w-5 h-5" />, href: BUY_EDM_URL, color: 'bg-[#FF4500]/10 text-[#FF4500]', external: true },
              { label: 'Stake EDM', icon: <Coins className="w-5 h-5" />, href: '/dashboard/staking', color: 'bg-teal/10 text-teal', external: false },
              { label: 'Send EDM', icon: <ArrowUpRight className="w-5 h-5" />, href: '#', color: 'bg-blue-50 text-blue-600', external: false },
              { label: 'Receive', icon: <ArrowDownLeft className="w-5 h-5" />, href: '#', color: 'bg-green-50 text-green-600', external: false },
            ].map((action, i) => (
              <motion.div key={i} variants={card}>
                {action.external ? (
                  <a href={action.href} target="_blank" rel="noopener noreferrer"
                    className="block bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-teal/20 transition-all text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      {action.icon}
                    </div>
                    <p className="text-sm font-semibold text-navy">{action.label}</p>
                  </a>
                ) : (
                  <Link href={action.href}
                    className="block bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-teal/20 transition-all text-center">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      {action.icon}
                    </div>
                    <p className="text-sm font-semibold text-navy">{action.label}</p>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* EDMA Info Cards */}
          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div variants={card} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#FF4500]/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#FF4500]" />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">EDM Presale</p>
                  <p className="text-xs text-gray-500">Current price</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">${EDM_PRESALE_PRICE}</p>
              <p className="text-xs text-gray-400 mt-1">per {EDM_TOKEN.symbol} token</p>
            </motion.div>

            <motion.div variants={card} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center">
                  <Coins className="w-5 h-5 text-teal" />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">Staking Reward</p>
                  <p className="text-xs text-gray-500">Presale period</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-navy">2% / month</p>
              <p className="text-xs text-gray-400 mt-1">Fixed rate during presale</p>
            </motion.div>

            <motion.div variants={card} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <p className="font-semibold text-navy text-sm">Proof of Verification</p>
                  <p className="text-xs text-gray-500">PoV Protocol</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Real-world assets verified before tokenization</p>
              <a href="https://edma.app" target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:underline mt-2 inline-flex items-center gap-1">
                Learn more <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
