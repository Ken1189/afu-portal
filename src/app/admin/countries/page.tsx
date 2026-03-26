'use client';

import { useState, useMemo } from 'react';
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
  Wifi,
  WifiOff,
  Radio,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
};

// ── Types ───────────────────────────────────────────────────────────────────

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
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const countries: Country[] = [
  {
    iso: 'BW', name: 'Botswana', flag: '🇧🇼', currency: 'BWP',
    paymentProviders: ['Orange Money'], languages: ['Setswana', 'English'],
    status: 'live', members: 3842, activeLoans: 312, revenueThisMonth: 78400,
  },
  {
    iso: 'ZW', name: 'Zimbabwe', flag: '🇿🇼', currency: 'USD',
    paymentProviders: ['EcoCash'], languages: ['Shona', 'Ndebele', 'English'],
    status: 'live', members: 4215, activeLoans: 487, revenueThisMonth: 92100,
  },
  {
    iso: 'TZ', name: 'Tanzania', flag: '🇹🇿', currency: 'TZS',
    paymentProviders: ['M-Pesa', 'Airtel Money'], languages: ['Swahili', 'English'],
    status: 'live', members: 4780, activeLoans: 421, revenueThisMonth: 65300,
  },
  {
    iso: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES',
    paymentProviders: ['M-Pesa', 'Airtel Money'], languages: ['Swahili', 'English'],
    status: 'live', members: 4950, activeLoans: 498, revenueThisMonth: 98700,
  },
  {
    iso: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR',
    paymentProviders: ['Bank Transfer'], languages: ['Zulu', 'Afrikaans', 'English'],
    status: 'live', members: 3200, activeLoans: 275, revenueThisMonth: 87200,
  },
  {
    iso: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN',
    paymentProviders: ['MTN MoMo'], languages: ['Hausa', 'Yoruba', 'English'],
    status: 'pilot', members: 1420, activeLoans: 132, revenueThisMonth: 24500,
  },
  {
    iso: 'ZM', name: 'Zambia', flag: '🇿🇲', currency: 'ZMW',
    paymentProviders: ['MTN MoMo', 'Airtel Money'], languages: ['Bemba', 'English'],
    status: 'pilot', members: 980, activeLoans: 87, revenueThisMonth: 15800,
  },
  {
    iso: 'MZ', name: 'Mozambique', flag: '🇲🇿', currency: 'MZN',
    paymentProviders: ['M-Pesa'], languages: ['Portuguese', 'English'],
    status: 'pilot', members: 745, activeLoans: 63, revenueThisMonth: 11200,
  },
  {
    iso: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS',
    paymentProviders: ['MTN MoMo', 'Vodafone Cash'], languages: ['English', 'Twi', 'Ga'],
    status: 'pilot', members: 700, activeLoans: 58, revenueThisMonth: 12400,
  },
  {
    iso: 'SL', name: 'Sierra Leone', flag: '🇸🇱', currency: 'SLE',
    paymentProviders: ['Orange Money'], languages: ['Krio', 'English'],
    status: 'planned', members: 210, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'UG', name: 'Uganda', flag: '🇺🇬', currency: 'UGX',
    paymentProviders: ['MTN Mobile Money', 'Airtel Money'], languages: ['English', 'Luganda', 'Swahili'],
    status: 'pilot', members: 620, activeLoans: 45, revenueThisMonth: 9800,
  },
  // ── East & Southern Africa Expansion ──
  {
    iso: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP',
    paymentProviders: ['Bank Transfer', 'Fawry'], languages: ['Arabic', 'English'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'ET', name: 'Ethiopia', flag: '🇪🇹', currency: 'ETB',
    paymentProviders: ['Telebirr', 'Bank Transfer'], languages: ['Amharic', 'English'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'MW', name: 'Malawi', flag: '🇲🇼', currency: 'MWK',
    paymentProviders: ['Airtel Money', 'TNM Mpamba'], languages: ['Chichewa', 'English'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'NA', name: 'Namibia', flag: '🇳🇦', currency: 'NAD',
    paymentProviders: ['Bank Transfer', 'MTC MoMo'], languages: ['English', 'Afrikaans', 'Oshiwambo'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  // ── West Africa Expansion ──
  {
    iso: 'GN', name: 'Republic of Guinea', flag: '🇬🇳', currency: 'GNF',
    paymentProviders: ['Orange Money', 'MTN MoMo'], languages: ['French', 'Fula', 'Mandinka'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼', currency: 'XOF',
    paymentProviders: ['Orange Money'], languages: ['Portuguese', 'Kriol'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'LR', name: 'Liberia', flag: '🇱🇷', currency: 'LRD',
    paymentProviders: ['Orange Money', 'MTN MoMo'], languages: ['English'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'XOF',
    paymentProviders: ['Orange Money', 'Moov Money'], languages: ['French', 'Bambara'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
  {
    iso: 'CI', name: 'Ivory Coast', flag: '🇨🇮', currency: 'XOF',
    paymentProviders: ['Orange Money', 'MTN MoMo', 'Moov Money'], languages: ['French'],
    status: 'planned', members: 0, activeLoans: 0, revenueThisMonth: 0,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<CountryStatus, { label: string; color: string; bg: string; dot: string }> = {
  live:    { label: 'Live',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400' },
  pilot:   { label: 'Pilot',   color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   dot: 'bg-amber-400' },
  planned: { label: 'Planned', color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/20',   dot: 'bg-slate-400' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

// ── Page Component ──────────────────────────────────────────────────────────

export default function CountriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CountryStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.iso.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

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

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#8CB89C] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Globe2 className="w-8 h-8 text-[#8CB89C]" />
          Country Management
        </h1>
        <p className="text-slate-400 mt-1">Manage AFU operating countries across Africa</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {summaryCards.map((card) => (
          <motion.div
            key={card.label}
            variants={cardVariants}
            className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl p-5"
          >
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
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1B2A4A]/60 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#8CB89C]/50 transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'live', 'pilot', 'planned'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                statusFilter === s
                  ? 'bg-[#8CB89C]/20 border-[#8CB89C]/40 text-[#8CB89C]'
                  : 'bg-[#1B2A4A]/40 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Country Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {filtered.map((country) => {
          const st = statusConfig[country.status];
          return (
            <motion.div
              key={country.iso}
              variants={cardVariants}
              className="bg-[#1B2A4A]/60 backdrop-blur border border-white/5 rounded-xl overflow-hidden hover:border-[#8CB89C]/20 transition-colors group"
            >
              {/* Card Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{country.flag}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{country.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          {country.iso}
                        </span>
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

                {/* Payment Providers */}
                <div className="mb-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Payment Providers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {country.paymentProviders.map((p) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C] border border-[#8CB89C]/20"
                      >
                        {p}
                      </span>
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
                      <span
                        key={l}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20"
                      >
                        {l}
                      </span>
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
                <button className="text-xs text-[#8CB89C] hover:text-[#8CB89C]/80 font-medium transition-colors">
                  Manage
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
    </div>
  );
}
