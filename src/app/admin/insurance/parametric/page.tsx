'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Play,
  DollarSign,
  Users,
  Zap,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Cloud,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { describeTriggerCondition } from '@/lib/insurance/weather';

// ── Types ────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  type: string;
  description: string | null;
  country: string | null;
  region: string | null;
  trigger_conditions: Record<string, unknown>;
  payout_structure: Record<string, unknown>;
  premium_rate: number;
  min_coverage: number;
  max_coverage: number;
  season_start: string | null;
  season_end: string | null;
  active: boolean;
  created_at: string;
}

interface Policy {
  id: string;
  user_id: string;
  product_id: string;
  policy_number: string;
  status: string;
  coverage_amount: number;
  premium_paid: number;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  created_at: string;
  product?: Product;
}

interface Trigger {
  id: string;
  policy_id: string;
  trigger_date: string;
  measured_value: number;
  threshold_value: number;
  payout_amount: number;
  payout_status: string;
  weather_data: Record<string, unknown> | null;
  created_at: string;
  policy?: Policy;
}

// ── Helpers ──────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusColors: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expired: 'bg-gray-50 text-gray-500 border-gray-200',
  triggered: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-amber-50 text-amber-600 border-amber-200',
  paid: 'bg-green-50 text-green-600 border-green-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
};

type AdminTab = 'products' | 'policies' | 'triggers' | 'weather';

const defaultProduct = {
  name: '',
  type: 'drought',
  description: '',
  country: '',
  region: '',
  trigger_conditions: JSON.stringify({ measurement: 'cumulative_rainfall', comparison: 'below', threshold: 50, period_days: 30 }, null, 2),
  payout_structure: JSON.stringify({ type: 'linear', base_payout_percent: 50, max_payout_percent: 100 }, null, 2),
  premium_rate: 0.05,
  min_coverage: 100,
  max_coverage: 10000,
  season_start: '',
  season_end: '',
  active: true,
};

// ── Component ────────────────────────────────────────────────────────────

export default function AdminParametricPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  // KPIs
  const [kpis, setKpis] = useState({
    activeProducts: 0,
    activePolicies: 0,
    totalCoverage: 0,
    totalPremiums: 0,
    triggersThisMonth: 0,
    payoutsThisMonth: 0,
  });

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState(defaultProduct);
  const [saving, setSaving] = useState(false);

  // Filters
  const [policyFilter, setPolicyFilter] = useState('');
  const [triggerFilter, setTriggerFilter] = useState('');

  // Expanded policy detail
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  // Check running
  const [checkRunning, setCheckRunning] = useState(false);
  const [checkResult, setCheckResult] = useState<Record<string, unknown> | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch data ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const adminClient = supabase;

      // Products
      const { data: prods } = await adminClient
        .from('parametric_products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts((prods as Product[]) || []);

      // Policies
      const { data: pols } = await adminClient
        .from('parametric_policies')
        .select('*, product:parametric_products(*)')
        .order('created_at', { ascending: false });
      setPolicies((pols as unknown as Policy[]) || []);

      // Triggers
      const { data: trigs } = await adminClient
        .from('parametric_triggers')
        .select('*, policy:parametric_policies(*, product:parametric_products(name))')
        .order('created_at', { ascending: false });
      setTriggers((trigs as unknown as Trigger[]) || []);

      // KPIs
      const activeProds = (prods || []).filter((p: Product) => p.active).length;
      const activePols = (pols || []).filter((p: Policy) => p.status === 'active').length;
      const totalCov = (pols || []).filter((p: Policy) => p.status === 'active').reduce((s: number, p: Policy) => s + p.coverage_amount, 0);
      const totalPrem = (pols || []).reduce((s: number, p: Policy) => s + p.premium_paid, 0);
      const thisMonth = new Date().toISOString().slice(0, 7);
      const trigThisMonth = (trigs || []).filter((t: Trigger) => t.trigger_date?.startsWith(thisMonth)).length;
      const payThisMonth = (trigs || [])
        .filter((t: Trigger) => t.trigger_date?.startsWith(thisMonth) && t.payout_status === 'paid')
        .reduce((s: number, t: Trigger) => s + t.payout_amount, 0);

      setKpis({
        activeProducts: activeProds,
        activePolicies: activePols,
        totalCoverage: totalCov,
        totalPremiums: totalPrem,
        triggersThisMonth: trigThisMonth,
        payoutsThisMonth: payThisMonth,
      });
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Product CRUD ───────────────────────────────────────────────────────

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProductForm(defaultProduct);
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      type: p.type,
      description: p.description || '',
      country: p.country || '',
      region: p.region || '',
      trigger_conditions: JSON.stringify(p.trigger_conditions, null, 2),
      payout_structure: JSON.stringify(p.payout_structure, null, 2),
      premium_rate: p.premium_rate,
      min_coverage: p.min_coverage,
      max_coverage: p.max_coverage,
      season_start: p.season_start || '',
      season_end: p.season_end || '',
      active: p.active,
    });
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      let trigCond, payStruct;
      try { trigCond = JSON.parse(productForm.trigger_conditions); } catch { showToast('Invalid trigger conditions JSON', 'error'); setSaving(false); return; }
      try { payStruct = JSON.parse(productForm.payout_structure); } catch { showToast('Invalid payout structure JSON', 'error'); setSaving(false); return; }

      const body = {
        name: productForm.name,
        type: productForm.type,
        description: productForm.description || null,
        country: productForm.country || null,
        region: productForm.region || null,
        trigger_conditions: trigCond,
        payout_structure: payStruct,
        premium_rate: productForm.premium_rate,
        min_coverage: productForm.min_coverage,
        max_coverage: productForm.max_coverage,
        season_start: productForm.season_start || null,
        season_end: productForm.season_end || null,
        active: productForm.active,
      };

      const url = editingProduct
        ? `/api/insurance/parametric/products/${editingProduct.id}`
        : '/api/insurance/parametric/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast(editingProduct ? 'Product updated' : 'Product created');
        setShowProductModal(false);
        fetchData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Save failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    const res = await fetch(`/api/insurance/parametric/products/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Product deactivated'); fetchData(); }
    else showToast('Delete failed', 'error');
  };

  const toggleProduct = async (p: Product) => {
    const res = await fetch(`/api/insurance/parametric/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) { showToast(`Product ${p.active ? 'deactivated' : 'activated'}`); fetchData(); }
  };

  // ── Run Check ──────────────────────────────────────────────────────────

  const runCheck = async () => {
    setCheckRunning(true);
    setCheckResult(null);
    try {
      const res = await fetch('/api/insurance/parametric/check', { method: 'POST' });
      const data = await res.json();
      setCheckResult(data);
      if (data.success) {
        showToast(`Check complete: ${data.checked} checked, ${data.triggered} triggered`);
        fetchData();
      } else {
        showToast(data.error || 'Check failed', 'error');
      }
    } catch {
      showToast('Check failed — network error', 'error');
    }
    setCheckRunning(false);
  };

  // ── Process payout ─────────────────────────────────────────────────────

  const processPayout = async (triggerId: string) => {
    try {
      // Call payout via the parametric engine on server
      const { error } = await supabase
        .from('parametric_triggers')
        .update({ payout_status: 'paid' })
        .eq('id', triggerId);

      if (!error) {
        showToast('Payout marked as paid');
        fetchData();
      } else {
        showToast('Payout failed: ' + error.message, 'error');
      }
    } catch {
      showToast('Payout error', 'error');
    }
  };

  // ── Filtered data ──────────────────────────────────────────────────────

  const filteredPolicies = policies.filter((p) => {
    if (!policyFilter) return true;
    const q = policyFilter.toLowerCase();
    return (
      p.policy_number.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q) ||
      p.product?.name?.toLowerCase().includes(q)
    );
  });

  const filteredTriggers = triggers.filter((t) => {
    if (!triggerFilter) return true;
    const q = triggerFilter.toLowerCase();
    return (
      t.payout_status.toLowerCase().includes(q) ||
      t.policy?.policy_number?.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        <span className="ml-2 text-sm text-gray-500">Loading parametric insurance admin...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#5DB347]" />
            Parametric Insurance
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage products, policies, triggers, and payouts</p>
        </div>
        <button
          onClick={runCheck}
          disabled={checkRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-semibold hover:bg-[#4a9a3a] transition-colors disabled:opacity-50"
        >
          {checkRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Run Check
        </button>
      </div>

      {/* Check Result */}
      {checkResult && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm">
          <p className="font-semibold text-blue-800">Check Result</p>
          <p className="text-blue-700">
            Checked: {String(checkResult.checked)} | Triggered: {String(checkResult.triggered)} | Payouts: {String(checkResult.payouts_initiated)}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Products', value: kpis.activeProducts, icon: <Shield className="w-5 h-5 text-[#5DB347]" />, color: 'bg-green-50' },
          { label: 'Active Policies', value: kpis.activePolicies, icon: <FileText className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50' },
          { label: 'Total Coverage', value: fmt(kpis.totalCoverage), icon: <DollarSign className="w-5 h-5 text-green-600" />, color: 'bg-green-50' },
          { label: 'Total Premiums', value: fmt(kpis.totalPremiums), icon: <DollarSign className="w-5 h-5 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Triggers (Month)', value: kpis.triggersThisMonth, icon: <Zap className="w-5 h-5 text-red-500" />, color: 'bg-red-50' },
          { label: 'Payouts (Month)', value: fmt(kpis.payoutsThisMonth), icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, color: 'bg-green-50' },
        ].map((kpi) => (
          <div key={kpi.label} className={`rounded-xl ${kpi.color} border border-gray-100 p-4`}>
            <div className="flex items-center gap-2 mb-1">{kpi.icon}<span className="text-[11px] text-gray-500">{kpi.label}</span></div>
            <p className="text-xl font-bold text-[#1B2A4A]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {([
          { key: 'products' as AdminTab, label: 'Products', icon: <Shield className="w-4 h-4" /> },
          { key: 'policies' as AdminTab, label: 'Policies', icon: <FileText className="w-4 h-4" /> },
          { key: 'triggers' as AdminTab, label: 'Triggers', icon: <Zap className="w-4 h-4" /> },
          { key: 'weather' as AdminTab, label: 'Weather Monitor', icon: <Cloud className="w-4 h-4" /> },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg transition-all ${
              tab === t.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Products Tab ── */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Products ({products.length})</h2>
            <button onClick={openCreateProduct} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5DB347] text-white text-sm font-semibold hover:bg-[#4a9a3a]">
              <Plus className="w-4 h-4" /> New Product
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden md:table-cell">Country</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">Trigger</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Rate</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">{p.name}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{p.type}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.country || 'Global'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell max-w-[200px] truncate">
                      {describeTriggerCondition(p.trigger_conditions as { measurement: string; comparison: string; threshold: number; period_days?: number })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{(p.premium_rate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleProduct(p)} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border cursor-pointer ${p.active ? statusColors.active : statusColors.expired}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditProduct(p)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No products found. Create your first parametric product.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Policies Tab ── */}
      {tab === 'policies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Policies ({policies.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter policies..."
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredPolicies.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpandedPolicy(expandedPolicy === p.id ? null : p.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[p.status] || statusColors.active}`}>
                      {p.status}
                    </span>
                    <span className="font-mono text-xs text-gray-500">{p.policy_number}</span>
                    <span className="font-medium text-[#1B2A4A]">{p.product?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600">{fmt(p.coverage_amount)}</span>
                    {expandedPolicy === p.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {expandedPolicy === p.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-[10px] text-gray-400">User ID</p><p className="font-mono text-xs text-gray-600 truncate">{p.user_id}</p></div>
                      <div><p className="text-[10px] text-gray-400">Premium Paid</p><p className="font-semibold">{fmt(p.premium_paid)}</p></div>
                      <div><p className="text-[10px] text-gray-400">Period</p><p>{fmtDate(p.start_date)} - {fmtDate(p.end_date)}</p></div>
                      <div><p className="text-[10px] text-gray-400">Location</p><p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.latitude.toFixed(3)}, {p.longitude.toFixed(3)}</p></div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredPolicies.length === 0 && (
              <div className="text-center py-8 text-gray-400">No policies match your filter.</div>
            )}
          </div>
        </div>
      )}

      {/* ── Triggers Tab ── */}
      {tab === 'triggers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1B2A4A]">Triggers ({triggers.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by status..."
                value={triggerFilter}
                onChange={(e) => setTriggerFilter(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Policy</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Measured</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Threshold</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Payout</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTriggers.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">{fmtDate(t.trigger_date)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.policy?.policy_number || t.policy_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-500">{t.measured_value}</td>
                    <td className="px-4 py-3 text-right font-medium">{t.threshold_value}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{fmt(t.payout_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColors[t.payout_status] || statusColors.pending}`}>
                        {t.payout_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.payout_status === 'pending' && (
                        <button
                          onClick={() => processPayout(t.id)}
                          className="text-xs font-semibold text-[#5DB347] hover:underline flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify & Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTriggers.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No triggers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Weather Monitor Tab ── */}
      {tab === 'weather' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1B2A4A]">Weather at Policy Locations</h2>
          <p className="text-sm text-gray-500">Current conditions at all active policy locations.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {policies
              .filter((p) => p.status === 'active')
              .map((p) => (
                <WeatherCard key={p.id} policy={p} />
              ))}

            {policies.filter((p) => p.status === 'active').length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-400">
                No active policies to monitor.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Product Modal ── */}
      <AnimatePresence>
        {showProductModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[5%] z-50 max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-[#1B2A4A] p-4 text-white flex items-center justify-between">
                <h3 className="text-lg font-bold">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Name</label>
                    <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                    <select value={productForm.type} onChange={(e) => setProductForm({ ...productForm, type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]">
                      {['drought', 'flood', 'heat', 'frost', 'excess_rain', 'low_rainfall'].map((t) => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Country</label>
                    <input value={productForm.country} onChange={(e) => setProductForm({ ...productForm, country: e.target.value })} placeholder="Leave empty for global" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Region</label>
                    <input value={productForm.region} onChange={(e) => setProductForm({ ...productForm, region: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Trigger Conditions (JSON)</label>
                  <textarea value={productForm.trigger_conditions} onChange={(e) => setProductForm({ ...productForm, trigger_conditions: e.target.value })} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#5DB347]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Payout Structure (JSON)</label>
                  <textarea value={productForm.payout_structure} onChange={(e) => setProductForm({ ...productForm, payout_structure: e.target.value })} rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-[#5DB347]" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Premium Rate</label>
                    <input type="number" step="0.001" value={productForm.premium_rate} onChange={(e) => setProductForm({ ...productForm, premium_rate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Min Coverage</label>
                    <input type="number" value={productForm.min_coverage} onChange={(e) => setProductForm({ ...productForm, min_coverage: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Max Coverage</label>
                    <input type="number" value={productForm.max_coverage} onChange={(e) => setProductForm({ ...productForm, max_coverage: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Season Start</label>
                    <input type="date" value={productForm.season_start} onChange={(e) => setProductForm({ ...productForm, season_start: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Season End</label>
                    <input type="date" value={productForm.season_end} onChange={(e) => setProductForm({ ...productForm, season_end: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="active" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })} className="accent-[#5DB347]" />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">Active</label>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowProductModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
                    Cancel
                  </button>
                  <button onClick={saveProduct} disabled={saving || !productForm.name} className="flex-1 py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Weather Card sub-component ───────────────────────────────────────────

function WeatherCard({ policy }: { policy: Policy }) {
  const [weather, setWeather] = useState<{ temperature: number; precipitation: number; humidity: number; wind_speed: number; soil_moisture: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weather/current?lat=${policy.latitude}&lng=${policy.longitude}`)
      .then((r) => r.json())
      .then((d) => { if (d.current) setWeather(d.current); })
      .catch(() => {
        setWeather({ temperature: 28, precipitation: 3, humidity: 65, wind_speed: 10, soil_moisture: 22 });
      })
      .finally(() => setLoading(false));
  }, [policy.latitude, policy.longitude]);

  const trigger = policy.product?.trigger_conditions as { measurement?: string; threshold?: number; comparison?: string } | undefined;
  let approaching = false;
  let triggered = false;

  if (weather && trigger) {
    const valueMap: Record<string, number> = {
      cumulative_rainfall: weather.precipitation,
      daily_rainfall: weather.precipitation,
      max_temperature: weather.temperature,
      soil_moisture: weather.soil_moisture,
    };
    const val = valueMap[trigger.measurement || ''] ?? 0;
    const thresh = trigger.threshold ?? 0;
    const comp = trigger.comparison;

    if (comp === 'below') {
      triggered = val < thresh;
      approaching = !triggered && val < thresh * 1.2;
    } else if (comp === 'above') {
      triggered = val > thresh;
      approaching = !triggered && val > thresh * 0.8;
    }
  }

  const borderColor = triggered ? 'border-red-300 bg-red-50' : approaching ? 'border-amber-300 bg-amber-50' : 'border-gray-100 bg-white';

  return (
    <div className={`rounded-xl border p-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-bold text-[#1B2A4A]">{policy.product?.name || 'Policy'}</p>
          <p className="text-[10px] text-gray-400 font-mono">{policy.policy_number}</p>
        </div>
        {triggered && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">TRIGGERED</span>}
        {approaching && !triggered && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">APPROACHING</span>}
      </div>

      <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
        <MapPin className="w-3 h-3" />
        {policy.latitude.toFixed(3)}, {policy.longitude.toFixed(3)}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
      ) : weather ? (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-white/60"><p className="font-bold text-[#1B2A4A]">{weather.temperature.toFixed(0)}&deg;C</p><p className="text-[10px] text-gray-400">Temp</p></div>
          <div className="p-2 rounded-lg bg-white/60"><p className="font-bold text-[#1B2A4A]">{weather.precipitation.toFixed(1)}mm</p><p className="text-[10px] text-gray-400">Rain</p></div>
          <div className="p-2 rounded-lg bg-white/60"><p className="font-bold text-[#1B2A4A]">{weather.humidity.toFixed(0)}%</p><p className="text-[10px] text-gray-400">Humidity</p></div>
        </div>
      ) : null}
    </div>
  );
}
