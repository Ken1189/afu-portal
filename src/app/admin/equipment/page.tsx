'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Search, Wrench, DollarSign, CheckCircle2, Clock, AlertTriangle, MapPin,
  Plus, Pencil, Trash2, X, Loader2, AlertCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// ── Types ────────────────────────────────────────────────────────────────────

interface EquipmentRecord {
  id: string; name: string; type: string; ownerName: string; farmName: string;
  status: 'available' | 'in-use' | 'maintenance'; dailyRate: number; location: string;
}

type StatusFilter = 'all' | 'available' | 'in-use' | 'maintenance';

const fallback_equipment: EquipmentRecord[] = [
  { id: 'EQ-001', name: 'John Deere 5055E', type: 'Tractor', ownerName: 'Grace Moyo', farmName: 'Moyo Farm', status: 'available', dailyRate: 120, location: 'Zimbabwe' },
  { id: 'EQ-002', name: 'Kubota L3901', type: 'Tractor', ownerName: 'Baraka Mushi', farmName: 'Mushi Agri', status: 'in-use', dailyRate: 95, location: 'Tanzania' },
  { id: 'EQ-003', name: 'Netafim Drip System', type: 'Irrigation', ownerName: 'Tendai Chirwa', farmName: 'Chirwa Orchards', status: 'available', dailyRate: 45, location: 'Zimbabwe' },
  { id: 'EQ-004', name: 'Massey Ferguson Combine', type: 'Harvester', ownerName: 'John Maseko', farmName: 'Maseko Fields', status: 'maintenance', dailyRate: 280, location: 'Zimbabwe' },
  { id: 'EQ-005', name: 'DJI Agras T30', type: 'Drone', ownerName: 'Farai Ndlovu', farmName: 'Ndlovu Estate', status: 'available', dailyRate: 65, location: 'Zimbabwe' },
  { id: 'EQ-006', name: 'Amazone ZA-TS', type: 'Spreader', ownerName: 'Kago Setshedi', farmName: 'Setshedi Farms', status: 'in-use', dailyRate: 55, location: 'Botswana' },
  { id: 'EQ-007', name: 'Isuzu NPR Truck', type: 'Transport', ownerName: 'Halima Mwanga', farmName: 'Mwanga Farm', status: 'available', dailyRate: 150, location: 'Tanzania' },
  { id: 'EQ-008', name: 'Honda WB30 Pump', type: 'Irrigation', ownerName: 'Amina Salim', farmName: 'Salim Holdings', status: 'in-use', dailyRate: 25, location: 'Tanzania' },
  { id: 'EQ-009', name: 'New Holland TC5.30', type: 'Harvester', ownerName: 'Grace Moyo', farmName: 'Moyo Farm', status: 'available', dailyRate: 250, location: 'Zimbabwe' },
  { id: 'EQ-010', name: 'Stihl MS 261', type: 'Chainsaw', ownerName: 'Nyasha Mutasa', farmName: 'Mutasa Growers', status: 'maintenance', dailyRate: 18, location: 'Zimbabwe' },
  { id: 'EQ-011', name: 'Toyota Hilux 4x4', type: 'Transport', ownerName: 'Tinashe Gumbo', farmName: 'Gumbo Orchards', status: 'in-use', dailyRate: 85, location: 'Botswana' },
  { id: 'EQ-012', name: 'Jacto Uniport', type: 'Sprayer', ownerName: 'Rumbidzai Chikore', farmName: 'Chikore Ag', status: 'available', dailyRate: 70, location: 'Zimbabwe' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } } };

const statusColors: Record<string, string> = { available: 'bg-green-100 text-green-700', 'in-use': 'bg-blue-100 text-blue-700', maintenance: 'bg-amber-100 text-amber-700' };
const statusLabels: Record<string, string> = { available: 'Available', 'in-use': 'In Use', maintenance: 'Maintenance' };
const statusIcons: Record<string, React.ReactNode> = { available: <CheckCircle2 className="w-3 h-3" />, 'in-use': <Clock className="w-3 h-3" />, maintenance: <AlertTriangle className="w-3 h-3" /> };

function formatCurrency(value: number): string { if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`; if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`; return `$${value.toLocaleString()}`; }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (<div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}{message}</div>);
}

interface EquipFormData { name: string; type: string; ownerName: string; farmName: string; status: EquipmentRecord['status']; dailyRate: string; location: string; }
const emptyForm: EquipFormData = { name: '', type: 'Tractor', ownerName: '', farmName: '', status: 'available', dailyRate: '', location: '' };

export default function EquipmentRegistryPage() {
  const { locale: _locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [equipment, setEquipment] = useState<EquipmentRecord[]>(fallback_equipment);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setEquipment(data.map((row: Record<string, unknown>) => {
          const desc = (row.description as string) || '';
          const ownerMatch = desc.match(/Owner:\s*([^|]+)/);
          const farmMatch = desc.match(/Farm:\s*(.+)/);
          return {
            id: (row.id as string) || '', name: (row.name as string) || 'Unknown',
            type: (row.type as string) || 'Other',
            ownerName: ownerMatch ? ownerMatch[1].trim() : 'Unknown', farmName: farmMatch ? farmMatch[1].trim() : '',
            status: ((row.status as string) || 'available') as EquipmentRecord['status'],
            dailyRate: (row.daily_rate as number) || 0, location: (row.location as string) || (row.country as string) || '',
          };
        }));
      }
    } catch { /* fallback */ }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let result = [...equipment];
    if (statusFilter !== 'all') result = result.filter((e) => e.status === statusFilter);
    if (searchQuery) { const q = searchQuery.toLowerCase(); result = result.filter((e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.ownerName.toLowerCase().includes(q)); }
    return result;
  }, [searchQuery, statusFilter, equipment]);

  const totalEquipment = equipment.length;
  const availableNow = equipment.filter((e) => e.status === 'available').length;
  const activeBookings = equipment.filter((e) => e.status === 'in-use').length;
  const rentalRevenue = equipment.filter((e) => e.status === 'in-use').reduce((s, e) => s + e.dailyRate * 30, 0);

  const summaryCards = [
    { label: 'Total Equipment', value: totalEquipment.toString(), icon: <Wrench className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal/10' },
    { label: 'Available Now', value: availableNow.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Bookings', value: activeBookings.toString(), icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Monthly Rental Rev.', value: formatCurrency(rentalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-navy', bg: 'bg-navy/10' },
  ];

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'available', label: 'Available' }, { key: 'in-use', label: 'In Use' }, { key: 'maintenance', label: 'Maintenance' },
  ];

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (eq: EquipmentRecord) => {
    setEditingId(eq.id);
    setForm({ name: eq.name, type: eq.type, ownerName: eq.ownerName, farmName: eq.farmName, status: eq.status, dailyRate: eq.dailyRate.toString(), location: eq.location });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.ownerName.trim()) { setToast({ message: 'Equipment name and owner are required', type: 'error' }); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), type: form.type.trim(), status: form.status, daily_rate: parseFloat(form.dailyRate) || 0, location: form.location.trim() || null, description: form.ownerName.trim() ? `Owner: ${form.ownerName.trim()}` + (form.farmName.trim() ? ` | Farm: ${form.farmName.trim()}` : '') : null };
    let error;
    if (editingId) { ({ error } = await supabase.from('equipment').update(payload).eq('id', editingId)); }
    else { ({ error } = await supabase.from('equipment').insert(payload)); }
    if (error) {
      if (editingId) { setEquipment(prev => prev.map(e => e.id === editingId ? { ...e, name: form.name, type: form.type, ownerName: form.ownerName, farmName: form.farmName, status: form.status, dailyRate: parseFloat(form.dailyRate) || 0, location: form.location } : e)); }
      else { setEquipment(prev => [{ id: `EQ-${String(prev.length + 1).padStart(3, '0')}`, name: form.name, type: form.type, ownerName: form.ownerName, farmName: form.farmName, status: form.status, dailyRate: parseFloat(form.dailyRate) || 0, location: form.location }, ...prev]); }
      setToast({ message: `Equipment ${editingId ? 'updated' : 'added'} (local)`, type: 'success' });
    } else { setToast({ message: `Equipment ${editingId ? 'updated' : 'added'} successfully`, type: 'success' }); await fetchData(); }
    setModalOpen(false); setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) { setEquipment(prev => prev.filter(e => e.id !== id)); setToast({ message: 'Equipment removed (local)', type: 'success' }); }
    else { setToast({ message: 'Equipment deleted successfully', type: 'success' }); await fetchData(); }
    setDeleteConfirmId(null); setDeleting(false);
  };

  const cycleStatus = async (eq: EquipmentRecord) => {
    const order: EquipmentRecord['status'][] = ['available', 'in-use', 'maintenance'];
    const next = order[(order.indexOf(eq.status) + 1) % order.length];
    setTogglingId(eq.id);
    const { error } = await supabase.from('equipment').update({ status: next }).eq('id', eq.id);
    if (error) { setEquipment(prev => prev.map(e => e.id === eq.id ? { ...e, status: next } : e)); }
    else { await fetchData(); }
    setToast({ message: `Status changed to ${statusLabels[next]}`, type: 'success' });
    setTogglingId(null);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-navy">Equipment Registry</h1><p className="text-sm text-gray-500 mt-0.5">All equipment available for sharing across member farms</p></div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors shadow-sm"><Plus className="w-4 h-4" /> Add Equipment</button>
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div key={i} variants={cardVariants} whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }} className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>{card.icon}</div><div><p className="text-2xl font-bold text-navy">{card.value}</p><p className="text-xs text-gray-500">{card.label}</p></div></div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search by name, type, or owner..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/50" /></div>
          <div className="flex flex-wrap gap-1">{tabs.map((tab) => (<button key={tab.key} onClick={() => setStatusFilter(tab.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === tab.key ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{tab.label}</button>))}</div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Showing {filtered.length} of {totalEquipment} items</p>
      </motion.div>

      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-cream/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Equipment</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Owner / Farm</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Daily Rate</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((eq) => (
                <tr key={eq.id} className="hover:bg-cream/50 transition-colors">
                  <td className="py-3 px-4"><div className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5 text-teal flex-shrink-0" /><span className="font-medium text-navy">{eq.name}</span></div></td>
                  <td className="py-3 px-4 text-gray-500">{eq.type}</td>
                  <td className="py-3 px-4"><p className="font-medium text-navy text-sm">{eq.ownerName}</p><p className="text-xs text-gray-400">{eq.farmName}</p></td>
                  <td className="py-3 px-4">
                    <button onClick={() => cycleStatus(eq)} disabled={togglingId === eq.id} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 ${statusColors[eq.status]}`} title="Click to cycle status">
                      {togglingId === eq.id ? <Loader2 className="w-3 h-3 animate-spin" /> : statusIcons[eq.status]}{statusLabels[eq.status]}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-medium text-navy">${eq.dailyRate}/day</td>
                  <td className="py-3 px-4"><div className="flex items-center gap-1 text-gray-500 text-xs"><MapPin className="w-3 h-3" />{eq.location}</div></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(eq)} className="p-2 rounded-lg text-gray-400 hover:text-navy hover:bg-gray-100 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirmId(eq.id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (<div className="py-16 text-center"><Wrench className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-sm text-gray-500">No equipment matches your filters</p></div>)}
      </motion.div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100"><h3 className="text-lg font-semibold text-navy">{editingId ? 'Edit Equipment' : 'Add Equipment'}</h3><button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" placeholder="John Deere 5055E" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Type</label><input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" placeholder="Tractor" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Owner *</label><input value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Farm</label><input value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as EquipmentRecord['status'] })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none bg-white"><option value="available">Available</option><option value="in-use">In Use</option><option value="maintenance">Maintenance</option></select></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Daily Rate ($)</label><input type="number" value={form.dailyRate} onChange={e => setForm({ ...form, dailyRate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" /></div>
                <div><label className="block text-xs font-semibold text-gray-600 mb-1">Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 outline-none" placeholder="Zimbabwe" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white bg-teal hover:bg-teal/90 disabled:opacity-50 transition-colors">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingId ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-xl max-w-sm w-full shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-navy mb-2">Delete Equipment?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
