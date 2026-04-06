'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TreePine,
  Plus,
  Loader2,
  X,
  Trash2,
  Calendar,
  Ruler,
  Award,
  Leaf,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  Package,
  Axe,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FeatureGate from '@/components/ui/FeatureGate';
import { useMembershipTier } from '@/lib/membership-context';

// ── Types ────────────────────────────────────────────────────────────────────

interface TreePlantation {
  id: string;
  species: string;
  plot_name: string;
  hectares: number;
  planting_date: string;
  expected_harvest_year: number | null;
  tree_count: number;
  spacing_meters: number | null;
  status: 'planned' | 'planted' | 'growing' | 'mature' | 'harvested';
  notes: string | null;
}

interface TimberInventory {
  id: string;
  species: string;
  plot_name: string;
  estimated_volume_m3: number;
  diameter_avg_cm: number | null;
  height_avg_m: number | null;
  grade: 'A' | 'B' | 'C' | 'D';
  last_measured: string;
  estimated_value: number | null;
}

interface HarvestSchedule {
  id: string;
  plot_name: string;
  species: string;
  planned_date: string;
  volume_m3: number;
  method: 'clear_cut' | 'selective' | 'thinning' | 'salvage';
  crew_size: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  buyer: string | null;
  price_per_m3: number | null;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending' | 'suspended';
  scope: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

type SectionTab = 'plantations' | 'timber' | 'harvesting' | 'certifications' | 'carbon';

const SECTIONS: { key: SectionTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'plantations', label: 'Plantations', icon: TreePine },
  { key: 'timber', label: 'Timber Inventory', icon: Package },
  { key: 'harvesting', label: 'Harvesting', icon: Axe },
  { key: 'certifications', label: 'Certifications', icon: Award },
  { key: 'carbon', label: 'Carbon Credits', icon: Leaf },
];

const PLANTATION_STATUSES = ['planned', 'planted', 'growing', 'mature', 'harvested'] as const;
const TIMBER_GRADES = ['A', 'B', 'C', 'D'] as const;
const HARVEST_METHODS = ['clear_cut', 'selective', 'thinning', 'salvage'] as const;
const HARVEST_STATUSES = ['scheduled', 'in_progress', 'completed', 'postponed'] as const;
const CERT_STATUSES = ['active', 'expired', 'pending', 'suspended'] as const;

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  planted: 'bg-emerald-100 text-emerald-700',
  growing: 'bg-green-100 text-green-700',
  mature: 'bg-amber-100 text-amber-700',
  harvested: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  postponed: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-orange-100 text-orange-700',
};

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-red-100 text-red-700',
};

const COMMON_SPECIES = [
  'Eucalyptus grandis', 'Pinus patula', 'Pinus elliottii', 'Acacia mearnsii',
  'Tectona grandis (Teak)', 'Grevillea robusta', 'Cupressus lusitanica',
  'Juniperus procera', 'Podocarpus', 'Khaya senegalensis (Mahogany)',
  'Prunus africana', 'Melia volkensii', 'Other',
];

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ForestryPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { t } = useLanguage();
  const { membershipTier } = useMembershipTier();

  const [activeTab, setActiveTab] = useState<SectionTab>('plantations');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [plantations, setPlantations] = useState<TreePlantation[]>([]);
  const [timberInventory, setTimberInventory] = useState<TimberInventory[]>([]);
  const [harvestSchedules, setHarvestSchedules] = useState<HarvestSchedule[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // Forms
  const [showPlantationForm, setShowPlantationForm] = useState(false);
  const [showTimberForm, setShowTimberForm] = useState(false);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);

  const [plantationForm, setPlantationForm] = useState({
    species: '', plot_name: '', hectares: '', planting_date: '',
    expected_harvest_year: '', tree_count: '', spacing_meters: '',
    status: 'planned' as TreePlantation['status'], notes: '',
  });

  const [timberForm, setTimberForm] = useState({
    species: '', plot_name: '', estimated_volume_m3: '', diameter_avg_cm: '',
    height_avg_m: '', grade: 'B' as TimberInventory['grade'],
    last_measured: '', estimated_value: '',
  });

  const [harvestForm, setHarvestForm] = useState({
    plot_name: '', species: '', planned_date: '', volume_m3: '',
    method: 'selective' as HarvestSchedule['method'], crew_size: '',
    status: 'scheduled' as HarvestSchedule['status'], buyer: '', price_per_m3: '',
  });

  const [certForm, setCertForm] = useState({
    name: '', issuer: '', certificate_number: '', issue_date: '',
    expiry_date: '', status: 'active' as Certification['status'], scope: '',
  });

  // ── Fetch data ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Plantations stored in farm_plots with type='forestry'
      const { data: plots } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'forestry_plantation')
        .order('created_at', { ascending: false });

      if (plots) {
        setPlantations(plots.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            species: (r.title as string) || '',
            plot_name: (meta.plot_name as string) || '',
            hectares: (meta.hectares as number) || 0,
            planting_date: (meta.planting_date as string) || '',
            expected_harvest_year: (meta.expected_harvest_year as number) || null,
            tree_count: (meta.tree_count as number) || 0,
            spacing_meters: (meta.spacing_meters as number) || null,
            status: (meta.status as TreePlantation['status']) || 'planned',
            notes: (r.notes as string) || null,
          };
        }));
      }

      // Timber inventory
      const { data: timber } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'forestry_timber')
        .order('created_at', { ascending: false });

      if (timber) {
        setTimberInventory(timber.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            species: (r.title as string) || '',
            plot_name: (meta.plot_name as string) || '',
            estimated_volume_m3: (meta.estimated_volume_m3 as number) || 0,
            diameter_avg_cm: (meta.diameter_avg_cm as number) || null,
            height_avg_m: (meta.height_avg_m as number) || null,
            grade: (meta.grade as TimberInventory['grade']) || 'B',
            last_measured: (meta.last_measured as string) || '',
            estimated_value: (meta.estimated_value as number) || null,
          };
        }));
      }

      // Harvest schedules
      const { data: harvests } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'forestry_harvest')
        .order('created_at', { ascending: false });

      if (harvests) {
        setHarvestSchedules(harvests.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            plot_name: (r.title as string) || '',
            species: (meta.species as string) || '',
            planned_date: (meta.planned_date as string) || '',
            volume_m3: (meta.volume_m3 as number) || 0,
            method: (meta.method as HarvestSchedule['method']) || 'selective',
            crew_size: (meta.crew_size as number) || 0,
            status: (meta.status as HarvestSchedule['status']) || 'scheduled',
            buyer: (meta.buyer as string) || null,
            price_per_m3: (meta.price_per_m3 as number) || null,
          };
        }));
      }

      // Certifications
      const { data: certs } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'forestry_cert')
        .order('created_at', { ascending: false });

      if (certs) {
        setCertifications(certs.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            name: (r.title as string) || '',
            issuer: (meta.issuer as string) || '',
            certificate_number: (meta.certificate_number as string) || '',
            issue_date: (meta.issue_date as string) || '',
            expiry_date: (meta.expiry_date as string) || '',
            status: (meta.status as Certification['status']) || 'active',
            scope: (meta.scope as string) || '',
          };
        }));
      }
    } catch (err) {
      console.error('Error fetching forestry data:', err);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Save handlers ──────────────────────────────────────────────────────

  const savePlantation = async () => {
    if (!user || !plantationForm.species) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'forestry_plantation',
        title: plantationForm.species,
        notes: plantationForm.notes || null,
        metadata: {
          plot_name: plantationForm.plot_name,
          hectares: parseFloat(plantationForm.hectares) || 0,
          planting_date: plantationForm.planting_date,
          expected_harvest_year: parseInt(plantationForm.expected_harvest_year) || null,
          tree_count: parseInt(plantationForm.tree_count) || 0,
          spacing_meters: parseFloat(plantationForm.spacing_meters) || null,
          status: plantationForm.status,
        },
      });
      setPlantationForm({ species: '', plot_name: '', hectares: '', planting_date: '', expected_harvest_year: '', tree_count: '', spacing_meters: '', status: 'planned', notes: '' });
      setShowPlantationForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving plantation:', err);
    }
    setSaving(false);
  };

  const saveTimber = async () => {
    if (!user || !timberForm.species) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'forestry_timber',
        title: timberForm.species,
        metadata: {
          plot_name: timberForm.plot_name,
          estimated_volume_m3: parseFloat(timberForm.estimated_volume_m3) || 0,
          diameter_avg_cm: parseFloat(timberForm.diameter_avg_cm) || null,
          height_avg_m: parseFloat(timberForm.height_avg_m) || null,
          grade: timberForm.grade,
          last_measured: timberForm.last_measured,
          estimated_value: parseFloat(timberForm.estimated_value) || null,
        },
      });
      setTimberForm({ species: '', plot_name: '', estimated_volume_m3: '', diameter_avg_cm: '', height_avg_m: '', grade: 'B', last_measured: '', estimated_value: '' });
      setShowTimberForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving timber:', err);
    }
    setSaving(false);
  };

  const saveHarvest = async () => {
    if (!user || !harvestForm.plot_name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'forestry_harvest',
        title: harvestForm.plot_name,
        metadata: {
          species: harvestForm.species,
          planned_date: harvestForm.planned_date,
          volume_m3: parseFloat(harvestForm.volume_m3) || 0,
          method: harvestForm.method,
          crew_size: parseInt(harvestForm.crew_size) || 0,
          status: harvestForm.status,
          buyer: harvestForm.buyer || null,
          price_per_m3: parseFloat(harvestForm.price_per_m3) || null,
        },
      });
      setHarvestForm({ plot_name: '', species: '', planned_date: '', volume_m3: '', method: 'selective', crew_size: '', status: 'scheduled', buyer: '', price_per_m3: '' });
      setShowHarvestForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving harvest:', err);
    }
    setSaving(false);
  };

  const saveCert = async () => {
    if (!user || !certForm.name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'forestry_cert',
        title: certForm.name,
        metadata: {
          issuer: certForm.issuer,
          certificate_number: certForm.certificate_number,
          issue_date: certForm.issue_date,
          expiry_date: certForm.expiry_date,
          status: certForm.status,
          scope: certForm.scope,
        },
      });
      setCertForm({ name: '', issuer: '', certificate_number: '', issue_date: '', expiry_date: '', status: 'active', scope: '' });
      setShowCertForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving certification:', err);
    }
    setSaving(false);
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await supabase.from('farm_activities').delete().eq('id', id);
    fetchData();
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const totalHectares = plantations.reduce((s, p) => s + (p.hectares || 0), 0);
  const totalTrees = plantations.reduce((s, p) => s + (p.tree_count || 0), 0);
  const totalTimberVolume = timberInventory.reduce((s, t) => s + (t.estimated_volume_m3 || 0), 0);
  const activeCerts = certifications.filter(c => c.status === 'active').length;

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <FeatureGate feature="forestry" tier={membershipTier}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5DB347]/10 rounded-2xl flex items-center justify-center">
              <TreePine className="w-6 h-6 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">Forestry</h1>
              <p className="text-sm text-gray-500">Plantation management, timber & sustainability</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Hectares', value: totalHectares.toFixed(1), icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Trees Planted', value: totalTrees.toLocaleString(), icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Timber Volume', value: `${totalTimberVolume.toFixed(0)} m\u00B3`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Certs', value: activeCerts, icon: Award, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === key
                  ? 'bg-[#5DB347] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : (
          <>
            {/* ── Plantations Tab ── */}
            {activeTab === 'plantations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Tree Plantations</h2>
                  <button onClick={() => setShowPlantationForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Plantation
                  </button>
                </div>

                {showPlantationForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Plantation</h3>
                      <button onClick={() => setShowPlantationForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={plantationForm.species} onChange={e => setPlantationForm({ ...plantationForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species *</option>
                        {COMMON_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="Plot / Block Name" value={plantationForm.plot_name} onChange={e => setPlantationForm({ ...plantationForm, plot_name: e.target.value })} className={inputCls} />
                      <input type="number" step="0.1" placeholder="Hectares" value={plantationForm.hectares} onChange={e => setPlantationForm({ ...plantationForm, hectares: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Planting Date</label>
                        <input type="date" value={plantationForm.planting_date} onChange={e => setPlantationForm({ ...plantationForm, planting_date: e.target.value })} className={inputCls} />
                      </div>
                      <input type="number" placeholder="Expected Harvest Year" value={plantationForm.expected_harvest_year} onChange={e => setPlantationForm({ ...plantationForm, expected_harvest_year: e.target.value })} className={inputCls} />
                      <input type="number" placeholder="Number of Trees" value={plantationForm.tree_count} onChange={e => setPlantationForm({ ...plantationForm, tree_count: e.target.value })} className={inputCls} />
                      <input type="number" step="0.5" placeholder="Spacing (meters)" value={plantationForm.spacing_meters} onChange={e => setPlantationForm({ ...plantationForm, spacing_meters: e.target.value })} className={inputCls} />
                      <select value={plantationForm.status} onChange={e => setPlantationForm({ ...plantationForm, status: e.target.value as TreePlantation['status'] })} className={inputCls}>
                        {PLANTATION_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <input placeholder="Notes" value={plantationForm.notes} onChange={e => setPlantationForm({ ...plantationForm, notes: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={savePlantation} disabled={saving || !plantationForm.species} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Plantation
                    </button>
                  </div>
                )}

                {plantations.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <TreePine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No plantations yet</h3>
                    <p className="text-sm text-gray-500">Start tracking your tree plantations and forestry blocks.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {plantations.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TreePine className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{p.species}</h4>
                            <p className="text-xs text-gray-500">
                              {p.plot_name} &bull; {p.hectares} ha &bull; {p.tree_count.toLocaleString()} trees
                              {p.expected_harvest_year && <> &bull; Harvest: {p.expected_harvest_year}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                          <button onClick={() => deleteRecord(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Timber Inventory Tab ── */}
            {activeTab === 'timber' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Timber Inventory</h2>
                  <button onClick={() => setShowTimberForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Measurement
                  </button>
                </div>

                {showTimberForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Timber Measurement</h3>
                      <button onClick={() => setShowTimberForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <select value={timberForm.species} onChange={e => setTimberForm({ ...timberForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species *</option>
                        {COMMON_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="Plot Name" value={timberForm.plot_name} onChange={e => setTimberForm({ ...timberForm, plot_name: e.target.value })} className={inputCls} />
                      <input type="number" step="0.1" placeholder="Volume (m3)" value={timberForm.estimated_volume_m3} onChange={e => setTimberForm({ ...timberForm, estimated_volume_m3: e.target.value })} className={inputCls} />
                      <input type="number" step="0.1" placeholder="Avg Diameter (cm)" value={timberForm.diameter_avg_cm} onChange={e => setTimberForm({ ...timberForm, diameter_avg_cm: e.target.value })} className={inputCls} />
                      <input type="number" step="0.1" placeholder="Avg Height (m)" value={timberForm.height_avg_m} onChange={e => setTimberForm({ ...timberForm, height_avg_m: e.target.value })} className={inputCls} />
                      <select value={timberForm.grade} onChange={e => setTimberForm({ ...timberForm, grade: e.target.value as TimberInventory['grade'] })} className={inputCls}>
                        {TIMBER_GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date Measured</label>
                        <input type="date" value={timberForm.last_measured} onChange={e => setTimberForm({ ...timberForm, last_measured: e.target.value })} className={inputCls} />
                      </div>
                      <input type="number" placeholder="Estimated Value (USD)" value={timberForm.estimated_value} onChange={e => setTimberForm({ ...timberForm, estimated_value: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={saveTimber} disabled={saving || !timberForm.species} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Measurement
                    </button>
                  </div>
                )}

                {timberInventory.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No timber inventory</h3>
                    <p className="text-sm text-gray-500">Record timber measurements to track your forestry assets.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {timberInventory.map(t => (
                      <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-[#1B2A4A]">{t.species} <span className="text-gray-400 font-normal">- {t.plot_name}</span></h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${GRADE_COLORS[t.grade]}`}>Grade {t.grade}</span>
                            <button onClick={() => deleteRecord(t.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                            <p className="text-xs text-gray-500">Volume</p>
                            <p className="text-sm font-bold text-[#1B2A4A]">{t.estimated_volume_m3} m&sup3;</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                            <p className="text-xs text-gray-500">Diameter</p>
                            <p className="text-sm font-bold text-[#1B2A4A]">{t.diameter_avg_cm ?? '-'} cm</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                            <p className="text-xs text-gray-500">Height</p>
                            <p className="text-sm font-bold text-[#1B2A4A]">{t.height_avg_m ?? '-'} m</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                            <p className="text-xs text-gray-500">Value</p>
                            <p className="text-sm font-bold text-[#1B2A4A]">{t.estimated_value ? `$${t.estimated_value.toLocaleString()}` : '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Harvesting Tab ── */}
            {activeTab === 'harvesting' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Harvesting Schedule</h2>
                  <button onClick={() => setShowHarvestForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Schedule Harvest
                  </button>
                </div>

                {showHarvestForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Schedule Harvest</h3>
                      <button onClick={() => setShowHarvestForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input placeholder="Plot / Block Name *" value={harvestForm.plot_name} onChange={e => setHarvestForm({ ...harvestForm, plot_name: e.target.value })} className={inputCls} />
                      <select value={harvestForm.species} onChange={e => setHarvestForm({ ...harvestForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species</option>
                        {COMMON_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Planned Date</label>
                        <input type="date" value={harvestForm.planned_date} onChange={e => setHarvestForm({ ...harvestForm, planned_date: e.target.value })} className={inputCls} />
                      </div>
                      <input type="number" step="0.1" placeholder="Volume (m3)" value={harvestForm.volume_m3} onChange={e => setHarvestForm({ ...harvestForm, volume_m3: e.target.value })} className={inputCls} />
                      <select value={harvestForm.method} onChange={e => setHarvestForm({ ...harvestForm, method: e.target.value as HarvestSchedule['method'] })} className={inputCls}>
                        {HARVEST_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <input type="number" placeholder="Crew Size" value={harvestForm.crew_size} onChange={e => setHarvestForm({ ...harvestForm, crew_size: e.target.value })} className={inputCls} />
                      <input placeholder="Buyer" value={harvestForm.buyer} onChange={e => setHarvestForm({ ...harvestForm, buyer: e.target.value })} className={inputCls} />
                      <input type="number" step="0.01" placeholder="Price per m3 (USD)" value={harvestForm.price_per_m3} onChange={e => setHarvestForm({ ...harvestForm, price_per_m3: e.target.value })} className={inputCls} />
                      <select value={harvestForm.status} onChange={e => setHarvestForm({ ...harvestForm, status: e.target.value as HarvestSchedule['status'] })} className={inputCls}>
                        {HARVEST_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                    </div>
                    <button onClick={saveHarvest} disabled={saving || !harvestForm.plot_name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Schedule
                    </button>
                  </div>
                )}

                {harvestSchedules.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Axe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No harvests scheduled</h3>
                    <p className="text-sm text-gray-500">Plan and schedule your timber harvesting operations.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {harvestSchedules.map(h => (
                      <div key={h.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Axe className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{h.plot_name} {h.species && <span className="text-gray-400 font-normal">({h.species})</span>}</h4>
                            <p className="text-xs text-gray-500">
                              {h.planned_date} &bull; {h.volume_m3} m&sup3; &bull; {h.method.replace('_', ' ')} &bull; Crew: {h.crew_size}
                              {h.buyer && <> &bull; Buyer: {h.buyer}</>}
                              {h.price_per_m3 && <> &bull; ${h.price_per_m3}/m&sup3;</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[h.status]}`}>{h.status.replace('_', ' ')}</span>
                          <button onClick={() => deleteRecord(h.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Certifications Tab ── */}
            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Sustainability Certifications</h2>
                  <button onClick={() => setShowCertForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Certification
                  </button>
                </div>

                {showCertForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Add Certification</h3>
                      <button onClick={() => setShowCertForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input placeholder="Certification Name *" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} className={inputCls} />
                      <input placeholder="Issuer (e.g. FSC, PEFC)" value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} className={inputCls} />
                      <input placeholder="Certificate Number" value={certForm.certificate_number} onChange={e => setCertForm({ ...certForm, certificate_number: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
                        <input type="date" value={certForm.issue_date} onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                        <input type="date" value={certForm.expiry_date} onChange={e => setCertForm({ ...certForm, expiry_date: e.target.value })} className={inputCls} />
                      </div>
                      <select value={certForm.status} onChange={e => setCertForm({ ...certForm, status: e.target.value as Certification['status'] })} className={inputCls}>
                        {CERT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <input placeholder="Scope / Coverage" value={certForm.scope} onChange={e => setCertForm({ ...certForm, scope: e.target.value })} className={`${inputCls} md:col-span-2`} />
                    </div>
                    <button onClick={saveCert} disabled={saving || !certForm.name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Certification
                    </button>
                  </div>
                )}

                {certifications.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No certifications</h3>
                    <p className="text-sm text-gray-500">Track your FSC, PEFC, and other sustainability certifications.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {certifications.map(cert => (
                      <div key={cert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cert.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <Award className={`w-5 h-5 ${cert.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{cert.name}</h4>
                            <p className="text-xs text-gray-500">
                              {cert.issuer} &bull; #{cert.certificate_number} &bull; Expires: {cert.expiry_date}
                              {cert.scope && <> &bull; {cert.scope}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[cert.status]}`}>{cert.status}</span>
                          <button onClick={() => deleteRecord(cert.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Carbon Credits Tab ── */}
            {activeTab === 'carbon' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1B2A4A]">Carbon Credits</h2>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#5DB347]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-6 h-6 text-[#5DB347]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1B2A4A] mb-2">Forestry Carbon Offset Programme</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Your tree plantations sequester carbon dioxide. Based on your current plantation data
                        ({totalHectares.toFixed(1)} hectares, {totalTrees.toLocaleString()} trees), you may be eligible
                        to generate verified carbon credits. Visit the Carbon Credits hub to register your forestry
                        projects and start earning.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500">Est. Annual Sequestration</p>
                          <p className="text-lg font-bold text-green-700">{(totalHectares * 8.5).toFixed(0)} tCO2e</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500">Potential Credit Value</p>
                          <p className="text-lg font-bold text-blue-700">${(totalHectares * 8.5 * 12).toFixed(0)}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-gray-500">Certification Required</p>
                          <p className="text-lg font-bold text-amber-700">{activeCerts > 0 ? 'Eligible' : 'Needed'}</p>
                        </div>
                      </div>
                      <Link
                        href="/farm/sustainability/credits"
                        className="inline-flex items-center gap-2 bg-[#5DB347] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors"
                      >
                        Go to Carbon Credits Hub <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </FeatureGate>
  );
}
