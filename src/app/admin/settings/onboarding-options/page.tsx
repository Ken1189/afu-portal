'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Settings,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Plus,
  X,
  Globe2,
  Wheat,
  Store,
  Languages,
  Users,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface CountryItem {
  name: string;
  currency: string;
}

interface OnboardingOptions {
  countries: CountryItem[];
  crops: string[];
  supplier_categories: string[];
  languages: string[];
  partnership_types: string[];
}

const DEFAULT_OPTIONS: OnboardingOptions = {
  countries: [
    { name: 'Botswana', currency: 'BWP' },
    { name: 'Zimbabwe', currency: 'ZWL' },
    { name: 'Tanzania', currency: 'TZS' },
    { name: 'Kenya', currency: 'KES' },
    { name: 'South Africa', currency: 'ZAR' },
    { name: 'Nigeria', currency: 'NGN' },
    { name: 'Uganda', currency: 'UGX' },
    { name: 'Zambia', currency: 'ZMW' },
    { name: 'Mozambique', currency: 'MZN' },
    { name: 'Sierra Leone', currency: 'SLL' },
  ],
  crops: ['Maize', 'Wheat', 'Sorghum', 'Coffee', 'Cotton', 'Tobacco', 'Sugarcane', 'Tea'],
  supplier_categories: ['Seeds', 'Fertilizer', 'Pesticides', 'Equipment', 'Insurance', 'Financial Services', 'Logistics'],
  languages: ['English', 'Shona', 'Ndebele', 'Swahili', 'Setswana', 'Portuguese', 'Hausa', 'Luganda'],
  partnership_types: ['NGO', 'Government', 'Research', 'Financial Institution', 'Other'],
};

const CONFIG_KEYS = {
  countries: 'onboarding_countries',
  crops: 'onboarding_crops',
  supplier_categories: 'onboarding_supplier_categories',
  languages: 'onboarding_languages',
  partnership_types: 'onboarding_partnership_types',
} as const;

type TabKey = keyof OnboardingOptions;

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'countries', label: 'Countries', icon: Globe2 },
  { key: 'crops', label: 'Crops', icon: Wheat },
  { key: 'supplier_categories', label: 'Supplier Categories', icon: Store },
  { key: 'languages', label: 'Languages', icon: Languages },
  { key: 'partnership_types', label: 'Partnership Types', icon: Users },
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

export default function OnboardingOptionsConfig() {
  const [options, setOptions] = useState<OnboardingOptions>(DEFAULT_OPTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('countries');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const keys = Object.values(CONFIG_KEYS);
    const { data: rows } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', keys);

    if (rows) {
      const loaded = { ...DEFAULT_OPTIONS };
      for (const row of rows) {
        const val = row.value;
        if (!val || !Array.isArray(val) || val.length === 0) continue;
        switch (row.key) {
          case CONFIG_KEYS.countries: loaded.countries = val as CountryItem[]; break;
          case CONFIG_KEYS.crops: loaded.crops = val as string[]; break;
          case CONFIG_KEYS.supplier_categories: loaded.supplier_categories = val as string[]; break;
          case CONFIG_KEYS.languages: loaded.languages = val as string[]; break;
          case CONFIG_KEYS.partnership_types: loaded.partnership_types = val as string[]; break;
        }
      }
      setOptions(loaded);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    for (const [field, configKey] of Object.entries(CONFIG_KEYS)) {
      const value = options[field as TabKey];
      const { data: existing } = await supabase
        .from('site_config')
        .select('id')
        .eq('key', configKey)
        .single();

      let error;
      if (existing) {
        ({ error } = await supabase
          .from('site_config')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', configKey));
      } else {
        ({ error } = await supabase
          .from('site_config')
          .insert({ key: configKey, value, description: `Onboarding ${field.replace(/_/g, ' ')}` }));
      }
      if (error) hasError = true;
    }

    if (hasError) {
      setToast({ message: 'Failed to save some onboarding options', type: 'error' });
    } else {
      setToast({ message: 'Onboarding options saved successfully', type: 'success' });
    }
    setSaving(false);
  };

  const resetDefaults = () => {
    if (confirm('Reset all onboarding options to default values?')) {
      setOptions(DEFAULT_OPTIONS);
    }
  };

  // ── Simple list helpers ──────────────────────────────────────────────────

  const addStringItem = (field: Exclude<TabKey, 'countries'>) => {
    setOptions((prev) => ({ ...prev, [field]: [...prev[field] as string[], ''] }));
  };

  const updateStringItem = (field: Exclude<TabKey, 'countries'>, index: number, value: string) => {
    setOptions((prev) => {
      const arr = [...prev[field] as string[]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const removeStringItem = (field: Exclude<TabKey, 'countries'>, index: number) => {
    setOptions((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // ── Country helpers ──────────────────────────────────────────────────────

  const addCountry = () => {
    setOptions((prev) => ({
      ...prev,
      countries: [...prev.countries, { name: '', currency: '' }],
    }));
  };

  const updateCountry = (index: number, field: keyof CountryItem, value: string) => {
    setOptions((prev) => {
      const countries = [...prev.countries];
      countries[index] = { ...countries[index], [field]: value };
      return { ...prev, countries };
    });
  };

  const removeCountry = (index: number) => {
    setOptions((prev) => ({
      ...prev,
      countries: prev.countries.filter((_, i) => i !== index),
    }));
  };

  // ── Render helpers ──────────────────────────────────────────────────────

  const renderStringList = (field: Exclude<TabKey, 'countries'>, label: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1B2A4A]">{label} ({(options[field] as string[]).length})</h3>
        <button
          onClick={() => addStringItem(field)}
          className="inline-flex items-center gap-1 text-xs text-[#5DB347] hover:underline font-medium"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {(options[field] as string[]).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateStringItem(field, i, e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              placeholder={`Enter ${label.toLowerCase().replace(/s$/, '')}...`}
            />
            <button onClick={() => removeStringItem(field, i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {(options[field] as string[]).length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center">No items yet. Click &quot;Add&quot; to get started.</p>
        )}
      </div>
    </div>
  );

  const renderCountries = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1B2A4A]">Countries ({options.countries.length})</h3>
        <button
          onClick={addCountry}
          className="inline-flex items-center gap-1 text-xs text-[#5DB347] hover:underline font-medium"
        >
          <Plus className="w-3 h-3" /> Add Country
        </button>
      </div>
      <div className="space-y-2">
        {options.countries.map((country, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={country.name}
              onChange={(e) => updateCountry(i, 'name', e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              placeholder="Country name"
            />
            <input
              type="text"
              value={country.currency}
              onChange={(e) => updateCountry(i, 'currency', e.target.value)}
              className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-center"
              placeholder="CUR"
            />
            <button onClick={() => removeCountry(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {options.countries.length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center">No countries yet. Click &quot;Add Country&quot; to get started.</p>
        )}
      </div>
    </div>
  );

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
            <Settings className="w-6 h-6 text-[#5DB347]" />
            Onboarding Options
          </h1>
          <p className="text-gray-500 mt-1">Configure the choices shown during user onboarding</p>
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
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#5DB347]' : ''}`} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#5DB347]/10 text-[#5DB347]' : 'bg-gray-200 text-gray-500'}`}>
                {activeTab === 'countries' && tab.key === 'countries' ? options.countries.length
                  : tab.key === 'countries' ? options.countries.length
                  : (options[tab.key] as string[]).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'countries' && renderCountries()}
        {activeTab === 'crops' && renderStringList('crops', 'Crops')}
        {activeTab === 'supplier_categories' && renderStringList('supplier_categories', 'Supplier Categories')}
        {activeTab === 'languages' && renderStringList('languages', 'Languages')}
        {activeTab === 'partnership_types' && renderStringList('partnership_types', 'Partnership Types')}
      </div>
    </div>
  );
}
