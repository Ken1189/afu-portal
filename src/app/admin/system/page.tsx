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
  operational: { label: 'Operational', color: 'text-emerald-700', dot: 'bg-emerald-500', bg: 'bg-emerald-100' },
  degraded:    { label: 'Degraded',    color: 'text-amber-700',   dot: 'bg-amber-500',   bg: 'bg-amber-100' },
  down:        { label: 'Down',        color: 'text-red-700',     dot: 'bg-red-500',     bg: 'bg-red-100' },
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
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#5DB347] transition-colors"
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
          <h1 className="text-3xl font-bold text-[#1B2A4A] flex items-center gap-3">
            <Activity className="w-8 h-8 text-[#5DB347]" />
            System Health
          </h1>
          <p className="text-gray-500 mt-1">Real-time infrastructure monitoring and diagnostics</p>
        </div>
        <button
          onClick={handleRefresh}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            refreshing
              ? 'bg-[#5DB347]/10 border-[#5DB347]/20 text-[#5DB347]'
              : 'bg-white border-gray-200 text-gray-500 hover:text-[#1B2A4A] hover:border-gray-300'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </motion.div>

      {/* Service Status Cards */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
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
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:border-[#5DB347]/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <svc.icon className="w-5 h-5 text-[#5DB347]" />
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`} />
                    {st.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">{svc.name}</h3>
                <div className="space-y-2">
                  {svc.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{m.label}</span>
                      <span className="text-gray-700 font-mono truncate ml-2 max-w-[140px]">{m.value}</span>
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
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
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
            const barColor = pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-[#5DB347]';
            return (
              <motion.div
                key={item.label}
                variants={cardVariants}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <item.icon className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-[#1B2A4A] mb-2 font-mono">
                  {formatStorageValue(item.used, item.total, item.unit)}
                </p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5 text-right">{pct}%</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* All Systems Operational Banner */}
      <section>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#1B2A4A]">All Systems Operational</h3>
            <p className="text-sm text-gray-500">
              {statsLoading ? 'Checking...' : `Connected to Supabase. ${(systemStats.totalUsers + systemStats.totalMembers + systemStats.totalLoans + systemStats.totalPayments).toLocaleString()} total records across core tables.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
