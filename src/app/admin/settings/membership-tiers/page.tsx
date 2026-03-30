'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Pencil,
  X,
  ArrowLeft,
  Crown,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Toast ─────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────

interface TierItem {
  id: string;
  name: string;
  slug: string;
  priceMonthly: string;
  priceAnnual: string;
  audience: string;
  is_popular: boolean;
  features: Record<string, boolean | string>;
  accent: string;
  accentBadge: string;
}

const defaultTiers: TierItem[] = [
  {
    id: '1', name: 'Smallholder', slug: 'smallholder', priceMonthly: '$4.99', priceAnnual: '$49',
    audience: 'Farms under 10 hectares', is_popular: false,
    accent: 'border-[#5DB347] bg-[#EBF7E5]', accentBadge: 'bg-[#5DB347]/10 text-[#5DB347]',
    features: { 'Crop Tracking': true, 'Financing Access': 'Up to $5K', 'Insurance': 'Basic', 'Marketplace': true, 'Training Courses': true, 'AI Assistant': true, 'Export Support': false, 'Dedicated Advisor': false, 'Insurance Discounts': false, 'Equipment Leasing Priority': false, 'Legal Support': false, 'Offtake Priority': false, 'Trade Finance Access': false, 'Farm Manager Visits': false, 'VIP Events': false },
  },
  {
    id: '2', name: 'Commercial Bronze', slug: 'bronze', priceMonthly: '$49', priceAnnual: '$490',
    audience: 'Growing commercial farms', is_popular: false,
    accent: 'border-amber-600 bg-amber-50', accentBadge: 'bg-amber-100 text-amber-700',
    features: { 'Crop Tracking': 'Advanced', 'Financing Access': 'Up to $50K', 'Insurance': 'Full', 'Marketplace': 'Discounted Inputs', 'Training Courses': true, 'AI Assistant': true, 'Export Support': 'Basic', 'Dedicated Advisor': false, 'Insurance Discounts': false, 'Trade Finance Access': 'Basic', 'Equipment Leasing Priority': false, 'Legal Support': false, 'Offtake Priority': false, 'Farm Manager Visits': false, 'VIP Events': false },
  },
  {
    id: '3', name: 'Commercial Gold', slug: 'gold', priceMonthly: '$499', priceAnnual: '$4,990',
    audience: 'Established commercial operations', is_popular: true,
    accent: 'border-yellow-500 bg-yellow-50', accentBadge: 'bg-yellow-100 text-yellow-700',
    features: { 'Crop Tracking': 'Advanced', 'Financing Access': 'Up to $250K', 'Insurance': 'Comprehensive', 'Marketplace': 'Discounted Inputs', 'Training Courses': true, 'AI Assistant': 'Priority', 'Export Support': 'Full', 'Dedicated Advisor': 'Dedicated', 'Insurance Discounts': '15% off', 'Trade Finance Access': 'Full', 'Equipment Leasing Priority': true, 'Legal Support': false, 'Offtake Priority': false, 'Farm Manager Visits': false, 'VIP Events': false },
  },
  {
    id: '4', name: 'Commercial Platinum', slug: 'platinum', priceMonthly: '$999', priceAnnual: '$9,990',
    audience: 'Large-scale & estate operations', is_popular: false,
    accent: 'border-slate-400 bg-slate-50', accentBadge: 'bg-slate-200 text-slate-700',
    features: { 'Crop Tracking': 'Advanced', 'Financing Access': 'Unlimited', 'Insurance': 'Comprehensive', 'Marketplace': 'Discounted Inputs', 'Training Courses': true, 'AI Assistant': 'Priority', 'Export Support': 'Full', 'Dedicated Advisor': 'Dedicated', 'Insurance Discounts': '25% off', 'Trade Finance Access': 'Full + Priority', 'Equipment Leasing Priority': true, 'Legal Support': true, 'Offtake Priority': true, 'Farm Manager Visits': true, 'VIP Events': true },
  },
  {
    id: '5', name: 'Partner / Vendor', slug: 'partner', priceMonthly: 'By Application', priceAnnual: 'By Application',
    audience: 'Suppliers, offtakers, service providers', is_popular: false,
    accent: 'border-purple-400 bg-purple-50', accentBadge: 'bg-purple-100 text-purple-700',
    features: { 'Crop Tracking': false, 'Financing Access': 'Custom', 'Insurance': 'Custom', 'Marketplace': 'Directory Listing', 'Training Courses': true, 'AI Assistant': true, 'Export Support': false, 'Dedicated Advisor': 'Dedicated', 'Insurance Discounts': false, 'Trade Finance Access': false, 'Equipment Leasing Priority': false, 'Legal Support': false, 'Offtake Priority': false, 'Farm Manager Visits': false, 'VIP Events': 'Co-branded Programs' },
  },
];

const FEATURE_KEYS = [
  'Crop Tracking', 'Financing Access', 'Insurance', 'Marketplace', 'Training Courses',
  'AI Assistant', 'Export Support', 'Dedicated Advisor', 'Insurance Discounts',
  'Trade Finance Access', 'Equipment Leasing Priority', 'Legal Support',
  'Offtake Priority', 'Farm Manager Visits', 'VIP Events',
];

const emptyTier: Omit<TierItem, 'id'> = {
  name: '', slug: '', priceMonthly: '', priceAnnual: '', audience: '', is_popular: false,
  accent: 'border-gray-300 bg-gray-50', accentBadge: 'bg-gray-100 text-gray-700',
  features: Object.fromEntries(FEATURE_KEYS.map(k => [k, false])),
};

// ── Main Page ─────────────────────────────────────────────

export default function MembershipTiersAdminPage() {
  const supabase = createClient();
  const [tiers, setTiers] = useState<TierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TierItem, 'id'>>(emptyTier);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('site_config').select('*').eq('key', 'membership_tiers').single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setTiers(Array.isArray(parsed) ? parsed : defaultTiers);
        } else {
          setTiers(defaultTiers);
        }
      } catch {
        setTiers(defaultTiers);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const save = useCallback(async (updated: TierItem[]) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_config').upsert({
        key: 'membership_tiers',
        value: JSON.stringify(updated),
        description: 'Membership tier configuration (pricing, features, audience)',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      if (error) throw error;
      setToast({ message: 'Membership tiers saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save tiers', type: 'error' });
    }
    setSaving(false);
  }, [supabase]);

  const openAdd = () => { setEditingId(null); setForm(emptyTier); setModalOpen(true); };
  const openEdit = (tier: TierItem) => {
    setEditingId(tier.id);
    const { id: _, ...rest } = tier;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      setToast({ message: 'Name and slug are required', type: 'error' }); return;
    }
    let updated: TierItem[];
    if (editingId) {
      updated = tiers.map(t => t.id === editingId ? { ...form, id: editingId } : t);
    } else {
      updated = [...tiers, { ...form, id: Date.now().toString() }];
    }
    setTiers(updated);
    save(updated);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = tiers.filter(t => t.id !== id);
    setTiers(updated);
    save(updated);
  };

  const setFeature = (key: string, value: boolean | string) => {
    setForm(f => ({ ...f, features: { ...f.features, [key]: value } }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin/settings" className="text-gray-400 hover:text-[#1B2A4A] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Crown className="w-6 h-6 text-[#5DB347]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Membership Tiers</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8 ml-8">
        Manage membership tier pricing, features, and audience descriptions. Changes appear on /memberships and /apply.
      </p>

      {/* Tier List */}
      <div className="space-y-4 mb-6">
        {tiers.map(tier => (
          <div key={tier.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${tier.is_popular ? 'bg-[#5DB347]' : 'bg-gray-300'}`} />
              <div>
                <div className="font-semibold text-[#1B2A4A]">{tier.name}</div>
                <div className="text-xs text-gray-500">{tier.audience} &mdash; {tier.priceMonthly}/mo &bull; {tier.priceAnnual}/yr</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEdit(tier)} className="p-2 rounded-lg hover:bg-[#EBF7E5] text-gray-400 hover:text-[#5DB347] transition-colors"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(tier.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={openAdd} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-md shadow-[#5DB347]/20">
        <Plus className="w-4 h-4" /> Add Tier
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1B2A4A]">{editingId ? 'Edit Tier' : 'Add Tier'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Tier Name *</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Slug *</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Monthly Price</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: e.target.value })} placeholder="$49" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Annual Price</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.priceAnnual} onChange={e => setForm({ ...form, priceAnnual: e.target.value })} placeholder="$490" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Audience</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} placeholder="Growing commercial farms" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_popular" checked={form.is_popular} onChange={e => setForm({ ...form, is_popular: e.target.checked })} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                <label htmlFor="is_popular" className="text-sm text-[#1B2A4A]">Mark as &ldquo;Most Popular&rdquo;</label>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-bold text-[#1B2A4A] mb-3">Features</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {FEATURE_KEYS.map(key => {
                    const val = form.features[key];
                    return (
                      <div key={key} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={val !== false}
                          onChange={e => setFeature(key, e.target.checked ? true : false)}
                          className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                        />
                        <span className="text-sm text-[#1B2A4A] w-44 shrink-0">{key}</span>
                        {val !== false && (
                          <input
                            className="flex-1 px-2 py-1 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none"
                            value={typeof val === 'string' ? val : ''}
                            onChange={e => setFeature(key, e.target.value || true)}
                            placeholder="true (or custom text)"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#1B2A4A] hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add'} Tier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
