'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Scale,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  DollarSign,
  CreditCard,
  Truck,
  ShieldCheck,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface MarketplaceRules {
  return_period_days: number;
  dispute_resolution_days: number;
  min_order_value: number;
  max_order_value: number;
  payment_terms: string;
  shipping_policy: string;
  quality_guarantee: string;
}

const DEFAULT_RULES: MarketplaceRules = {
  return_period_days: 14,
  dispute_resolution_days: 30,
  min_order_value: 10,
  max_order_value: 50000,
  payment_terms: 'Payment must be completed within 7 days of order confirmation. We support mobile money, bank transfer, and card payments.',
  shipping_policy: 'Suppliers are responsible for shipping within the delivery window specified. Delivery tracking must be provided for orders above $100.',
  quality_guarantee: 'All products must meet the quality standards set by AFU. Products failing quality checks will be returned at the supplier\'s expense.',
};

const CONFIG_KEY = 'marketplace_rules';

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MarketplaceRulesConfig() {
  const [rules, setRules] = useState<MarketplaceRules>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', CONFIG_KEY)
      .single();

    if (!error && data) {
      setRules(data.value as MarketplaceRules);
    }
    setLoading(false);
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
        .update({ value: rules, updated_at: new Date().toISOString() })
        .eq('key', CONFIG_KEY));
    } else {
      ({ error } = await supabase
        .from('site_config')
        .insert({ key: CONFIG_KEY, value: rules, description: 'Marketplace rules and policies' }));
    }

    if (error) {
      setToast({ message: 'Failed to save marketplace rules', type: 'error' });
    } else {
      setToast({ message: 'Marketplace rules saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const resetDefaults = () => {
    if (confirm('Reset all fields to default values?')) {
      setRules(DEFAULT_RULES);
    }
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Rules</h1>
          <p className="text-gray-500 mt-1">Configure marketplace policies and constraints</p>
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Numeric fields row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <RotateCcw className="w-4 h-4 text-blue-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Return Period</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rules.return_period_days}
              onChange={(e) => setRules({ ...rules, return_period_days: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
              min={0}
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">days</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Dispute Resolution</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rules.dispute_resolution_days}
              onChange={(e) => setRules({ ...rules, dispute_resolution_days: parseInt(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
              min={0}
            />
            <span className="text-sm text-gray-400 whitespace-nowrap">days</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Min Order Value</label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="number"
              value={rules.min_order_value}
              onChange={(e) => setRules({ ...rules, min_order_value: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
              min={0}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Max Order Value</label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">$</span>
            <input
              type="number"
              value={rules.max_order_value}
              onChange={(e) => setRules({ ...rules, max_order_value: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Text fields */}
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Payment Terms</label>
          </div>
          <textarea
            value={rules.payment_terms}
            onChange={(e) => setRules({ ...rules, payment_terms: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
            rows={3}
            placeholder="Define payment terms for the marketplace..."
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Truck className="w-4 h-4 text-orange-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Shipping Policy</label>
          </div>
          <textarea
            value={rules.shipping_policy}
            onChange={(e) => setRules({ ...rules, shipping_policy: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
            rows={3}
            placeholder="Define shipping policies..."
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-teal-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
            </div>
            <label className="text-sm font-medium text-gray-700">Quality Guarantee</label>
          </div>
          <textarea
            value={rules.quality_guarantee}
            onChange={(e) => setRules({ ...rules, quality_guarantee: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent outline-none"
            rows={3}
            placeholder="Define quality guarantee terms..."
          />
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Changes are saved when you click the Save button above.</p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
