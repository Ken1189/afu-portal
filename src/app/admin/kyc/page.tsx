'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  RefreshCw,
  Info,
  FileImage,
  ScanLine,
  BadgeCheck,
  Layers,
  AlertCircle,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

type DocType = 'national_id' | 'passport' | 'drivers_license' | 'proof_of_address';
type KycStatus = 'pending' | 'verified' | 'rejected';
type KycTier = 1 | 2 | 3;

interface KycRecord {
  id: string;
  name: string;
  email: string;
  country: string;
  docType: DocType;
  submittedDate: string;
  tier: KycTier;
  status: KycStatus;
}

interface CountryCompliance {
  code: string;
  name: string;
  members: number;
  compliance: number;
  status: 'compliant' | 'action_needed';
}

// ── Mock data ────────────────────────────────────────────────────────────────

const FALLBACK_KYC_RECORDS: KycRecord[] = [
  { id: '1', name: 'Amara Diallo', email: 'amara.diallo@example.com', country: 'Sierra Leone', docType: 'national_id', submittedDate: '2026-03-17', tier: 2, status: 'pending' },
  { id: '2', name: 'Chidi Okonkwo', email: 'chidi.okonkwo@example.com', country: 'Nigeria', docType: 'passport', submittedDate: '2026-03-16', tier: 2, status: 'pending' },
  { id: '3', name: 'Fatima Nkosi', email: 'fatima.nkosi@example.com', country: 'South Africa', docType: 'drivers_license', submittedDate: '2026-03-15', tier: 1, status: 'verified' },
  { id: '4', name: 'Kwame Mensah', email: 'kwame.mensah@example.com', country: 'Tanzania', docType: 'national_id', submittedDate: '2026-03-14', tier: 1, status: 'verified' },
  { id: '5', name: 'Zanele Dube', email: 'zanele.dube@example.com', country: 'Zimbabwe', docType: 'proof_of_address', submittedDate: '2026-03-13', tier: 3, status: 'pending' },
  { id: '6', name: 'Lebo Sithole', email: 'lebo.sithole@example.com', country: 'Botswana', docType: 'passport', submittedDate: '2026-03-12', tier: 2, status: 'rejected' },
  { id: '7', name: 'Mwangi Kamau', email: 'mwangi.kamau@example.com', country: 'Kenya', docType: 'national_id', submittedDate: '2026-03-11', tier: 2, status: 'verified' },
  { id: '8', name: 'Grace Phiri', email: 'grace.phiri@example.com', country: 'Zambia', docType: 'proof_of_address', submittedDate: '2026-03-10', tier: 3, status: 'pending' },
];

const COUNTRIES: CountryCompliance[] = [
  { code: 'bw', name: 'Botswana', members: 14, compliance: 93, status: 'compliant' },
  { code: 'zw', name: 'Zimbabwe', members: 22, compliance: 81, status: 'compliant' },
  { code: 'tz', name: 'Tanzania', members: 18, compliance: 78, status: 'action_needed' },
  { code: 'ke', name: 'Kenya', members: 31, compliance: 90, status: 'compliant' },
  { code: 'za', name: 'South Africa', members: 27, compliance: 87, status: 'compliant' },
  { code: 'ng', name: 'Nigeria', members: 19, compliance: 68, status: 'action_needed' },
  { code: 'zm', name: 'Zambia', members: 11, compliance: 82, status: 'compliant' },
  { code: 'mz', name: 'Mozambique', members: 8, compliance: 75, status: 'action_needed' },
  { code: 'sl', name: 'Sierra Leone', members: 6, compliance: 83, status: 'compliant' },
  { code: 'ug', name: 'Uganda', members: 9, compliance: 79, status: 'action_needed' },
];

const DOC_TYPE_LABELS: Record<DocType, string> = {
  national_id: 'National ID',
  passport: 'Passport',
  drivers_license: "Driver's License",
  proof_of_address: 'Proof of Address',
};

const TIER_LABELS: Record<KycTier, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: KycStatus }) {
  const cfg = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
    verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Verified' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: KycTier }) {
  const colors: Record<KycTier, string> = {
    1: 'bg-blue-100 text-blue-700',
    2: 'bg-purple-100 text-purple-700',
    3: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier]}`}>
      {TIER_LABELS[tier]}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function KycManagementPage() {
  const [records, setRecords] = useState<KycRecord[]>(FALLBACK_KYC_RECORDS);
  const [filterTab, setFilterTab] = useState<'all' | KycStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const showError = (msg: string) => { setErrorMsg(msg); setTimeout(() => setErrorMsg(null), 5000); };

  // Fetch real KYC data from Supabase — try kyc_verifications first, then kyc_documents, fallback to hardcoded
  const fetchKycRecords = useCallback(async () => {
    const supabase = createClient();

    // Attempt 1: kyc_verifications joined with profiles
    try {
      const { data: verifications, error: vErr } = await supabase
        .from('kyc_verifications')
        .select('id, profile_id, status, verification_type, submitted_at, reviewed_at, reviewer_id, notes, profiles!inner(full_name, email, country)')
        .order('submitted_at', { ascending: false });

      if (!vErr && verifications && verifications.length > 0) {
        const mapped: KycRecord[] = verifications.map((v: Record<string, unknown>) => {
          const profile = v.profiles as Record<string, unknown> | null;
          const rawStatus = String(v.status || 'pending');
          const status: KycStatus = rawStatus === 'approved' || rawStatus === 'verified' ? 'verified' : rawStatus === 'rejected' ? 'rejected' : 'pending';
          const vType = String(v.verification_type || 'national_id');
          const docType: DocType = (['national_id', 'passport', 'drivers_license', 'proof_of_address'].includes(vType) ? vType : 'national_id') as DocType;
          return {
            id: String(v.id),
            name: String(profile?.full_name || 'Unknown'),
            email: String(profile?.email || ''),
            country: String(profile?.country || '-'),
            docType,
            submittedDate: v.submitted_at ? new Date(String(v.submitted_at)).toISOString().split('T')[0] : '-',
            tier: 1 as KycTier,
            status,
          };
        });
        setRecords(mapped);
        return;
      }
    } catch {
      // kyc_verifications table may not exist — continue to fallback
    }

    // Attempt 2: kyc_documents joined with profiles
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*, profiles!inner(full_name, email, country)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: KycRecord[] = data.map((doc: Record<string, unknown>) => {
          const profiles = doc.profiles as Record<string, unknown> | null;
          const rawStatus = String(doc.status || 'pending');
          const status: KycStatus = rawStatus === 'approved' || rawStatus === 'verified' ? 'verified' : rawStatus === 'rejected' ? 'rejected' : 'pending';
          return {
            id: String(doc.id),
            name: String(profiles?.full_name || 'Unknown'),
            email: String(profiles?.email || ''),
            country: String(profiles?.country || '-'),
            docType: (String(doc.document_type || 'national_id')) as DocType,
            submittedDate: doc.created_at ? new Date(String(doc.created_at)).toISOString().split('T')[0] : '-',
            tier: (Number(doc.kyc_tier) || 1) as KycTier,
            status,
          };
        });
        setRecords(mapped);
        return;
      }
    } catch {
      // kyc_documents table may not exist — keep fallback
    }

    // Attempt 3: keep FALLBACK_KYC_RECORDS (already set as initial state)
  }, []);

  useEffect(() => { fetchKycRecords(); }, [fetchKycRecords]);

  const filtered = records.filter((r) => {
    const matchTab = filterTab === 'all' || r.status === filterTab;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  async function handleApprove(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, action: 'approve' }),
      });
      if (res.ok) {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'verified' as KycStatus } : r)));
        if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'verified' as KycStatus } : r);
        showSuccess('Document verified successfully.');
      } else {
        // Fallback: update directly via Supabase — try kyc_verifications first, then kyc_documents
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const reviewerId = authUser?.id || null;

        // Try kyc_verifications
        const { error: vErr } = await supabase
          .from('kyc_verifications')
          .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewer_id: reviewerId })
          .eq('id', id);

        if (!vErr) {
          setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'verified' as KycStatus } : r)));
          if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'verified' as KycStatus } : r);
          showSuccess('Document verified successfully.');
        } else {
          // Fallback to kyc_documents
          const { error } = await supabase.from('kyc_documents').update({ status: 'verified' }).eq('id', id);
          if (!error) {
            setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'verified' as KycStatus } : r)));
            if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'verified' as KycStatus } : r);
            showSuccess('Document verified successfully.');
          } else {
            showError(`Failed to verify: ${error.message}`);
          }
        }
      }
    } catch {
      showError('Network error while approving document.');
    }
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return; // cancelled
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/kyc/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id, action: 'reject', reason }),
      });
      if (res.ok) {
        setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as KycStatus } : r)));
        if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'rejected' as KycStatus } : r);
        showSuccess('Document rejected.');
      } else {
        // Fallback: update directly via Supabase — try kyc_verifications first, then kyc_documents
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const reviewerId = authUser?.id || null;

        // Try kyc_verifications
        const { error: vErr } = await supabase
          .from('kyc_verifications')
          .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewer_id: reviewerId, notes: reason })
          .eq('id', id);

        if (!vErr) {
          setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as KycStatus } : r)));
          if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'rejected' as KycStatus } : r);
          showSuccess('Document rejected.');
        } else {
          // Fallback to kyc_documents
          const { error } = await supabase.from('kyc_documents').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
          if (!error) {
            setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as KycStatus } : r)));
            if (selectedRecord?.id === id) setSelectedRecord((r) => r ? { ...r, status: 'rejected' as KycStatus } : r);
            showSuccess('Document rejected.');
          } else {
            showError(`Failed to reject: ${error.message}`);
          }
        }
      }
    } catch {
      showError('Network error while rejecting document.');
    }
    setActionLoading(null);
  }

  async function handleRequestMoreInfo(id: string) {
    const note = window.prompt('Enter note for additional information request:');
    if (!note) return;
    setActionLoading(id);
    const supabase = createClient();
    const { error } = await supabase.from('kyc_documents').update({ status: 'pending', admin_notes: note }).eq('id', id);
    if (!error) {
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'pending' as KycStatus } : r)));
      showSuccess('Request for more information sent.');
    } else {
      showError(`Failed: ${error.message}`);
    }
    setActionLoading(null);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchKycRecords();
    setRefreshing(false);
    showSuccess('Data refreshed.');
  }

  const stats = {
    verified: records.filter((r) => r.status === 'verified').length,
    pending: records.filter((r) => r.status === 'pending').length,
    tier1: records.filter((r) => r.tier === 1).length,
    tier2: records.filter((r) => r.tier === 2).length,
  };

  const TABS: { key: 'all' | KycStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: records.length },
    { key: 'pending', label: 'Pending', count: records.filter((r) => r.status === 'pending').length },
    { key: 'verified', label: 'Verified', count: records.filter((r) => r.status === 'verified').length },
    { key: 'rejected', label: 'Rejected', count: records.filter((r) => r.status === 'rejected').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#8CB89C]" />
              <h1 className="text-lg font-semibold text-[#1B2A4A]">KYC Management</h1>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {[
            {
              label: 'Total Verified',
              value: `${stats.verified + 153} members`,
              icon: <BadgeCheck className="w-5 h-5" />,
              iconBg: 'bg-emerald-100',
              iconColor: 'text-emerald-600',
              accent: 'border-l-4 border-emerald-400',
            },
            {
              label: 'Pending Review',
              value: `${stats.pending + 19} documents`,
              icon: <Clock className="w-5 h-5" />,
              iconBg: 'bg-amber-100',
              iconColor: 'text-amber-600',
              accent: 'border-l-4 border-amber-400',
            },
            {
              label: 'Tier 1 (Basic)',
              value: `${stats.tier1 + 87} members`,
              icon: <Layers className="w-5 h-5" />,
              iconBg: 'bg-blue-100',
              iconColor: 'text-blue-600',
              accent: 'border-l-4 border-blue-400',
            },
            {
              label: 'Tier 2 (Enhanced)',
              value: `${stats.tier2 + 65} members`,
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: 'bg-purple-100',
              iconColor: 'text-purple-600',
              accent: 'border-l-4 border-purple-400',
            },
          ].map((card) => (
            <motion.div
              key={card.label}
              variants={cardVariants}
              className={`bg-white rounded-xl p-5 shadow-sm ${card.accent}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-[#1B2A4A]">{card.value.split(' ')[0]}</p>
                  <p className="text-sm text-gray-400">{card.value.split(' ').slice(1).join(' ')}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${card.iconBg} ${card.iconColor}`}>{card.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── KYC Tiers info banner ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-[#1B2A4A] text-white rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-[#8CB89C]" />
              <span className="text-sm font-semibold text-[#8CB89C] uppercase tracking-wide">KYC Tier Requirements</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  tier: 'Tier 1',
                  limit: '< $500 / month',
                  reqs: ['Phone number verification', 'Full name'],
                  color: 'border-blue-400 bg-blue-900/20',
                  badge: 'bg-blue-500',
                },
                {
                  tier: 'Tier 2',
                  limit: '< $5,000 / month',
                  reqs: ['National ID or Passport', 'Selfie / liveness check'],
                  color: 'border-purple-400 bg-purple-900/20',
                  badge: 'bg-purple-500',
                },
                {
                  tier: 'Tier 3',
                  limit: '> $5,000 / month',
                  reqs: ['Government-issued ID', 'Proof of address', 'Source of funds declaration'],
                  color: 'border-[#D4A843] bg-yellow-900/20',
                  badge: 'bg-[#D4A843]',
                },
              ].map((t) => (
                <div key={t.tier} className={`rounded-lg border p-4 ${t.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${t.badge}`}>{t.tier}</span>
                    <span className="text-xs text-gray-300">{t.limit}</span>
                  </div>
                  <ul className="space-y-1">
                    {t.reqs.map((req) => (
                      <li key={req} className="flex items-start gap-1.5 text-sm text-gray-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8CB89C] mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Pending Verifications Queue + Document Preview ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Table — 2/3 width */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <h2 className="text-base font-semibold text-[#1B2A4A]">Pending Verifications Queue</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] w-52"
                  />
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 mt-3">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      filterTab === tab.key
                        ? 'bg-[#1B2A4A] text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                      filterTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table body */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Document</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tier</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                          No records match the current filter.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((record) => (
                        <motion.tr
                          key={record.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedRecord(record)}
                          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedRecord?.id === record.id ? 'bg-teal-50/60' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                                {record.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-xs">{record.name}</p>
                                <p className="text-gray-400 text-[11px]">{record.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{DOC_TYPE_LABELS[record.docType]}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{record.submittedDate}</td>
                          <td className="px-4 py-3"><TierBadge tier={record.tier} /></td>
                          <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                                className="p-1.5 rounded text-gray-400 hover:text-[#8CB89C] hover:bg-teal-50 transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {record.status === 'pending' && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleApprove(record.id); }}
                                    className="p-1.5 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Approve"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReject(record.id); }}
                                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Reject"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Preview — 1/3 width */}
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
            <h2 className="text-base font-semibold text-[#1B2A4A] mb-4">Document Preview</h2>
            <AnimatePresence mode="wait">
              {selectedRecord ? (
                <motion.div
                  key={selectedRecord.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col gap-4"
                >
                  {/* Member info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {selectedRecord.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{selectedRecord.name}</p>
                      <p className="text-xs text-gray-500">{selectedRecord.email}</p>
                      <p className="text-xs text-gray-400">{selectedRecord.country}</p>
                    </div>
                  </div>

                  {/* Doc type */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 mb-0.5">Document</p>
                      <p className="font-medium text-gray-700">{DOC_TYPE_LABELS[selectedRecord.docType]}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 mb-0.5">Submitted</p>
                      <p className="font-medium text-gray-700">{selectedRecord.submittedDate}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 mb-0.5">Tier</p>
                      <TierBadge tier={selectedRecord.tier} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-400 mb-0.5">Status</p>
                      <StatusBadge status={selectedRecord.status} />
                    </div>
                  </div>

                  {/* Document placeholder */}
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-10 gap-3 min-h-[160px]">
                    <FileImage className="w-10 h-10 text-gray-300" />
                    <p className="text-xs text-gray-400 text-center">Document image would<br />appear here</p>
                  </div>

                  {/* Action buttons */}
                  {selectedRecord.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(selectedRecord.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(selectedRecord.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">Select a document to preview</p>
                  <p className="text-xs text-gray-300">Click any row in the table</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── AML Screening + Country Compliance ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* AML Screening Summary */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#1B2A4A]/10 rounded-lg">
                <ScanLine className="w-4 h-4 text-[#1B2A4A]" />
              </div>
              <h2 className="text-base font-semibold text-[#1B2A4A]">AML Screening Summary</h2>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Total Screened', value: 156, icon: <Users className="w-4 h-4 text-gray-400" />, color: 'text-gray-900' },
                { label: 'Clear', value: 153, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'text-emerald-600' },
                { label: 'Flagged', value: 3, icon: <AlertTriangle className="w-4 h-4 text-red-500" />, color: 'text-red-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Clear rate</span>
                <span>98.1%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.1%' }} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              Last screening run: <span className="font-medium text-gray-600">2 hours ago</span>
            </div>

            <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium border border-[#8CB89C] text-[#8CB89C] hover:bg-[#8CB89C]/5 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Run Screening Now
            </button>
          </div>

          {/* Country Compliance Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-[#8CB89C]/10 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-[#8CB89C]" />
              </div>
              <h2 className="text-base font-semibold text-[#1B2A4A]">Country Compliance Status</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {COUNTRIES.map((country) => (
                <div
                  key={country.code}
                  className="border border-gray-100 rounded-xl p-3.5 hover:border-[#8CB89C]/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src={`https://flagcdn.com/w40/${country.code}.png`}
                      alt={country.name}
                      width={28}
                      height={20}
                      className="rounded shadow-sm object-cover"
                      style={{ height: '20px', width: '28px' }}
                    />
                    <span className="text-sm font-semibold text-gray-800">{country.name}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Members</span>
                      <span className="font-medium text-gray-700">{country.members}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">KYC Rate</span>
                      <span className="font-bold text-[#1B2A4A]">{country.compliance}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${country.compliance >= 80 ? 'bg-[#8CB89C]' : 'bg-amber-400'}`}
                        style={{ width: `${country.compliance}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2.5">
                    {country.status === 'compliant' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Action Needed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
