'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface InsuranceProduct {
  icon: string;
  name: string;
  description: string;
  premium: string;
  link: string;
}

interface InsuranceStat {
  value: string;
  label: string;
}

interface InsuranceConfig {
  products: InsuranceProduct[];
  stats: InsuranceStat[];
}

const ICON_OPTIONS = ['Tractor', 'Wheat', 'Hospital', 'Home', 'Ship', 'Beef', 'ShieldCheck', 'Cog', 'Landmark', 'Truck'];

const DEFAULT_CONFIG: InsuranceConfig = {
  products: [
    { icon: 'Tractor', name: 'Asset Insurance', description: 'Protect your farming equipment, machinery, vehicles, and buildings against breakdown, theft, fire, and natural disasters.', premium: 'From $12/month', link: '/services/insurance/asset' },
    { icon: 'Wheat', name: 'Crop Insurance', description: 'Guard against crop loss from drought, flood, pests, disease, and hail with weather-index and traditional indemnity coverage.', premium: 'From $8/month', link: '/services/insurance/crop' },
    { icon: 'Hospital', name: 'Medical Insurance', description: 'Health coverage for farming families including outpatient care, hospitalization, dental, and optical across our clinic network.', premium: 'From $15/month', link: '/services/insurance/medical' },
    { icon: 'Home', name: 'Farm Insurance', description: 'Comprehensive all-in-one protection for your entire farm: buildings, fencing, irrigation, stored produce, and liability coverage.', premium: 'From $25/month', link: '/services/insurance/farm' },
    { icon: 'Ship', name: 'Trade Insurance', description: 'Coverage for export shipments including marine transit, buyer default, letters of credit, and political risk for cross-border trade.', premium: 'From $35/month', link: '/services/insurance/trade' },
    { icon: 'Beef', name: 'Livestock Insurance', description: 'Protect your cattle, goats, sheep, and poultry against disease, theft, predators, and natural disasters.', premium: 'From $10/month', link: '/services/insurance/livestock' },
    { icon: 'ShieldCheck', name: 'Life & Personal Insurance', description: 'Life cover, funeral plans, and personal accident insurance to protect farming families and their futures.', premium: 'From $3/month', link: '/services/insurance/life' },
    { icon: 'Cog', name: 'Equipment Insurance', description: 'Cover tractors, irrigation systems, and implements against theft, damage, and mechanical breakdown.', premium: 'From $15/month', link: '/services/insurance/equipment' },
    { icon: 'Landmark', name: 'Pension & Retirement', description: "Farmer retirement savings plans with leveraged growth through AFU's capital program. Start from $10/month.", premium: 'From $10/month', link: '/services/insurance/pension' },
    { icon: 'Truck', name: 'Vehicle & Transport Insurance', description: 'Third party, fire and theft, or comprehensive cover for farm bakkies, trucks, and fleet vehicles.', premium: 'From $8/month', link: '/services/insurance/vehicle' },
  ],
  stats: [
    { value: '1,200+', label: 'Policies Active' },
    { value: '$5.2M', label: 'Total Coverage' },
    { value: '94%', label: 'Claims Paid' },
    { value: '48hrs', label: 'Avg. Claim Resolution' },
  ],
};

const CONFIG_KEY = 'insurance_page_products';

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

export default function InsurancePricingConfig() {
  const [config, setConfig] = useState<InsuranceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (!error && data?.value) {
      const val = data.value as InsuranceConfig;
      setConfig({
        products: val.products ?? DEFAULT_CONFIG.products,
        stats: val.stats ?? DEFAULT_CONFIG.stats,
      });
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
        .update({ value: config, updated_at: new Date().toISOString() })
        .eq('key', CONFIG_KEY));
    } else {
      ({ error } = await supabase
        .from('site_config')
        .insert({ key: CONFIG_KEY, value: config, description: 'Insurance page products and stats' }));
    }

    if (error) {
      setToast({ message: 'Failed to save insurance config', type: 'error' });
    } else {
      setToast({ message: 'Insurance config saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const resetDefaults = () => {
    if (confirm('Reset all insurance products and stats to default values?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const updateProduct = (index: number, field: keyof InsuranceProduct, value: string) => {
    setConfig((prev) => {
      const products = [...prev.products];
      products[index] = { ...products[index], [field]: value };
      return { ...prev, products };
    });
  };

  const addProduct = () => {
    setConfig((prev) => ({
      ...prev,
      products: [...prev.products, { icon: 'ShieldCheck', name: '', description: '', premium: '', link: '' }],
    }));
    setExpandedProduct(config.products.length);
  };

  const removeProduct = (index: number) => {
    if (!confirm('Remove this product?')) return;
    setConfig((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
    setExpandedProduct(null);
  };

  const updateStat = (index: number, field: keyof InsuranceStat, value: string) => {
    setConfig((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: value };
      return { ...prev, stats };
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
            <ShieldCheck className="w-6 h-6 text-[#5DB347]" />
            Insurance Product Pricing
          </h1>
          <p className="text-gray-500 mt-1">Manage insurance products displayed on the public insurance page</p>
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

      {/* Stats Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Page Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.stats.map((stat, i) => (
            <div key={i} className="space-y-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                {['Policies Count', 'Total Coverage', 'Claims Paid %', 'Avg Resolution'][i] ?? `Stat ${i + 1}`}
              </label>
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(i, 'value', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                placeholder="Value"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(i, 'label', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1B2A4A]">
            Insurance Products ({config.products.length})
          </h2>
          <button
            onClick={addProduct}
            className="inline-flex items-center gap-2 px-4 py-2 text-[#5DB347] border border-[#5DB347]/30 rounded-lg text-sm font-medium hover:bg-[#5DB347]/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        <div className="space-y-3">
          {config.products.map((product, i) => {
            const isExpanded = expandedProduct === i;
            return (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Collapsed row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setExpandedProduct(isExpanded ? null : i)}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900">{product.name || '(Unnamed product)'}</span>
                    <span className="text-xs text-[#5DB347] ml-3">{product.premium}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeProduct(i); }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="p-4 space-y-3 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(i, 'name', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Price Text</label>
                        <input
                          type="text"
                          value={product.premium}
                          onChange={(e) => updateProduct(i, 'premium', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                          placeholder="From $12/month"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                        <select
                          value={product.icon}
                          onChange={(e) => updateProduct(i, 'icon', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>{ic}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                        <input
                          type="text"
                          value={product.link}
                          onChange={(e) => updateProduct(i, 'link', e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                          placeholder="/services/insurance/..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(i, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
