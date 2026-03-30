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
  Banknote,
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

interface LoanTier {
  id: string;
  name: string;
  range: string;
  area: string;
  rate: string;
  features: string[];
  featured?: boolean;
}

interface DisbursementStage {
  id: string;
  stage: string;
  period: string;
  activities: string;
  funding: string;
  color: string;
}

interface LoanConfig {
  tiers: LoanTier[];
  stages: DisbursementStage[];
  crops: { name: string; season: string }[];
  requirements: string[];
}

const defaultConfig: LoanConfig = {
  tiers: [
    { id: '1', name: 'Smallholder', range: '$500 - $5,000', area: 'Up to 5 hectares', rate: '14 - 18% APR', features: ['Input vouchers via AFU marketplace', 'Agronomist advisory included', 'Group lending available', 'Harvest escrow repayment'] },
    { id: '2', name: 'Growth', range: '$5,000 - $25,000', area: '5 - 50 hectares', rate: '12 - 15% APR', features: ['Direct cash disbursement option', 'Dedicated loan officer', 'Seasonal repayment flex', 'Multi-crop financing'], featured: true },
    { id: '3', name: 'Commercial', range: '$25,000 - $100,000', area: '50+ hectares', rate: '10 - 13% APR', features: ['Custom disbursement schedule', 'Priority processing', 'Revolving facility option', 'Export-linked repayment'] },
  ],
  stages: [
    { id: '1', stage: 'Pre-Plant', period: '6-8 weeks before', activities: 'Land preparation, soil testing, input procurement', funding: '40% of loan disbursed', color: 'bg-amber-100 text-amber-800' },
    { id: '2', stage: 'Planting', period: 'Planting window', activities: 'Seed, fertilizer application, planting labour', funding: '30% disbursed', color: 'bg-green-100 text-green-800' },
    { id: '3', stage: 'Growing', period: 'Season duration', activities: 'Top-dressing, pest control, irrigation', funding: '20% disbursed', color: 'bg-teal-100 text-teal-800' },
    { id: '4', stage: 'Harvest', period: 'Harvest window', activities: 'Harvesting, transport to collection point', funding: '10% disbursed', color: 'bg-blue-100 text-blue-800' },
    { id: '5', stage: 'Repayment', period: 'Post-harvest', activities: 'Crop sold via offtake, loan deducted from escrow', funding: 'Loan + interest settled', color: 'bg-navy text-white' },
  ],
  crops: [
    { name: 'Maize', season: 'Oct - Apr' }, { name: 'Soya Beans', season: 'Nov - Apr' },
    { name: 'Groundnuts', season: 'Nov - Mar' }, { name: 'Tobacco', season: 'Sep - Mar' },
    { name: 'Cotton', season: 'Oct - May' }, { name: 'Sunflower', season: 'Nov - Apr' },
    { name: 'Vegetables', season: 'Year-round' }, { name: 'Wheat', season: 'May - Oct' },
  ],
  requirements: [
    'Active AFU membership (any tier)', 'KYC verification complete', 'Crop plan submitted and approved',
    'Land proof: title deed, lease, or offer letter', 'At least one season of farming history (waived for group loans)', 'Offtake agreement or market plan',
  ],
};

const emptyTier: Omit<LoanTier, 'id'> = { name: '', range: '', area: '', rate: '', features: [], featured: false };

// ── Main Page ─────────────────────────────────────────────

export default function LoanProductsAdminPage() {
  const supabase = createClient();
  const [config, setConfig] = useState<LoanConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'tiers' | 'stages' | 'crops' | 'requirements'>('tiers');

  // Modal state for tier editing
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<LoanTier, 'id'>>(emptyTier);
  const [featuresText, setFeaturesText] = useState('');

  // Requirements editing
  const [reqText, setReqText] = useState('');

  // Crops editing
  const [cropName, setCropName] = useState('');
  const [cropSeason, setCropSeason] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('site_config').select('*').eq('key', 'loan_products').single();
        if (data) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          if (parsed && typeof parsed === 'object') {
            setConfig({ ...defaultConfig, ...parsed });
            if (parsed.requirements) setReqText(parsed.requirements.join('\n'));
          }
        } else {
          setReqText(defaultConfig.requirements.join('\n'));
        }
      } catch {
        setReqText(defaultConfig.requirements.join('\n'));
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const saveConfig = useCallback(async (updated: LoanConfig) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('site_config').upsert({
        key: 'loan_products',
        value: JSON.stringify(updated),
        description: 'Crop development loan products configuration',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      if (error) throw error;
      setToast({ message: 'Loan products saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save loan products', type: 'error' });
    }
    setSaving(false);
  }, [supabase]);

  // Tier CRUD
  const openAddTier = () => { setEditingId(null); setForm(emptyTier); setFeaturesText(''); setModalOpen(true); };
  const openEditTier = (tier: LoanTier) => { setEditingId(tier.id); const { id: _, ...rest } = tier; setForm(rest); setFeaturesText(tier.features.join('\n')); setModalOpen(true); };

  const handleSaveTier = () => {
    if (!form.name.trim()) { setToast({ message: 'Tier name is required', type: 'error' }); return; }
    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);
    let updated: LoanConfig;
    if (editingId) {
      updated = { ...config, tiers: config.tiers.map(t => t.id === editingId ? { ...form, features, id: editingId } : t) };
    } else {
      updated = { ...config, tiers: [...config.tiers, { ...form, features, id: Date.now().toString() }] };
    }
    setConfig(updated);
    saveConfig(updated);
    setModalOpen(false);
  };

  const handleDeleteTier = (id: string) => {
    const updated = { ...config, tiers: config.tiers.filter(t => t.id !== id) };
    setConfig(updated);
    saveConfig(updated);
  };

  // Requirements save
  const saveRequirements = () => {
    const reqs = reqText.split('\n').map(r => r.trim()).filter(Boolean);
    const updated = { ...config, requirements: reqs };
    setConfig(updated);
    saveConfig(updated);
  };

  // Crop add/remove
  const addCrop = () => {
    if (!cropName.trim()) return;
    const updated = { ...config, crops: [...config.crops, { name: cropName.trim(), season: cropSeason.trim() || 'Year-round' }] };
    setConfig(updated);
    saveConfig(updated);
    setCropName('');
    setCropSeason('');
  };
  const removeCrop = (idx: number) => {
    const updated = { ...config, crops: config.crops.filter((_, i) => i !== idx) };
    setConfig(updated);
    saveConfig(updated);
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
        <Link href="/admin/settings" className="text-gray-400 hover:text-[#1B2A4A] transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <Banknote className="w-6 h-6 text-[#5DB347]" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Loan Products</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8 ml-8">Manage crop development loan tiers, disbursement stages, eligible crops, and requirements.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(['tiers', 'stages', 'crops', 'requirements'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-[#5DB347] text-[#5DB347]' : 'border-transparent text-gray-400 hover:text-[#1B2A4A]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tiers Tab */}
      {tab === 'tiers' && (
        <>
          <div className="space-y-4 mb-6">
            {config.tiers.map(tier => (
              <div key={tier.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                    {tier.name}
                    {tier.featured && <span className="text-xs bg-[#5DB347]/10 text-[#5DB347] px-2 py-0.5 rounded-full font-medium">Featured</span>}
                  </div>
                  <div className="text-xs text-gray-500">{tier.range} &bull; {tier.area} &bull; {tier.rate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditTier(tier)} className="p-2 rounded-lg hover:bg-[#EBF7E5] text-gray-400 hover:text-[#5DB347] transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteTier(tier.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={openAddTier} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-md shadow-[#5DB347]/20">
            <Plus className="w-4 h-4" /> Add Loan Tier
          </button>
        </>
      )}

      {/* Stages Tab */}
      {tab === 'stages' && (
        <div className="space-y-3">
          {config.stages.map((stage, i) => (
            <div key={stage.id || i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-8 h-8 bg-[#1B2A4A] rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="font-semibold text-[#1B2A4A] text-sm">{stage.stage}</div>
                <div className="text-xs text-gray-500">{stage.period} &mdash; {stage.activities}</div>
              </div>
              <div className="text-sm font-semibold text-[#1B2A4A] text-right">{stage.funding}</div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">Disbursement stages are displayed on the Crop Development Loan page. Edit the JSON directly in site_config for advanced changes.</p>
        </div>
      )}

      {/* Crops Tab */}
      {tab === 'crops' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {config.crops.map((crop, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#1B2A4A] text-sm">{crop.name}</div>
                  <div className="text-xs text-gray-400">{crop.season}</div>
                </div>
                <button onClick={() => removeCrop(i)} className="p-1 hover:bg-red-50 rounded text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">Crop Name</label>
              <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={cropName} onChange={e => setCropName(e.target.value)} placeholder="e.g. Cassava" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1B2A4A] mb-1">Season</label>
              <input className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={cropSeason} onChange={e => setCropSeason(e.target.value)} placeholder="e.g. Oct - Mar" />
            </div>
            <button onClick={addCrop} className="flex items-center gap-1 bg-[#5DB347] hover:bg-[#449933] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </>
      )}

      {/* Requirements Tab */}
      {tab === 'requirements' && (
        <div>
          <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Requirements (one per line)</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none resize-none"
            rows={8}
            value={reqText}
            onChange={e => setReqText(e.target.value)}
          />
          <button onClick={saveRequirements} disabled={saving} className="mt-4 flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 shadow-md shadow-[#5DB347]/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Requirements
          </button>
        </div>
      )}

      {/* Tier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1B2A4A]">{editingId ? 'Edit' : 'Add'} Loan Tier</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Tier Name *</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Amount Range</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.range} onChange={e => setForm({ ...form, range: e.target.value })} placeholder="$500 - $5,000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Farm Area</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Up to 5 hectares" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Interest Rate</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} placeholder="14 - 18% APR" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured" checked={form.featured || false} onChange={e => setForm({ ...form, featured: e.target.checked })} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                <label htmlFor="featured" className="text-sm text-[#1B2A4A]">Featured (Most Popular)</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">Features (one per line)</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/50 focus:border-[#5DB347] outline-none resize-none" rows={5} value={featuresText} onChange={e => setFeaturesText(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#1B2A4A] hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveTier} disabled={saving} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
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
