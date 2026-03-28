'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Search,
  HeartPulse,
  DollarSign,
  CheckCircle2,
  MapPin,
  Beef,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface LivestockRecord {
  id: string;
  animalType: string;
  breed: string;
  memberName: string;
  farmName: string;
  count: number;
  healthStatus: 'healthy' | 'fair' | 'poor' | 'quarantined';
  location: string;
  valueEstimate: number;
}

type TypeFilter = 'all' | 'cattle' | 'poultry' | 'goats' | 'sheep' | 'pigs';

// ── Placeholder Data ─────────────────────────────────────────────────────────

const fallback_livestockRecords: LivestockRecord[] = [
  { id: 'LS-001', animalType: 'Cattle', breed: 'Brahman', memberName: 'Grace Moyo', farmName: 'Moyo Farm', count: 120, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 180000 },
  { id: 'LS-002', animalType: 'Poultry', breed: 'Rhode Island Red', memberName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', count: 2500, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 25000 },
  { id: 'LS-003', animalType: 'Goats', breed: 'Boer', memberName: 'Amina Salim', farmName: 'Salim Holdings', count: 85, healthStatus: 'fair', location: 'Tanzania', valueEstimate: 12750 },
  { id: 'LS-004', animalType: 'Cattle', breed: 'Nguni', memberName: 'Baraka Mushi', farmName: 'Mushi Agri', count: 200, healthStatus: 'healthy', location: 'Tanzania', valueEstimate: 300000 },
  { id: 'LS-005', animalType: 'Pigs', breed: 'Large White', memberName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', count: 150, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 45000 },
  { id: 'LS-006', animalType: 'Sheep', breed: 'Dorper', memberName: 'Kago Setshedi', farmName: 'Setshedi Farms', count: 300, healthStatus: 'healthy', location: 'Botswana', valueEstimate: 60000 },
  { id: 'LS-007', animalType: 'Poultry', breed: 'Kuroiler', memberName: 'John Maseko', farmName: 'Maseko Fields', count: 4000, healthStatus: 'fair', location: 'Zimbabwe', valueEstimate: 32000 },
  { id: 'LS-008', animalType: 'Cattle', breed: 'Tuli', memberName: 'Halima Mwanga', farmName: 'Mwanga Farm', count: 80, healthStatus: 'poor', location: 'Tanzania', valueEstimate: 96000 },
  { id: 'LS-009', animalType: 'Goats', breed: 'Kalahari Red', memberName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', count: 60, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 10800 },
  { id: 'LS-010', animalType: 'Pigs', breed: 'Landrace', memberName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', count: 90, healthStatus: 'quarantined', location: 'Zimbabwe', valueEstimate: 27000 },
  { id: 'LS-011', animalType: 'Sheep', breed: 'Merino', memberName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', count: 180, healthStatus: 'healthy', location: 'Botswana', valueEstimate: 43200 },
  { id: 'LS-012', animalType: 'Cattle', breed: 'Bonsmara', memberName: 'Grace Moyo', farmName: 'Moyo Farm', count: 50, healthStatus: 'healthy', location: 'Zimbabwe', valueEstimate: 87500 },
];

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } } };

// ── Helpers ──────────────────────────────────────────────────────────────────

const healthColors: Record<string, string> = { healthy: 'bg-green-100 text-green-700', fair: 'bg-amber-100 text-amber-700', poor: 'bg-red-100 text-red-700', quarantined: 'bg-purple-100 text-purple-700' };
const healthLabels: Record<string, string> = { healthy: 'Healthy', fair: 'Fair', poor: 'Poor', quarantined: 'Quarantined' };

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

interface LivestockFormData {
  animalType: string; breed: string; memberName: string; farmName: string;
  count: string; healthStatus: LivestockRecord['healthStatus']; location: string; valueEstimate: string;
}

const emptyForm: LivestockFormData = { animalType: 'Cattle', breed: '', memberName: '', farmName: '', count: '', healthStatus: 'healthy', location: '', valueEstimate: '' };

// ═══════════════════════════════════════════════════════════════════════════════

export default function LivestockManagementPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [livestockRecords, setLivestockRecords] = useState<LivestockRecord[]>(fallback_livestockRecords);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LivestockFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('livestock').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLivestockRecords(data.map((row: Record<string, unknown>) => ({
          id: (row.id as string) || '', animalType: (row.animal_type as string) || 'Other',
          breed: (row.breed as string) || '', memberName: (row.member_name as string) || (row.farmer_name as string) || 'Unknown',
          farmName: (row.farm_name as string) || '', count: (row.count as number) || (row.head_count as number) || 1,
          healthStatus: ((row.health_status as string) || 'healthy') as LivestockRecord['healthStatus'],
          location: (row.location as string) || (row.country as string) || '', valueEstimate: (row.value_estimate as number) || 0,
        })));
      }
    } catch { /* fallback */ }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let result = [...livestockRecords];
    if (typeFilter !== 'all') result = result.filter((l) => l.animalType.toLowerCase() === typeFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => l.animalType.toLowerCase().includes(q) || l.breed.toLowerCase().includes(q) || l.memberName.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, typeFilter, livestockRecords]);

  const totalAnimals = livestockRecords.reduce((s, l) => s + l.count, 0);
  const healthyCount = livestockRecords.filter((l) => l.healthStatus === 'healthy').reduce((s, l) => s + l.count, 0);
  const healthyPct = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;
  const totalValue = livestockRecords.reduce((s, l) => s + l.valueEstimate, 0);
  const farmsWithLivestock = new Set(livestockRecords.map((l) => l.farmName)).size;

  const summaryCards = [
    { label: 'Total Animals', value: totalAnimals.toLocaleString(), icon: <Beef className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Healthy', value: `${healthyPct}%`, icon: <HeartPulse className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Est. Value', value: formatCurrency(totalValue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-blue-50' },
    { label: 'Farms w/ Livestock', value: farmsWithLivestock.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const tabs: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'cattle', label: 'Cattle' }, { key: 'poultry', label: 'Poultry' },
    { key: 'goats', label: 'Goats' }, { key: 'sheep', label: 'Sheep' }, { key: 'pigs', label: 'Pigs' },
  ];

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ls: LivestockRecord) => {
    setEditingId(ls.id);
    setForm({ animalType: ls.animalType, breed: ls.breed, memberName: ls.memberName, farmName: ls.farmName, count: ls.count.toString(), healthStatus: ls.healthStatus, location: ls.location, valueEstimate: ls.valueEstimate.toString() });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.animalType.trim() || !form.memberName.trim()) { setToast({ message: 'Animal type and member name are required', type: 'error' }); return; }
    setSaving(true);
    const payload = { animal_type: form.animalType.trim(), breed: form.breed.trim() || null, member_name: form.memberName.trim(), farm_name: form.farmName.trim() || null, count: parseInt(form.count) || 1, health_status: form.healthStatus, location: form.location.trim() || null, value_estimate: parseFloat(form.valueEstimate) || 0 };
    let error;
    if (editingId) { ({ error } = await supabase.from('livestock').update(payload).eq('id', editingId)); }
    else { ({ error } = await supabase.from('livestock').insert(payload)); }
    if (error) {
      if (editingId) { setLivestockRecords(prev => prev.map(l => l.id === editingId ? { ...l, animalType: form.animalType, breed: form.breed, memberName: form.memberName, farmName: form.farmName, count: parseInt(form.count) || 1, healthStatus: form.healthStatus, location: form.location, valueEstimate: parseFloat(form.valueEstimate) || 0 } : l)); }
      else { setLivestockRecords(prev => [{ id: `LS-${String(prev.length + 1).padStart(3, '0')}`, animalType: form.animalType, breed: form.breed, memberName: form.memberName, farmName: form.farmName, count: parseInt(form.count) || 1, healthStatus: form.healthStatus, location: form.location, valueEstimate: parseFloat(form.valueEstimate) || 0 }, ...prev]); }
      setToast({ message: `Record ${editingId ? 'updated' : 'added'} (local)`, type: 'success' });
    } else {
      setToast({ message: `Record ${editingId ? 'updated' : 'added'} successfully`, type: 'success' });
      await fetchData();
    }
    setModalOpen(false); setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from('livestock').delete().eq('id', id);
    if (error) { setLivestockRecords(prev => prev.filter(l => l.id !== id)); setToast({ message: 'Record removed (local)', type: 'success' }); }
    else { setToast({ message: 'Record deleted successfully', type: 'success' }); await fetchData(); }
    setDeleteConfirmId(null); setDeleting(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Livestock Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">All livestock across member farms</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} variants={cardVariants} whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>{card.icon}</div>
              <div><p className="text-2xl font-bold text-navy">{card.value}</p><p className="text-xs text-gray-500">{card.label}</p></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by type, breed, or member..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" />
          </div>
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setTypeFilter(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === tab.key ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{tab.label}</button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {livestockRecords.length} records</p>
      </motion.div>

      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Breed</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Member / Farm</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Count</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Health</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Value Est.</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((ls) => (
                <tr key={ls.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-navy">{ls.animalType}</td>
                  <td className="py-3 px-4 text-gray-500">{ls.breed}</td>
                  <td className="py-3 px-4"><p className="font-medium text-navy text-sm">{ls.memberName}</p><p className="text-xs text-gray-400">{ls.farmName}</p></td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{ls.count.toLocaleString()}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColors[ls.healthStatus]}`}>{healthLabels[ls.healthStatus]}</span></td>
                  <td className="py-3 px-4"><div className="flex items-center gap-1 text-gray-500 text-xs"><MapPin className="w-3 h-3" />{ls.location}</div></td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">{formatCurrency(ls.valueEstimate)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(ls)} className="p-1.5 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirmId(ls.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (<div className="py-16 text-center"><Beef className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">No livestock match your filters</p></div>)}
      </motion.div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy">{editingId ? 'Edit Record' : 'Add Record'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Animal Type *</label>
                  <select value={form.animalType} onChange={e => setForm({ ...form, animalType: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none bg-white">
                    <option value="Cattle">Cattle</option><option value="Poultry">Poultry</option><option value="Goats">Goats</option><option value="Sheep">Sheep</option><option value="Pigs">Pigs</option><option value="Other">Other</option>
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Breed</label><input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Member Name *</label><input value={form.memberName} onChange={e => setForm({ ...form, memberName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Farm Name</label><input value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Count</label><input type="number" value={form.count} onChange={e => setForm({ ...form, count: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Health Status</label>
                  <select value={form.healthStatus} onChange={e => setForm({ ...form, healthStatus: e.target.value as LivestockRecord['healthStatus'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none bg-white">
                    <option value="healthy">Healthy</option><option value="fair">Fair</option><option value="poor">Poor</option><option value="quarantined">Quarantined</option>
                  </select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Value Est. ($)</label><input type="number" value={form.valueEstimate} onChange={e => setForm({ ...form, valueEstimate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" placeholder="Zimbabwe" /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-teal hover:bg-teal/90 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-navy mb-2">Delete Livestock Record?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
