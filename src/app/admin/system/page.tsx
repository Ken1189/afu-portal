'use client';

import { useState } from 'react';
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
  AlertTriangle,
  Clock,
  RefreshCw,
  Bell,
  BarChart3,
  CheckCircle2,
  XCircle,
  Timer,
  Key,
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
      { label: 'Providers', value: 'M-Pesa, EcoCash, MTN, Airtel, Orange, Bank' },
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

const storageMetrics = [
  { label: 'Database Size', used: 2.4, total: 8, unit: 'GB', icon: Database },
  { label: 'File Storage', used: 1.2, total: 5, unit: 'GB', icon: FolderOpen },
  { label: 'API Calls (Month)', used: 125432, total: 500000, unit: '', icon: Zap },
  { label: 'Active Connections', used: 47, total: 200, unit: '', icon: Users },
];

const recentErrors = [
  { id: 1, timestamp: '2026-03-19 14:32:05', endpoint: '/api/payments/process', status: 502, message: 'Payment gateway timeout — MTN MoMo Nigeria' },
  { id: 2, timestamp: '2026-03-19 13:18:42', endpoint: '/api/members/verify', status: 422, message: 'Invalid KYC document format for member MZ-4421' },
  { id: 3, timestamp: '2026-03-19 11:05:19', endpoint: '/api/loans/disburse', status: 500, message: 'Insufficient float balance in ZMW disbursement pool' },
  { id: 4, timestamp: '2026-03-19 09:47:33', endpoint: '/api/auth/refresh', status: 401, message: 'Expired refresh token for admin session A-2847' },
  { id: 5, timestamp: '2026-03-18 23:12:08', endpoint: '/api/blockchain/submit', status: 503, message: 'EDMA L2 node temporarily unreachable — retry succeeded' },
];

const backgroundJobs = [
  { name: 'Credit Score Recalculation', lastRun: '2026-03-19 06:00', nextRun: '2026-03-20 06:00', status: 'completed' as const },
  { name: 'Payment Reconciliation', lastRun: '2026-03-19 12:00', nextRun: '2026-03-19 18:00', status: 'completed' as const },
  { name: 'Price Alert Checks', lastRun: '2026-03-19 14:30', nextRun: '2026-03-19 14:45', status: 'running' as const },
  { name: 'Notification Queue', lastRun: '2026-03-19 14:35', nextRun: 'Continuous', status: 'running' as const, pending: 23, processing: 4 },
];

const topConsumers = [
  { key: 'afk_mobile_app_v3', requests: 48210, pct: 38.4 },
  { key: 'web_portal_prod', requests: 31840, pct: 25.4 },
  { key: 'partner_api_ecoCash', requests: 18920, pct: 15.1 },
  { key: 'internal_cron_jobs', requests: 14650, pct: 11.7 },
  { key: 'admin_dashboard', requests: 11812, pct: 9.4 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusStyles = {
  operational: { label: 'Operational', color: 'text-emerald-400', dot: 'bg-emerald-400', bg: 'bg-emerald-500/10' },
  degraded:    { label: 'Degraded',    color: 'text-amber-400',   dot: 'bg-amber-400',   bg: 'bg-amber-500/10' },
  down:        { label: 'Down',        color: 'text-red-400',     dot: 'bg-red-400',     bg: 'bg-red-500/10' },
};

const jobStatusStyles = {
  completed: { label: 'Completed', color: 'text-emerald-400', icon: CheckCircle2 },
  running:   { label: 'Running',   color: 'text-[#8CB89C]',   icon: RefreshCw },
  failed:    { label: 'Failed',    color: 'text-red-400',     icon: XCircle },
};

function formatStorageValue(used: number, total: number, unit: string): string {
  if (unit === 'GB') return `${used} ${unit} / ${total} ${unit}`;
  return `${used.toLocaleString()} / ${total.toLocaleString()}`;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function SystemHealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

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

      {/* Recent Errors */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Recent Errors
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Endpoint</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody>
                {recentErrors.map((err) => (
                  <tr key={err.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-400 whitespace-nowrap">
                      <Clock className="w-3 h-3 inline mr-1.5 opacity-50" />
                      {err.timestamp}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[#8CB89C] whitespace-nowrap">{err.endpoint}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${
                        err.status >= 500
                          ? 'bg-red-500/10 text-red-400'
                          : err.status >= 400
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {err.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-300 max-w-xs truncate">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* Background Jobs */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Timer className="w-4 h-4" /> Background Jobs
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {backgroundJobs.map((job) => {
            const jst = jobStatusStyles[job.status];
            const JIcon = jst.icon;
            return (
              <motion.div
                key={job.name}
                variants={cardVariants}
                className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{job.name}</h3>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${jst.color}`}>
                    <JIcon className={`w-3.5 h-3.5 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                    {jst.label}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Run</span>
                    <span className="text-slate-300 font-mono">{job.lastRun}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Next Run</span>
                    <span className="text-slate-300 font-mono">{job.nextRun}</span>
                  </div>
                  {'pending' in job && (
                    <div className="flex justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-500">Queue</span>
                      <span className="text-slate-300">
                        <span className="text-[#D4A843]">{job.pending}</span> pending &middot;{' '}
                        <span className="text-[#8CB89C]">{job.processing}</span> processing
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Rate Limiting */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" /> Rate Limiting &amp; Top Consumers
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Utilization Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Requests per Minute (Last 10 min)</h3>
            <div className="space-y-2.5">
              {[
                { time: '14:35', rpm: 342 },
                { time: '14:34', rpm: 318 },
                { time: '14:33', rpm: 356 },
                { time: '14:32', rpm: 290 },
                { time: '14:31', rpm: 375 },
                { time: '14:30', rpm: 310 },
                { time: '14:29', rpm: 268 },
                { time: '14:28', rpm: 345 },
                { time: '14:27', rpm: 398 },
                { time: '14:26', rpm: 312 },
              ].map((row) => {
                const pct = Math.round((row.rpm / 500) * 100);
                return (
                  <div key={row.time} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-12">{row.time}</span>
                    <div className="flex-1 h-4 bg-slate-700/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          pct > 80 ? 'bg-red-400' : pct > 60 ? 'bg-amber-400' : 'bg-[#8CB89C]'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-400 w-10 text-right">{row.rpm}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-3">Limit: 500 req/min &middot; Current: 342 req/min (68%)</p>
          </motion.div>

          {/* Top Consumers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Top API Consumers</h3>
            <div className="space-y-3">
              {topConsumers.map((consumer, i) => (
                <div key={consumer.key} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 w-5 text-center">{i + 1}</span>
                  <Key className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-300 truncate">{consumer.key}</span>
                      <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{consumer.requests.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${consumer.pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-[#D4A843]"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#D4A843] w-12 text-right">{consumer.pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">Total: 125,432 requests this month</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
