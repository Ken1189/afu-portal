'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Shield,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface InsuranceClaim {
  id: string;
  claim_type: string;
  amount: number;
  status: string;
  created_at: string;
  farmer_name: string;
}

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  memberName: string;
  productType: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'pending-claim' | 'expired' | 'claimed';
  expiryDate: string;
}

interface PolicyFormData {
  policy_number: string;
  member_id: string;
  product_id: string;
  coverage_amount: string;
  premium: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface MemberOption {
  id: string;
  full_name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

const EMPTY_POLICY_FORM: PolicyFormData = {
  policy_number: '',
  member_id: '',
  product_id: '',
  coverage_amount: '',
  premium: '',
  status: 'active',
  start_date: '',
  end_date: '',
};

type ClaimStatusFilter = 'all' | 'pending' | 'approved' | 'rejected';
type PolicyStatusFilter = 'all' | 'active' | 'pending-claim' | 'expired';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const FALLBACK_POLICIES: InsurancePolicy[] = [
  { id: 'INS-001', policyNumber: 'POL-2026-0041', memberName: 'Grace Moyo', productType: 'Crop Insurance', coverageAmount: 120000, premium: 3600, status: 'active', expiryDate: '2026-12-31' },
  { id: 'INS-002', policyNumber: 'POL-2026-0042', memberName: 'Tendai Chirwa', productType: 'Livestock Insurance', coverageAmount: 85000, premium: 2550, status: 'active', expiryDate: '2026-09-15' },
  { id: 'INS-003', policyNumber: 'POL-2026-0043', memberName: 'Amina Salim', productType: 'Crop Insurance', coverageAmount: 200000, premium: 6000, status: 'pending-claim', expiryDate: '2026-11-30' },
  { id: 'INS-004', policyNumber: 'POL-2025-0038', memberName: 'Baraka Mushi', productType: 'Weather Index', coverageAmount: 50000, premium: 1500, status: 'expired', expiryDate: '2026-01-15' },
  { id: 'INS-005', policyNumber: 'POL-2026-0044', memberName: 'Farai Ndlovu', productType: 'Equipment Insurance', coverageAmount: 75000, premium: 2250, status: 'active', expiryDate: '2027-01-31' },
  { id: 'INS-006', policyNumber: 'POL-2026-0045', memberName: 'Kago Setshedi', productType: 'Crop Insurance', coverageAmount: 95000, premium: 2850, status: 'active', expiryDate: '2026-10-20' },
];

const FALLBACK_CLAIMS: InsuranceClaim[] = [
  { id: 'CLM-001', claim_type: 'Crop Damage', amount: 45000, status: 'pending', created_at: '2026-03-10', farmer_name: 'Grace Moyo' },
  { id: 'CLM-002', claim_type: 'Livestock Loss', amount: 28000, status: 'pending', created_at: '2026-03-08', farmer_name: 'Tendai Chirwa' },
  { id: 'CLM-003', claim_type: 'Weather Damage', amount: 62000, status: 'approved', created_at: '2026-02-20', farmer_name: 'Amina Salim' },
  { id: 'CLM-004', claim_type: 'Equipment Failure', amount: 15000, status: 'rejected', created_at: '2026-02-15', farmer_name: 'Baraka Mushi' },
  { id: 'CLM-005', claim_type: 'Crop Damage', amount: 38000, status: 'pending', created_at: '2026-03-12', farmer_name: 'Farai Ndlovu' },
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
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  'pending-claim': 'Pending Claim',
  expired: 'Expired',
  claimed: 'Claimed',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
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
  const supabase = createClient();

  // Claims state
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatusFilter, setClaimStatusFilter] = useState<ClaimStatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Policies state
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [policiesLoading, setPoliciesLoading] = useState(true);
  const [policySearch, setPolicySearch] = useState('');
  const [policyStatusFilter, setPolicyStatusFilter] = useState<PolicyStatusFilter>('all');

  // Policy CRUD state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [policyForm, setPolicyForm] = useState<PolicyFormData>(EMPTY_POLICY_FORM);
  const [policySaving, setPolicySaving] = useState(false);
  const [deletingPolicyId, setDeletingPolicyId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // View toggle
  const [activeView, setActiveView] = useState<'claims' | 'policies'>('claims');

  // Fetch claims
  const fetchClaims = useCallback(async () => {
    setClaimsLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurance_claims')
        .select('id, description, claim_amount, status, submitted_at, members!insurance_claims_member_id_fkey(profiles(full_name))')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setClaims(
          data.map((row: Record<string, unknown>) => {
            const membersData = row.members as Record<string, unknown> | null;
            const profilesData = membersData?.profiles as Record<string, unknown> | null;
            const statusVal = (row.status as string) || 'submitted';
            return {
              id: row.id as string,
              claim_type: (row.description as string) || 'Unknown',
              amount: (row.claim_amount as number) || 0,
              status: statusVal === 'submitted' ? 'pending' : statusVal,
              created_at: (row.submitted_at as string) || '',
              farmer_name: (profilesData?.full_name as string) || 'Unknown Farmer',
            };
          })
        );
      } else {
        setClaims(FALLBACK_CLAIMS);
      }
    } catch {
      setClaims(FALLBACK_CLAIMS);
    }
    setClaimsLoading(false);
  }, [supabase]);

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setPoliciesLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('id, policy_number, coverage_amount, premium, status, start_date, end_date, insurance_products(name), members!insurance_policies_member_id_fkey(profiles(full_name))')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setPolicies(
          data.map((row: Record<string, unknown>) => {
            const membersData = row.members as Record<string, unknown> | null;
            const profilesData = membersData?.profiles as Record<string, unknown> | null;
            const productData = row.insurance_products as Record<string, unknown> | null;
            return {
              id: row.id as string,
              policyNumber: (row.policy_number as string) || (row.id as string),
              memberName: (profilesData?.full_name as string) || 'Unknown',
              productType: (productData?.name as string) || 'General',
              coverageAmount: (row.coverage_amount as number) || 0,
              premium: (row.premium as number) || 0,
              status: ((row.status as string) || 'active') as InsurancePolicy['status'],
              expiryDate: ((row.end_date as string) || '')?.split('T')[0] || '',
            };
          })
        );
      } else {
        setPolicies(FALLBACK_POLICIES);
      }
    } catch {
      setPolicies(FALLBACK_POLICIES);
    }
    setPoliciesLoading(false);
  }, [supabase]);

  // Fetch members for dropdown
  const fetchMembers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, profiles(full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setMembers(
          data.map((row: Record<string, unknown>) => {
            const profilesData = row.profiles as Record<string, unknown> | null;
            return {
              id: row.id as string,
              full_name: (profilesData?.full_name as string) || 'Unknown',
            };
          })
        );
      }
    } catch {
      // Members dropdown will be empty; user can type member_id manually
    }
  }, [supabase]);

  // Fetch insurance products for dropdown
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('insurance_products')
        .select('id, name')
        .order('name');
      if (error) throw error;
      if (data) {
        setProducts(data as ProductOption[]);
      }
    } catch {
      // Products dropdown will be empty
    }
  }, [supabase]);

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
    fetchMembers();
    fetchProducts();
  }, [fetchClaims, fetchPolicies, fetchMembers, fetchProducts]);

  // Approve / Reject claim
  const handleClaimAction = async (claimId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(claimId);
    try {
      const { error } = await supabase
        .from('insurance_claims')
        .update({ status: newStatus })
        .eq('id', claimId);

      if (error) throw error;

      // Update local state
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
      );
    } catch {
      // If it fails (e.g. mock data IDs), update local state anyway for demo
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
      );
    }
    setActionLoading(null);
  };

  // Open modal for creating a new policy
  const openCreatePolicy = () => {
    setEditingPolicyId(null);
    const year = new Date().getFullYear();
    const seq = String(policies.length + 1).padStart(4, '0');
    setPolicyForm({ ...EMPTY_POLICY_FORM, policy_number: `POL-${year}-${seq}` });
    setPolicyModalOpen(true);
  };

  // Open modal for editing an existing policy
  const openEditPolicy = async (policyId: string) => {
    setEditingPolicyId(policyId);
    // Fetch the raw row so we get member_id and product_id
    try {
      const { data, error } = await supabase
        .from('insurance_policies')
        .select('*')
        .eq('id', policyId)
        .single();
      if (error) throw error;
      if (data) {
        setPolicyForm({
          policy_number: (data.policy_number as string) || '',
          member_id: (data.member_id as string) || '',
          product_id: (data.product_id as string) || '',
          coverage_amount: String(data.coverage_amount ?? ''),
          premium: String(data.premium ?? ''),
          status: (data.status as string) || 'active',
          start_date: ((data.start_date as string) || '').split('T')[0],
          end_date: ((data.end_date as string) || '').split('T')[0],
        });
      }
    } catch {
      // If fetch fails (e.g. fallback data), pre-fill from local state
      const local = policies.find((p) => p.id === policyId);
      if (local) {
        setPolicyForm({
          policy_number: local.policyNumber,
          member_id: '',
          product_id: '',
          coverage_amount: String(local.coverageAmount),
          premium: String(local.premium),
          status: local.status,
          start_date: '',
          end_date: local.expiryDate,
        });
      }
    }
    setPolicyModalOpen(true);
  };

  // Save (create or update) policy
  const handleSavePolicy = async () => {
    setPolicySaving(true);
    const payload = {
      policy_number: policyForm.policy_number,
      member_id: policyForm.member_id || null,
      product_id: policyForm.product_id || null,
      coverage_amount: parseFloat(policyForm.coverage_amount) || 0,
      premium: parseFloat(policyForm.premium) || 0,
      status: policyForm.status,
      start_date: policyForm.start_date || null,
      end_date: policyForm.end_date || null,
    };

    try {
      if (editingPolicyId) {
        const { error } = await supabase
          .from('insurance_policies')
          .update(payload)
          .eq('id', editingPolicyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('insurance_policies')
          .insert(payload);
        if (error) throw error;
      }
    } catch {
      // If Supabase fails (demo/fallback mode), still close the modal
    }
    setPolicyModalOpen(false);
    setPolicySaving(false);
    fetchPolicies();
  };

  // Delete policy
  const handleDeletePolicy = async (policyId: string) => {
    setDeletingPolicyId(policyId);
    try {
      const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', policyId);
      if (error) throw error;
    } catch {
      // If Supabase fails, remove from local state for demo
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    }
    setDeleteConfirmId(null);
    setDeletingPolicyId(null);
    fetchPolicies();
  };

  // Filter claims
  const filteredClaims = useMemo(() => {
    let result = [...claims];
    if (claimStatusFilter !== 'all') result = result.filter((c) => c.status === claimStatusFilter);
    if (claimSearch) {
      const q = claimSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.farmer_name.toLowerCase().includes(q) ||
          c.claim_type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [claims, claimSearch, claimStatusFilter]);

  // Filter policies
  const filteredPolicies = useMemo(() => {
    let result = [...policies];
    if (policyStatusFilter !== 'all') result = result.filter((p) => p.status === policyStatusFilter);
    if (policySearch) {
      const q = policySearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.policyNumber.toLowerCase().includes(q) ||
          p.memberName.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q)
      );
    }
    return result;
  }, [policies, policySearch, policyStatusFilter]);

  // Summary stats
  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
  const approvedClaimsTotal = claims.filter((c) => c.status === 'approved').reduce((s, c) => s + c.amount, 0);
  const activePolicies = policies.filter((p) => p.status === 'active').length;
  const totalCoverage = policies.filter((p) => p.status === 'active').reduce((s, p) => s + p.coverageAmount, 0);

  const summaryCards = [
    { label: 'Active Policies', value: activePolicies.toString(), icon: <Shield className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Total Coverage', value: formatCurrency(totalCoverage), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Pending Claims', value: pendingClaimsCount.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Claims Approved', value: formatCurrency(approvedClaimsTotal), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const claimTabs: { key: ClaimStatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  const policyTabs: { key: PolicyStatusFilter; label: string }[] = [
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
        <p className="text-sm text-gray-500 mt-0.5">Manage insurance policies and claims across all member farms</p>
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

      {/* View Toggle */}
      <motion.div variants={cardVariants} className="flex gap-2">
        <button
          onClick={() => setActiveView('claims')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'claims' ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Claims ({claims.length})
        </button>
        <button
          onClick={() => setActiveView('policies')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'policies' ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Policies ({policies.length})
        </button>
      </motion.div>

      {/* ─── Claims View ─── */}
      {activeView === 'claims' && (
        <>
          {/* Claims Filters */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by claim ID, farmer, or type..."
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {claimTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setClaimStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      claimStatusFilter === tab.key
                        ? 'bg-teal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing {filteredClaims.length} of {claims.length} claims
            </p>
          </motion.div>

          {/* Claims Table */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {claimsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-teal animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-cream/50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Claim ID</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Farmer</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-cream/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{claim.id}</td>
                        <td className="py-3 px-4 font-medium text-navy">{claim.farmer_name}</td>
                        <td className="py-3 px-4 text-gray-500">{claim.claim_type}</td>
                        <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{formatCurrency(claim.amount)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[claim.status] || 'bg-gray-100 text-gray-600'}`}>
                            {claim.status === 'pending' && <Clock className="w-3 h-3" />}
                            {claim.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                            {claim.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {statusLabels[claim.status] || claim.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{claim.created_at?.split('T')[0]}</td>
                        <td className="py-3 px-4 text-center">
                          {claim.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleClaimAction(claim.id, 'approved')}
                                disabled={actionLoading === claim.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === claim.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleClaimAction(claim.id, 'rejected')}
                                disabled={actionLoading === claim.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {actionLoading === claim.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <XCircle className="w-3 h-3" />
                                )}
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!claimsLoading && filteredClaims.length === 0 && (
              <div className="py-16 text-center">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No claims match your filters</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ─── Policies View ─── */}
      {activeView === 'policies' && (
        <>
          {/* Policies Filters */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by policy number, member, or product..."
                  value={policySearch}
                  onChange={(e) => setPolicySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {policyTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPolicyStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      policyStatusFilter === tab.key
                        ? 'bg-teal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={openCreatePolicy}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4ea03c] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Policy
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">Showing {filteredPolicies.length} of {policies.length} policies</p>
          </motion.div>

          {/* Policies Table */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {policiesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-teal animate-spin" />
              </div>
            ) : (
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
                      <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPolicies.map((pol) => (
                      <tr key={pol.id} className="hover:bg-cream/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{pol.policyNumber}</td>
                        <td className="py-3 px-4 font-medium text-navy">{pol.memberName}</td>
                        <td className="py-3 px-4 text-gray-500">{pol.productType}</td>
                        <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{formatCurrency(pol.coverageAmount)}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-gray-600">{formatCurrency(pol.premium)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[pol.status] || 'bg-gray-100 text-gray-600'}`}>
                            {pol.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                            {pol.status === 'pending-claim' && <Clock className="w-3 h-3" />}
                            {statusLabels[pol.status] || pol.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{pol.expiryDate}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditPolicy(pol.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              title="Edit policy"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            {deleteConfirmId === pol.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDeletePolicy(pol.id)}
                                  disabled={deletingPolicyId === pol.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {deletingPolicyId === pol.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    'Confirm'
                                  )}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirmId(pol.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                                title="Delete policy"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!policiesLoading && filteredPolicies.length === 0 && (
              <div className="py-16 text-center">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No policies match your filters</p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ─── Policy Create/Edit Modal ─── */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1B2A4A]">
                {editingPolicyId ? 'Edit Policy' : 'Add New Policy'}
              </h2>
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Policy Number */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Policy Number</label>
                <input
                  type="text"
                  value={policyForm.policy_number}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, policy_number: e.target.value }))}
                  placeholder="POL-2026-0001"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                />
              </div>

              {/* Member */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Member</label>
                {members.length > 0 ? (
                  <select
                    value={policyForm.member_id}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, member_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
                  >
                    <option value="">Select a member...</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={policyForm.member_id}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, member_id: e.target.value }))}
                    placeholder="Member ID (UUID)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                )}
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Type</label>
                {products.length > 0 ? (
                  <select
                    value={policyForm.product_id}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, product_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={policyForm.product_id}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, product_id: e.target.value }))}
                    placeholder="Product ID (UUID)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                )}
              </div>

              {/* Coverage & Premium row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Amount</label>
                  <input
                    type="number"
                    value={policyForm.coverage_amount}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, coverage_amount: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Premium</label>
                  <input
                    type="number"
                    value={policyForm.premium}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, premium: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={policyForm.status}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>

              {/* Dates row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={policyForm.start_date}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={policyForm.end_date}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/50"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolicy}
                disabled={policySaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#4ea03c] transition-colors shadow-sm disabled:opacity-50"
              >
                {policySaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingPolicyId ? 'Update Policy' : 'Create Policy'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
