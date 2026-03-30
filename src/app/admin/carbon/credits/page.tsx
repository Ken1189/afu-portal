'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins, Plus, Loader2, X, Search, BadgeCheck, DollarSign,
  ShoppingCart, Archive, TrendingUp, Users, TreePine,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CarbonCredit {
  id: string;
  serial_number: string;
  project_id: string;
  vintage_year: number;
  quantity: number;
  status: string;
  price_per_tonne: number;
  minted_at: string;
  project_name?: string;
  buyer_name?: string;
}

interface CarbonProject {
  id: string;
  name: string;
  price_per_credit: number;
}

interface SaleRecord {
  id: string;
  credit_serial: string;
  buyer_name: string;
  quantity: number;
  total_amount: number;
  farmer_share: number;
  afu_share: number;
  buffer_share: number;
  purchased_at: string;
}

// ── Demo data ────────────────────────────────────────────────────────────────

const demoProjects: CarbonProject[] = [
  { id: 'p1', name: 'Chobe Agroforestry Initiative', price_per_credit: 18.5 },
  { id: 'p2', name: 'Makgadikgadi Soil Carbon Project', price_per_credit: 22 },
  { id: 'p3', name: 'Eastern Highlands Methane Capture', price_per_credit: 15.75 },
  { id: 'p4', name: 'Kilimanjaro Shade-Grown Coffee', price_per_credit: 24.5 },
  { id: 'p5', name: 'Okavango Delta Biochar Programme', price_per_credit: 85 },
  { id: 'p6', name: 'Tuli Block Conservation Tillage', price_per_credit: 13.5 },
];

const demoCredits: CarbonCredit[] = [
  { id: 'c1', serial_number: 'ACR-2025-0012', project_id: 'p1', vintage_year: 2025, quantity: 450, status: 'listed', price_per_tonne: 18.5, minted_at: '2025-01-15', project_name: 'Chobe Agroforestry Initiative' },
  { id: 'c2', serial_number: 'ACR-2025-0045', project_id: 'p2', vintage_year: 2025, quantity: 280, status: 'listed', price_per_tonne: 22, minted_at: '2025-02-01', project_name: 'Makgadikgadi Soil Carbon Project' },
  { id: 'c3', serial_number: 'ACR-2024-0089', project_id: 'p3', vintage_year: 2024, quantity: 620, status: 'sold', price_per_tonne: 15.75, minted_at: '2024-08-15', project_name: 'Eastern Highlands Methane Capture', buyer_name: 'GreenFuture Corp' },
  { id: 'c4', serial_number: 'ACR-2025-0102', project_id: 'p4', vintage_year: 2025, quantity: 520, status: 'listed', price_per_tonne: 24.5, minted_at: '2025-03-01', project_name: 'Kilimanjaro Shade-Grown Coffee' },
  { id: 'c5', serial_number: 'ACR-2024-0156', project_id: 'p5', vintage_year: 2024, quantity: 340, status: 'retired', price_per_tonne: 85, minted_at: '2024-11-01', project_name: 'Okavango Delta Biochar Programme', buyer_name: 'EcoVentures Ltd' },
  { id: 'c6', serial_number: 'ACR-2025-0178', project_id: 'p6', vintage_year: 2025, quantity: 310, status: 'issued', price_per_tonne: 13.5, minted_at: '2025-03-10', project_name: 'Tuli Block Conservation Tillage' },
];

const demoSales: SaleRecord[] = [
  { id: 's1', credit_serial: 'ACR-2024-0089', buyer_name: 'GreenFuture Corp', quantity: 50, total_amount: 787.5, farmer_share: 551.25, afu_share: 157.5, buffer_share: 78.75, purchased_at: '2025-02-15' },
  { id: 's2', credit_serial: 'ACR-2024-0089', buyer_name: 'SustainTech Inc', quantity: 100, total_amount: 1575, farmer_share: 1102.5, afu_share: 315, buffer_share: 157.5, purchased_at: '2025-02-20' },
  { id: 's3', credit_serial: 'ACR-2024-0156', buyer_name: 'EcoVentures Ltd', quantity: 30, total_amount: 2550, farmer_share: 1785, afu_share: 510, buffer_share: 255, purchased_at: '2025-03-01' },
  { id: 's4', credit_serial: 'ACR-2025-0012', buyer_name: 'CarbonNeutral AG', quantity: 200, total_amount: 3700, farmer_share: 2590, afu_share: 740, buffer_share: 370, purchased_at: '2025-03-10' },
];

const statusColors: Record<string, string> = {
  issued: 'bg-blue-100 text-blue-700',
  listed: 'bg-purple-100 text-purple-700',
  sold: 'bg-green-100 text-green-700',
  retired: 'bg-gray-100 text-gray-600',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminCarbonCreditsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tab, setTab] = useState<'credits' | 'sales'>('credits');

  // Mint form
  const [showMintForm, setShowMintForm] = useState(false);
  const [mintForm, setMintForm] = useState({ project_id: '', vintage_year: new Date().getFullYear(), quantity: 0, price_per_tonne: 0 });
  const [minting, setMinting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [creditsRes, projectsRes, salesRes] = await Promise.all([
          supabase.from('carbon_credits').select('*, carbon_projects(name)').order('created_at', { ascending: false }),
          supabase.from('carbon_projects').select('id, name, price_per_credit').order('name'),
          supabase.from('carbon_purchases').select('*').order('created_at', { ascending: false }),
        ]);

        if (creditsRes.data?.length) {
          setCredits(creditsRes.data.map((c: any) => ({ ...c, project_name: c.carbon_projects?.name })));
        } else {
          setCredits(demoCredits);
        }

        if (projectsRes.data?.length) {
          setProjects(projectsRes.data);
        } else {
          setProjects(demoProjects);
        }

        if (salesRes.data?.length) {
          setSales(salesRes.data.map((s: any) => ({
            id: s.id,
            credit_serial: s.credit_serial || 'N/A',
            buyer_name: s.buyer_name || 'Unknown',
            quantity: s.quantity || 0,
            total_amount: s.total_amount || 0,
            farmer_share: (s.total_amount || 0) * 0.7,
            afu_share: (s.total_amount || 0) * 0.2,
            buffer_share: (s.total_amount || 0) * 0.1,
            purchased_at: s.created_at || s.purchased_at,
          })));
        } else {
          setSales(demoSales);
        }
      } catch {
        setCredits(demoCredits);
        setProjects(demoProjects);
        setSales(demoSales);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  // KPIs
  const totalIssued = credits.reduce((s, c) => s + c.quantity, 0);
  const totalSold = credits.filter(c => c.status === 'sold' || c.status === 'retired').reduce((s, c) => s + c.quantity, 0);
  const totalRevenue = sales.reduce((s, r) => s + r.total_amount, 0);
  const farmerRevenue = sales.reduce((s, r) => s + r.farmer_share, 0);
  const afuRevenue = sales.reduce((s, r) => s + r.afu_share, 0);
  const bufferRevenue = sales.reduce((s, r) => s + r.buffer_share, 0);

  // Mint credits
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mintForm.project_id || !mintForm.quantity) {
      showToast('error', 'Project and quantity are required');
      return;
    }
    setMinting(true);
    try {
      const res = await fetch('/api/carbon/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mintForm),
      });

      if (res.ok) {
        const data = await res.json();
        const proj = projects.find(p => p.id === mintForm.project_id);
        const newCredit: CarbonCredit = data.credit || {
          id: `c${Date.now()}`,
          serial_number: `ACR-${mintForm.vintage_year}-${String(Date.now()).slice(-4)}`,
          project_id: mintForm.project_id,
          vintage_year: mintForm.vintage_year,
          quantity: mintForm.quantity,
          status: 'issued',
          price_per_tonne: mintForm.price_per_tonne,
          minted_at: new Date().toISOString(),
          project_name: proj?.name,
        };
        newCredit.project_name = proj?.name;
        setCredits(prev => [newCredit, ...prev]);
        setShowMintForm(false);
        setMintForm({ project_id: '', vintage_year: new Date().getFullYear(), quantity: 0, price_per_tonne: 0 });
        showToast('success', `Minted ${mintForm.quantity} credits successfully`);
      } else {
        const err = await res.json();
        showToast('error', err.error || 'Minting failed');
      }
    } catch {
      // Demo fallback
      const proj = projects.find(p => p.id === mintForm.project_id);
      setCredits(prev => [{
        id: `c${Date.now()}`,
        serial_number: `ACR-${mintForm.vintage_year}-${String(Date.now()).slice(-4)}`,
        project_id: mintForm.project_id,
        vintage_year: mintForm.vintage_year,
        quantity: mintForm.quantity,
        status: 'issued',
        price_per_tonne: mintForm.price_per_tonne,
        minted_at: new Date().toISOString(),
        project_name: proj?.name,
      }, ...prev]);
      setShowMintForm(false);
      showToast('success', `Minted ${mintForm.quantity} credits (demo)`);
    }
    setMinting(false);
  };

  // Update credit status
  const updateCreditStatus = async (credit: CarbonCredit, newStatus: string) => {
    try {
      await fetch('/api/carbon/credits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit_id: credit.id, status: newStatus }),
      });
    } catch {
      // fallback
    }
    setCredits(prev => prev.map(c => c.id === credit.id ? { ...c, status: newStatus } : c));
    showToast('success', `Credit ${credit.serial_number} marked as ${newStatus}`);
  };

  // Filter
  const filteredCredits = credits.filter(c => {
    if (search && !c.serial_number.toLowerCase().includes(search.toLowerCase()) && !c.project_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Carbon Credits</h1>
          <p className="text-sm text-gray-500">Mint, manage, and track carbon credit lifecycle</p>
        </div>
        <button
          onClick={() => setShowMintForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
        >
          <Plus className="w-4 h-4" /> Mint Credits
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Issued', value: `${totalIssued.toLocaleString()}t`, icon: Coins, color: '#5DB347' },
          { label: 'Total Sold', value: `${totalSold.toLocaleString()}t`, icon: ShoppingCart, color: '#6366F1' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#10B981' },
          { label: 'Farmer Share (70%)', value: `$${farmerRevenue.toLocaleString()}`, icon: Users, color: '#F59E0B' },
          { label: 'AFU Share (20%)', value: `$${afuRevenue.toLocaleString()}`, icon: TrendingUp, color: '#8B5CF6' },
          { label: 'Buffer Pool (10%)', value: `$${bufferRevenue.toLocaleString()}`, icon: Archive, color: '#EF4444' },
        ].map(kpi => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-[#1B2A4A]">{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['credits', 'sales'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'credits' ? 'Credits' : 'Sales History'}
          </button>
        ))}
      </div>

      {tab === 'credits' ? (
        <>
          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by serial or project..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#5DB347]"
              />
            </div>
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
            >
              <option value="">All Statuses</option>
              <option value="issued">Issued</option>
              <option value="listed">Listed</option>
              <option value="sold">Sold</option>
              <option value="retired">Retired</option>
            </select>
          </div>

          {/* Credits Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Serial Number</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Project</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Vintage</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Quantity</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Price/t</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCredits.map(credit => (
                    <tr key={credit.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium text-[#1B2A4A]">{credit.serial_number}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{credit.project_name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-gray-600">{credit.vintage_year}</td>
                      <td className="px-4 py-3 font-medium text-[#1B2A4A]">{credit.quantity.toLocaleString()}t</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[credit.status] || 'bg-gray-100 text-gray-600'}`}>
                          {credit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-[#5DB347]">${credit.price_per_tonne}</td>
                      <td className="px-4 py-3 text-gray-500">{credit.buyer_name || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {credit.status === 'issued' && (
                            <button
                              onClick={() => updateCreditStatus(credit, 'listed')}
                              className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition"
                            >
                              List for Sale
                            </button>
                          )}
                          {credit.status === 'sold' && (
                            <button
                              onClick={() => updateCreditStatus(credit, 'retired')}
                              className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition"
                            >
                              Retire
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCredits.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No credits found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Sales History */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Credit</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Quantity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Farmer (70%)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">AFU (20%)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Buffer (10%)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs">{sale.credit_serial}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{sale.buyer_name}</td>
                    <td className="px-4 py-3 text-gray-600">{sale.quantity}t</td>
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">${sale.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600">${sale.farmer_share.toLocaleString()}</td>
                    <td className="px-4 py-3 text-purple-600">${sale.afu_share.toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-500">${sale.buffer_share.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(sale.purchased_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sales.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No sales recorded yet</p>
            </div>
          )}
        </div>
      )}

      {/* Mint Credits Modal */}
      <AnimatePresence>
        {showMintForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMintForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">Mint Carbon Credits</h3>
                <button onClick={() => setShowMintForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleMint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    required
                    value={mintForm.project_id}
                    onChange={e => {
                      const p = projects.find(pr => pr.id === e.target.value);
                      setMintForm(f => ({ ...f, project_id: e.target.value, price_per_tonne: p?.price_per_credit || 0 }));
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  >
                    <option value="">Select project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vintage Year *</label>
                    <input required type="number" min={2020} max={2030} value={mintForm.vintage_year} onChange={e => setMintForm(f => ({ ...f, vintage_year: parseInt(e.target.value) }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (tonnes) *</label>
                    <input required type="number" min={1} value={mintForm.quantity || ''} onChange={e => setMintForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Tonne ($)</label>
                  <input type="number" step="0.01" min="0" value={mintForm.price_per_tonne || ''} onChange={e => setMintForm(f => ({ ...f, price_per_tonne: parseFloat(e.target.value) || 0 }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]" />
                </div>

                {mintForm.quantity > 0 && mintForm.price_per_tonne > 0 && (
                  <div className="bg-green-50 rounded-xl p-3 space-y-1">
                    <p className="text-sm font-medium text-[#1B2A4A]">Estimated Value: ${(mintForm.quantity * mintForm.price_per_tonne).toLocaleString()}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                      <span>Farmer 70%: ${(mintForm.quantity * mintForm.price_per_tonne * 0.7).toLocaleString()}</span>
                      <span>AFU 20%: ${(mintForm.quantity * mintForm.price_per_tonne * 0.2).toLocaleString()}</span>
                      <span>Buffer 10%: ${(mintForm.quantity * mintForm.price_per_tonne * 0.1).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={minting}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {minting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Mint Credits'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
