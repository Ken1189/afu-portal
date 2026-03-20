'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Shield,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface InsuranceRecord {
  id: string;
  policyNumber: string;
  memberName: string;
  productType: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'pending-claim' | 'expired' | 'claimed';
  expiryDate: string;
}

type StatusFilter = 'all' | 'active' | 'pending-claim' | 'expired';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const FALLBACK_POLICIES: InsuranceRecord[] = [
  { id: 'INS-001', policyNumber: 'POL-2026-0041', memberName: 'Grace Moyo', productType: 'Crop Insurance', coverageAmount: 120000, premium: 3600, status: 'active', expiryDate: '2026-12-31' },
  { id: 'INS-002', policyNumber: 'POL-2026-0042', memberName: 'Tendai Chirwa', productType: 'Livestock Insurance', coverageAmount: 85000, premium: 2550, status: 'active', expiryDate: '2026-09-15' },
  { id: 'INS-003', policyNumber: 'POL-2026-0043', memberName: 'Amina Salim', productType: 'Crop Insurance', coverageAmount: 200000, premium: 6000, status: 'pending-claim', expiryDate: '2026-11-30' },
  { id: 'INS-004', policyNumber: 'POL-2025-0038', memberName: 'Baraka Mushi', productType: 'Weather Index', coverageAmount: 50000, premium: 1500, status: 'expired', expiryDate: '2026-01-15' },
  { id: 'INS-005', policyNumber: 'POL-2026-0044', memberName: 'Farai Ndlovu', productType: 'Equipment Insurance', coverageAmount: 75000, premium: 2250, status: 'active', expiryDate: '2027-01-31' },
  { id: 'INS-006', policyNumber: 'POL-2026-0045', memberName: 'Kago Setshedi', productType: 'Crop Insurance', coverageAmount: 95000, premium: 2850, status: 'active', expiryDate: '2026-10-20' },
  { id: 'INS-007', policyNumber: 'POL-2026-0046', memberName: 'John Maseko', productType: 'Livestock Insurance', coverageAmount: 60000, premium: 1800, status: 'pending-claim', expiryDate: '2026-08-31' },
  { id: 'INS-008', policyNumber: 'POL-2025-0035', memberName: 'Halima Mwanga', productType: 'Weather Index', coverageAmount: 40000, premium: 1200, status: 'expired', expiryDate: '2025-12-31' },
  { id: 'INS-009', policyNumber: 'POL-2026-0047', memberName: 'Nyasha Mutasa', productType: 'Crop Insurance', coverageAmount: 150000, premium: 4500, status: 'active', expiryDate: '2026-12-15' },
  { id: 'INS-010', policyNumber: 'POL-2026-0048', memberName: 'Rumbidzai Chikore', productType: 'Equipment Insurance', coverageAmount: 30000, premium: 900, status: 'active', expiryDate: '2027-02-28' },
  { id: 'INS-011', policyNumber: 'POL-2026-0049', memberName: 'Tinashe Gumbo', productType: 'Livestock Insurance', coverageAmount: 110000, premium: 3300, status: 'claimed', expiryDate: '2026-07-31' },
  { id: 'INS-012', policyNumber: 'POL-2026-0050', memberName: 'Grace Moyo', productType: 'Weather Index', coverageAmount: 45000, premium: 1350, status: 'active', expiryDate: '2026-11-15' },
];

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  'pending-claim': 'bg-amber-100 text-amber-700',
  expired: 'bg-gray-100 text-gray-500',
  claimed: 'bg-blue-100 text-blue-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  'pending-claim': 'Pending Claim',
  expired: 'Expired',
  claimed: 'Claimed',
};

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function InsuranceOverviewPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    let result = [...FALLBACK_POLICIES];
    if (statusFilter !== 'all') result = result.filter((p) => p.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.policyNumber.toLowerCase().includes(q) ||
          p.memberName.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, statusFilter]);

  const activePolicies = FALLBACK_POLICIES.filter((p) => p.status === 'active').length;
  const totalCoverage = FALLBACK_POLICIES.filter((p) => p.status === 'active').reduce((s, p) => s + p.coverageAmount, 0);
  const pendingClaims = FALLBACK_POLICIES.filter((p) => p.status === 'pending-claim').length;
  const claimsPaidMonth = FALLBACK_POLICIES.filter((p) => p.status === 'claimed').reduce((s, p) => s + p.coverageAmount, 0);

  const summaryCards = [
    { label: 'Active Policies', value: activePolicies.toString(), icon: <Shield className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Total Coverage', value: formatCurrency(totalCoverage), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Pending Claims', value: pendingClaims.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Claims Paid (Month)', value: formatCurrency(claimsPaidMonth), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending-claim', label: 'Pending Claims' },
    { key: 'expired', label: 'Expired' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-2xl font-bold text-navy">Insurance Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Insurance policies across all member farms</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by policy number, member, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {FALLBACK_POLICIES.length} policies</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Policy #</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Coverage</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Premium</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((pol) => (
                <tr key={pol.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-500">{pol.policyNumber}</td>
                  <td className="py-3 px-4 font-medium text-navy">{pol.memberName}</td>
                  <td className="py-3 px-4 text-gray-500">{pol.productType}</td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{formatCurrency(pol.coverageAmount)}</td>
                  <td className="py-3 px-4 text-right tabular-nums text-gray-600">{formatCurrency(pol.premium)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pol.status]}`}>
                      {pol.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                      {pol.status === 'pending-claim' && <Clock className="w-3 h-3" />}
                      {statusLabels[pol.status] || pol.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{pol.expiryDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No policies match your filters</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
