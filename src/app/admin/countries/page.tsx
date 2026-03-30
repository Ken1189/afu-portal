'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe2,
  Users,
  Banknote,
  TrendingUp,
  Search,
  MapPin,
  CreditCard,
  Languages,
  Radio,
  Plus,
  Pencil,
  Save,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

// ── Types ──
type CountryStatus = 'live' | 'pilot' | 'planned';

interface Country {
  iso: string;
  name: string;
  flag: string;
  currency: string;
  paymentProviders: string[];
  languages: string[];
  status: CountryStatus;
  members: number;
  activeLoans: number;
  revenueThisMonth: number;
  description?: string;
  key_crops?: string;
  key_programs?: string;
  contact_email?: string;
}

interface CountryFormData {
  iso: string;
  name: string;
  flag: string;
  currency: string;
  status: CountryStatus;
  description: string;
  key_crops: string;
  key_programs: string;
  contact_email: string;
}

const EMPTY_FORM: CountryFormData = {
  iso: '',
  name: '',
  flag: '',
  currency: '',
  status: 'planned',
  description: '',
  key_crops: '',
  key_programs: '',
  contact_email: '',
};

// ── Mock Data ──
const fallback_countries: Country[] = [
  { iso: 'BW', name: 'Botswana', flag: '\ud83c\udde7\ud83c\uddfc', currency: 'BWP', paymentProviders: ['Orange Money'], languages: ['Setswana', 'English'], status: 'live', members: 3842, activeLoans: 312, revenueThisMonth: 78400 },
  { iso: 'ZW', name: 'Zimbabwe', flag: '\ud83c\uddff\ud83c\uddfc', currency: 'USD', paymentProviders: ['EcoCash'], languages: ['Shona', 'Ndebele', 'English'], status: 'live', members: 4215, activeLoans: 487, revenueThisMonth: 92100 },
  { iso: 'TZ', name: 'Tanzania', flag: '\ud83c\uddf9\ud83c\uddff', currency: 'TZS', paymentProviders: ['M-Pesa', 'Airtel Money'], languages: ['Swahili', 'English'], status: 'live', members: 4780, activeLoans: 421, revenueThisMonth: 65300 },
  { iso: 'KE', name: 'Kenya', flag: '\ud83c\uddf0\ud83c\uddea', currency: 'KES', paymentProviders: ['M-Pesa', 'Airtel Money'], languages: ['Swahili', 'English'], status: 'live', members: 4950, activeLoans: 498, revenueThisMonth: 98700 },
  { iso: 'ZA', name: 'South Africa', flag: '\ud83c\uddff\ud83c\udde6', currency: 'ZAR', paymentProviders: ['Bank Transfer'], languages: ['Zulu', 'Afrikaans', 'English'], status: 'live', members: 3200, activeLoans: 275, revenueThisMonth: 87200 },
  { iso: 'NG', name: 'Nigeria', flag: '\ud83c\uddf3\ud83c\uddec', currency: 'NGN', paymentProviders: ['MTN MoMo'], languages: ['Hausa', 'Yoruba', 'English'], status: 'pilot', members: 1420, activeLoans: 132, revenueThisMonth: 24500 },
  { iso: 'ZM', name: 'Zambia', flag: '\ud83c\uddff\ud83c\uddf2', currency: 'ZMW', paymentProviders: ['MTN MoMo', 'Airtel Money'], languages: ['Bemba', 'English'], status: 'pilot', members: 980, activeLoans: 87, revenueThisMonth: 15800 },
  { iso: 'MZ', name: 'Mozambique', flag: '\ud83c\uddf2\ud83c\uddff', currency: 'MZN', paymentProviders: ['M-Pesa'], languages: ['Portuguese', 'English'], status: 'pilot', members: 745, activeLoans: 63, revenueThisMonth: 11200 },
  { iso: 'GH', name: 'Ghana', flag: '\ud83c\uddec\ud83c\udded', currency: 'GHS', paymentProviders: ['MTN MoMo', 'Vodafone Cash'], languages: ['English', 'Twi', 'Ga'], status: 'pilot', members: 700, activeLoans: 58, revenueThisMonth: 12400 },
  { iso: 'SL', name: 'Sierra Leone', flag: '\ud83c\uddf8\ud83c\uddf1', currency: 'SLE', paymentProviders: ['Orange Money'], languages: ['Krio', 'English'], status: 'planned', members: 210, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'UG', name: 'Uganda', flag: '\ud83c\uddfa\ud83c\uddec', currency: 'UGX', paymentProviders: ['MTN Mobile Money', 'Airtel Money'], languages: ['English', 'Luganda', 'Swahili'], status: 'pilot', members: 620, activeLoans: 45, revenueThisMonth: 9800 },
  { iso: 'EG', name: 'Egypt', flag: '\ud83c\uddea\ud83c\uddec', currency: 'EGP', paymentProviders: ['Bank Transfer', 'Fawry'], languages: ['Arabic', 'English'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'ET', name: 'Ethiopia', flag: '\ud83c\uddea\ud83c\uddf9', currency: 'ETB', paymentProviders: ['Telebirr', 'Bank Transfer'], languages: ['Amharic', 'English'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'MW', name: 'Malawi', flag: '\ud83c\uddf2\ud83c\uddfc', currency: 'MWK', paymentProviders: ['Airtel Money', 'TNM Mpamba'], languages: ['Chichewa', 'English'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'NA', name: 'Namibia', flag: '\ud83c\uddf3\ud83c\udde6', currency: 'NAD', paymentProviders: ['Bank Transfer', 'MTC MoMo'], languages: ['English', 'Afrikaans', 'Oshiwambo'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'GN', name: 'Republic of Guinea', flag: '\ud83c\uddec\ud83c\uddf3', currency: 'GNF', paymentProviders: ['Orange Money', 'MTN MoMo'], languages: ['French', 'Fula', 'Mandinka'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'GW', name: 'Guinea-Bissau', flag: '\ud83c\uddec\ud83c\uddfc', currency: 'XOF', paymentProviders: ['Orange Money'], languages: ['Portuguese', 'Kriol'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'LR', name: 'Liberia', flag: '\ud83c\uddf1\ud83c\uddf7', currency: 'LRD', paymentProviders: ['Orange Money', 'MTN MoMo'], languages: ['English'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'ML', name: 'Mali', flag: '\ud83c\uddf2\ud83c\uddf1', currency: 'XOF', paymentProviders: ['Orange Money', 'Moov Money'], languages: ['French', 'Bambara'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
  { iso: 'CI', name: 'Ivory Coast', flag: '\ud83c\udde8\ud83c\uddee', currency: 'XOF', paymentProviders: ['Orange Money', 'MTN MoMo', 'Moov Money'], languages: ['French'], status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0 },
];

// ── Helpers ──
const statusConfig: Record<CountryStatus, { label: string; color: string; bg: string; dot: string }> = {
  live:    { label: 'Live',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  pilot:   { label: 'Pilot',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
  planned: { label: 'Planned', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',   dot: 'bg-slate-400' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

// ── Toast ──
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Country Edit Modal ──
function CountryModal({
  form,
  onChange,
  onSave,
  onClose,
  saving,
  isEdit,
}: {
  form: CountryFormData;
  onChange: (f: CountryFormData) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0F1A2E] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{isEdit ? 'Edit Country' : 'Add Country'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          {!isEdit && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ISO Code *</label>
                <input value={form.iso} onChange={(e) => onChange({ ...form, iso: e.target.value.toUpperCase() })} maxLength={2} placeholder="ZW"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Flag Emoji</label>
                <input value={form.flag} onChange={(e) => onChange({ ...form, flag: e.target.value })} placeholder="Flag emoji"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className={isEdit ? '' : ''}>
              <label className="block text-sm font-medium text-gray-300 mb-1">Country Name *</label>
              <input value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} placeholder="Country name"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
              <input value={form.currency} onChange={(e) => onChange({ ...form, currency: e.target.value })} placeholder="USD"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select value={form.status} onChange={(e) => onChange({ ...form, status: e.target.value as CountryStatus })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-[#8CB89C]/50 focus:outline-none">
              <option value="planned" className="bg-[#0F1A2E]">Planned</option>
              <option value="pilot" className="bg-[#0F1A2E]">Pilot</option>
              <option value="live" className="bg-[#0F1A2E]">Live</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => onChange({ ...form, description: e.target.value })} rows={3} placeholder="Country description..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Key Crops</label>
            <input value={form.key_crops} onChange={(e) => onChange({ ...form, key_crops: e.target.value })} placeholder="Maize, Sorghum, Groundnuts..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Key Programs</label>
            <input value={form.key_programs} onChange={(e) => onChange({ ...form, key_programs: e.target.value })} placeholder="Seed distribution, crop insurance..."
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
            <input type="email" value={form.contact_email} onChange={(e) => onChange({ ...form, contact_email: e.target.value })} placeholder="admin@africanfarmingunion.org"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-[#8CB89C]/50 focus:outline-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">Cancel</button>
          <button onClick={onSave} disabled={saving || !form.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Update Country' : 'Add Country'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page Component ──
export default function CountriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CountryStatus | 'all'>('all');
  const [countries, setCountries] = useState<Country[]>(fallback_countries);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingIso, setEditingIso] = useState<string | null>(null);
  const [formData, setFormData] = useState<CountryFormData>(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);

  const supabase = createClient();

  const loadCountrySettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('country_settings')
        .select('*');
      if (data && data.length > 0) {
        setCountries((prev) =>
          prev.map((c) => {
            const setting = data.find((s: Record<string, unknown>) => s.iso === c.iso);
            if (setting) {
              return {
                ...c,
                description: (setting.description as string) || c.description,
                key_crops: (setting.key_crops as string) || c.key_crops,
                key_programs: (setting.key_programs as string) || c.key_programs,
                contact_email: (setting.contact_email as string) || c.contact_email,
                status: (setting.status as CountryStatus) || c.status,
              };
            }
            return c;
          })
        );
      }
    } catch {
      // table may not exist, use fallback
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('country')
          .not('country', 'is', null);
        if (!error && data && data.length > 0) {
          const countryMemberCounts: Record<string, number> = {};
          data.forEach((row: Record<string, unknown>) => {
            const c = (row.country as string) || '';
            if (c) countryMemberCounts[c] = (countryMemberCounts[c] || 0) + 1;
          });
          setCountries((prev) =>
            prev.map((c) => {
              const realCount = countryMemberCounts[c.name] || countryMemberCounts[c.iso];
              return realCount !== undefined ? { ...c, members: realCount } : c;
            })
          );
        }
      } catch { /* fallback */ }
      await loadCountrySettings();
      setIsLoading(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.iso.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [countries, search, statusFilter]);

  const totalMembers = countries.reduce((s, c) => s + c.members, 0);
  const totalRevenue = countries.reduce((s, c) => s + c.revenueThisMonth, 0);
  const liveCount = countries.filter((c) => c.status === 'live').length;
  const pilotCount = countries.filter((c) => c.status === 'pilot').length;

  const summaryCards = [
    { label: 'Total Countries', value: String(countries.length), icon: Globe2, accent: 'text-[#8CB89C]' },
    { label: 'Total Members', value: totalMembers.toLocaleString(), icon: Users, accent: 'text-[#D4A843]' },
    { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, accent: 'text-emerald-400' },
    { label: 'Live / Pilot', value: `${liveCount} / ${pilotCount}`, icon: Radio, accent: 'text-[#8CB89C]' },
  ];

  // ── Modal handlers ──
  const openEditModal = (country: Country) => {
    setEditingIso(country.iso);
    setFormData({
      iso: country.iso,
      name: country.name,
      flag: country.flag,
      currency: country.currency,
      status: country.status,
      description: country.description || '',
      key_crops: country.key_crops || '',
      key_programs: country.key_programs || '',
      contact_email: country.contact_email || '',
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingIso(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setToast({ message: 'Country name is required', type: 'error' });
      return;
    }
    setFormSaving(true);

    const payload = {
      iso: formData.iso || editingIso,
      name: formData.name,
      status: formData.status,
      description: formData.description || null,
      key_crops: formData.key_crops || null,
      key_programs: formData.key_programs || null,
      contact_email: formData.contact_email || null,
    };

    try {
      const { error } = await supabase
        .from('country_settings')
        .upsert(payload, { onConflict: 'iso' });

      if (error) throw error;

      // Update local state
      if (editingIso) {
        setCountries((prev) =>
          prev.map((c) =>
            c.iso === editingIso
              ? { ...c, status: formData.status, description: formData.description, key_crops: formData.key_crops, key_programs: formData.key_programs, contact_email: formData.contact_email }
              : c
          )
        );
        setToast({ message: 'Country updated', type: 'success' });
      } else {
        // Add new country to local state
        setCountries((prev) => [
          ...prev,
          {
            iso: formData.iso,
            name: formData.name,
            flag: formData.flag || '',
            currency: formData.currency || '',
            paymentProviders: [],
            languages: [],
            status: formData.status,
            members: 0,
            activeLoans: 0,
            revenueThisMonth: 0,
            description: formData.description,
            key_crops: formData.key_crops,
            key_programs: formData.key_programs,
            contact_email: formData.contact_email,
          },
        ]);
        setToast({ message: 'Country added', type: 'success' });
      }
      setShowModal(false);
    } catch {
      setToast({ message: 'Failed to save country settings', type: 'error' });
    }
    setFormSaving(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Back link */}
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#8CB89C] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe2 className="w-8 h-8 text-[#8CB89C]" />
            Country Management
          </h1>
          <p className="text-slate-400 mt-1">Manage AFU operating countries across Africa</p>
        </div>
        <button onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all">
          <Plus className="w-4 h-4" />
          Add Country
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <motion.div key={card.label} variants={cardVariants}
            className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.accent}`} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search countries..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1B2A4A]/60 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8CB89C]/50 transition-colors text-sm" />
        </div>
        <div className="flex gap-2">
          {(['all', 'live', 'pilot', 'planned'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-[#8CB89C]/20 border-[#8CB89C]/40 text-[#8CB89C]'
                  : 'bg-[#1B2A4A]/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Country Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((country) => {
          const st = statusConfig[country.status];
          return (
            <motion.div key={country.iso} variants={cardVariants}
              className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl overflow-hidden hover:border-[#8CB89C]/20 transition-colors group">
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{country.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">{country.iso}</span>
                        <span className="text-xs text-slate-500">|</span>
                        <span className="text-xs font-mono text-[#D4A843]">{country.currency}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`} />
                    {st.label}
                  </span>
                </div>

                {/* Description if present */}
                {country.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{country.description}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2.5 bg-white/[0.03] rounded-lg">
                    <Users className="w-4 h-4 text-[#8CB89C] mx-auto mb-1" />
                    <p className="text-sm font-semibold text-white">{country.members.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Members</p>
                  </div>
                  <div className="text-center p-2.5 bg-white/[0.03] rounded-lg">
                    <Banknote className="w-4 h-4 text-[#D4A843] mx-auto mb-1" />
                    <p className="text-sm font-semibold text-white">{country.activeLoans}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active Loans</p>
                  </div>
                  <div className="text-center p-2.5 bg-white/[0.03] rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-sm font-semibold text-white">{formatCurrency(country.revenueThisMonth)}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue</p>
                  </div>
                </div>

                {/* Key Crops */}
                {country.key_crops && (
                  <div className="mb-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Key Crops</p>
                    <p className="text-xs text-[#8CB89C]">{country.key_crops}</p>
                  </div>
                )}

                {/* Payment Providers */}
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment Providers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {country.paymentProviders.map((p) => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C] border border-[#8CB89C]/20">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Languages className="w-3 h-3" /> Languages
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {country.languages.map((l) => (
                      <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20">{l}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {country.status === 'live' ? 'Fully operational' : country.status === 'pilot' ? 'Pilot programme' : 'Coming soon'}
                </span>
                <button onClick={() => openEditModal(country)}
                  className="flex items-center gap-1.5 text-xs text-[#8CB89C] hover:text-[#8CB89C]/80 font-medium transition-colors">
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <Globe2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No countries match your filter.</p>
        </div>
      )}

      {/* Country Modal */}
      {showModal && (
        <CountryModal
          form={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={formSaving}
          isEdit={!!editingIso}
        />
      )}
    </div>
  );
}
