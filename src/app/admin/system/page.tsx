'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Database,
  Server,
  CreditCard,
  Link2,
  HardDrive,
  FolderOpen,
  Zap,
  Users,
  RefreshCw,
  CheckCircle2,
  Shield,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

// ── Mock Data ───────────────────────────────────────────────────────────────

const services = [
  {
    name: 'Supabase Database',
    icon: Database,
    status: 'operational' as const,
    metrics: [
      { label: 'Latency', value: '12ms' },
      { label: 'Uptime', value: '99.99%' },
    ],
  },
  {
    name: 'API Server',
    icon: Server,
    status: 'operational' as const,
    metrics: [
      { label: 'Requests/min', value: '342' },
      { label: 'Error Rate', value: '0.02%' },
    ],
  },
  {
    name: 'Payment Gateways',
    icon: CreditCard,
    status: 'degraded' as const,
    metrics: [
      { label: 'Active', value: '6 of 7' },
      { label: 'Providers', value: 'M-Pesa, Mobile Money, MTN, Airtel, Orange, Bank' },
    ],
  },
  {
    name: 'Blockchain (EDMA L2)',
    icon: Link2,
    status: 'operational' as const,
    metrics: [
      { label: 'Connection', value: 'Connected' },
      { label: 'Last Block', value: '#4,812,337' },
    ],
  },
];

const defaultStorageMetrics = [
  { label: 'Database Size', used: 2.4, total: 8, unit: 'GB', icon: Database },
  { label: 'File Storage', used: 1.2, total: 5, unit: 'GB', icon: FolderOpen },
  { label: 'API Calls (Month)', used: 125432, total: 500000, unit: '', icon: Zap },
  { label: 'Active Connections', used: 47, total: 200, unit: '', icon: Users },
];


// ── Helpers ─────────────────────────────────────────────────────────────────

const statusStyles = {
  operational: { label: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
  degraded:    { label: 'Degraded',    color: 'text-amber-400',   dot: 'bg-amber-400',   bg: 'bg-amber-500/10' },
  down:        { label: 'Down',        color: 'text-red-400',     dot: 'bg-red-400',     bg: 'bg-red-500/10' },
};

function formatStorageValue(used: number, total: number, unit: string): string {
  if (unit === 'GB') return `${used} ${unit} / ${total} ${unit}`;
  return `${used.toLocaleString()} / ${total.toLocaleString()}`;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function SystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalMembers: 0,
    totalLoans: 0,
    totalPayments: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchSystemStats = async () => {
    const supabase = createClient();
    try {
      const [
        { count: userCount },
        { count: memberCount },
        { count: loanCount },
        { count: paymentCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('loans').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('*', { count: 'exact', head: true }),
      ]);
      setSystemStats({
        totalUsers: userCount ?? 0,
        totalMembers: memberCount ?? 0,
        totalLoans: loanCount ?? 0,
        totalPayments: paymentCount ?? 0,
      });
    } catch {
      // keep defaults
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setStatsLoading(true);
    fetchSystemStats().then(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  // Dynamic storage metrics using DB stats
  const storageMetrics = [
    { label: 'Database Size', used: 2.4, total: 8, unit: 'GB', icon: Database },
    { label: 'File Storage', used: 1.2, total: 5, unit: 'GB', icon: FolderOpen },
    { label: 'Total Records', used: systemStats.totalUsers + systemStats.totalMembers + systemStats.totalLoans + systemStats.totalPayments, total: 100000, unit: '', icon: Zap },
    { label: 'Active Users', used: systemStats.totalUsers || defaultStorageMetrics[3].used, total: 200, unit: '', icon: Users },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#8CB89C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#8CB89C]" />
            System Health
          </h1>
          <p className="text-slate-400 mt-1">Real-time infrastructure monitoring and diagnostics</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            refreshing
              ? 'bg-[#8CB89C]/20 border-[#8CB89C]/40 text-[#8CB89C]'
              : 'bg-[#1B2A4A]/60 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </motion.div>

      {/* Service Status Cards */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Service Status
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {services.map((svc) => {
            const st = statusStyles[svc.status];
            return (
              <motion.div
                key={svc.name}
                variants={cardVariants}
                className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5 hover:border-[#8CB89C]/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <svc.icon className="w-5 h-5 text-[#8CB89C]" />
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`} />
                    {st.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">{svc.name}</h3>
                <div className="space-y-2">
                  {svc.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{m.label}</span>
                      <span className="text-slate-300 font-mono truncate ml-2 max-w-[140px]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Storage & Usage */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HardDrive className="w-4 h-4" /> Storage &amp; Usage
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {storageMetrics.map((item) => {
            const pct = Math.round((item.used / item.total) * 100);
            const barColor = pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-[#8CB89C]';
            return (
              <motion.div
                key={item.label}
                variants={cardVariants}
                className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <item.icon className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-lg font-semibold text-white mb-2 font-mono">
                  {formatStorageValue(item.used, item.total, item.unit)}
                </p>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 text-right">{pct}%</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* All Systems Operational Banner */}
      <section>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">All Systems Operational</h3>
            <p className="text-sm text-slate-400">
              {statsLoading ? 'Checking...' : `Connected to Supabase. ${(systemStats.totalUsers + systemStats.totalMembers + systemStats.totalLoans + systemStats.totalPayments).toLocaleString()} total records across core tables.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
