'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Wheat,
  Plus,
  Calendar,
  Droplets,
  Bug,
  Scissors,
  Layers,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Thermometer,
  CloudRain,
  Sprout,
  Leaf,
  TrendingUp,
  FileText,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FeatureGate from '@/components/ui/FeatureGate';
import { useMembershipTier } from '@/lib/membership-context';

// ── Types ────────────────────────────────────────────────────────────────────

interface CropPlan {
  id: string;
  crop_name: string;
  variety: string;
  plot_name: string;
  planting_date: string;
  expected_harvest: string;
  area_hectares: number;
  status: 'planned' | 'planted' | 'growing' | 'ready' | 'harvested';
  notes: string | null;
}

interface SoilRecord {
  id: string;
  plot_name: string;
  test_date: string;
  ph_level: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  organic_matter: number | null;
  recommendation: string | null;
}

interface IrrigationSchedule {
  id: string;
  plot_name: string;
  method: 'drip' | 'sprinkler' | 'flood' | 'furrow' | 'center_pivot';
  frequency: string;
  duration_minutes: number;
  water_source: string;
  last_irrigated: string | null;
  next_scheduled: string | null;
  active: boolean;
}

interface PestRecord {
  id: string;
  crop_name: string;
  pest_or_disease: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date_detected: string;
  treatment: string | null;
  treatment_date: string | null;
  resolved: boolean;
}

// ── Section tabs ─────────────────────────────────────────────────────────────

type SectionTab = 'planning' | 'soil' | 'irrigation' | 'pest' | 'harvest';

const SECTIONS: { key: SectionTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'planning', label: 'Crop Planning', icon: Calendar },
  { key: 'soil', label: 'Soil Management', icon: Layers },
  { key: 'irrigation', label: 'Irrigation', icon: Droplets },
  { key: 'pest', label: 'Pest & Disease', icon: Bug },
  { key: 'harvest', label: 'Harvest Planning', icon: Scissors },
];

const CROP_STATUSES = ['planned', 'planted', 'growing', 'ready', 'harvested'] as const;
const IRRIGATION_METHODS = ['drip', 'sprinkler', 'flood', 'furrow', 'center_pivot'] as const;
const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  planted: 'bg-emerald-100 text-emerald-700',
  growing: 'bg-green-100 text-green-700',
  ready: 'bg-amber-100 text-amber-700',
  harvested: 'bg-gray-100 text-gray-600',
};

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

// ── Main Page Component ──────────────────────────────────────────────────────

export default function AgriculturePage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { t } = useLanguage();
  const { membershipTier } = useMembershipTier();

  const [activeTab, setActiveTab] = useState<SectionTab>('planning');
  const [loading, setLoading] = useState(true);

  // Data states
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [irrigationSchedules, setIrrigationSchedules] = useState<IrrigationSchedule[]>([]);
  const [pestRecords, setPestRecords] = useState<PestRecord[]>([]);

  // Form states
  const [showCropForm, setShowCropForm] = useState(false);
  const [showSoilForm, setShowSoilForm] = useState(false);
  const [showIrrigationForm, setShowIrrigationForm] = useState(false);
  const [showPestForm, setShowPestForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Crop form fields
  const [cropForm, setCropForm] = useState({
    crop_name: '', variety: '', plot_name: '', planting_date: '',
    expected_harvest: '', area_hectares: '', status: 'planned' as CropPlan['status'], notes: '',
  });

  // Soil form fields
  const [soilForm, setSoilForm] = useState({
    plot_name: '', test_date: '', ph_level: '', nitrogen: '', phosphorus: '',
    potassium: '', organic_matter: '', recommendation: '',
  });

  // Irrigation form fields
  const [irrigationForm, setIrrigationForm] = useState({
    plot_name: '', method: 'drip' as IrrigationSchedule['method'],
    frequency: '', duration_minutes: '', water_source: '', next_scheduled: '',
  });

  // Pest form fields
  const [pestForm, setPestForm] = useState({
    crop_name: '', pest_or_disease: '', severity: 'low' as PestRecord['severity'],
    date_detected: '', treatment: '', resolved: false,
  });

  // ── Fetch data from farm_activities (agriculture type) ─────────────────

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch crop plans from farm_activities where category = 'crop_plan'
      const { data: plans } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'crop_plan')
        .order('created_at', { ascending: false });

      if (plans) {
        setCropPlans(plans.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          crop_name: (r.title as string) || '',
          variety: ((r.metadata as Record<string, unknown>)?.variety as string) || '',
          plot_name: ((r.metadata as Record<string, unknown>)?.plot_name as string) || '',
          planting_date: ((r.metadata as Record<string, unknown>)?.planting_date as string) || '',
          expected_harvest: ((r.metadata as Record<string, unknown>)?.expected_harvest as string) || '',
          area_hectares: ((r.metadata as Record<string, unknown>)?.area_hectares as number) || 0,
          status: ((r.metadata as Record<string, unknown>)?.status as CropPlan['status']) || 'planned',
          notes: (r.notes as string) || null,
        })));
      }

      // Fetch soil records
      const { data: soils } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'soil_test')
        .order('created_at', { ascending: false });

      if (soils) {
        setSoilRecords(soils.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          plot_name: (r.title as string) || '',
          test_date: ((r.metadata as Record<string, unknown>)?.test_date as string) || '',
          ph_level: ((r.metadata as Record<string, unknown>)?.ph_level as number) || null,
          nitrogen: ((r.metadata as Record<string, unknown>)?.nitrogen as number) || null,
          phosphorus: ((r.metadata as Record<string, unknown>)?.phosphorus as number) || null,
          potassium: ((r.metadata as Record<string, unknown>)?.potassium as number) || null,
          organic_matter: ((r.metadata as Record<string, unknown>)?.organic_matter as number) || null,
          recommendation: ((r.metadata as Record<string, unknown>)?.recommendation as string) || null,
        })));
      }

      // Fetch irrigation schedules
      const { data: irrig } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'irrigation')
        .order('created_at', { ascending: false });

      if (irrig) {
        setIrrigationSchedules(irrig.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          plot_name: (r.title as string) || '',
          method: ((r.metadata as Record<string, unknown>)?.method as IrrigationSchedule['method']) || 'drip',
          frequency: ((r.metadata as Record<string, unknown>)?.frequency as string) || '',
          duration_minutes: ((r.metadata as Record<string, unknown>)?.duration_minutes as number) || 0,
          water_source: ((r.metadata as Record<string, unknown>)?.water_source as string) || '',
          last_irrigated: ((r.metadata as Record<string, unknown>)?.last_irrigated as string) || null,
          next_scheduled: ((r.metadata as Record<string, unknown>)?.next_scheduled as string) || null,
          active: ((r.metadata as Record<string, unknown>)?.active as boolean) ?? true,
        })));
      }

      // Fetch pest records
      const { data: pests } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'pest_disease')
        .order('created_at', { ascending: false });

      if (pests) {
        setPestRecords(pests.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          crop_name: (r.title as string) || '',
          pest_or_disease: ((r.metadata as Record<string, unknown>)?.pest_or_disease as string) || '',
          severity: ((r.metadata as Record<string, unknown>)?.severity as PestRecord['severity']) || 'low',
          date_detected: ((r.metadata as Record<string, unknown>)?.date_detected as string) || '',
          treatment: ((r.metadata as Record<string, unknown>)?.treatment as string) || null,
          treatment_date: ((r.metadata as Record<string, unknown>)?.treatment_date as string) || null,
          resolved: ((r.metadata as Record<string, unknown>)?.resolved as boolean) ?? false,
        })));
      }
    } catch (err) {
      console.error('Error fetching agriculture data:', err);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Save handlers ──────────────────────────────────────────────────────

  const saveCropPlan = async () => {
    if (!user || !cropForm.crop_name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'crop_plan',
        title: cropForm.crop_name,
        notes: cropForm.notes || null,
        metadata: {
          variety: cropForm.variety,
          plot_name: cropForm.plot_name,
          planting_date: cropForm.planting_date,
          expected_harvest: cropForm.expected_harvest,
          area_hectares: parseFloat(cropForm.area_hectares) || 0,
          status: cropForm.status,
        },
      });
      setCropForm({ crop_name: '', variety: '', plot_name: '', planting_date: '', expected_harvest: '', area_hectares: '', status: 'planned', notes: '' });
      setShowCropForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving crop plan:', err);
    }
    setSaving(false);
  };

  const saveSoilRecord = async () => {
    if (!user || !soilForm.plot_name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'soil_test',
        title: soilForm.plot_name,
        metadata: {
          test_date: soilForm.test_date,
          ph_level: parseFloat(soilForm.ph_level) || null,
          nitrogen: parseFloat(soilForm.nitrogen) || null,
          phosphorus: parseFloat(soilForm.phosphorus) || null,
          potassium: parseFloat(soilForm.potassium) || null,
          organic_matter: parseFloat(soilForm.organic_matter) || null,
          recommendation: soilForm.recommendation || null,
        },
      });
      setSoilForm({ plot_name: '', test_date: '', ph_level: '', nitrogen: '', phosphorus: '', potassium: '', organic_matter: '', recommendation: '' });
      setShowSoilForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving soil record:', err);
    }
    setSaving(false);
  };

  const saveIrrigation = async () => {
    if (!user || !irrigationForm.plot_name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'irrigation',
        title: irrigationForm.plot_name,
        metadata: {
          method: irrigationForm.method,
          frequency: irrigationForm.frequency,
          duration_minutes: parseInt(irrigationForm.duration_minutes) || 0,
          water_source: irrigationForm.water_source,
          next_scheduled: irrigationForm.next_scheduled || null,
          active: true,
        },
      });
      setIrrigationForm({ plot_name: '', method: 'drip', frequency: '', duration_minutes: '', water_source: '', next_scheduled: '' });
      setShowIrrigationForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving irrigation schedule:', err);
    }
    setSaving(false);
  };

  const savePestRecord = async () => {
    if (!user || !pestForm.crop_name) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'pest_disease',
        title: pestForm.crop_name,
        metadata: {
          pest_or_disease: pestForm.pest_or_disease,
          severity: pestForm.severity,
          date_detected: pestForm.date_detected,
          treatment: pestForm.treatment || null,
          resolved: pestForm.resolved,
        },
      });
      setPestForm({ crop_name: '', pest_or_disease: '', severity: 'low', date_detected: '', treatment: '', resolved: false });
      setShowPestForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving pest record:', err);
    }
    setSaving(false);
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await supabase.from('farm_activities').delete().eq('id', id);
    fetchData();
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const totalPlots = new Set(cropPlans.map(c => c.plot_name).filter(Boolean)).size;
  const activeCrops = cropPlans.filter(c => ['planted', 'growing', 'ready'].includes(c.status)).length;
  const totalHectares = cropPlans.reduce((sum, c) => sum + (c.area_hectares || 0), 0);
  const activePests = pestRecords.filter(p => !p.resolved).length;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <FeatureGate feature="agriculture" tier={membershipTier}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5DB347]/10 rounded-2xl flex items-center justify-center">
              <Wheat className="w-6 h-6 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">Agriculture</h1>
              <p className="text-sm text-gray-500">Crop planning, soil, irrigation & pest management</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Active Plots', value: totalPlots, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Crops', value: activeCrops, icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Total Hectares', value: totalHectares.toFixed(1), icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Active Pests', value: activePests, icon: Bug, color: 'text-red-600', bg: 'bg-red-50' },
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
          </div>
        ) : (
          <>
            {/* ── Crop Planning Tab ── */}
            {activeTab === 'planning' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Crop Planning Calendar</h2>
                  <button onClick={() => setShowCropForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Crop Plan
                  </button>
                </div>

                {showCropForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Crop Plan</h3>
                      <button onClick={() => setShowCropForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Crop Name *" value={cropForm.crop_name} onChange={e => setCropForm({ ...cropForm, crop_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input placeholder="Variety" value={cropForm.variety} onChange={e => setCropForm({ ...cropForm, variety: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input placeholder="Plot Name" value={cropForm.plot_name} onChange={e => setCropForm({ ...cropForm, plot_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" step="0.1" placeholder="Area (hectares)" value={cropForm.area_hectares} onChange={e => setCropForm({ ...cropForm, area_hectares: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Planting Date</label>
                        <input type="date" value={cropForm.planting_date} onChange={e => setCropForm({ ...cropForm, planting_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Expected Harvest</label>
                        <input type="date" value={cropForm.expected_harvest} onChange={e => setCropForm({ ...cropForm, expected_harvest: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </div>
                      <select value={cropForm.status} onChange={e => setCropForm({ ...cropForm, status: e.target.value as CropPlan['status'] })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none">
                        {CROP_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <input placeholder="Notes" value={cropForm.notes} onChange={e => setCropForm({ ...cropForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    </div>
                    <button onClick={saveCropPlan} disabled={saving || !cropForm.crop_name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Crop Plan
                    </button>
                  </div>
                )}

                {cropPlans.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No crop plans yet</h3>
                    <p className="text-sm text-gray-500">Start planning your growing season by adding your first crop plan.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {cropPlans.map(plan => (
                      <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Sprout className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{plan.crop_name} {plan.variety && <span className="text-gray-400 font-normal">({plan.variety})</span>}</h4>
                            <p className="text-xs text-gray-500">{plan.plot_name} &bull; {plan.area_hectares} ha &bull; Plant: {plan.planting_date || 'TBD'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[plan.status] || 'bg-gray-100 text-gray-600'}`}>{plan.status}</span>
                          <button onClick={() => deleteRecord(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Soil Management Tab ── */}
            {activeTab === 'soil' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Soil Management</h2>
                  <button onClick={() => setShowSoilForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Soil Test
                  </button>
                </div>

                {showSoilForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Soil Test Result</h3>
                      <button onClick={() => setShowSoilForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <input placeholder="Plot Name *" value={soilForm.plot_name} onChange={e => setSoilForm({ ...soilForm, plot_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Test Date</label>
                        <input type="date" value={soilForm.test_date} onChange={e => setSoilForm({ ...soilForm, test_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </div>
                      <input type="number" step="0.1" placeholder="pH Level" value={soilForm.ph_level} onChange={e => setSoilForm({ ...soilForm, ph_level: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" placeholder="Nitrogen (mg/kg)" value={soilForm.nitrogen} onChange={e => setSoilForm({ ...soilForm, nitrogen: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" placeholder="Phosphorus (mg/kg)" value={soilForm.phosphorus} onChange={e => setSoilForm({ ...soilForm, phosphorus: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" placeholder="Potassium (mg/kg)" value={soilForm.potassium} onChange={e => setSoilForm({ ...soilForm, potassium: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" step="0.1" placeholder="Organic Matter (%)" value={soilForm.organic_matter} onChange={e => setSoilForm({ ...soilForm, organic_matter: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input placeholder="Recommendation" value={soilForm.recommendation} onChange={e => setSoilForm({ ...soilForm, recommendation: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                    </div>
                    <button onClick={saveSoilRecord} disabled={saving || !soilForm.plot_name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Soil Test
                    </button>
                  </div>
                )}

                {soilRecords.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No soil tests recorded</h3>
                    <p className="text-sm text-gray-500">Record soil test results to track soil health across your farm.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {soilRecords.map(rec => (
                      <div key={rec.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-[#1B2A4A]">{rec.plot_name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{rec.test_date}</span>
                            <button onClick={() => deleteRecord(rec.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            { label: 'pH', value: rec.ph_level, unit: '' },
                            { label: 'Nitrogen', value: rec.nitrogen, unit: 'mg/kg' },
                            { label: 'Phosphorus', value: rec.phosphorus, unit: 'mg/kg' },
                            { label: 'Potassium', value: rec.potassium, unit: 'mg/kg' },
                            { label: 'Organic Matter', value: rec.organic_matter, unit: '%' },
                          ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                              <p className="text-xs text-gray-500">{item.label}</p>
                              <p className="text-sm font-bold text-[#1B2A4A]">{item.value ?? '-'} {item.unit}</p>
                            </div>
                          ))}
                        </div>
                        {rec.recommendation && <p className="text-xs text-gray-600 mt-2 bg-amber-50 px-3 py-2 rounded-lg"><strong>Rec:</strong> {rec.recommendation}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Irrigation Tab ── */}
            {activeTab === 'irrigation' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Irrigation Scheduling</h2>
                  <button onClick={() => setShowIrrigationForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Schedule
                  </button>
                </div>

                {showIrrigationForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Irrigation Schedule</h3>
                      <button onClick={() => setShowIrrigationForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <input placeholder="Plot Name *" value={irrigationForm.plot_name} onChange={e => setIrrigationForm({ ...irrigationForm, plot_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <select value={irrigationForm.method} onChange={e => setIrrigationForm({ ...irrigationForm, method: e.target.value as IrrigationSchedule['method'] })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none">
                        {IRRIGATION_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <input placeholder="Frequency (e.g. Daily, Every 3 days)" value={irrigationForm.frequency} onChange={e => setIrrigationForm({ ...irrigationForm, frequency: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input type="number" placeholder="Duration (minutes)" value={irrigationForm.duration_minutes} onChange={e => setIrrigationForm({ ...irrigationForm, duration_minutes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input placeholder="Water Source" value={irrigationForm.water_source} onChange={e => setIrrigationForm({ ...irrigationForm, water_source: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Next Scheduled</label>
                        <input type="date" value={irrigationForm.next_scheduled} onChange={e => setIrrigationForm({ ...irrigationForm, next_scheduled: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </div>
                    </div>
                    <button onClick={saveIrrigation} disabled={saving || !irrigationForm.plot_name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Schedule
                    </button>
                  </div>
                )}

                {irrigationSchedules.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No irrigation schedules</h3>
                    <p className="text-sm text-gray-500">Set up irrigation scheduling for your plots.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {irrigationSchedules.map(sched => (
                      <div key={sched.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Droplets className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{sched.plot_name}</h4>
                            <p className="text-xs text-gray-500">{sched.method.replace('_', ' ')} &bull; {sched.frequency} &bull; {sched.duration_minutes} min &bull; Source: {sched.water_source || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {sched.next_scheduled && <span className="text-xs text-gray-500">Next: {sched.next_scheduled}</span>}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sched.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{sched.active ? 'Active' : 'Paused'}</span>
                          <button onClick={() => deleteRecord(sched.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Pest & Disease Tab ── */}
            {activeTab === 'pest' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Pest & Disease Management</h2>
                  <button onClick={() => setShowPestForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Report Issue
                  </button>
                </div>

                {showPestForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Report Pest or Disease</h3>
                      <button onClick={() => setShowPestForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Crop Name *" value={pestForm.crop_name} onChange={e => setPestForm({ ...pestForm, crop_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <input placeholder="Pest or Disease Name *" value={pestForm.pest_or_disease} onChange={e => setPestForm({ ...pestForm, pest_or_disease: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <select value={pestForm.severity} onChange={e => setPestForm({ ...pestForm, severity: e.target.value as PestRecord['severity'] })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none">
                        {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date Detected</label>
                        <input type="date" value={pestForm.date_detected} onChange={e => setPestForm({ ...pestForm, date_detected: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      </div>
                      <input placeholder="Treatment Applied" value={pestForm.treatment} onChange={e => setPestForm({ ...pestForm, treatment: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none" />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={pestForm.resolved} onChange={e => setPestForm({ ...pestForm, resolved: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                        Resolved
                      </label>
                    </div>
                    <button onClick={savePestRecord} disabled={saving || !pestForm.crop_name} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Record
                    </button>
                  </div>
                )}

                {pestRecords.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Bug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No pest or disease records</h3>
                    <p className="text-sm text-gray-500">Report pest and disease issues to keep track of crop health.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {pestRecords.map(rec => (
                      <div key={rec.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rec.resolved ? 'bg-green-50' : 'bg-red-50'}`}>
                            {rec.resolved ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{rec.pest_or_disease} <span className="text-gray-400 font-normal">on {rec.crop_name}</span></h4>
                            <p className="text-xs text-gray-500">Detected: {rec.date_detected} {rec.treatment && <>&bull; Treatment: {rec.treatment}</>}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${SEVERITY_COLORS[rec.severity]}`}>{rec.severity}</span>
                          <button onClick={() => deleteRecord(rec.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Harvest Planning Tab ── */}
            {activeTab === 'harvest' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#1B2A4A]">Harvest Planning</h2>
                <p className="text-sm text-gray-500">Upcoming harvests based on your crop plans.</p>

                {cropPlans.filter(c => c.expected_harvest && ['growing', 'ready', 'planted'].includes(c.status)).length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No upcoming harvests</h3>
                    <p className="text-sm text-gray-500">Add crop plans with expected harvest dates to see them here.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {cropPlans
                      .filter(c => c.expected_harvest && ['planted', 'growing', 'ready'].includes(c.status))
                      .sort((a, b) => a.expected_harvest.localeCompare(b.expected_harvest))
                      .map(plan => {
                        const daysUntil = Math.ceil((new Date(plan.expected_harvest).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysUntil <= 7 ? 'bg-amber-50' : 'bg-green-50'}`}>
                                <Scissors className={`w-5 h-5 ${daysUntil <= 7 ? 'text-amber-600' : 'text-green-600'}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#1B2A4A]">{plan.crop_name} {plan.variety && <span className="text-gray-400 font-normal">({plan.variety})</span>}</h4>
                                <p className="text-xs text-gray-500">{plan.plot_name} &bull; {plan.area_hectares} ha &bull; Harvest: {plan.expected_harvest}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-bold ${daysUntil <= 0 ? 'text-red-600' : daysUntil <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                                {daysUntil <= 0 ? 'Overdue' : `${daysUntil} days`}
                              </p>
                              <p className="text-xs text-gray-400">until harvest</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </FeatureGate>
  );
}
