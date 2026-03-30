'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Sprout,
  Search,
  HeartPulse,
  DollarSign,
  CheckCircle2,
  Leaf,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface CropRecord {
  id: string;
  cropName: string;
  variety: string;
  memberName: string;
  farmName: string;
  hectares: number;
  stage: 'seedling' | 'growing' | 'harvest-ready' | 'harvested';
  healthScore: number;
  plantingDate: string;
  expectedHarvest: string;
  estimatedRevenue: number;
}

type StageFilter = 'all' | 'seedling' | 'growing' | 'harvest-ready' | 'harvested';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const fallback_cropRecords: CropRecord[] = [
  { id: 'CR-001', cropName: 'Maize', variety: 'SC 513', memberName: 'Grace Moyo', farmName: 'Moyo Farm', hectares: 45, stage: 'growing', healthScore: 88, plantingDate: '2025-11-15', expectedHarvest: '2026-04-20', estimatedRevenue: 28500 },
  { id: 'CR-002', cropName: 'Blueberries', variety: 'Duke', memberName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', hectares: 12, stage: 'harvest-ready', healthScore: 94, plantingDate: '2025-08-01', expectedHarvest: '2026-03-25', estimatedRevenue: 96000 },
  { id: 'CR-003', cropName: 'Cassava', variety: 'TMS 30572', memberName: 'Amina Salim', farmName: 'Salim Holdings', hectares: 80, stage: 'growing', healthScore: 82, plantingDate: '2025-10-05', expectedHarvest: '2026-07-10', estimatedRevenue: 44000 },
  { id: 'CR-004', cropName: 'Sesame', variety: 'S-42', memberName: 'Baraka Mushi', farmName: 'Mushi Agri', hectares: 55, stage: 'seedling', healthScore: 76, plantingDate: '2026-02-20', expectedHarvest: '2026-06-15', estimatedRevenue: 38500 },
  { id: 'CR-005', cropName: 'Coffee', variety: 'Arabica SL28', memberName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', hectares: 30, stage: 'growing', healthScore: 91, plantingDate: '2025-06-10', expectedHarvest: '2026-05-01', estimatedRevenue: 72000 },
  { id: 'CR-006', cropName: 'Groundnuts', variety: 'Natal Common', memberName: 'Kago Setshedi', farmName: 'Setshedi Farms', hectares: 25, stage: 'harvest-ready', healthScore: 85, plantingDate: '2025-12-01', expectedHarvest: '2026-03-28', estimatedRevenue: 15000 },
  { id: 'CR-007', cropName: 'Sorghum', variety: 'Macia', memberName: 'John Maseko', farmName: 'Maseko Fields', hectares: 60, stage: 'harvested', healthScore: 90, plantingDate: '2025-09-15', expectedHarvest: '2026-02-10', estimatedRevenue: 32000 },
  { id: 'CR-008', cropName: 'Cotton', variety: 'SZ-9314', memberName: 'Halima Mwanga', farmName: 'Mwanga Textiles Farm', hectares: 40, stage: 'growing', healthScore: 79, plantingDate: '2025-11-20', expectedHarvest: '2026-05-15', estimatedRevenue: 24000 },
  { id: 'CR-009', cropName: 'Tobacco', variety: 'KRK 26', memberName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', hectares: 35, stage: 'seedling', healthScore: 72, plantingDate: '2026-02-10', expectedHarvest: '2026-06-30', estimatedRevenue: 56000 },
  { id: 'CR-010', cropName: 'Maize', variety: 'PAN 53', memberName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', hectares: 20, stage: 'harvest-ready', healthScore: 87, plantingDate: '2025-10-25', expectedHarvest: '2026-03-30', estimatedRevenue: 12600 },
  { id: 'CR-011', cropName: 'Blueberries', variety: 'Emerald', memberName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', hectares: 8, stage: 'growing', healthScore: 93, plantingDate: '2025-07-15', expectedHarvest: '2026-04-05', estimatedRevenue: 64000 },
  { id: 'CR-012', cropName: 'Cassava', variety: 'NASE 14', memberName: 'Grace Moyo', farmName: 'Moyo Farm', hectares: 30, stage: 'seedling', healthScore: 68, plantingDate: '2026-03-01', expectedHarvest: '2026-09-15', estimatedRevenue: 16500 },
];

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const stageColors: Record<string, string> = {
  seedling: 'bg-blue-100 text-blue-700',
  growing: 'bg-green-100 text-green-700',
  'harvest-ready': 'bg-amber-100 text-amber-700',
  harvested: 'bg-gray-100 text-gray-600',
};

const stageLabels: Record<string, string> = {
  seedling: 'Seedling',
  growing: 'Growing',
  'harvest-ready': 'Harvest Ready',
  harvested: 'Harvested',
};

function healthColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-teal';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

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

// ── Form defaults ────────────────────────────────────────────────────────────

interface CropFormData {
  cropName: string;
  variety: string;
  memberName: string;
  farmName: string;
  hectares: string;
  stage: CropRecord['stage'];
  healthScore: string;
  plantingDate: string;
  expectedHarvest: string;
  estimatedRevenue: string;
}

const emptyForm: CropFormData = {
  cropName: '',
  variety: '',
  memberName: '',
  farmName: '',
  hectares: '',
  stage: 'seedling',
  healthScore: '80',
  plantingDate: '',
  expectedHarvest: '',
  estimatedRevenue: '',
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function CropManagementPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [cropRecords, setCropRecords] = useState<CropRecord[]>(fallback_cropRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CropFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('farm_plots')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setCropRecords(
          data.map((row: Record<string, unknown>) => {
            const notes = (row.notes as string) || '';
            const memberMatch = notes.match(/Member:\s*([^|]+)/);
            const revenueMatch = notes.match(/Est\. Revenue:\s*\$?([\d.]+)/);
            return {
              id: (row.id as string) || '',
              cropName: (row.crop as string) || (row.crop_type as string) || 'Unknown',
              variety: (row.variety as string) || '',
              memberName: memberMatch ? memberMatch[1].trim() : 'Unknown',
              farmName: (row.name as string) || '',
              hectares: (row.size_ha as number) || 0,
              stage: ((row.stage as string) || 'growing') as CropRecord['stage'],
              healthScore: (row.health_score as number) || 0,
              plantingDate: ((row.planting_date as string) || '')?.split('T')[0] || '',
              expectedHarvest: ((row.expected_harvest as string) || '')?.split('T')[0] || '',
              estimatedRevenue: revenueMatch ? parseFloat(revenueMatch[1]) : 0,
            };
          })
        );
      }
    } catch { /* fallback */ }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let result = [...cropRecords];
    if (stageFilter !== 'all') result = result.filter((c) => c.stage === stageFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.cropName.toLowerCase().includes(q) ||
          c.memberName.toLowerCase().includes(q) ||
          c.variety.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, stageFilter, cropRecords]);

  const totalCrops = cropRecords.length;
  const avgHealth = totalCrops > 0 ? Math.round(cropRecords.reduce((s, c) => s + c.healthScore, 0) / totalCrops) : 0;
  const harvestReady = cropRecords.filter((c) => c.stage === 'harvest-ready').length;
  const totalRevenue = cropRecords.reduce((s, c) => s + c.estimatedRevenue, 0);

  const summaryCards = [
    { label: 'Total Crops', value: totalCrops.toString(), icon: <Sprout className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Avg Health Score', value: `${avgHealth}%`, icon: <HeartPulse className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Harvest Ready', value: harvestReady.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Est. Revenue', value: formatCurrency(totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
  ];

  const tabs: { key: StageFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'seedling', label: 'Seedling' },
    { key: 'growing', label: 'Growing' },
    { key: 'harvest-ready', label: 'Harvest Ready' },
    { key: 'harvested', label: 'Harvested' },
  ];

  // ── CRUD Handlers ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (crop: CropRecord) => {
    setEditingId(crop.id);
    setForm({
      cropName: crop.cropName,
      variety: crop.variety,
      memberName: crop.memberName,
      farmName: crop.farmName,
      hectares: crop.hectares.toString(),
      stage: crop.stage,
      healthScore: crop.healthScore.toString(),
      plantingDate: crop.plantingDate,
      expectedHarvest: crop.expectedHarvest,
      estimatedRevenue: crop.estimatedRevenue.toString(),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.cropName.trim() || !form.memberName.trim()) {
      setToast({ message: 'Crop name and member name are required', type: 'error' });
      return;
    }
    setSaving(true);
    const payload = {
      crop: form.cropName.trim(),
      variety: form.variety.trim() || null,
      name: form.farmName.trim() || form.cropName.trim(),
      size_ha: parseFloat(form.hectares) || 0,
      stage: form.stage,
      health_score: parseInt(form.healthScore) || 0,
      planting_date: form.plantingDate || null,
      expected_harvest: form.expectedHarvest || null,
      notes: form.memberName.trim() ? `Member: ${form.memberName.trim()}` + (form.estimatedRevenue ? ` | Est. Revenue: $${form.estimatedRevenue}` : '') : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('farm_plots').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('farm_plots').insert(payload));
    }

    if (error) {
      // Fallback: update local state for demo
      if (editingId) {
        setCropRecords(prev => prev.map(c => c.id === editingId ? {
          ...c, cropName: form.cropName, variety: form.variety, memberName: form.memberName,
          farmName: form.farmName, hectares: parseFloat(form.hectares) || 0, stage: form.stage,
          healthScore: parseInt(form.healthScore) || 0, plantingDate: form.plantingDate,
          expectedHarvest: form.expectedHarvest, estimatedRevenue: parseFloat(form.estimatedRevenue) || 0,
        } : c));
      } else {
        setCropRecords(prev => [{
          id: `CR-${String(prev.length + 1).padStart(3, '0')}`,
          cropName: form.cropName, variety: form.variety, memberName: form.memberName,
          farmName: form.farmName, hectares: parseFloat(form.hectares) || 0, stage: form.stage,
          healthScore: parseInt(form.healthScore) || 0, plantingDate: form.plantingDate,
          expectedHarvest: form.expectedHarvest, estimatedRevenue: parseFloat(form.estimatedRevenue) || 0,
        }, ...prev]);
      }
      setToast({ message: `Crop ${editingId ? 'updated' : 'added'} (local)`, type: 'success' });
    } else {
      setToast({ message: `Crop ${editingId ? 'updated' : 'added'} successfully`, type: 'success' });
      await fetchData();
    }
    setModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from('farm_plots').delete().eq('id', id);
    if (error) {
      // Fallback: remove locally
      setCropRecords(prev => prev.filter(c => c.id !== id));
      setToast({ message: 'Crop removed (local)', type: 'success' });
    } else {
      setToast({ message: 'Crop deleted successfully', type: 'success' });
      await fetchData();
    }
    setDeleteConfirmId(null);
    setDeleting(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Crop Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">All crops across all member farms</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Crop
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop, variety, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStageFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  stageFilter === tab.key
                    ? 'bg-teal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {totalCrops} crop records</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Crop</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Variety</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member / Farm</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Hectares</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stage</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Health</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Planted</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Exp. Harvest</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((crop) => (
                <tr key={crop.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      <span className="font-medium text-navy">{crop.cropName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{crop.variety}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy text-sm">{crop.memberName}</p>
                    <p className="text-xs text-gray-400">{crop.farmName}</p>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-gray-600">{crop.hectares}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[crop.stage]}`}>
                      {stageLabels[crop.stage]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold tabular-nums ${healthColor(crop.healthScore)}`}>
                      {crop.healthScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">{crop.plantingDate}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{crop.expectedHarvest}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(crop)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(crop.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Sprout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No crops match your filters</p>
          </div>
        )}
      </motion.div>

      {/* ── Add/Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy">{editingId ? 'Edit Crop' : 'Add Crop'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Crop Name *</label>
                  <input value={form.cropName} onChange={e => setForm({ ...form, cropName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" placeholder="Maize" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Variety</label>
                  <input value={form.variety} onChange={e => setForm({ ...form, variety: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" placeholder="SC 513" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Member Name *</label>
                  <input value={form.memberName} onChange={e => setForm({ ...form, memberName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" placeholder="Grace Moyo" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Farm Name</label>
                  <input value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" placeholder="Moyo Farm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Hectares</label>
                  <input type="number" value={form.hectares} onChange={e => setForm({ ...form, hectares: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Stage</label>
                  <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as CropRecord['stage'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none bg-white">
                    <option value="seedling">Seedling</option>
                    <option value="growing">Growing</option>
                    <option value="harvest-ready">Harvest Ready</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Health %</label>
                  <input type="number" min="0" max="100" value={form.healthScore} onChange={e => setForm({ ...form, healthScore: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Planting Date</label>
                  <input type="date" value={form.plantingDate} onChange={e => setForm({ ...form, plantingDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Exp. Harvest</label>
                  <input type="date" value={form.expectedHarvest} onChange={e => setForm({ ...form, expectedHarvest: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Est. Revenue ($)</label>
                  <input type="number" value={form.estimatedRevenue} onChange={e => setForm({ ...form, estimatedRevenue: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-teal hover:bg-teal/90 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-navy mb-2">Delete Crop Record?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone. The crop record will be permanently removed.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
