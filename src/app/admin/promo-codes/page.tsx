'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Pencil, Trash2, Save, Loader2, X, Search,
  CheckCircle2, AlertCircle, Tag, ToggleLeft, ToggleRight,
  Copy, Users, Calendar, Percent, DollarSign,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  currency: string;
  applies_to: string;
  max_uses: number | null;
  current_uses: number;
  min_amount: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface Redemption {
  id: string;
  user_id: string;
  context: string | null;
  discount_applied: number;
  redeemed_at: string;
  profile?: { full_name: string | null; email: string | null };
}

interface FormData {
  code: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: string;
  currency: string;
  applies_to: string;
  specific_member_id: string;
  specific_member_name: string;
  max_uses: string;
  min_amount: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

const emptyForm: FormData = {
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: '10',
  currency: 'USD',
  applies_to: 'all',
  specific_member_id: '',
  specific_member_name: '',
  max_uses: '',
  min_amount: '0',
  starts_at: new Date().toISOString().slice(0, 16),
  expires_at: '',
  is_active: true,
};

const APPLIES_OPTIONS = [
  // General
  { value: 'all', label: 'Everyone', group: 'General' },
  // By Role
  { value: 'farmer', label: 'Farmers', group: 'By Role' },
  { value: 'supplier', label: 'Suppliers', group: 'By Role' },
  { value: 'ambassador', label: 'Ambassadors', group: 'By Role' },
  { value: 'investor', label: 'Investors', group: 'By Role' },
  // Membership & Billing
  { value: 'membership', label: 'Memberships', group: 'Membership & Billing' },
  { value: 'subscription', label: 'Subscriptions', group: 'Membership & Billing' },
  // Enterprise & Co-op
  { value: 'enterprise', label: 'Enterprise Accounts', group: 'Enterprise & Co-op' },
  { value: 'cooperative', label: 'Cooperatives', group: 'Enterprise & Co-op' },
  { value: 'bulk-order', label: 'Bulk Orders', group: 'Enterprise & Co-op' },
  // Special Offers
  { value: 'marketing', label: 'Marketing Campaign', group: 'Special Offers' },
  { value: 'referral', label: 'Referral Reward', group: 'Special Offers' },
  { value: 'launch', label: 'Launch Promotion', group: 'Special Offers' },
  { value: 'seasonal', label: 'Seasonal Offer', group: 'Special Offers' },
  { value: 'loyalty', label: 'Loyalty Reward', group: 'Special Offers' },
  { value: 'partner', label: 'Partner Exclusive', group: 'Special Offers' },
  // Specific Member
  { value: 'specific-member', label: 'Specific Member Only', group: 'Targeted' },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AFU-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface MemberResult {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [memberResults, setMemberResults] = useState<MemberResult[]>([]);
  const [viewRedemptions, setViewRedemptions] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const flash = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load ──────────────────────────────────────────────────

  const loadCodes = useCallback(async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[promo] load error', error);
      flash('error', 'Failed to load promo codes');
    } else {
      setCodes((data || []) as PromoCode[]);
    }
    setLoading(false);
  }, [supabase, flash]);

  useEffect(() => { loadCodes(); }, [loadCodes]);

  // ── Filtered list ─────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return codes;
    const q = search.toLowerCase();
    return codes.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        c.applies_to.toLowerCase().includes(q)
    );
  }, [codes, search]);

  // ── Save (create / update) ────────────────────────────────

  const handleSave = async () => {
    if (!form.code.trim()) { flash('error', 'Code is required'); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      currency: form.currency,
      applies_to: form.applies_to,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      min_amount: parseFloat(form.min_amount) || 0,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
      specific_member_id: form.applies_to === 'specific-member' ? (form.specific_member_id || null) : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('promo_codes').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('promo_codes').insert(payload));
    }

    setSaving(false);
    if (error) {
      flash('error', error.message.includes('unique') ? 'Code already exists' : error.message);
    } else {
      flash('success', editingId ? 'Promo code updated' : 'Promo code created');
      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      loadCodes();
    }
  };

  // ── Toggle active ─────────────────────────────────────────

  const toggleActive = async (c: PromoCode) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !c.is_active })
      .eq('id', c.id);
    if (error) flash('error', error.message);
    else {
      setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
    }
  };

  // ── Delete ────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promo code? This cannot be undone.')) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (error) flash('error', error.message);
    else {
      flash('success', 'Deleted');
      setCodes((prev) => prev.filter((x) => x.id !== id));
    }
  };

  // ── Open edit ─────────────────────────────────────────────

  const openEdit = (c: PromoCode) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      currency: c.currency,
      applies_to: c.applies_to,
      specific_member_id: (c as unknown as Record<string, unknown>).specific_member_id as string || '',
      specific_member_name: '',
      max_uses: c.max_uses != null ? String(c.max_uses) : '',
      min_amount: String(c.min_amount),
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : '',
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
      is_active: c.is_active,
    });
    setShowModal(true);
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, code: generateCode() });
    setShowModal(true);
  };

  // ── View redemptions ──────────────────────────────────────

  const loadRedemptions = async (codeId: string) => {
    setViewRedemptions(codeId);
    setLoadingRedemptions(true);
    const { data } = await supabase
      .from('promo_code_redemptions')
      .select('id, user_id, context, discount_applied, redeemed_at')
      .eq('promo_code_id', codeId)
      .order('redeemed_at', { ascending: false });
    setRedemptions((data || []) as Redemption[]);
    setLoadingRedemptions(false);
  };

  // ── Copy code ─────────────────────────────────────────────

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    flash('success', `Copied: ${code}`);
  };

  // ── Render ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Promo Codes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage discount codes for signups, memberships, and subscriptions
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal/90 transition"
        >
          <Plus className="w-4 h-4" /> New Code
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-3 px-4 font-medium text-gray-500">Code</th>
                <th className="py-3 px-4 font-medium text-gray-500">Discount</th>
                <th className="py-3 px-4 font-medium text-gray-500">Applies To</th>
                <th className="py-3 px-4 font-medium text-gray-500">Usage</th>
                <th className="py-3 px-4 font-medium text-gray-500">Expires</th>
                <th className="py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Tag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{search ? 'No codes match your search' : 'No promo codes yet'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const expired = c.expires_at && new Date(c.expires_at) < new Date();
                  const maxed = c.max_uses != null && c.current_uses >= c.max_uses;
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-navy">{c.code}</span>
                          <button onClick={() => copyCode(c.code)} className="text-gray-400 hover:text-teal" title="Copy">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {c.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
                          {c.discount_type === 'percent' ? (
                            <><Percent className="w-3.5 h-3.5" />{c.discount_value}%</>
                          ) : (
                            <><DollarSign className="w-3.5 h-3.5" />{c.discount_value}</>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                          {c.applies_to}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => loadRedemptions(c.id)}
                          className="flex items-center gap-1 text-xs hover:text-teal transition"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {c.current_uses}{c.max_uses != null ? ` / ${c.max_uses}` : ''}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {c.expires_at ? (
                          <span className={expired ? 'text-red-500' : ''}>
                            {new Date(c.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleActive(c)} title={c.is_active ? 'Deactivate' : 'Activate'}>
                          {c.is_active && !expired && !maxed ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              <ToggleRight className="w-3.5 h-3.5" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              <ToggleLeft className="w-3.5 h-3.5" /> {expired ? 'Expired' : maxed ? 'Maxed' : 'Inactive'}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit">
                            <Pencil className="w-3.5 h-3.5 text-gray-500" />
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redemptions panel */}
      {viewRedemptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewRedemptions(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy">Redemptions</h3>
              <button onClick={() => setViewRedemptions(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[55vh]">
              {loadingRedemptions ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-teal" /></div>
              ) : redemptions.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No redemptions yet</p>
              ) : (
                <div className="space-y-3">
                  {redemptions.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                      <div>
                        <p className="font-medium text-navy">{r.user_id.slice(0, 8)}...</p>
                        <p className="text-xs text-gray-400">{r.context || 'signup'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${r.discount_applied}</p>
                        <p className="text-xs text-gray-400">{new Date(r.redeemed_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-navy">{editingId ? 'Edit Promo Code' : 'New Promo Code'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    placeholder="AFU-XXXXX"
                  />
                  <button
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    className="px-3 py-2 bg-gray-100 rounded-xl text-xs font-medium hover:bg-gray-200 transition"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  placeholder="Launch day 20% off for farmers"
                />
              </div>

              {/* Discount type + value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {form.discount_type === 'percent' ? 'Percentage' : 'Amount'}
                  </label>
                  <input
                    type="number"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    min="0"
                    max={form.discount_type === 'percent' ? '100' : undefined}
                  />
                </div>
              </div>

              {/* Applies to */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Applies To</label>
                <select
                  value={form.applies_to}
                  onChange={(e) => setForm({ ...form, applies_to: e.target.value, specific_member_id: '', specific_member_name: '' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                >
                  {(() => {
                    const groups = [...new Set(APPLIES_OPTIONS.map((o) => o.group))];
                    return groups.map((g) => (
                      <optgroup key={g} label={g}>
                        {APPLIES_OPTIONS.filter((o) => o.group === g).map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </optgroup>
                    ));
                  })()}
                </select>
              </div>

              {/* Specific member search — only shown when "specific-member" is selected */}
              {form.applies_to === 'specific-member' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Search Member</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Type name or email to search..."
                      value={form.specific_member_name || ''}
                      onChange={async (e) => {
                        const q = e.target.value;
                        setForm({ ...form, specific_member_name: q, specific_member_id: '' });
                        if (q.length < 2) { setMemberResults([]); return; }
                        const { data } = await supabase
                          .from('profiles')
                          .select('id, full_name, email')
                          .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
                          .limit(8);
                        setMemberResults((data || []) as MemberResult[]);
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    />
                  </div>
                  {memberResults.length > 0 && !form.specific_member_id && (
                    <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg max-h-48 overflow-y-auto">
                      {memberResults.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, specific_member_id: m.id, specific_member_name: `${m.full_name || 'No name'} (${m.email})` });
                            setMemberResults([]);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-teal/5 text-sm border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium text-navy">{m.full_name || 'No name'}</span>
                          <span className="text-gray-400 ml-2 text-xs">{m.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {form.specific_member_id && (
                    <div className="mt-2 flex items-center gap-2 bg-teal/5 border border-teal/20 rounded-xl px-3 py-2 text-sm">
                      <Users className="w-4 h-4 text-teal" />
                      <span className="font-medium text-navy flex-1">{form.specific_member_name}</span>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, specific_member_id: '', specific_member_name: '' })}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Max uses + Min amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses (blank = unlimited)</label>
                  <input
                    type="number"
                    value={form.max_uses}
                    onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    min="0"
                    placeholder="Unlimited"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    value={form.min_amount}
                    onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    min="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Expires At (blank = never)</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-teal focus:ring-teal"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal/90 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
