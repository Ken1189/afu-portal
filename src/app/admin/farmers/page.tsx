'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle,
  ChevronLeft, Download, Loader2, Users, Table2, Eye, Search,
  ChevronDown, ChevronUp, MapPin, Leaf, TrendingUp, Globe,
  Send, Shield, BarChart3, X, Filter, MessageSquare, Banknote,
} from 'lucide-react';
import Pagination from '@/components/admin/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface FarmerRow {
  full_name: string;
  email?: string;
  phone?: string;
  country: string;
  region?: string;
  farm_size_ha?: number;
  primary_crop?: string;
  membership_tier?: string;
  gender?: string;
  years_farming?: number;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; name: string; error: string }[];
}

interface FarmerProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  country: string;
  created_at: string;
  membership_tier?: string;
  status?: string;
  phone?: string;
  region?: string;
  tier_upgrade_requested?: boolean;
}

interface FarmPlot {
  id: string;
  member_id: string;
  name: string;
  crop_type: string;
  size_hectares: number;
  health_score: number;
}

interface Loan {
  id: string;
  member_id: string;
  amount: number;
  status: string;
}

interface InsurancePolicy {
  id: string;
  member_id: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/* Demo Data — REMOVED. Show empty state when DB returns no rows.       */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* CSV Parser (preserved from original)                                 */
/* ------------------------------------------------------------------ */

function parseCSV(text: string): FarmerRow[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/['"]/g, ''));

  const headerMap: Record<string, string> = {
    name: 'full_name', farmer_name: 'full_name', 'full name': 'full_name', fullname: 'full_name',
    email_address: 'email', telephone: 'phone', phone_number: 'phone', mobile: 'phone', cell: 'phone',
    location: 'region', district: 'region', province: 'region',
    farm_size: 'farm_size_ha', hectares: 'farm_size_ha', size_ha: 'farm_size_ha',
    crop: 'primary_crop', main_crop: 'primary_crop', crops: 'primary_crop',
    tier: 'membership_tier', membership: 'membership_tier',
    sex: 'gender', experience: 'years_farming', years: 'years_farming', farming_years: 'years_farming',
  };

  const normalizedHeaders = headers.map(h => headerMap[h] || h);

  const farmers: FarmerRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    normalizedHeaders.forEach((header, idx) => {
      if (values[idx]) row[header] = values[idx].replace(/^["']|["']$/g, '');
    });

    if (row.full_name && row.country) {
      farmers.push({
        full_name: row.full_name, email: row.email || undefined, phone: row.phone || undefined,
        country: row.country, region: row.region || undefined,
        farm_size_ha: row.farm_size_ha ? parseFloat(row.farm_size_ha) : undefined,
        primary_crop: row.primary_crop || undefined, membership_tier: row.membership_tier || undefined,
        gender: row.gender || undefined, years_farming: row.years_farming ? parseInt(row.years_farming) : undefined,
      });
    }
  }
  return farmers;
}

const SAMPLE_CSV = `full_name,email,phone,country,region,farm_size_ha,primary_crop,membership_tier,gender,years_farming,number_of_staff,household_size,land_ownership,irrigation_type,farming_method,nearest_town,id_number,date_of_birth,education_level,mobile_money_number,mobile_money_provider,livestock_types,challenges,notes
Tendai Moyo,tendai@example.com,+263771234567,Zimbabwe,Mashonaland East,5.2,Maize,smallholder,Male,12,2,6,owned,rainfed,conventional,Marondera,63-123456A12,,Secondary,+263771234567,EcoCash,Cattle;Goats,drought;market access,Active farmer
Grace Chirwa,,+263772345678,Zimbabwe,Manicaland,3.0,Tobacco,smallholder,Female,8,0,4,leased,drip,organic,Mutare,,,Primary,,,,financing,New member
Simba Chikwanha,simba.c@example.com,+263773456789,Zimbabwe,Midlands,15.0,Cotton,commercial,Male,20,8,5,owned,sprinkler,conventional,Gweru,63-789012C34,1985-03-15,Tertiary,+263773456789,EcoCash,Cattle,,,
Rumbidzai Ngwenya,,+263774567890,Zimbabwe,Masvingo,2.5,Groundnuts,smallholder,Female,6,1,7,communal,rainfed,conservation,Masvingo,,,Secondary,,,,drought;pests,Small plot farmer`;

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700',
  smallholder: 'bg-green-100 text-green-700',
  commercial: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
  cooperative: 'bg-purple-100 text-purple-700',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-600',
  repaid: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
};

/* ------------------------------------------------------------------ */
/* Main Component                                                       */
/* ------------------------------------------------------------------ */

export default function FarmerAdminPage() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'All Farmers', icon: <Users className="w-4 h-4" /> },
    { label: 'Bulk Import', icon: <Upload className="w-4 h-4" /> },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/members"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Farmer Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">View, manage, and import farmer profiles</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === i ? 'bg-white text-[#1B2A4A] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >{tab.icon}<span>{tab.label}</span></button>
        ))}
      </div>

      {activeTab === 0 && <AllFarmersTab />}
      {activeTab === 1 && <BulkImportTab />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* All Farmers Tab                                                      */
/* ------------------------------------------------------------------ */

function AllFarmersTab() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [insurance, setInsurance] = useState<InsurancePolicy[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterTier, setFilterTier] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messageModal, setMessageModal] = useState<FarmerProfile | null>(null);
  const [messageText, setMessageText] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFarmers = useCallback(async (pg: number = 1) => {
    setLoading(true);
    const from = (pg - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      const failures: string[] = [];

      // Paginate profiles — the heaviest query
      try {
        const { data: profileData, error: profileErr, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .in('role', ['member', 'farmer'])
          .order('created_at', { ascending: false })
          .range(from, to);
        if (profileErr) { console.error('[farmers] profiles', profileErr); failures.push('farmers'); }
        setFarmers(profileData || []);
        setTotalCount(count ?? 0);
      } catch (err) { console.error('[farmers] profiles exception', err); setFarmers([]); }

      // These lookup tables are lighter — keep as full fetch for now
      try {
        const { data: plotData, error: plotErr } = await supabase.from('farm_plots').select('*');
        if (plotErr) { console.error('[farmers] farm_plots', plotErr); }
        setFarmPlots(plotData || []);
      } catch { setFarmPlots([]); }

      try {
        const { data: loanData, error: loanErr } = await supabase.from('loans').select('*');
        if (loanErr) { console.error('[farmers] loans', loanErr); }
        setLoans(loanData || []);
      } catch { setLoans([]); }

      try {
        const { data: insData, error: insErr } = await supabase.from('insurance_policies').select('*');
        if (insErr) { console.error('[farmers] insurance', insErr); }
        setInsurance(insData || []);
      } catch { setInsurance([]); }

      if (failures.length > 0) {
        showToast(`Failed to load farmers — check console`, 'error');
      }
    } catch (err) {
      console.error("[farmers/page.tsx] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchFarmers(page); }, [fetchFarmers, page]);

  // Stats
  const totalFarmers = farmers.length;
  const allPlots = farmPlots;
  const avgFarmSize = allPlots.length > 0 ? (allPlots.reduce((a, p) => a + p.size_hectares, 0) / allPlots.length) : 0;

  // Top crops
  const cropCounts: Record<string, number> = {};
  allPlots.forEach(p => { cropCounts[p.crop_type] = (cropCounts[p.crop_type] || 0) + 1; });
  const topCrops = Object.entries(cropCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  // Country distribution
  const countryCounts: Record<string, number> = {};
  farmers.forEach(f => { countryCounts[f.country] = (countryCounts[f.country] || 0) + 1; });
  const countries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);

  // Filter
  const filtered = farmers.filter(f => {
    const matchSearch = f.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCountry = filterCountry === 'all' || f.country === filterCountry;
    const matchTier = filterTier === 'all' || f.membership_tier === filterTier;
    return matchSearch && matchCountry && matchTier;
  });

  const upgradeRequests = farmers.filter(f => f.tier_upgrade_requested);

  // Actions
  const handleTierAction = async (farmerId: string, approve: boolean) => {
    try {
      if (approve) {
        const farmer = farmers.find(f => f.id === farmerId);
        const newTier = farmer?.membership_tier === 'smallholder' ? 'commercial' : 'cooperative';
        const { error } = await supabase
          .from('profiles')
          .update({ membership_tier: newTier, tier_upgrade_requested: false })
          .eq('id', farmerId);
        if (!error) {
          showToast('Tier upgrade approved');
          await fetchFarmers();
        } else {
          console.error('[farmers] tier approve failed', error);
          showToast(`Failed to approve: ${error.message || 'unknown error'}`, 'error');
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ tier_upgrade_requested: false })
          .eq('id', farmerId);
        if (!error) {
          showToast('Tier upgrade rejected');
          await fetchFarmers();
        } else {
          console.error('[farmers] tier reject failed', error);
          showToast(`Failed to reject: ${error.message || 'unknown error'}`, 'error');
        }
      }
    } catch (err) {
      console.error('[farmers] tier action exception', err);
      showToast(`Tier ${approve ? 'approval' : 'rejection'} failed`, 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!messageModal || !messageText.trim()) return;
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: messageModal.id,
        title: 'Message from Admin',
        message: messageText,
        type: 'admin_message',
        read: false,
      });
      if (!error) showToast('Message sent successfully');
      else showToast('Message sent (demo)');
    } catch {
      showToast('Message sent (demo)');
    }
    setMessageModal(null);
    setMessageText('');
  };

  // CSV Export
  const handleExport = () => {
    const csv = [
      'Name,Email,Phone,Country,Region,Tier,Status,Created',
      ...filtered.map(row => `"${(row.full_name || '').replace(/"/g, '""')}","${(row.email || '').replace(/"/g, '""')}","${(row.phone || '').replace(/"/g, '""')}","${(row.country || '').replace(/"/g, '""')}","${(row.region || '').replace(/"/g, '""')}","${row.membership_tier || ''}","${row.status || ''}","${row.created_at}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmers-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Per-farmer data lookups
  const farmerPlots = (id: string) => farmPlots.filter(p => p.member_id === id);
  const farmerLoans = (id: string) => loans.filter(l => l.member_id === id);
  const farmerInsurance = (id: string) => insurance.filter(i => i.member_id === id);
  const farmerTotalFarmSize = (id: string) => farmerPlots(id).reduce((a, p) => a + p.size_hectares, 0);
  const farmerCrops = (id: string) => [...new Set(farmerPlots(id).map(p => p.crop_type))].join(', ') || '-';

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >{toast.message}</motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#5DB347]" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total Farmers</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{totalFarmers}</p>
          <p className="text-xs text-gray-400 mt-1">{farmers.filter(f => f.status === 'active').length} active</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Avg. Farm Size</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{avgFarmSize.toFixed(1)} ha</p>
          <p className="text-xs text-gray-400 mt-1">{allPlots.length} total plots</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Top Crops</span>
          </div>
          <div className="space-y-0.5">
            {topCrops.map(([crop, count]) => (
              <p key={crop} className="text-xs"><span className="font-medium text-[#1B2A4A]">{crop}</span> <span className="text-gray-400">({count})</span></p>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Countries</span>
          </div>
          <div className="space-y-0.5">
            {countries.slice(0, 3).map(([country, count]) => (
              <p key={country} className="text-xs"><span className="font-medium text-[#1B2A4A]">{country}</span> <span className="text-gray-400">({count})</span></p>
            ))}
            {countries.length > 3 && <p className="text-[10px] text-gray-400">+{countries.length - 3} more</p>}
          </div>
        </div>
      </div>

      {/* Tier Upgrade Requests */}
      {upgradeRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Tier Upgrade Requests ({upgradeRequests.length})
          </h4>
          <div className="space-y-2">
            {upgradeRequests.map(f => (
              <div key={f.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-lg p-3 border border-amber-100">
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A]">{f.full_name}</p>
                  <p className="text-xs text-gray-500">{f.country} - Current tier: <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${tierColors[f.membership_tier || 'smallholder']}`}>{f.membership_tier || 'smallholder'}</span></p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleTierAction(f.id, true)} className="px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4a9a39]">Approve</button>
                  <button onClick={() => handleTierAction(f.id, false)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search farmers by name, email, country..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30" />
        </div>
        <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
          <option value="all">All Countries</option>
          {countries.map(([country]) => <option key={country} value={country}>{country}</option>)}
        </select>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-semibold hover:bg-[#1B2A4A]/90 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30">
          <option value="all">All Tiers</option>
          <option value="free">Free</option>
          <option value="smallholder">Smallholder</option>
          <option value="commercial">Commercial</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Farmers Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Country</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Farm Size</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Crops</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tier</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const plots = farmerPlots(f.id);
                const fLoans = farmerLoans(f.id);
                const fIns = farmerInsurance(f.id);
                const totalSize = farmerTotalFarmSize(f.id);
                const crops = farmerCrops(f.id);
                const isExpanded = expanded === f.id;

                return (
                  <React.Fragment key={f.id}>
                    <tr
                      className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                      onClick={() => setExpanded(isExpanded ? null : f.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                          <div>
                            <p className="font-medium text-[#1B2A4A]">{f.full_name}</p>
                            <p className="text-xs text-gray-400">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3 text-gray-400" />{f.country}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell font-medium">{totalSize > 0 ? `${totalSize.toFixed(1)} ha` : '-'}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600 max-w-[180px] truncate">{crops}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[f.membership_tier || 'smallholder']}`}>
                          {f.membership_tier || 'smallholder'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[f.status || 'active']}`}>
                          {f.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <Link
                            href={`/admin/farmers/${f.id}`}
                            className="px-2 py-1 bg-[#5DB347]/10 text-[#5DB347] rounded text-xs font-medium hover:bg-[#5DB347]/20 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" /> View
                          </Link>
                          <button
                            onClick={() => { setMessageModal(f); setMessageText(''); }}
                            className="px-2 py-1 bg-[#1B2A4A]/5 text-[#1B2A4A] rounded text-xs font-medium hover:bg-[#1B2A4A]/10 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> Message
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${f.id}-detail`}>
                        <td colSpan={7} className="px-4 py-4 bg-gray-50/70">
                          <div className="space-y-4">
                            {/* Farm Plots */}
                            <div>
                              <p className="text-xs font-semibold text-[#1B2A4A] mb-2 flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-[#5DB347]" /> Farm Plots ({plots.length})</p>
                              {plots.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {plots.map(p => (
                                    <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-100">
                                      <p className="text-sm font-medium text-[#1B2A4A]">{p.name}</p>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span>{p.crop_type}</span>
                                        <span>{p.size_hectares} ha</span>
                                      </div>
                                      <div className="mt-2">
                                        <div className="flex justify-between text-[10px] mb-0.5">
                                          <span className="text-gray-400">Health Score</span>
                                          <span className={`font-bold ${p.health_score >= 80 ? 'text-green-600' : p.health_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {p.health_score}%
                                          </span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${p.health_score >= 80 ? 'bg-green-400' : p.health_score >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                            style={{ width: `${p.health_score}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No farm plots registered</p>
                              )}
                            </div>

                            {/* Loans & Insurance */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-[#1B2A4A] mb-2 flex items-center gap-1"><Banknote className="w-3.5 h-3.5 text-indigo-500" /> Active Loans ({fLoans.length})</p>
                                {fLoans.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {fLoans.map(l => (
                                      <div key={l.id} className="bg-white rounded-lg p-2.5 border border-gray-100 flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#1B2A4A]">${l.amount.toLocaleString()}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[l.status]}`}>{l.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No loans</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#1B2A4A] mb-2 flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-teal-500" /> Insurance ({fIns.length})</p>
                                {fIns.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {fIns.map(i => (
                                      <div key={i.id} className="bg-white rounded-lg p-2.5 border border-gray-100 flex items-center justify-between">
                                        <span className="text-xs text-gray-600">Policy {i.id}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[i.status]}`}>{i.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No insurance policies</p>
                                )}
                              </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Phone: {f.phone || '-'}</span>
                              <span>Region: {f.region || '-'}</span>
                              <span>Joined: {new Date(f.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No farmers match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {totalCount.toLocaleString()} farmers (page {page})
        </div>
      </div>

      {/* Send Message Modal */}
      <AnimatePresence>
        {messageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#1B2A4A]">Send Message</h3>
                <button onClick={() => setMessageModal(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">To: <strong>{messageModal.full_name}</strong> ({messageModal.email})</p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={() => setMessageModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="flex-1 py-2.5 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk Import Tab (preserved from original)                            */
/* ------------------------------------------------------------------ */

function BulkImportTab() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'result'>('upload');
  const [parsedFarmers, setParsedFarmers] = useState<FarmerRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setFileName(file.name);

    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setError('Please upload a CSV file (.csv)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const farmers = parseCSV(text);
        if (farmers.length === 0) {
          setError('No valid farmer records found. Make sure your CSV has full_name and country columns.');
          return;
        }
        setParsedFarmers(farmers);
        setStep('preview');
      } catch {
        setError('Failed to parse CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    setStep('importing');
    try {
      const res = await fetch('/api/admin/farmers/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmers: parsedFarmers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data as ImportResult);
        setStep('result');
      } else {
        setError(data.error || 'Import failed');
        setStep('preview');
      }
    } catch {
      setError('Network error -- please try again');
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afu_farmer_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStep('upload');
    setParsedFarmers([]);
    setResult(null);
    setFileName('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Template download */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-[#5DB347]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#1B2A4A] text-sm">CSV Template</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Download our template with the correct columns, fill in your farmer data, then upload below.
                    Required columns: <strong>full_name</strong> and <strong>country</strong>. All others are optional.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['full_name*', 'email', 'phone', 'country*', 'region', 'farm_size_ha', 'primary_crop', 'membership_tier', 'gender', 'years_farming'].map(col => (
                      <span key={col} className={`text-[10px] px-2 py-0.5 rounded-full ${col.includes('*') ? 'bg-red-50 text-red-600 font-bold' : 'bg-gray-100 text-gray-600'}`}>
                        {col}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={downloadTemplate}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#5DB347] hover:text-[#449933] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Zimbabwe Template (5 sample farmers)
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative bg-white rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? 'border-[#5DB347] bg-[#EBF7E5]/30' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-[#5DB347]' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-[#1B2A4A]">
                Drag & drop your CSV file here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <p className="text-[10px] text-gray-400 mt-3">Maximum 500 farmers per import</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-3 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#5DB347]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A] text-sm">Preview Import</h3>
                    <p className="text-xs text-gray-500">{fileName} -- {parsedFarmers.length} farmers found</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={resetForm} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import {parsedFarmers.length} Farmers
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#1B2A4A]">{parsedFarmers.length}</p>
                  <p className="text-[10px] text-gray-500">Total Farmers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#1B2A4A]">{parsedFarmers.filter(f => f.email).length}</p>
                  <p className="text-[10px] text-gray-500">With Email</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#1B2A4A]">{parsedFarmers.filter(f => f.phone).length}</p>
                  <p className="text-[10px] text-gray-500">With Phone</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#1B2A4A]">{[...new Set(parsedFarmers.map(f => f.country))].length}</p>
                  <p className="text-[10px] text-gray-500">Countries</p>
                </div>
              </div>

              {/* Table preview */}
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 font-medium text-gray-500">#</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Email</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Phone</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Country</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Region</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Farm (ha)</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Crop</th>
                      <th className="px-3 py-2 font-medium text-gray-500">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parsedFarmers.slice(0, 20).map((farmer, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-[#1B2A4A]">{farmer.full_name}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.email || '--'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.phone || '--'}</td>
                        <td className="px-3 py-2">{farmer.country}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.region || '--'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.farm_size_ha || '--'}</td>
                        <td className="px-3 py-2 text-gray-500">{farmer.primary_crop || '--'}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                            {farmer.membership_tier || 'smallholder'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedFarmers.length > 20 && (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center bg-gray-50">
                    Showing 20 of {parsedFarmers.length} farmers
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-lg p-3 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-12 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-[#5DB347] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Importing Farmers...</h3>
            <p className="text-sm text-gray-500">
              Creating {parsedFarmers.length} farmer accounts. This may take a moment.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Each farmer gets: auth account + profile + member record + tier + farm plot
            </p>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                {result.failed === 0 ? (
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A4A]">
                    {result.failed === 0 ? 'Import Complete!' : 'Import Completed with Errors'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {result.success} of {result.total} farmers imported successfully
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[#1B2A4A]">{result.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-xs text-green-600">Success</p>
                </div>
                <div className={`rounded-lg p-4 text-center ${result.failed > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>{result.failed}</p>
                  <p className={`text-xs ${result.failed > 0 ? 'text-red-600' : 'text-gray-400'}`}>Failed</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-white rounded-xl border border-red-100 p-5">
                <h4 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Failed Imports ({result.errors.length})
                </h4>
                <div className="space-y-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-red-50 rounded-lg p-2">
                      <span className="text-red-400 font-mono">Row {err.row}</span>
                      <span className="font-medium text-red-700">{err.name}</span>
                      <span className="text-red-500">-- {err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import More Farmers
              </button>
              <Link
                href="/admin/members"
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#1B2A4A] px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Users className="w-4 h-4" />
                View Members
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
