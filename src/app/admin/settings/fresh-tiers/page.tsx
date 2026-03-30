'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingCart,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface FreshTier {
  name: string;
  type: string;
  tagline: string;
  price: string;
  desc: string;
  features: string[];
  color: string;
  borderColor: string;
  featured: boolean;
}

const DEFAULT_TIERS: FreshTier[] = [
  {
    name: 'AFU Fresh',
    type: 'B2C',
    tagline: 'Consumer Grocery Boxes',
    price: 'From $15/box',
    desc: 'Weekly subscription boxes of fresh seasonal produce delivered to households. Fruits, vegetables, and staples straight from local farms.',
    features: [
      'Weekly or bi-weekly subscription options',
      'Seasonal variety boxes curated by farm experts',
      'Family, individual, and custom box sizes',
      'Mobile money and card payment',
      'Full traceability — know your farmer',
    ],
    color: 'from-[#5DB347] to-[#449933]',
    borderColor: 'border-[#5DB347]/30',
    featured: false,
  },
  {
    name: 'AFU Trade',
    type: 'B2B',
    tagline: 'Restaurants, Hotels & Retailers',
    price: 'Bulk Pricing',
    desc: 'Reliable bulk supply for hospitality, retail, and food service businesses. Consistent quality, competitive pricing, flexible delivery schedules.',
    features: [
      'Dedicated account manager',
      'Custom order volumes and schedules',
      'Quality-graded produce with certifications',
      'Invoice and credit terms available',
      'Priority cold-chain logistics',
    ],
    color: 'from-[#1B2A4A] to-[#2D4A7A]',
    borderColor: 'border-[#1B2A4A]/30',
    featured: true,
  },
  {
    name: 'AFU Export',
    type: 'International',
    tagline: 'EU, UK & Middle East Markets',
    price: 'Premium Crops',
    desc: 'Export-grade African produce to international markets. Specialty crops, premium quality, full trade finance and logistics support.',
    features: [
      'Export-certified produce (GlobalGAP, HACCP)',
      'EU, UK, and Middle East market access',
      'Trade finance instruments (SBLCs, L/Cs)',
      'End-to-end logistics and customs',
      'Carbon-neutral shipping options',
    ],
    color: 'from-[#D4A843] to-[#E8C547]',
    borderColor: 'border-gold/30',
    featured: false,
  },
];

const CONFIG_KEY = 'fresh_tiers';

const COLOR_PRESETS = [
  { label: 'Green', value: 'from-[#5DB347] to-[#449933]' },
  { label: 'Navy', value: 'from-[#1B2A4A] to-[#2D4A7A]' },
  { label: 'Gold', value: 'from-[#D4A843] to-[#E8C547]' },
];

const BORDER_PRESETS = [
  { label: 'Green', value: 'border-[#5DB347]/30' },
  { label: 'Navy', value: 'border-[#1B2A4A]/30' },
  { label: 'Gold', value: 'border-gold/30' },
];

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FreshTiersConfig() {
  const [tiers, setTiers] = useState<FreshTier[]>(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (!error && data?.value && Array.isArray(data.value)) {
      setTiers(data.value as FreshTier[]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    const { data: existing } = await supabase
      .from('site_config')
      .select('id')
      .eq('key', CONFIG_KEY)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_config')
        .update({ value: tiers, updated_at: new Date().toISOString() })
        .eq('key', CONFIG_KEY));
    } else {
      ({ error } = await supabase
        .from('site_config')
        .insert({ key: CONFIG_KEY, value: tiers, description: 'AFU Fresh marketplace tiers' }));
    }

    if (error) {
      setToast({ message: 'Failed to save fresh tiers', type: 'error' });
    } else {
      setToast({ message: 'Fresh tiers saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const resetDefaults = () => {
    if (confirm('Reset all tiers to default values?')) {
      setTiers(DEFAULT_TIERS);
    }
  };

  const updateTier = (index: number, field: keyof FreshTier, value: string | boolean | string[]) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addTier = () => {
    setTiers((prev) => [...prev, {
      name: '',
      type: '',
      tagline: '',
      price: '',
      desc: '',
      features: [],
      color: 'from-[#5DB347] to-[#449933]',
      borderColor: 'border-[#5DB347]/30',
      featured: false,
    }]);
    setExpandedTier(tiers.length);
  };

  const removeTier = (index: number) => {
    if (!confirm('Remove this tier?')) return;
    setTiers((prev) => prev.filter((_, i) => i !== index));
    setExpandedTier(null);
  };

  const addFeature = (tierIndex: number) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[tierIndex] = { ...copy[tierIndex], features: [...copy[tierIndex].features, ''] };
      return copy;
    });
  };

  const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
    setTiers((prev) => {
      const copy = [...prev];
      const features = [...copy[tierIndex].features];
      features[featureIndex] = value;
      copy[tierIndex] = { ...copy[tierIndex], features };
      return copy;
    });
  };

  const removeFeature = (tierIndex: number, featureIndex: number) => {
    setTiers((prev) => {
      const copy = [...prev];
      copy[tierIndex] = { ...copy[tierIndex], features: copy[tierIndex].features.filter((_, i) => i !== featureIndex) };
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-[#5DB347]" />
            Fresh Marketplace Tiers
          </h1>
          <p className="text-gray-500 mt-1">Configure the marketplace tiers shown on the AFU Fresh page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetDefaults}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-gray-600 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: saving ? '#9CA3AF' : '#5DB347' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tiers */}
      <div className="space-y-4">
        {tiers.map((tier, i) => {
          const isExpanded = expandedTier === i;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Collapsed header */}
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedTier(isExpanded ? null : i)}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#1B2A4A]">{tier.name || '(Unnamed tier)'}</span>
                  <span className="text-xs text-gray-500 ml-3">{tier.type}</span>
                  <span className="text-xs text-[#5DB347] ml-3">{tier.price}</span>
                  {tier.featured && (
                    <span className="ml-2 text-[10px] font-bold uppercase bg-[#1B2A4A] text-white px-2 py-0.5 rounded-full">Featured</span>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTier(i); }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="p-5 space-y-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tier Name</label>
                      <input type="text" value={tier.name} onChange={(e) => updateTier(i, 'name', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Type (B2C / B2B / International)</label>
                      <input type="text" value={tier.type} onChange={(e) => updateTier(i, 'type', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tagline</label>
                      <input type="text" value={tier.tagline} onChange={(e) => updateTier(i, 'tagline', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Price Text</label>
                      <input type="text" value={tier.price} onChange={(e) => updateTier(i, 'price', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Color Gradient</label>
                      <select value={tier.color} onChange={(e) => updateTier(i, 'color', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white">
                        {COLOR_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Border Color</label>
                      <select value={tier.borderColor} onChange={(e) => updateTier(i, 'borderColor', e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white">
                        {BORDER_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    <textarea value={tier.desc} onChange={(e) => updateTier(i, 'desc', e.target.value)} rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500">Featured</label>
                    <button
                      type="button"
                      onClick={() => updateTier(i, 'featured', !tier.featured)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${tier.featured ? 'bg-[#5DB347]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${tier.featured ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-500">Features</label>
                      <button onClick={() => addFeature(i)} className="text-xs text-[#5DB347] hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tier.features.map((f, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <input type="text" value={f} onChange={(e) => updateFeature(i, j, e.target.value)}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]" />
                          <button onClick={() => removeFeature(i, j)} className="p-1 text-gray-400 hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add tier button */}
      <button
        onClick={addTier}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-[#5DB347] hover:text-[#5DB347] transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Marketplace Tier
      </button>
    </div>
  );
}
