'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Users,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Search,
  Download,
  FileImage,
  MapPin,
  TrendingUp,
  Activity,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Types ────────────────────────────────────────────────────────────────────

type KycStatus = 'pending' | 'verified' | 'rejected' | 'expired';
type MemberType = 'farmer' | 'supplier' | 'investor';
type RiskScore = 'low' | 'medium' | 'high';

interface KycDocument {
  name: string;
  type: string;
  uploadedDate: string;
  verified: boolean;
  file_url?: string;
}

interface KycRecord {
  id: string;
  name: string;
  email: string;
  type: MemberType;
  country: string;
  submittedDate: string;
  status: KycStatus;
  risk: RiskScore;
  documents: KycDocument[];
  notes: string;
}

// ── Fallback data ────────────────────────────────────────────────────────────

const FALLBACK_RECORDS: KycRecord[] = [
  {
    id: 'KYC-001', name: 'Amara Diallo', email: 'amara.diallo@example.com', type: 'farmer',
    country: 'Sierra Leone', submittedDate: '2026-04-09', status: 'pending', risk: 'low',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2026-04-09', verified: false },
      { name: 'Proof of Address', type: 'proof_of_address', uploadedDate: '2026-04-09', verified: false },
      { name: 'Farm Registration', type: 'farm_registration', uploadedDate: '2026-04-09', verified: false },
    ],
    notes: '',
  },
  {
    id: 'KYC-002', name: 'Watson Vine Holdings', email: 'admin@watsonvine.co.za', type: 'supplier',
    country: 'South Africa', submittedDate: '2026-04-08', status: 'verified', risk: 'low',
    documents: [
      { name: 'Business Registration', type: 'business_reg', uploadedDate: '2026-04-07', verified: true },
      { name: 'Tax Clearance Certificate', type: 'tax_cert', uploadedDate: '2026-04-07', verified: true },
      { name: 'Director IDs', type: 'national_id', uploadedDate: '2026-04-08', verified: true },
    ],
    notes: 'Premium partner. Expedited review.',
  },
  {
    id: 'KYC-003', name: 'Chidi Okonkwo', email: 'chidi.okonkwo@example.com', type: 'investor',
    country: 'Nigeria', submittedDate: '2026-04-07', status: 'pending', risk: 'high',
    documents: [
      { name: 'Passport', type: 'passport', uploadedDate: '2026-04-07', verified: false },
      { name: 'Source of Funds Declaration', type: 'source_of_funds', uploadedDate: '2026-04-07', verified: false },
    ],
    notes: 'Awaiting additional source of funds documentation.',
  },
  {
    id: 'KYC-004', name: 'Fatima Nkosi', email: 'fatima.nkosi@example.com', type: 'farmer',
    country: 'South Africa', submittedDate: '2026-04-06', status: 'verified', risk: 'low',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2026-04-05', verified: true },
      { name: 'Proof of Address', type: 'proof_of_address', uploadedDate: '2026-04-05', verified: true },
    ],
    notes: 'All documents verified. Tier 2 approved.',
  },
  {
    id: 'KYC-005', name: 'Zanele Dube', email: 'zanele.dube@example.com', type: 'farmer',
    country: 'Zimbabwe', submittedDate: '2025-10-15', status: 'expired', risk: 'medium',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2025-10-14', verified: true },
      { name: 'Farm Registration', type: 'farm_registration', uploadedDate: '2025-10-15', verified: true },
    ],
    notes: 'ID expired April 2026. Renewal requested.',
  },
  {
    id: 'KYC-006', name: 'Mwangi Kamau', email: 'mwangi.kamau@example.com', type: 'supplier',
    country: 'Kenya', submittedDate: '2026-04-09', status: 'pending', risk: 'low',
    documents: [
      { name: 'Business Registration', type: 'business_reg', uploadedDate: '2026-04-09', verified: false },
      { name: 'Tax Certificate', type: 'tax_cert', uploadedDate: '2026-04-09', verified: false },
    ],
    notes: '',
  },
  {
    id: 'KYC-007', name: 'Lebo Sithole', email: 'lebo.sithole@example.com', type: 'investor',
    country: 'Botswana', submittedDate: '2026-04-05', status: 'rejected', risk: 'medium',
    documents: [
      { name: 'Passport', type: 'passport', uploadedDate: '2026-04-04', verified: true },
      { name: 'Bank Statement', type: 'bank_statement', uploadedDate: '2026-04-05', verified: false },
    ],
    notes: 'Bank statement illegible. Requested re-upload.',
  },
  {
    id: 'KYC-008', name: 'Grace Phiri', email: 'grace.phiri@example.com', type: 'farmer',
    country: 'Zambia', submittedDate: '2026-04-10', status: 'pending', risk: 'low',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2026-04-10', verified: false },
      { name: 'Proof of Address', type: 'proof_of_address', uploadedDate: '2026-04-10', verified: false },
      { name: 'Selfie', type: 'selfie', uploadedDate: '2026-04-10', verified: false },
    ],
    notes: '',
  },
  {
    id: 'KYC-009', name: 'Thabo Ramaano', email: 'thabo.ramaano@example.com', type: 'farmer',
    country: 'South Africa', submittedDate: '2026-04-04', status: 'verified', risk: 'low',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2026-04-03', verified: true },
      { name: 'Proof of Address', type: 'proof_of_address', uploadedDate: '2026-04-04', verified: true },
    ],
    notes: 'Verified by Sarah M.',
  },
  {
    id: 'KYC-010', name: 'Baraka Mwenda', email: 'baraka.mwenda@example.com', type: 'supplier',
    country: 'Tanzania', submittedDate: '2026-04-03', status: 'verified', risk: 'low',
    documents: [
      { name: 'Business Registration', type: 'business_reg', uploadedDate: '2026-04-02', verified: true },
      { name: 'Tax Certificate', type: 'tax_cert', uploadedDate: '2026-04-03', verified: true },
      { name: 'Director ID', type: 'national_id', uploadedDate: '2026-04-03', verified: true },
    ],
    notes: 'Existing supplier, renewal verified.',
  },
  {
    id: 'KYC-011', name: 'Mpho Ramotswe', email: 'mpho.ramotswe@example.com', type: 'farmer',
    country: 'Botswana', submittedDate: '2026-03-28', status: 'rejected', risk: 'medium',
    documents: [
      { name: 'National ID', type: 'national_id', uploadedDate: '2026-03-27', verified: true },
      { name: 'Proof of Address', type: 'proof_of_address', uploadedDate: '2026-03-28', verified: false },
    ],
    notes: 'Utility bill older than 3 months. Rejected.',
  },
  {
    id: 'KYC-012', name: 'Kweku Asante', email: 'kweku.asante@example.com', type: 'investor',
    country: 'Nigeria', submittedDate: '2026-04-01', status: 'pending', risk: 'high',
    documents: [
      { name: 'Passport', type: 'passport', uploadedDate: '2026-04-01', verified: false },
      { name: 'Source of Funds', type: 'source_of_funds', uploadedDate: '2026-04-01', verified: false },
      { name: 'Bank Statement', type: 'bank_statement', uploadedDate: '2026-04-01', verified: false },
    ],
    notes: 'High-value investor. Enhanced due diligence required.',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<KycStatus, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending', icon: <Clock className="w-3 h-3" /> },
  verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Verified', icon: <CheckCircle2 className="w-3 h-3" /> },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: <XCircle className="w-3 h-3" /> },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Expired', icon: <AlertCircle className="w-3 h-3" /> },
};

const TYPE_CONFIG: Record<MemberType, { bg: string; text: string; label: string }> = {
  farmer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Farmer' },
  supplier: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Supplier' },
  investor: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Investor' },
};

const RISK_CONFIG: Record<RiskScore, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low Risk' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Medium Risk' },
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
};

const TABS: { value: KycStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

function exportPendingList(records: KycRecord[]) {
  const pending = records.filter(r => r.status === 'pending');
  const headers = ['ID', 'Name', 'Email', 'Type', 'Country', 'Submitted', 'Risk', 'Documents'];
  const rows = pending.map(r => [
    r.id, r.name, r.email, r.type, r.country, r.submittedDate, r.risk,
    `"${r.documents.map(d => d.name).join(', ')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kyc-pending-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function KycManagementPage() {
  const [records, setRecords] = useState<KycRecord[]>([]);
  const [activeTab, setActiveTab] = useState<KycStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<KycRecord | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }, []);

  // Fetch real KYC data from Supabase
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase
          .from('kyc_verifications')
          .select('*, profile:profiles(full_name, email, country, avatar_url)')
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          const mapped: KycRecord[] = data.map((r: any) => ({
            id: r.id,
            name: r.profile?.full_name || 'Unknown',
            email: r.profile?.email || '',
            type: 'farmer' as MemberType,
            country: r.profile?.country || '',
            submittedDate: r.created_at || new Date().toISOString(),
            status: (r.status || 'pending') as KycStatus,
            risk: (r.risk_score || 'low') as RiskScore,
            documents: Array.isArray(r.documents) ? r.documents : [],
            notes: r.admin_notes || r.notes || '',
          }));
          setRecords(mapped);
        }
      } catch { /* table may not exist — show empty */ }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = records;
    if (activeTab !== 'all') result = result.filter(r => r.status === activeTab);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const total = records.length;
    const pending = records.filter(r => r.status === 'pending').length;
    const verified = records.filter(r => r.status === 'verified').length;
    const approvalRate = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { total, pending, verified, approvalRate, avgProcessingTime: '2.4 days' };
  }, [records]);

  const handleApprove = async (id: string) => {
    const supabase = createClient();
    await supabase.from('kyc_verifications').update({ status: 'verified', admin_notes: reviewNotes || null, reviewed_at: new Date().toISOString() }).eq('id', id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'verified' as KycStatus, notes: reviewNotes || r.notes } : r));
    setSelectedRecord(null);
    setReviewNotes('');
    showSuccess(`KYC application ${id} approved successfully`);
  };

  const handleReject = async (id: string) => {
    const supabase = createClient();
    await supabase.from('kyc_verifications').update({ status: 'rejected', admin_notes: reviewNotes || null, reviewed_at: new Date().toISOString() }).eq('id', id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as KycStatus, notes: reviewNotes || r.notes } : r));
    setSelectedRecord(null);
    setReviewNotes('');
    showSuccess(`KYC application ${id} rejected`);
  };

  const handleBulkApproveLowRisk = () => {
    const lowRiskPending = records.filter(r => r.status === 'pending' && r.risk === 'low');
    if (lowRiskPending.length === 0) return;
    setRecords(prev => prev.map(r =>
      r.status === 'pending' && r.risk === 'low' ? { ...r, status: 'verified' as KycStatus, notes: 'Bulk approved (low risk)' } : r
    ));
    showSuccess(`${lowRiskPending.length} low-risk applications bulk approved`);
  };

  const tabCounts = useMemo(() => ({
    all: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    verified: records.filter(r => r.status === 'verified').length,
    rejected: records.filter(r => r.status === 'rejected').length,
    expired: records.filter(r => r.status === 'expired').length,
  }), [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">KYC Management</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, and manage member identity verification</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleBulkApproveLowRisk}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-medium hover:bg-[#5DB347]/90 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve All Low-Risk
          </button>
          <button
            onClick={() => exportPendingList(records)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Pending
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {[
          { label: 'Total Submissions', value: stats.total, icon: <Users className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-slate-50' },
          { label: 'Pending Review', value: stats.pending, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Verified', value: stats.verified, icon: <ShieldCheck className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg Processing', value: stats.avgProcessingTime, icon: <Activity className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Approval Rate', value: `${stats.approvalRate}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#5DB347]', bg: 'bg-green-50' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={cardVariants}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-100">
          <div className="flex gap-1 flex-wrap flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setActiveTab(tab.value); setSelectedRecord(null); setPreviewDoc(null); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${activeTab === tab.value ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab.value ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {tabCounts[tab.value]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>
        </div>

        {/* Records */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No KYC records found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or tab filter</p>
            </div>
          )}

          {filtered.map((record) => {
            const sc = STATUS_CONFIG[record.status];
            const tc = TYPE_CONFIG[record.type];
            const rc = RISK_CONFIG[record.risk];
            const isSelected = selectedRecord?.id === record.id;

            return (
              <motion.div key={record.id} variants={cardVariants}>
                <div
                  className={`p-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50 ring-1 ring-[#5DB347]/20' : ''}`}
                  onClick={() => { setSelectedRecord(isSelected ? null : record); setReviewNotes(''); setPreviewDoc(null); }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{record.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${tc.bg} ${tc.text}`}>{tc.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${rc.bg} ${rc.text}`}>{rc.label}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{record.email}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{record.country}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{record.submittedDate}</span>
                      </div>
                    </div>

                    {/* Status + docs count */}
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-gray-500 bg-gray-100">
                        <FileText className="w-3 h-3" />
                        {record.documents.length} docs
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded detail panel */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Documents */}
                          <div className="lg:col-span-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {record.documents.map((doc, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                    previewDoc?.url === doc.file_url && previewDoc?.name === doc.name
                                      ? 'bg-blue-50 border-[#5DB347]/30 ring-1 ring-[#5DB347]/20'
                                      : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (doc.file_url) {
                                      setPreviewDoc({ url: doc.file_url, type: doc.type, name: doc.name });
                                    }
                                  }}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.verified ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                    <FileImage className={`w-5 h-5 ${doc.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                                    <p className="text-[10px] text-gray-400">
                                      Uploaded {doc.uploadedDate}
                                      {!doc.file_url && <span className="ml-1 text-gray-300">(no file)</span>}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {doc.file_url && (
                                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                                    )}
                                    {doc.verified ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                                        <Clock className="w-2.5 h-2.5" /> Pending
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Document viewer */}
                            {previewDoc ? (
                              <div className="mt-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">{previewDoc.name}</span>
                                    <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{previewDoc.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={previewDoc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2A4A] text-white rounded-lg text-xs font-medium hover:bg-[#1B2A4A]/90 transition-colors"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                      Download
                                    </a>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setPreviewDoc(null); }}
                                      className="inline-flex items-center gap-1 px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4">
                                  {(() => {
                                    const url = previewDoc.url;
                                    const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
                                    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                                    const isPdf = ext === 'pdf';

                                    if (isImage) {
                                      return (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={url}
                                          alt={previewDoc.name}
                                          className="w-full max-h-[500px] object-contain rounded-xl"
                                        />
                                      );
                                    }
                                    if (isPdf) {
                                      return (
                                        <iframe
                                          src={url}
                                          title={previewDoc.name}
                                          className="w-full h-96 rounded-xl border border-gray-100"
                                        />
                                      );
                                    }
                                    return (
                                      <div className="text-center py-8">
                                        <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 mb-3">
                                          Preview not available for this file type
                                        </p>
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors"
                                        >
                                          <Download className="w-4 h-4" />
                                          Open File
                                        </a>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3 p-6 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-center">
                                <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-400">Click a document above to preview</p>
                              </div>
                            )}
                          </div>

                          {/* Review panel */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Assessment</h4>
                              <div className={`p-3 rounded-xl ${rc.bg} border`}>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className={`w-4 h-4 ${rc.text}`} />
                                  <span className={`text-sm font-semibold ${rc.text}`}>{rc.label}</span>
                                </div>
                                <p className="text-xs mt-1 opacity-80">
                                  Based on: {record.country} origin, {record.type} account type
                                  {record.risk === 'high' && ', enhanced due diligence required'}
                                </p>
                              </div>
                            </div>

                            {record.notes && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Existing Notes</h4>
                                <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100">{record.notes}</p>
                              </div>
                            )}

                            <div>
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Review Notes</h4>
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                placeholder="Add review notes before approving or rejecting..."
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none"
                              />
                            </div>

                            {(record.status === 'pending' || record.status === 'expired') && (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleApprove(record.id); }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl text-sm font-medium hover:bg-[#5DB347]/90 transition-colors"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleReject(record.id); }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#5DB347] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
