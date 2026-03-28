'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';
import {
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  MapPin,
  Wheat,
  DollarSign,
  TrendingUp,
  Copy,
  ShoppingCart,
  Package,
  Wallet,
  Vote,
  UserPlus,
  BarChart3,
  Send,
  ChevronRight,
  Clock,
  Globe,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface Cooperative {
  id: string;
  name: string;
  country: string;
  region: string | null;
  member_count: number;
  description: string | null;
  status: string;
  created_at: string;
}

interface CoopMember {
  id: string;
  cooperative_id: string;
  member_id: string;
  role: string;
  joined_at: string;
  full_name?: string;
  email?: string;
  farm_size_ha?: number;
  crops?: string;
  contribution?: number;
}

interface CoopOrder {
  id: string;
  order_number: string;
  type: 'buy' | 'sell';
  commodity: string;
  quantity: number;
  unit: string;
  target_price: number;
  currency: string;
  status: string;
  deadline: string;
  created_at: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────
const DEMO_COOPERATIVE: Cooperative = {
  id: 'demo-coop-1',
  name: 'Kilimanjaro Farmers Cooperative',
  country: 'Tanzania',
  region: 'Kilimanjaro',
  member_count: 48,
  description: 'United smallholder farmers working together for better market access and bulk purchasing power.',
  status: 'active',
  created_at: '2023-06-15',
};

const DEMO_MEMBERS: CoopMember[] = [
  { id: '1', cooperative_id: 'demo-coop-1', member_id: 'u1', role: 'chairman', joined_at: '2023-06-15', full_name: 'John Mwangi', email: 'john@email.com', farm_size_ha: 12, crops: 'Maize, Beans', contribution: 2400 },
  { id: '2', cooperative_id: 'demo-coop-1', member_id: 'u2', role: 'treasurer', joined_at: '2023-06-15', full_name: 'Grace Ochieng', email: 'grace@email.com', farm_size_ha: 8, crops: 'Coffee, Avocados', contribution: 1800 },
  { id: '3', cooperative_id: 'demo-coop-1', member_id: 'u3', role: 'secretary', joined_at: '2023-07-01', full_name: 'Peter Kamau', email: 'peter@email.com', farm_size_ha: 15, crops: 'Tea, Maize', contribution: 3200 },
  { id: '4', cooperative_id: 'demo-coop-1', member_id: 'u4', role: 'member', joined_at: '2023-08-10', full_name: 'Mary Wanjiru', email: 'mary@email.com', farm_size_ha: 5, crops: 'Beans, Potatoes', contribution: 900 },
  { id: '5', cooperative_id: 'demo-coop-1', member_id: 'u5', role: 'member', joined_at: '2023-09-20', full_name: 'James Otieno', email: 'james@email.com', farm_size_ha: 10, crops: 'Maize, Sunflower', contribution: 2100 },
];

const DEMO_ORDERS: CoopOrder[] = [
  { id: 'o1', order_number: 'COOP-BUY-001', type: 'buy', commodity: 'Fertilizer', quantity: 5000, unit: 'kg', target_price: 0.85, currency: 'USD', status: 'open', deadline: '2026-04-15', created_at: '2026-03-20' },
  { id: 'o2', order_number: 'COOP-SELL-001', type: 'sell', commodity: 'Maize', quantity: 25000, unit: 'kg', target_price: 0.32, currency: 'USD', status: 'afu_review', deadline: '2026-05-01', created_at: '2026-03-18' },
  { id: 'o3', order_number: 'COOP-BUY-002', type: 'buy', commodity: 'Seeds', quantity: 800, unit: 'kg', target_price: 3.50, currency: 'USD', status: 'completed', deadline: '2026-03-01', created_at: '2026-02-10' },
];

const COMMODITIES = [
  'Maize', 'Wheat', 'Rice', 'Sorghum', 'Millet', 'Soybeans', 'Sunflower',
  'Coffee', 'Tea', 'Cocoa', 'Cotton', 'Sugar Cane', 'Cassava', 'Groundnuts',
  'Sesame', 'Beans', 'Cowpeas', 'Potatoes', 'Tomatoes', 'Onions',
  'Bananas', 'Mangoes', 'Avocados', 'Oranges',
  'Fertilizer', 'Seeds', 'Pesticides', 'Farm Equipment',
];

const UNITS = ['kg', 'tonnes', 'bags (50kg)', 'bags (90kg)', 'litres', 'pieces'];
const QUALITY_GRADES = ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Economy)', 'Organic Certified'];

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  afu_review: 'bg-yellow-100 text-yellow-700',
  afu_fulfilling: 'bg-green-100 text-green-700',
  marketplace: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-teal-100 text-teal-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open', afu_review: 'AFU Review', afu_fulfilling: 'AFU Fulfilling',
  marketplace: 'Marketplace', quoted: 'Quoted', accepted: 'Accepted',
  delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled',
};

// ── Tabs ───────────────────────────────────────────────────────────────────
type DashTab = 'members' | 'bulk-buy' | 'collective-sell' | 'treasury' | 'governance';

export default function CooperativeDashboardPage() {
  const supabase = createClient();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>('members');
  const [loading, setLoading] = useState(true);

  // Data
  const [cooperative, setCooperative] = useState<Cooperative | null>(null);
  const [members, setMembers] = useState<CoopMember[]>([]);
  const [orders, setOrders] = useState<CoopOrder[]>([]);
  const [useDemo, setUseDemo] = useState(false);

  // Forms
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [buyForm, setBuyForm] = useState({ commodity: '', quantity: '', unit: 'kg', target_price: '', currency: 'USD', deadline: '', notes: '' });
  const [sellForm, setSellForm] = useState({ commodity: '', quantity: '', unit: 'kg', quality_grade: 'Grade B (Standard)', target_price: '', currency: 'USD', deadline: '', notes: '' });

  // ── Fetch cooperative data ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Find user's cooperative membership
      const { data: membership } = await supabase
        .from('cooperative_members')
        .select('cooperative_id, role')
        .eq('member_id', user.id)
        .limit(1)
        .single();

      if (!membership) {
        setUseDemo(true);
        setCooperative(DEMO_COOPERATIVE);
        setMembers(DEMO_MEMBERS);
        setOrders(DEMO_ORDERS);
        setLoading(false);
        return;
      }

      // Fetch cooperative
      const { data: coop } = await supabase
        .from('cooperatives')
        .select('*')
        .eq('id', membership.cooperative_id)
        .single();

      if (coop) setCooperative(coop);

      // Fetch members with profile info
      const { data: memData } = await supabase
        .from('cooperative_members')
        .select('*')
        .eq('cooperative_id', membership.cooperative_id)
        .order('joined_at');

      setMembers(memData || []);

      // Fetch cooperative orders
      const { data: orderData } = await supabase
        .from('trade_orders')
        .select('*')
        .eq('cooperative_id', membership.cooperative_id)
        .order('created_at', { ascending: false });

      setOrders(orderData || []);
    } catch {
      setUseDemo(true);
      setCooperative(DEMO_COOPERATIVE);
      setMembers(DEMO_MEMBERS);
      setOrders(DEMO_ORDERS);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Submit bulk buy order ────────────────────────────────────────────────
  const handleBulkBuy = async () => {
    if (!buyForm.commodity || !buyForm.quantity || !buyForm.target_price || !buyForm.deadline) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/cooperatives/' + (cooperative?.id || 'demo') + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'buy', ...buyForm, quantity: parseFloat(buyForm.quantity), target_price: parseFloat(buyForm.target_price) }),
      });
      if (!res.ok) throw new Error('Failed to create order');
      setSuccess('Bulk buy order created successfully!');
      setShowBuyForm(false);
      setBuyForm({ commodity: '', quantity: '', unit: 'kg', target_price: '', currency: 'USD', deadline: '', notes: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      setError('Failed to create order. Using demo mode.');
      const newOrder: CoopOrder = {
        id: `o-${Date.now()}`, order_number: `COOP-BUY-${String(orders.length + 1).padStart(3, '0')}`,
        type: 'buy', commodity: buyForm.commodity, quantity: parseFloat(buyForm.quantity),
        unit: buyForm.unit, target_price: parseFloat(buyForm.target_price), currency: buyForm.currency,
        status: 'open', deadline: buyForm.deadline, created_at: new Date().toISOString(),
      };
      setOrders(prev => [newOrder, ...prev]);
      setShowBuyForm(false);
      setBuyForm({ commodity: '', quantity: '', unit: 'kg', target_price: '', currency: 'USD', deadline: '', notes: '' });
      setSuccess('Bulk buy order created (demo)!');
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    }
    setSubmitting(false);
  };

  // ── Submit collective sell ───────────────────────────────────────────────
  const handleCollectiveSell = async () => {
    if (!sellForm.commodity || !sellForm.quantity || !sellForm.target_price || !sellForm.deadline) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/cooperatives/' + (cooperative?.id || 'demo') + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'sell', ...sellForm, quantity: parseFloat(sellForm.quantity), target_price: parseFloat(sellForm.target_price) }),
      });
      if (!res.ok) throw new Error('Failed to create offer');
      setSuccess('Collective sell offer created successfully!');
      setShowSellForm(false);
      setSellForm({ commodity: '', quantity: '', unit: 'kg', quality_grade: 'Grade B (Standard)', target_price: '', currency: 'USD', deadline: '', notes: '' });
      fetchData();
      setTimeout(() => setSuccess(''), 4000);
    } catch {
      const newOrder: CoopOrder = {
        id: `o-${Date.now()}`, order_number: `COOP-SELL-${String(orders.length + 1).padStart(3, '0')}`,
        type: 'sell', commodity: sellForm.commodity, quantity: parseFloat(sellForm.quantity),
        unit: sellForm.unit, target_price: parseFloat(sellForm.target_price), currency: sellForm.currency,
        status: 'open', deadline: sellForm.deadline, created_at: new Date().toISOString(),
      };
      setOrders(prev => [newOrder, ...prev]);
      setShowSellForm(false);
      setSellForm({ commodity: '', quantity: '', unit: 'kg', quality_grade: 'Grade B (Standard)', target_price: '', currency: 'USD', deadline: '', notes: '' });
      setSuccess('Collective sell offer created (demo)!');
      setError('');
      setTimeout(() => setSuccess(''), 4000);
    }
    setSubmitting(false);
  };

  // ── Generate invite link ─────────────────────────────────────────────────
  const handleInvite = () => {
    const link = `${window.location.origin}/farm/cooperatives?join=${cooperative?.id || 'demo'}`;
    setInviteLink(link);
    navigator.clipboard?.writeText(link);
    setSuccess('Invite link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalLand = members.reduce((s, m) => s + (m.farm_size_ha || 0), 0) || 245;
  const combinedProduction = totalLand * 2.5; // rough estimate tonnes
  const revenue = orders.filter(o => o.type === 'sell' && o.status === 'completed').reduce((s, o) => s + o.target_price * o.quantity, 0) || 34500;
  const buyOrders = orders.filter(o => o.type === 'buy');
  const sellOrders = orders.filter(o => o.type === 'sell');
  const treasuryBalance = 12450;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  const tabs: { key: DashTab; label: string; icon: React.ReactNode }[] = [
    { key: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { key: 'bulk-buy', label: 'Bulk Purchasing', icon: <ShoppingCart className="w-4 h-4" /> },
    { key: 'collective-sell', label: 'Collective Selling', icon: <Package className="w-4 h-4" /> },
    { key: 'treasury', label: 'Treasury', icon: <Wallet className="w-4 h-4" /> },
    { key: 'governance', label: 'Governance', icon: <Vote className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#5DB347] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{cooperative?.name || 'My Cooperative'}</h1>
                <p className="text-sm opacity-80 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {cooperative?.region || 'Region'}, {cooperative?.country || 'Country'}
                </p>
              </div>
            </div>
            <p className="text-sm opacity-70 mt-2">{cooperative?.description || 'United farmers working together.'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInvite}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
            <Link
              href="/farm/cooperatives"
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <Globe className="w-4 h-4" />
              All Cooperatives
            </Link>
          </div>
        </div>
        {inviteLink && (
          <div className="mt-3 bg-white/10 rounded-lg p-3 flex items-center gap-2 text-sm">
            <Copy className="w-4 h-4 shrink-0" />
            <span className="truncate">{inviteLink}</span>
          </div>
        )}
      </div>

      {/* Toast */}
      {success && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Members" value={cooperative?.member_count || members.length} icon={<Users className="w-5 h-5 text-[#5DB347]" />} />
        <KPICard label="Total Land (ha)" value={totalLand.toLocaleString()} icon={<MapPin className="w-5 h-5 text-blue-500" />} />
        <KPICard label="Production (tonnes)" value={combinedProduction.toFixed(0)} icon={<Wheat className="w-5 h-5 text-amber-500" />} />
        <KPICard label="Revenue This Season" value={`$${(revenue / 1000).toFixed(1)}K`} icon={<DollarSign className="w-5 h-5 text-green-500" />} />
      </div>

      {/* My Contribution */}
      <div className="bg-[#EBF7E5] rounded-xl p-4">
        <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2">My Contribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">Farm Size:</span> <span className="font-medium">8 ha</span></div>
          <div><span className="text-gray-500">Crops:</span> <span className="font-medium">Maize, Beans</span></div>
          <div><span className="text-gray-500">Contribution:</span> <span className="font-medium">$1,800</span></div>
          <div><span className="text-gray-500">Role:</span> <span className="font-medium capitalize">Member</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setError(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* ─── Members Tab ─── */}
        {activeTab === 'members' && (
          <div>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-[#1B2A4A]">Cooperative Members ({members.length})</h3>
              <button onClick={handleInvite} className="flex items-center gap-2 bg-[#5DB347] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#449933] transition-colors">
                <UserPlus className="w-4 h-4" /> Invite
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Role</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Farm (ha)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Crops</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Contribution</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-[#1B2A4A]">{m.full_name || 'Member'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.role === 'chairman' ? 'bg-amber-100 text-amber-700'
                            : m.role === 'treasurer' ? 'bg-blue-100 text-blue-700'
                              : m.role === 'secretary' ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{m.farm_size_ha || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{m.crops || '—'}</td>
                      <td className="py-3 px-4 text-right font-medium">{m.contribution ? `$${m.contribution.toLocaleString()}` : '—'}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{new Date(m.joined_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Bulk Purchasing Tab ─── */}
        {activeTab === 'bulk-buy' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">Bulk Purchasing</h3>
                <p className="text-sm text-gray-500">Pool orders to get better prices on inputs</p>
              </div>
              <button onClick={() => setShowBuyForm(!showBuyForm)} className="flex items-center gap-2 bg-[#5DB347] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#449933] transition-colors">
                <Plus className="w-4 h-4" /> Create Bulk Order
              </button>
            </div>

            {/* Savings banner */}
            <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">Estimated Savings: 18-25%</p>
                <p className="text-xs text-green-600">Bulk purchasing saves your cooperative an average of $4,200 per season vs individual purchases.</p>
              </div>
            </div>

            {/* Buy form */}
            {showBuyForm && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-[#1B2A4A]">New Bulk Buy Order</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Commodity *</label>
                    <select value={buyForm.commodity} onChange={e => setBuyForm(f => ({ ...f, commodity: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                      <option value="">Select...</option>
                      {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity Needed *</label>
                      <input type="number" value={buyForm.quantity} onChange={e => setBuyForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 5000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                      <select value={buyForm.unit} onChange={e => setBuyForm(f => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Target Price (per unit) *</label>
                      <input type="number" step="0.01" value={buyForm.target_price} onChange={e => setBuyForm(f => ({ ...f, target_price: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                      <select value={buyForm.currency} onChange={e => setBuyForm(f => ({ ...f, currency: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                        <option value="USD">USD</option><option value="KES">KES</option><option value="TZS">TZS</option><option value="UGX">UGX</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Deadline *</label>
                    <input type="date" value={buyForm.deadline} onChange={e => setBuyForm(f => ({ ...f, deadline: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleBulkBuy} disabled={submitting} className="flex items-center gap-2 bg-[#5DB347] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Bulk Order
                  </button>
                  <button onClick={() => setShowBuyForm(false)} className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Active bulk orders */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Active Bulk Orders</h4>
              {buyOrders.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No bulk buy orders yet.</p>
              ) : (
                buyOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{order.commodity} — {order.quantity.toLocaleString()} {order.unit}</p>
                        <p className="text-xs text-gray-500">{order.order_number} &bull; Target: {order.currency} {order.target_price}/{order.unit} &bull; Deadline: {new Date(order.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Collective Selling Tab ─── */}
        {activeTab === 'collective-sell' && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1B2A4A]">Collective Selling</h3>
                <p className="text-sm text-gray-500">Pool produce from members for better market prices</p>
              </div>
              <button onClick={() => setShowSellForm(!showSellForm)} className="flex items-center gap-2 bg-[#5DB347] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#449933] transition-colors">
                <Plus className="w-4 h-4" /> Create Collective Offer
              </button>
            </div>

            {showSellForm && (
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-[#1B2A4A]">New Collective Sell Offer</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Commodity *</label>
                    <select value={sellForm.commodity} onChange={e => setSellForm(f => ({ ...f, commodity: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                      <option value="">Select...</option>
                      {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Total Quantity *</label>
                      <input type="number" value={sellForm.quantity} onChange={e => setSellForm(f => ({ ...f, quantity: e.target.value }))} placeholder="Sum from all members" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                      <select value={sellForm.unit} onChange={e => setSellForm(f => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quality Grade</label>
                    <select value={sellForm.quality_grade} onChange={e => setSellForm(f => ({ ...f, quality_grade: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                      {QUALITY_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Target Price *</label>
                      <input type="number" step="0.01" value={sellForm.target_price} onChange={e => setSellForm(f => ({ ...f, target_price: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                      <select value={sellForm.currency} onChange={e => setSellForm(f => ({ ...f, currency: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent">
                        <option value="USD">USD</option><option value="KES">KES</option><option value="TZS">TZS</option><option value="UGX">UGX</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Deadline *</label>
                    <input type="date" value={sellForm.deadline} onChange={e => setSellForm(f => ({ ...f, deadline: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCollectiveSell} disabled={submitting} className="flex items-center gap-2 bg-[#5DB347] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Submit Collective Offer
                  </button>
                  <button onClick={() => setShowSellForm(false)} className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {/* Active sell orders */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Active Collective Offers</h4>
              {sellOrders.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No collective sell offers yet.</p>
              ) : (
                sellOrders.map(order => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{order.commodity} — {order.quantity.toLocaleString()} {order.unit}</p>
                        <p className="text-xs text-gray-500">{order.order_number} &bull; Target: {order.currency} {order.target_price}/{order.unit}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── Treasury Tab ─── */}
        {activeTab === 'treasury' && (
          <div className="p-5 space-y-5">
            <h3 className="font-semibold text-[#1B2A4A]">Cooperative Treasury</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-green-700">${treasuryBalance.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Total Contributions</p>
                <p className="text-2xl font-bold text-blue-700">${members.reduce((s, m) => s + (m.contribution || 0), 0).toLocaleString() || '10,300'}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Pending Payouts</p>
                <p className="text-2xl font-bold text-amber-700">$2,150</p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-700">Recent Transactions</h4>
            <div className="space-y-2">
              {[
                { desc: 'Bulk fertilizer payment', amount: -4250, date: '2026-03-15' },
                { desc: 'Maize sale proceeds', amount: 8500, date: '2026-03-10' },
                { desc: 'Member contribution (5 members)', amount: 2400, date: '2026-03-01' },
                { desc: 'Transport costs', amount: -850, date: '2026-02-28' },
                { desc: 'Bean sale proceeds', amount: 3200, date: '2026-02-20' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                      {tx.amount > 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <DollarSign className="w-4 h-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{tx.desc}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} USD
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Governance Tab ─── */}
        {activeTab === 'governance' && (
          <div className="p-5 space-y-5">
            <h3 className="font-semibold text-[#1B2A4A]">Governance & Decisions</h3>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Active Votes</h4>
              {[
                { title: 'Approve bulk purchase of 5 tonnes fertilizer', votes: { yes: 32, no: 5, pending: 11 }, deadline: '2026-04-05' },
                { title: 'Elect new treasurer for 2026', votes: { yes: 28, no: 8, pending: 12 }, deadline: '2026-04-15' },
              ].map((vote, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{vote.title}</p>
                      <p className="text-xs text-gray-500 mt-1">Deadline: {new Date(vote.deadline).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">Yes ({vote.votes.yes})</button>
                      <button className="bg-red-100 text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">No ({vote.votes.no})</button>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${(vote.votes.yes / (vote.votes.yes + vote.votes.no + vote.votes.pending)) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{vote.votes.pending} members have not voted</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Meeting Minutes</h4>
              {[
                { date: '2026-03-15', title: 'Monthly General Meeting', attendees: 38, summary: 'Discussed planting season, approved fertilizer purchase.' },
                { date: '2026-02-15', title: 'Monthly General Meeting', attendees: 42, summary: 'Reviewed Q4 finances, planned collective maize sale.' },
              ].map((meeting, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">{new Date(meeting.date).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">&bull; {meeting.attendees} attendees</span>
                  </div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{meeting.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{meeting.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {useDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center text-xs text-amber-700">
          Showing demo data. Join a cooperative to see your real dashboard.
        </div>
      )}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────
function KPICard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
    </div>
  );
}
