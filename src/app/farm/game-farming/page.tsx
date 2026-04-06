'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Rabbit,
  Plus,
  Loader2,
  X,
  Trash2,
  Heart,
  Activity,
  Baby,
  Syringe,
  DollarSign,
  FileText,
  MapPin,
  Shield,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Eye,
  TrendingUp,
  ClipboardList,
  Stethoscope,
  Ticket,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FeatureGate from '@/components/ui/FeatureGate';
import { useMembershipTier } from '@/lib/membership-context';

// ── Types ────────────────────────────────────────────────────────────────────

interface GameAnimal {
  id: string;
  species: string;
  common_name: string;
  count: number;
  enclosure: string;
  health_status: 'healthy' | 'under_treatment' | 'quarantine' | 'injured';
  gender_breakdown: string | null;
  date_acquired: string | null;
  acquisition_method: 'bred' | 'purchased' | 'relocated' | 'wild_capture';
  value_estimate: number | null;
  cites_listed: boolean;
  notes: string | null;
}

interface BreedingProgram {
  id: string;
  species: string;
  program_name: string;
  breeding_pairs: number;
  season: string;
  expected_offspring: number;
  actual_offspring: number | null;
  success_rate: number | null;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'completed' | 'planned' | 'paused';
  notes: string | null;
}

interface VetRecord {
  id: string;
  species: string;
  animal_id_or_group: string;
  record_type: 'checkup' | 'vaccination' | 'treatment' | 'surgery' | 'darting' | 'deworming';
  description: string;
  date: string;
  vet_name: string | null;
  cost: number;
  next_due_date: string | null;
  outcome: string | null;
}

interface Permit {
  id: string;
  permit_type: 'hunting' | 'tourism' | 'capture' | 'transport' | 'breeding' | 'cites_export';
  permit_number: string;
  issued_by: string;
  species_covered: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  quota: number | null;
  used: number | null;
  notes: string | null;
}

interface RevenueRecord {
  id: string;
  source: 'hunting' | 'tourism' | 'live_sale' | 'breeding' | 'venison' | 'trophy' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: string;
  species: string | null;
  client: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

type SectionTab = 'registry' | 'breeding' | 'vet' | 'permits' | 'revenue';

const SECTIONS: { key: SectionTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'registry', label: 'Animal Registry', icon: ClipboardList },
  { key: 'breeding', label: 'Breeding', icon: Baby },
  { key: 'vet', label: 'Veterinary', icon: Stethoscope },
  { key: 'permits', label: 'Permits', icon: Ticket },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
];

const HEALTH_STATUSES = ['healthy', 'under_treatment', 'quarantine', 'injured'] as const;
const ACQUISITION_METHODS = ['bred', 'purchased', 'relocated', 'wild_capture'] as const;
const BREEDING_STATUSES = ['active', 'completed', 'planned', 'paused'] as const;
const VET_TYPES = ['checkup', 'vaccination', 'treatment', 'surgery', 'darting', 'deworming'] as const;
const PERMIT_TYPES = ['hunting', 'tourism', 'capture', 'transport', 'breeding', 'cites_export'] as const;
const PERMIT_STATUSES = ['active', 'expired', 'pending', 'revoked'] as const;
const REVENUE_SOURCES = ['hunting', 'tourism', 'live_sale', 'breeding', 'venison', 'trophy', 'other'] as const;

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-green-100 text-green-700',
  under_treatment: 'bg-yellow-100 text-yellow-700',
  quarantine: 'bg-red-100 text-red-700',
  injured: 'bg-orange-100 text-orange-700',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  planned: 'bg-purple-100 text-purple-700',
  paused: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  revoked: 'bg-red-100 text-red-700',
};

const AFRICAN_GAME_SPECIES = [
  'African Buffalo', 'Black Wildebeest', 'Blue Wildebeest', 'Blesbok', 'Bontebok',
  'Bushbuck', 'Common Duiker', 'Eland', 'Gemsbok (Oryx)', 'Giraffe',
  'Greater Kudu', 'Impala', 'Klipspringer', 'Lechwe', 'Mountain Reedbuck',
  'Nyala', 'Ostrich', 'Red Hartebeest', 'Roan Antelope', 'Sable Antelope',
  'Springbok', 'Steenbok', 'Tsessebe', 'Warthog', 'Waterbuck',
  'Zebra (Burchell)', 'Zebra (Cape Mountain)', 'Crocodile', 'Other',
];

// ── Main Page Component ──────────────────────────────────────────────────────

export default function GameFarmingPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const { t } = useLanguage();
  const { membershipTier } = useMembershipTier();

  const [activeTab, setActiveTab] = useState<SectionTab>('registry');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [animals, setAnimals] = useState<GameAnimal[]>([]);
  const [breedingPrograms, setBreedingPrograms] = useState<BreedingProgram[]>([]);
  const [vetRecords, setVetRecords] = useState<VetRecord[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>([]);

  // Forms
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [showBreedingForm, setShowBreedingForm] = useState(false);
  const [showVetForm, setShowVetForm] = useState(false);
  const [showPermitForm, setShowPermitForm] = useState(false);
  const [showRevenueForm, setShowRevenueForm] = useState(false);

  const [animalForm, setAnimalForm] = useState({
    species: '', common_name: '', count: '', enclosure: '',
    health_status: 'healthy' as GameAnimal['health_status'],
    gender_breakdown: '', date_acquired: '',
    acquisition_method: 'purchased' as GameAnimal['acquisition_method'],
    value_estimate: '', cites_listed: false, notes: '',
  });

  const [breedingForm, setBreedingForm] = useState({
    species: '', program_name: '', breeding_pairs: '', season: '',
    expected_offspring: '', start_date: '',
    status: 'planned' as BreedingProgram['status'], notes: '',
  });

  const [vetForm, setVetForm] = useState({
    species: '', animal_id_or_group: '',
    record_type: 'checkup' as VetRecord['record_type'],
    description: '', date: '', vet_name: '', cost: '', next_due_date: '', outcome: '',
  });

  const [permitForm, setPermitForm] = useState({
    permit_type: 'hunting' as Permit['permit_type'],
    permit_number: '', issued_by: '', species_covered: '',
    issue_date: '', expiry_date: '',
    status: 'active' as Permit['status'], quota: '', notes: '',
  });

  const [revenueForm, setRevenueForm] = useState({
    source: 'hunting' as RevenueRecord['source'],
    description: '', amount: '', currency: 'USD', date: '',
    species: '', client: '',
  });

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] outline-none";

  // ── Fetch data ─────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Animals from livestock table with type='game'
      const { data: liveData } = await supabase
        .from('livestock')
        .select('*')
        .eq('member_id', user.id)
        .eq('type', 'game')
        .order('created_at', { ascending: false });

      if (liveData) {
        setAnimals(liveData.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            species: (r.breed as string) || '',
            common_name: ((r as Record<string, unknown>).tag_id as string) || '',
            count: (r.count as number) || 0,
            enclosure: (r.location as string) || '',
            health_status: (r.health_status as GameAnimal['health_status']) || 'healthy',
            gender_breakdown: (meta.gender_breakdown as string) || null,
            date_acquired: (r.date_acquired as string) || null,
            acquisition_method: (meta.acquisition_method as GameAnimal['acquisition_method']) || 'purchased',
            value_estimate: (r.value_estimate as number) || null,
            cites_listed: (meta.cites_listed as boolean) ?? false,
            notes: (r.notes as string) || null,
          };
        }));
      }

      // Breeding programs
      const { data: breedData } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'game_breeding')
        .order('created_at', { ascending: false });

      if (breedData) {
        setBreedingPrograms(breedData.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            species: (r.title as string) || '',
            program_name: (meta.program_name as string) || '',
            breeding_pairs: (meta.breeding_pairs as number) || 0,
            season: (meta.season as string) || '',
            expected_offspring: (meta.expected_offspring as number) || 0,
            actual_offspring: (meta.actual_offspring as number) || null,
            success_rate: (meta.success_rate as number) || null,
            start_date: (meta.start_date as string) || '',
            end_date: (meta.end_date as string) || null,
            status: (meta.status as BreedingProgram['status']) || 'planned',
            notes: (r.notes as string) || null,
          };
        }));
      }

      // Vet records
      const { data: vetData } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'game_vet')
        .order('created_at', { ascending: false });

      if (vetData) {
        setVetRecords(vetData.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            species: (r.title as string) || '',
            animal_id_or_group: (meta.animal_id_or_group as string) || '',
            record_type: (meta.record_type as VetRecord['record_type']) || 'checkup',
            description: (meta.description as string) || '',
            date: (meta.date as string) || '',
            vet_name: (meta.vet_name as string) || null,
            cost: (meta.cost as number) || 0,
            next_due_date: (meta.next_due_date as string) || null,
            outcome: (meta.outcome as string) || null,
          };
        }));
      }

      // Permits
      const { data: permitData } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'game_permit')
        .order('created_at', { ascending: false });

      if (permitData) {
        setPermits(permitData.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            permit_type: (meta.permit_type as Permit['permit_type']) || 'hunting',
            permit_number: (r.title as string) || '',
            issued_by: (meta.issued_by as string) || '',
            species_covered: (meta.species_covered as string) || '',
            issue_date: (meta.issue_date as string) || '',
            expiry_date: (meta.expiry_date as string) || '',
            status: (meta.status as Permit['status']) || 'active',
            quota: (meta.quota as number) || null,
            used: (meta.used as number) || null,
            notes: (r.notes as string) || null,
          };
        }));
      }

      // Revenue
      const { data: revData } = await supabase
        .from('farm_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'game_revenue')
        .order('created_at', { ascending: false });

      if (revData) {
        setRevenueRecords(revData.map((r: Record<string, unknown>) => {
          const meta = (r.metadata || {}) as Record<string, unknown>;
          return {
            id: r.id as string,
            source: (meta.source as RevenueRecord['source']) || 'other',
            description: (r.title as string) || '',
            amount: (meta.amount as number) || 0,
            currency: (meta.currency as string) || 'USD',
            date: (meta.date as string) || '',
            species: (meta.species as string) || null,
            client: (meta.client as string) || null,
          };
        }));
      }
    } catch (err) {
      console.error('Error fetching game farming data:', err);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Save handlers ──────────────────────────────────────────────────────

  const saveAnimal = async () => {
    if (!user || !animalForm.species) return;
    setSaving(true);
    try {
      await supabase.from('livestock').insert({
        member_id: user.id,
        type: 'game',
        breed: animalForm.species,
        tag_id: animalForm.common_name || null,
        count: parseInt(animalForm.count) || 0,
        location: animalForm.enclosure || null,
        health_status: animalForm.health_status,
        date_acquired: animalForm.date_acquired || null,
        value_estimate: parseFloat(animalForm.value_estimate) || null,
        notes: animalForm.notes || null,
        metadata: {
          gender_breakdown: animalForm.gender_breakdown || null,
          acquisition_method: animalForm.acquisition_method,
          cites_listed: animalForm.cites_listed,
        },
      });
      setAnimalForm({ species: '', common_name: '', count: '', enclosure: '', health_status: 'healthy', gender_breakdown: '', date_acquired: '', acquisition_method: 'purchased', value_estimate: '', cites_listed: false, notes: '' });
      setShowAnimalForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving animal:', err);
    }
    setSaving(false);
  };

  const saveBreeding = async () => {
    if (!user || !breedingForm.species) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'game_breeding',
        title: breedingForm.species,
        notes: breedingForm.notes || null,
        metadata: {
          program_name: breedingForm.program_name,
          breeding_pairs: parseInt(breedingForm.breeding_pairs) || 0,
          season: breedingForm.season,
          expected_offspring: parseInt(breedingForm.expected_offspring) || 0,
          start_date: breedingForm.start_date,
          status: breedingForm.status,
        },
      });
      setBreedingForm({ species: '', program_name: '', breeding_pairs: '', season: '', expected_offspring: '', start_date: '', status: 'planned', notes: '' });
      setShowBreedingForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving breeding program:', err);
    }
    setSaving(false);
  };

  const saveVet = async () => {
    if (!user || !vetForm.species) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'game_vet',
        title: vetForm.species,
        metadata: {
          animal_id_or_group: vetForm.animal_id_or_group,
          record_type: vetForm.record_type,
          description: vetForm.description,
          date: vetForm.date,
          vet_name: vetForm.vet_name || null,
          cost: parseFloat(vetForm.cost) || 0,
          next_due_date: vetForm.next_due_date || null,
          outcome: vetForm.outcome || null,
        },
      });
      setVetForm({ species: '', animal_id_or_group: '', record_type: 'checkup', description: '', date: '', vet_name: '', cost: '', next_due_date: '', outcome: '' });
      setShowVetForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving vet record:', err);
    }
    setSaving(false);
  };

  const savePermit = async () => {
    if (!user || !permitForm.permit_number) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'game_permit',
        title: permitForm.permit_number,
        notes: permitForm.notes || null,
        metadata: {
          permit_type: permitForm.permit_type,
          issued_by: permitForm.issued_by,
          species_covered: permitForm.species_covered,
          issue_date: permitForm.issue_date,
          expiry_date: permitForm.expiry_date,
          status: permitForm.status,
          quota: parseInt(permitForm.quota) || null,
        },
      });
      setPermitForm({ permit_type: 'hunting', permit_number: '', issued_by: '', species_covered: '', issue_date: '', expiry_date: '', status: 'active', quota: '', notes: '' });
      setShowPermitForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving permit:', err);
    }
    setSaving(false);
  };

  const saveRevenue = async () => {
    if (!user || !revenueForm.description) return;
    setSaving(true);
    try {
      await supabase.from('farm_activities').insert({
        user_id: user.id,
        category: 'game_revenue',
        title: revenueForm.description,
        metadata: {
          source: revenueForm.source,
          amount: parseFloat(revenueForm.amount) || 0,
          currency: revenueForm.currency,
          date: revenueForm.date,
          species: revenueForm.species || null,
          client: revenueForm.client || null,
        },
      });
      setRevenueForm({ source: 'hunting', description: '', amount: '', currency: 'USD', date: '', species: '', client: '' });
      setShowRevenueForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving revenue:', err);
    }
    setSaving(false);
  };

  const deleteActivityRecord = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    await supabase.from('farm_activities').delete().eq('id', id);
    fetchData();
  };

  const deleteLivestockRecord = async (id: string) => {
    if (!confirm('Delete this animal record?')) return;
    await supabase.from('livestock').delete().eq('id', id);
    fetchData();
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const totalAnimals = animals.reduce((s, a) => s + (a.count || 0), 0);
  const uniqueSpecies = new Set(animals.map(a => a.species)).size;
  const healthyCount = animals.filter(a => a.health_status === 'healthy').reduce((s, a) => s + a.count, 0);
  const totalRevenue = revenueRecords.reduce((s, r) => s + (r.amount || 0), 0);
  const activePermits = permits.filter(p => p.status === 'active').length;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <FeatureGate feature="game_farming" tier={membershipTier}>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5DB347]/10 rounded-2xl flex items-center justify-center">
              <Rabbit className="w-6 h-6 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[#1B2A4A]">Game Farming</h1>
              <p className="text-sm text-gray-500">Wildlife management, breeding & permits</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total Animals', value: totalAnimals.toLocaleString(), icon: Rabbit, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Species', value: uniqueSpecies, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Healthy', value: `${totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0}%`, icon: Heart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Permits', value: activePermits, icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl font-bold text-[#1B2A4A]">{stat.value}</p>
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
            {/* ── Animal Registry Tab ── */}
            {activeTab === 'registry' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Animal Registry</h2>
                  <button onClick={() => setShowAnimalForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Animals
                  </button>
                </div>

                {showAnimalForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Register Game Animals</h3>
                      <button onClick={() => setShowAnimalForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={animalForm.species} onChange={e => setAnimalForm({ ...animalForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species *</option>
                        {AFRICAN_GAME_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="Common Name / Tag" value={animalForm.common_name} onChange={e => setAnimalForm({ ...animalForm, common_name: e.target.value })} className={inputCls} />
                      <input type="number" placeholder="Count *" value={animalForm.count} onChange={e => setAnimalForm({ ...animalForm, count: e.target.value })} className={inputCls} />
                      <input placeholder="Enclosure / Camp" value={animalForm.enclosure} onChange={e => setAnimalForm({ ...animalForm, enclosure: e.target.value })} className={inputCls} />
                      <select value={animalForm.health_status} onChange={e => setAnimalForm({ ...animalForm, health_status: e.target.value as GameAnimal['health_status'] })} className={inputCls}>
                        {HEALTH_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <input placeholder="Gender Breakdown (e.g. 5M, 8F)" value={animalForm.gender_breakdown} onChange={e => setAnimalForm({ ...animalForm, gender_breakdown: e.target.value })} className={inputCls} />
                      <select value={animalForm.acquisition_method} onChange={e => setAnimalForm({ ...animalForm, acquisition_method: e.target.value as GameAnimal['acquisition_method'] })} className={inputCls}>
                        {ACQUISITION_METHODS.map(m => <option key={m} value={m}>{m.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date Acquired</label>
                        <input type="date" value={animalForm.date_acquired} onChange={e => setAnimalForm({ ...animalForm, date_acquired: e.target.value })} className={inputCls} />
                      </div>
                      <input type="number" placeholder="Estimated Value (USD)" value={animalForm.value_estimate} onChange={e => setAnimalForm({ ...animalForm, value_estimate: e.target.value })} className={inputCls} />
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" checked={animalForm.cites_listed} onChange={e => setAnimalForm({ ...animalForm, cites_listed: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                        CITES Listed Species
                      </label>
                      <input placeholder="Notes" value={animalForm.notes} onChange={e => setAnimalForm({ ...animalForm, notes: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={saveAnimal} disabled={saving || !animalForm.species} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Animals
                    </button>
                  </div>
                )}

                {animals.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Rabbit className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No animals registered</h3>
                    <p className="text-sm text-gray-500">Start your game farming registry by adding your wildlife species.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {animals.map(a => (
                      <div key={a.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                            <Rabbit className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">
                              {a.species}
                              {a.common_name && <span className="text-gray-400 font-normal"> ({a.common_name})</span>}
                              {a.cites_listed && <span className="ml-2 px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded">CITES</span>}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {a.count} animals &bull; {a.enclosure || 'No enclosure'} &bull; {a.acquisition_method.replace('_', ' ')}
                              {a.gender_breakdown && <> &bull; {a.gender_breakdown}</>}
                              {a.value_estimate && <> &bull; ${a.value_estimate.toLocaleString()}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${HEALTH_COLORS[a.health_status]}`}>{a.health_status.replace('_', ' ')}</span>
                          <button onClick={() => deleteLivestockRecord(a.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Breeding Programs Tab ── */}
            {activeTab === 'breeding' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Breeding Programs</h2>
                  <button onClick={() => setShowBreedingForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> New Program
                  </button>
                </div>

                {showBreedingForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Breeding Program</h3>
                      <button onClick={() => setShowBreedingForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={breedingForm.species} onChange={e => setBreedingForm({ ...breedingForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species *</option>
                        {AFRICAN_GAME_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="Program Name" value={breedingForm.program_name} onChange={e => setBreedingForm({ ...breedingForm, program_name: e.target.value })} className={inputCls} />
                      <input type="number" placeholder="Breeding Pairs" value={breedingForm.breeding_pairs} onChange={e => setBreedingForm({ ...breedingForm, breeding_pairs: e.target.value })} className={inputCls} />
                      <input placeholder="Season (e.g. Winter 2026)" value={breedingForm.season} onChange={e => setBreedingForm({ ...breedingForm, season: e.target.value })} className={inputCls} />
                      <input type="number" placeholder="Expected Offspring" value={breedingForm.expected_offspring} onChange={e => setBreedingForm({ ...breedingForm, expected_offspring: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                        <input type="date" value={breedingForm.start_date} onChange={e => setBreedingForm({ ...breedingForm, start_date: e.target.value })} className={inputCls} />
                      </div>
                      <select value={breedingForm.status} onChange={e => setBreedingForm({ ...breedingForm, status: e.target.value as BreedingProgram['status'] })} className={inputCls}>
                        {BREEDING_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <input placeholder="Notes" value={breedingForm.notes} onChange={e => setBreedingForm({ ...breedingForm, notes: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={saveBreeding} disabled={saving || !breedingForm.species} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Program
                    </button>
                  </div>
                )}

                {breedingPrograms.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Baby className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No breeding programs</h3>
                    <p className="text-sm text-gray-500">Set up breeding programs to manage your wildlife population.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {breedingPrograms.map(bp => (
                      <div key={bp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Baby className="w-5 h-5 text-pink-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{bp.species} {bp.program_name && <span className="text-gray-400 font-normal">- {bp.program_name}</span>}</h4>
                            <p className="text-xs text-gray-500">
                              {bp.breeding_pairs} pairs &bull; {bp.season} &bull; Expected: {bp.expected_offspring}
                              {bp.actual_offspring !== null && <> &bull; Actual: {bp.actual_offspring}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[bp.status]}`}>{bp.status}</span>
                          <button onClick={() => deleteActivityRecord(bp.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Veterinary Records Tab ── */}
            {activeTab === 'vet' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Veterinary Records</h2>
                  <button onClick={() => setShowVetForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Record
                  </button>
                </div>

                {showVetForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">New Veterinary Record</h3>
                      <button onClick={() => setShowVetForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={vetForm.species} onChange={e => setVetForm({ ...vetForm, species: e.target.value })} className={inputCls}>
                        <option value="">Select Species *</option>
                        {AFRICAN_GAME_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input placeholder="Animal ID / Group" value={vetForm.animal_id_or_group} onChange={e => setVetForm({ ...vetForm, animal_id_or_group: e.target.value })} className={inputCls} />
                      <select value={vetForm.record_type} onChange={e => setVetForm({ ...vetForm, record_type: e.target.value as VetRecord['record_type'] })} className={inputCls}>
                        {VET_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                      <input placeholder="Description *" value={vetForm.description} onChange={e => setVetForm({ ...vetForm, description: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <input type="date" value={vetForm.date} onChange={e => setVetForm({ ...vetForm, date: e.target.value })} className={inputCls} />
                      </div>
                      <input placeholder="Veterinarian Name" value={vetForm.vet_name} onChange={e => setVetForm({ ...vetForm, vet_name: e.target.value })} className={inputCls} />
                      <input type="number" step="0.01" placeholder="Cost (USD)" value={vetForm.cost} onChange={e => setVetForm({ ...vetForm, cost: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Next Due Date</label>
                        <input type="date" value={vetForm.next_due_date} onChange={e => setVetForm({ ...vetForm, next_due_date: e.target.value })} className={inputCls} />
                      </div>
                      <input placeholder="Outcome" value={vetForm.outcome} onChange={e => setVetForm({ ...vetForm, outcome: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={saveVet} disabled={saving || !vetForm.species} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Record
                    </button>
                  </div>
                )}

                {vetRecords.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No veterinary records</h3>
                    <p className="text-sm text-gray-500">Track vaccinations, treatments, and health checkups for your game animals.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {vetRecords.map(vr => (
                      <div key={vr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Syringe className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{vr.record_type} - {vr.species}</h4>
                            <p className="text-xs text-gray-500">
                              {vr.date} &bull; {vr.description} {vr.vet_name && <>&bull; Dr. {vr.vet_name}</>} &bull; ${vr.cost}
                              {vr.next_due_date && <> &bull; Next: {vr.next_due_date}</>}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => deleteActivityRecord(vr.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Permits Tab ── */}
            {activeTab === 'permits' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Hunting / Tourism Permits</h2>
                  <button onClick={() => setShowPermitForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Permit
                  </button>
                </div>

                {showPermitForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Add Permit</h3>
                      <button onClick={() => setShowPermitForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={permitForm.permit_type} onChange={e => setPermitForm({ ...permitForm, permit_type: e.target.value as Permit['permit_type'] })} className={inputCls}>
                        {PERMIT_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <input placeholder="Permit Number *" value={permitForm.permit_number} onChange={e => setPermitForm({ ...permitForm, permit_number: e.target.value })} className={inputCls} />
                      <input placeholder="Issued By" value={permitForm.issued_by} onChange={e => setPermitForm({ ...permitForm, issued_by: e.target.value })} className={inputCls} />
                      <input placeholder="Species Covered" value={permitForm.species_covered} onChange={e => setPermitForm({ ...permitForm, species_covered: e.target.value })} className={inputCls} />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
                        <input type="date" value={permitForm.issue_date} onChange={e => setPermitForm({ ...permitForm, issue_date: e.target.value })} className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                        <input type="date" value={permitForm.expiry_date} onChange={e => setPermitForm({ ...permitForm, expiry_date: e.target.value })} className={inputCls} />
                      </div>
                      <select value={permitForm.status} onChange={e => setPermitForm({ ...permitForm, status: e.target.value as Permit['status'] })} className={inputCls}>
                        {PERMIT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <input type="number" placeholder="Quota (if applicable)" value={permitForm.quota} onChange={e => setPermitForm({ ...permitForm, quota: e.target.value })} className={inputCls} />
                      <input placeholder="Notes" value={permitForm.notes} onChange={e => setPermitForm({ ...permitForm, notes: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={savePermit} disabled={saving || !permitForm.permit_number} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Permit
                    </button>
                  </div>
                )}

                {permits.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No permits recorded</h3>
                    <p className="text-sm text-gray-500">Track your hunting, tourism, and wildlife permits.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {permits.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${p.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                            <Shield className={`w-5 h-5 ${p.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{p.permit_type.replace('_', ' ')} - #{p.permit_number}</h4>
                            <p className="text-xs text-gray-500">
                              {p.issued_by} &bull; {p.species_covered} &bull; Expires: {p.expiry_date}
                              {p.quota && <> &bull; Quota: {p.used || 0}/{p.quota}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                          <button onClick={() => deleteActivityRecord(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Revenue Tab ── */}
            {activeTab === 'revenue' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Revenue Tracking</h2>
                  <button onClick={() => setShowRevenueForm(true)} className="flex items-center gap-2 bg-[#5DB347] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors">
                    <Plus className="w-4 h-4" /> Add Revenue
                  </button>
                </div>

                {showRevenueForm && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1B2A4A]">Record Revenue</h3>
                      <button onClick={() => setShowRevenueForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <select value={revenueForm.source} onChange={e => setRevenueForm({ ...revenueForm, source: e.target.value as RevenueRecord['source'] })} className={inputCls}>
                        {REVENUE_SOURCES.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}</option>)}
                      </select>
                      <input placeholder="Description *" value={revenueForm.description} onChange={e => setRevenueForm({ ...revenueForm, description: e.target.value })} className={inputCls} />
                      <input type="number" step="0.01" placeholder="Amount *" value={revenueForm.amount} onChange={e => setRevenueForm({ ...revenueForm, amount: e.target.value })} className={inputCls} />
                      <select value={revenueForm.currency} onChange={e => setRevenueForm({ ...revenueForm, currency: e.target.value })} className={inputCls}>
                        {['USD', 'ZAR', 'KES', 'NGN', 'TZS', 'UGX', 'GHS', 'EUR', 'GBP'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Date</label>
                        <input type="date" value={revenueForm.date} onChange={e => setRevenueForm({ ...revenueForm, date: e.target.value })} className={inputCls} />
                      </div>
                      <input placeholder="Species (optional)" value={revenueForm.species} onChange={e => setRevenueForm({ ...revenueForm, species: e.target.value })} className={inputCls} />
                      <input placeholder="Client / Buyer" value={revenueForm.client} onChange={e => setRevenueForm({ ...revenueForm, client: e.target.value })} className={inputCls} />
                    </div>
                    <button onClick={saveRevenue} disabled={saving || !revenueForm.description} className="bg-[#5DB347] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#4EA03D] transition-colors disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Revenue
                    </button>
                  </div>
                )}

                {/* Revenue summary */}
                {revenueRecords.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(
                      revenueRecords.reduce<Record<string, number>>((acc, r) => {
                        const key = r.source.replace('_', ' ');
                        acc[key] = (acc[key] || 0) + r.amount;
                        return acc;
                      }, {})
                    ).map(([source, total]) => (
                      <div key={source} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-xs text-gray-500 capitalize">{source}</p>
                        <p className="text-lg font-bold text-[#1B2A4A]">${total.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}

                {revenueRecords.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-[#1B2A4A] mb-1">No revenue recorded</h3>
                    <p className="text-sm text-gray-500">Track revenue from hunting, tourism, live sales, and more.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {revenueRecords.map(r => (
                      <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-[#1B2A4A] truncate">{r.description}</h4>
                            <p className="text-xs text-gray-500">
                              {r.source.replace('_', ' ')} &bull; {r.date}
                              {r.species && <> &bull; {r.species}</>}
                              {r.client && <> &bull; {r.client}</>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-600">{r.currency} {r.amount.toLocaleString()}</span>
                          <button onClick={() => deleteActivityRecord(r.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
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
