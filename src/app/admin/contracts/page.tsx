'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  FileText, Plus, X, Loader2, CheckCircle2, Clock, AlertTriangle,
  Search, Edit3, Trash2, Download, Calendar, DollarSign, Globe,
  Users, Building2, Award, Shield, ChevronRight, RefreshCw,
} from 'lucide-react';

/* ─── Types ─── */
interface Contract {
  id: string;
  party_id: string | null;
  party_type: string;
  party_name: string;
  party_email: string | null;
  contract_type: string;
  title: string;
  description: string | null;
  commission_rate: number | null;
  payment_terms: string | null;
  territory: string[] | null;
  exclusivity: boolean;
  minimum_order_value: number | null;
  discount_rate: number | null;
  start_date: string | null;
  end_date: string | null;
  auto_renew: boolean;
  status: string;
  signed_at: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending_signature: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-600',
  terminated: 'bg-red-100 text-red-600',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  supplier: <Building2 className="w-4 h-4" />,
  partner: <Users className="w-4 h-4" />,
  ambassador: <Award className="w-4 h-4" />,
  investor: <Shield className="w-4 h-4" />,
};

const PAYMENT_TERMS = [
  { value: 'upfront', label: 'Upfront' },
  { value: 'on_delivery', label: 'On Delivery' },
  { value: 'net_7', label: 'Net 7 Days' },
  { value: 'net_14', label: 'Net 14 Days' },
  { value: 'net_30', label: 'Net 30 Days' },
  { value: 'net_60', label: 'Net 60 Days' },
  { value: 'net_90', label: 'Net 90 Days' },
];

const COUNTRIES = ['Botswana', 'Ghana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe'];

export default function AdminContractsPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    party_type: 'supplier',
    party_name: '',
    party_email: '',
    contract_type: 'supplier',
    title: '',
    description: '',
    commission_rate: '',
    payment_terms: 'net_30',
    territory: [] as string[],
    exclusivity: false,
    minimum_order_value: '',
    discount_rate: '',
    start_date: '',
    end_date: '',
    auto_renew: false,
    notes: '',
  });

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
    setContracts((data || []) as Contract[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const filtered = useMemo(() => {
    let list = contracts;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter(c => c.party_type === typeFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.party_name.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
    }
    return list;
  }, [contracts, statusFilter, typeFilter, searchTerm]);

  // Stats
  const activeCount = contracts.filter(c => c.status === 'active').length;
  const expiringCount = contracts.filter(c => {
    if (!c.end_date || c.status !== 'active') return false;
    const diff = (new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0;
  }).length;

  const openCreate = () => {
    setEditing(null);
    setForm({ party_type: 'supplier', party_name: '', party_email: '', contract_type: 'supplier', title: '', description: '', commission_rate: '', payment_terms: 'net_30', territory: [], exclusivity: false, minimum_order_value: '', discount_rate: '', start_date: '', end_date: '', auto_renew: false, notes: '' });
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setEditing(c);
    setForm({
      party_type: c.party_type, party_name: c.party_name, party_email: c.party_email || '',
      contract_type: c.contract_type, title: c.title, description: c.description || '',
      commission_rate: c.commission_rate?.toString() || '', payment_terms: c.payment_terms || 'net_30',
      territory: c.territory || [], exclusivity: c.exclusivity, minimum_order_value: c.minimum_order_value?.toString() || '',
      discount_rate: c.discount_rate?.toString() || '', start_date: c.start_date || '', end_date: c.end_date || '',
      auto_renew: c.auto_renew, notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.party_name || !form.title) return;
    setSaving(true);
    const payload = {
      party_type: form.party_type,
      party_name: form.party_name,
      party_email: form.party_email || null,
      contract_type: form.contract_type,
      title: form.title,
      description: form.description || null,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
      payment_terms: form.payment_terms,
      territory: form.territory.length > 0 ? form.territory : null,
      exclusivity: form.exclusivity,
      minimum_order_value: form.minimum_order_value ? parseFloat(form.minimum_order_value) : null,
      discount_rate: form.discount_rate ? parseFloat(form.discount_rate) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      auto_renew: form.auto_renew,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      await supabase.from('contracts').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('contracts').insert({ ...payload, created_by: user?.id, status: 'draft' });
    }
    setShowModal(false);
    setSaving(false);
    fetchContracts();
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'active') updates.signed_at = new Date().toISOString();
    await supabase.from('contracts').update(updates).eq('id', id);
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status, signed_at: status === 'active' ? new Date().toISOString() : c.signed_at } : c));
  };

  const deleteContract = async (id: string) => {
    await supabase.from('contracts').delete().eq('id', id);
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Contracts</h1>
          <p className="text-sm text-gray-500">Manage supplier, partner, and ambassador agreements</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{contracts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-[#5DB347]">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Expiring (30d)</p>
          <p className="text-2xl font-bold text-amber-600">{expiringCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Draft</p>
          <p className="text-2xl font-bold text-gray-400">{contracts.filter(c => c.status === 'draft').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search contracts..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending_signature">Pending Signature</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="terminated">Terminated</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="all">All Types</option>
          <option value="supplier">Supplier</option>
          <option value="partner">Partner</option>
          <option value="ambassador">Ambassador</option>
          <option value="investor">Investor</option>
        </select>
        <button onClick={fetchContracts} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{contracts.length === 0 ? 'No contracts yet.' : 'No matching contracts.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-gray-400">{TYPE_ICONS[c.party_type] || <FileText className="w-4 h-4" />}</span>
                    <h3 className="font-semibold text-[#1B2A4A]">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{c.party_name}{c.party_email ? ` (${c.party_email})` : ''}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    {c.commission_rate && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{c.commission_rate}% commission</span>
                    )}
                    {c.discount_rate && (
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{c.discount_rate}% member discount</span>
                    )}
                    {c.payment_terms && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.payment_terms.replace('_', ' ')}</span>
                    )}
                    {c.start_date && (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(c.start_date).toLocaleDateString()} — {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Ongoing'}</span>
                    )}
                    {c.territory?.length ? (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{c.territory.join(', ')}</span>
                    ) : null}
                    {c.exclusivity && <span className="text-amber-600 font-medium">Exclusive</span>}
                    {c.auto_renew && <span className="text-green-600">Auto-renew</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {c.status === 'draft' && (
                    <button onClick={() => updateStatus(c.id, 'pending_signature')} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg hover:bg-amber-100">Send for Signature</button>
                  )}
                  {c.status === 'pending_signature' && (
                    <button onClick={() => updateStatus(c.id, 'active')} className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">Mark Signed</button>
                  )}
                  {c.status === 'active' && (
                    <button onClick={() => updateStatus(c.id, 'terminated')} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100">Terminate</button>
                  )}
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => deleteContract(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CREATE/EDIT MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editing ? 'Edit Contract' : 'New Contract'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Party Type *</label>
                  <select value={form.party_type} onChange={e => setForm(p => ({ ...p, party_type: e.target.value, contract_type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="supplier">Supplier</option>
                    <option value="partner">Partner</option>
                    <option value="ambassador">Ambassador</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Party Name *</label>
                  <input type="text" value={form.party_name} onChange={e => setForm(p => ({ ...p, party_name: e.target.value }))} placeholder="Company or person name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={form.party_email} onChange={e => setForm(p => ({ ...p, party_email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Contract Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Supplier Agreement — Kalahari Seeds" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Commission Rate (%)</label>
                  <input type="number" step="0.1" value={form.commission_rate} onChange={e => setForm(p => ({ ...p, commission_rate: e.target.value }))} placeholder="5" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Member Discount (%)</label>
                  <input type="number" step="0.1" value={form.discount_rate} onChange={e => setForm(p => ({ ...p, discount_rate: e.target.value }))} placeholder="10" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Terms</label>
                  <select value={form.payment_terms} onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {PAYMENT_TERMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min Order Value (USD)</label>
                  <input type="number" value={form.minimum_order_value} onChange={e => setForm(p => ({ ...p, minimum_order_value: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Territory</label>
                  <div className="flex flex-wrap gap-1">
                    {COUNTRIES.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, territory: p.territory.includes(c) ? p.territory.filter(t => t !== c) : [...p.territory, c] }))} className={`text-[10px] px-2 py-0.5 rounded-full border ${form.territory.includes(c) ? 'bg-[#5DB347] text-white border-[#5DB347]' : 'border-gray-200 text-gray-500'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.exclusivity} onChange={e => setForm(p => ({ ...p, exclusivity: e.target.checked }))} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                  Exclusive territory
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.auto_renew} onChange={e => setForm(p => ({ ...p, auto_renew: e.target.checked }))} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                  Auto-renew
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.party_name || !form.title} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
