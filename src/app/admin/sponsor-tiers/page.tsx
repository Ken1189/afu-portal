'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Pencil,
  Eye,
  EyeOff,
  Gift,
  Star,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Types ─────────────────────────────────────────────────

interface SponsorTier {
  id: string;
  name: string;
  price_usd: number;
  billing_label: string;
  description: string | null;
  features: string[];
  is_popular: boolean;
  is_published: boolean;
  display_order: number;
  cta_text: string;
  cta_url: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  price_usd: string;
  billing_label: string;
  description: string;
  features: string[];
  is_popular: boolean;
  is_published: boolean;
  display_order: number;
  cta_text: string;
  cta_url: string;
  icon: string;
}

const emptyForm: FormData = {
  name: '',
  price_usd: '0',
  billing_label: '/month',
  description: '',
  features: [''],
  is_popular: false,
  is_published: true,
  display_order: 0,
  cta_text: 'Sponsor Now',
  cta_url: '',
  icon: '',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function SponsorTiersAdmin() {
  const [tiers, setTiers] = useState<SponsorTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sponsor_tiers')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) {
      setToast({ message: 'Failed to load sponsor tiers', type: 'error' });
    } else {
      setTiers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const openEdit = (tier: SponsorTier) => {
    setEditingId(tier.id);
    setForm({
      name: tier.name,
      price_usd: tier.price_usd.toString(),
      billing_label: tier.billing_label,
      description: tier.description || '',
      features: tier.features.length > 0 ? tier.features : [''],
      is_popular: tier.is_popular,
      is_published: tier.is_published,
      display_order: tier.display_order,
      cta_text: tier.cta_text,
      cta_url: tier.cta_url || '',
      icon: tier.icon || '',
    });
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: tiers.length + 1 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setToast({ message: 'Tier name is required', type: 'error' });
      return;
    }
    setSaving(true);
    const cleanFeatures = form.features.filter((f) => f.trim() !== '');
    const payload = {
      name: form.name.trim(),
      price_usd: parseFloat(form.price_usd) || 0,
      billing_label: form.billing_label,
      description: form.description || null,
      features: cleanFeatures,
      is_popular: form.is_popular,
      is_published: form.is_published,
      display_order: form.display_order,
      cta_text: form.cta_text || 'Choose',
      cta_url: form.cta_url || null,
      icon: form.icon || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('sponsor_tiers').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('sponsor_tiers').insert(payload));
    }

    if (error) {
      setToast({ message: `Failed to ${editingId ? 'update' : 'create'} tier`, type: 'error' });
    } else {
      setToast({ message: `Tier ${editingId ? 'updated' : 'created'} successfully`, type: 'success' });
      setModalOpen(false);
      fetchTiers();
    }
    setSaving(false);
  };

  const toggleField = async (id: string, field: 'is_popular' | 'is_published', value: boolean) => {
    const { error } = await supabase.from('sponsor_tiers').update({ [field]: !value }).eq('id', id);
    if (error) {
      setToast({ message: 'Failed to update', type: 'error' });
    } else {
      setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: !value } : t)));
    }
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeature = (idx: number) => setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });
  const updateFeature = (idx: number, val: string) => {
    const updated = [...form.features];
    updated[idx] = val;
    setForm({ ...form, features: updated });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Custom';
    return `$${price.toLocaleString()}`;
  };

  // Tier card color schemes
  const tierColors: Record<string, { bg: string; border: string; accent: string; badge: string }> = {
    'Bronze': { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
    'Silver': { bg: 'bg-gray-50', border: 'border-gray-300', accent: 'text-gray-700', badge: 'bg-gray-200 text-gray-700' },
    'Gold': { bg: 'bg-yellow-50', border: 'border-yellow-300', accent: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
    'Corporate': { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  };
  const defaultColors = { bg: 'bg-green-50', border: 'border-green-200', accent: 'text-green-700', badge: 'bg-green-100 text-green-700' };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Sponsor Tiers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sponsorship pricing and features</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90" style={{ background: '#5DB347' }}>
          <Plus className="w-4 h-4" />
          Add Tier
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && tiers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No sponsor tiers yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add your first sponsorship tier</p>
          <button onClick={openAdd} className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#5DB347' }}>
            <Plus className="w-4 h-4 inline mr-1" />Add Tier
          </button>
        </div>
      )}

      {/* Tier Cards — Public Preview Style */}
      {!loading && tiers.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier) => {
            const colors = tierColors[tier.name] || defaultColors;
            return (
              <div
                key={tier.id}
                className={`relative rounded-xl border-2 p-6 transition-all hover:shadow-lg group ${colors.bg} ${colors.border} ${
                  !tier.is_published ? 'opacity-50' : ''
                } ${tier.is_popular ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
              >
                {/* Popular badge */}
                {tier.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ background: '#5DB347' }}>
                      <Star className="w-3 h-3 fill-current" /> Most Popular
                    </span>
                  </div>
                )}

                {/* Draft badge */}
                {!tier.is_published && (
                  <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-medium">Draft</span>
                )}

                {/* Icon + Name */}
                <div className="text-center mb-4">
                  {tier.icon && <span className="text-3xl block mb-2">{tier.icon}</span>}
                  <h3 className={`text-lg font-bold ${colors.accent}`}>{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <span className="text-3xl font-extrabold text-[#1B2A4A]">{formatPrice(tier.price_usd)}</span>
                  {tier.price_usd > 0 && <span className="text-sm text-gray-500">{tier.billing_label}</span>}
                </div>

                {/* Description */}
                {tier.description && (
                  <p className="text-xs text-gray-500 text-center mb-4">{tier.description}</p>
                )}

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA preview */}
                <div className="text-center">
                  <span className="inline-block px-6 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#5DB347' }}>
                    {tier.cta_text}
                  </span>
                </div>

                {/* Edit overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(tier)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-white text-[#1B2A4A] shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Pencil className="w-3.5 h-3.5 inline mr-1" />Edit
                    </button>
                    <button
                      onClick={() => toggleField(tier.id, 'is_popular', tier.is_popular)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-shadow ${
                        tier.is_popular ? 'bg-yellow-100 text-yellow-700' : 'bg-white text-gray-500'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 inline mr-1" />{tier.is_popular ? 'Unmark' : 'Popular'}
                    </button>
                    <button
                      onClick={() => toggleField(tier.id, 'is_published', tier.is_published)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-500 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {tier.is_published ? <EyeOff className="w-3.5 h-3.5 inline mr-1" /> : <Eye className="w-3.5 h-3.5 inline mr-1" />}
                      {tier.is_published ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">{editingId ? 'Edit Tier' : 'Add Tier'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Name + Icon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tier Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="Gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Icon (emoji)</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="🌾" />
                </div>
              </div>

              {/* Price + Billing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (USD)</label>
                  <input type="number" step="0.01" value={form.price_usd} onChange={(e) => setForm({ ...form, price_usd: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Billing Label</label>
                  <input value={form.billing_label} onChange={(e) => setForm({ ...form, billing_label: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="/month" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="Support a smallholder farmer..." />
              </div>

              {/* Features list */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Features</label>
                <div className="space-y-2">
                  {form.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <input
                        value={feature}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
                        placeholder="Feature description..."
                      />
                      {form.features.length > 1 && (
                        <button onClick={() => removeFeature(idx)} className="p-1 text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addFeature} className="flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
                    <Plus className="w-3.5 h-3.5" /> Add Feature
                  </button>
                </div>
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CTA Text</label>
                  <input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="Sponsor Now" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">CTA URL</label>
                  <input value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" placeholder="/sponsor/checkout" />
                </div>
              </div>

              {/* Order + Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Order</label>
                  <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-200" />
                    <span className="text-sm text-gray-600">Popular</span>
                  </label>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-green-500 focus:ring-green-200" />
                    <span className="text-sm text-gray-600">Published</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50" style={{ background: '#5DB347' }}>
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
