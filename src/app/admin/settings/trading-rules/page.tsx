'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Scale,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldAlert,
  FileText,
  Percent,
  Ban,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface CountryRule {
  country: string;
  export_license_required: boolean;
  max_export_quantity_tons: number;
  restricted_commodities: string[];
  tax_rate_percent: number;
  notes: string;
}

const COMMODITY_OPTIONS = ['Maize', 'Coffee', 'Cotton', 'Tobacco', 'Tea', 'Cocoa', 'Cashew Nuts', 'Sesame', 'Sorghum', 'Rice', 'Groundnuts', 'Wheat'];

const DEFAULT_RULES: CountryRule[] = [
  {
    country: 'Zimbabwe',
    export_license_required: true,
    max_export_quantity_tons: 10000,
    restricted_commodities: ['Maize', 'Wheat'],
    tax_rate_percent: 5.0,
    notes: 'Maize exports restricted during food security emergencies. Tobacco export via auction floors only.',
  },
  {
    country: 'Uganda',
    export_license_required: true,
    max_export_quantity_tons: 50000,
    restricted_commodities: [],
    tax_rate_percent: 3.0,
    notes: 'Coffee exports regulated by Uganda Coffee Development Authority. UCDA certificate required.',
  },
  {
    country: 'Kenya',
    export_license_required: true,
    max_export_quantity_tons: 25000,
    restricted_commodities: ['Maize'],
    tax_rate_percent: 4.0,
    notes: 'Tea exports managed by Kenya Tea Development Agency. Maize export bans during drought.',
  },
  {
    country: 'Tanzania',
    export_license_required: true,
    max_export_quantity_tons: 30000,
    restricted_commodities: ['Cashew Nuts'],
    tax_rate_percent: 3.5,
    notes: 'Cashew nut exports must go through warehouse receipt system. Export levy on raw cashew.',
  },
  {
    country: 'Zambia',
    export_license_required: false,
    max_export_quantity_tons: 20000,
    restricted_commodities: ['Maize'],
    tax_rate_percent: 2.5,
    notes: 'Maize export ban activated when national reserves fall below strategic minimum levels.',
  },
];

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X size={14} /></button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TradingRulesPage() {
  const supabase = createClient();

  const [rules, setRules] = useState<CountryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Editing
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CountryRule>({
    country: '', export_license_required: true, max_export_quantity_tons: 0,
    restricted_commodities: [], tax_rate_percent: 0, notes: '',
  });

  // Adding
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState<CountryRule>({
    country: '', export_license_required: true, max_export_quantity_tons: 10000,
    restricted_commodities: [], tax_rate_percent: 3.0, notes: '',
  });

  // ── Load ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .eq('key', 'country_trading_rules')
      .single();

    if (error && error.code !== 'PGRST116') {
      setToast({ message: 'Failed to load trading rules', type: 'error' });
    }

    setRules(data?.value ? (data.value as CountryRule[]) : DEFAULT_RULES);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save ────────────────────────────────────────────────────────────────
  const saveRules = useCallback(async (updated: CountryRule[]) => {
    setSaving(true);
    const { error } = await supabase
      .from('site_config')
      .upsert(
        {
          key: 'country_trading_rules',
          value: updated,
          description: 'Per-country trading regulations and export rules',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      setToast({ message: 'Failed to save trading rules', type: 'error' });
    } else {
      setRules(updated);
      setToast({ message: 'Trading rules saved successfully', type: 'success' });
    }
    setSaving(false);
  }, []);

  // ── Commodity toggle helper ─────────────────────────────────────────────
  const toggleRestricted = (form: CountryRule, setForm: (f: CountryRule) => void, commodity: string) => {
    const restricted = form.restricted_commodities.includes(commodity)
      ? form.restricted_commodities.filter((c) => c !== commodity)
      : [...form.restricted_commodities, commodity];
    setForm({ ...form, restricted_commodities: restricted });
  };

  // ── Handlers ────────────────────────────────────────────────────────────
  const startEdit = (idx: number) => { setEditIdx(idx); setEditForm({ ...rules[idx] }); };
  const saveEdit = () => { if (editIdx === null) return; const u = [...rules]; u[editIdx] = editForm; saveRules(u); setEditIdx(null); };
  const deleteRule = (idx: number) => { saveRules(rules.filter((_, i) => i !== idx)); };
  const addRule = () => {
    if (!newForm.country.trim()) return;
    saveRules([...rules, { ...newForm }]);
    setAdding(false);
    setNewForm({ country: '', export_license_required: true, max_export_quantity_tons: 10000, restricted_commodities: [], tax_rate_percent: 3.0, notes: '' });
  };

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#5DB347]" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Scale size={28} className="text-[#5DB347]" />
            Country Trading Rules
          </h1>
          <p className="text-gray-500 mt-1">Manage per-country trading regulations, export limits, and tax rates</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white rounded-xl hover:bg-[#4ea23c] transition font-medium text-sm"
        >
          <Plus size={16} /> Add Country
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Globe size={14} /> Countries</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{rules.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><ShieldAlert size={14} /> License Required</div>
          <p className="text-2xl font-bold text-orange-600">{rules.filter((r) => r.export_license_required).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Percent size={14} /> Avg Tax Rate</div>
          <p className="text-2xl font-bold text-[#1B2A4A]">
            {rules.length > 0 ? (rules.reduce((s, r) => s + r.tax_rate_percent, 0) / rules.length).toFixed(1) : '0'}%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-1"><Ban size={14} /> With Restrictions</div>
          <p className="text-2xl font-bold text-red-600">{rules.filter((r) => r.restricted_commodities.length > 0).length}</p>
        </div>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-[#1B2A4A] mb-3">New Country Trading Rules</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
              <input type="text" value={newForm.country} onChange={(e) => setNewForm({ ...newForm, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="e.g. Malawi" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Export (tons)</label>
              <input type="number" value={newForm.max_export_quantity_tons} onChange={(e) => setNewForm({ ...newForm, max_export_quantity_tons: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tax Rate %</label>
              <input type="number" step="0.1" value={newForm.tax_rate_percent} onChange={(e) => setNewForm({ ...newForm, tax_rate_percent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Export License Required</label>
              <button
                onClick={() => setNewForm({ ...newForm, export_license_required: !newForm.export_license_required })}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition ${newForm.export_license_required ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700'}`}
              >
                {newForm.export_license_required ? 'Yes - License Required' : 'No - Free Export'}
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <input type="text" value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" placeholder="Regulatory notes..." />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-500 mb-2">Restricted Commodities</label>
            <div className="flex flex-wrap gap-2">
              {COMMODITY_OPTIONS.map((commodity) => (
                <button
                  key={commodity}
                  onClick={() => toggleRestricted(newForm, setNewForm, commodity)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${newForm.restricted_commodities.includes(commodity) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                >
                  {commodity}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addRule} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition"><Save size={14} className="inline mr-1" /> Save</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* Country Cards */}
      {rules.map((rule, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {editIdx === idx ? (
            /* Edit Mode */
            <div className="p-5">
              <h3 className="font-semibold text-[#1B2A4A] mb-3">Edit: {rule.country}</h3>
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Country</label>
                  <input type="text" value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Export (tons)</label>
                  <input type="number" value={editForm.max_export_quantity_tons} onChange={(e) => setEditForm({ ...editForm, max_export_quantity_tons: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Tax Rate %</label>
                  <input type="number" step="0.1" value={editForm.tax_rate_percent} onChange={(e) => setEditForm({ ...editForm, tax_rate_percent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Export License Required</label>
                  <button
                    onClick={() => setEditForm({ ...editForm, export_license_required: !editForm.export_license_required })}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium border transition ${editForm.export_license_required ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700'}`}
                  >
                    {editForm.export_license_required ? 'Yes - License Required' : 'No - Free Export'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <input type="text" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-2">Restricted Commodities</label>
                <div className="flex flex-wrap gap-2">
                  {COMMODITY_OPTIONS.map((commodity) => (
                    <button
                      key={commodity}
                      onClick={() => toggleRestricted(editForm, setEditForm, commodity)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${editForm.restricted_commodities.includes(commodity) ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {commodity}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4ea23c] transition"><Save size={14} className="inline mr-1" /> Save</button>
                <button onClick={() => setEditIdx(null)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Cancel</button>
              </div>
            </div>
          ) : (
            /* Display Mode */
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/5 flex items-center justify-center">
                    <Globe size={20} className="text-[#1B2A4A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A] text-lg">{rule.country}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rule.export_license_required ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                        <ShieldAlert size={11} />
                        {rule.export_license_required ? 'License Required' : 'Free Export'}
                      </span>
                      <span className="text-xs text-gray-500">Tax: {rule.tax_rate_percent}%</span>
                      <span className="text-xs text-gray-500">Max: {rule.max_export_quantity_tons.toLocaleString()} tons</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(idx)} className="p-1.5 text-gray-400 hover:text-[#5DB347] hover:bg-[#5DB347]/10 rounded-lg transition"><Pencil size={14} /></button>
                  <button onClick={() => deleteRule(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
              </div>

              {rule.restricted_commodities.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500 mr-2">Restricted:</span>
                  {rule.restricted_commodities.map((rc) => (
                    <span key={rc} className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-medium mr-1 mb-1">{rc}</span>
                  ))}
                </div>
              )}

              {rule.notes && (
                <div className="flex items-start gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                  <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">{rule.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {rules.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Scale size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No country trading rules configured.</p>
        </div>
      )}

      {saving && (
        <div className="fixed bottom-6 right-6 bg-[#1B2A4A] text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Loader2 size={16} className="animate-spin" /> Saving...
        </div>
      )}
    </div>
  );
}
