'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sprout,
  FileCheck,
  FileX,
  Globe,
  Users,
  TrendingUp,
  BarChart3,
  Calendar,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useApplications } from '@/lib/supabase/use-applications';

// ── Animation variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Types ──
type TabKey = 'pending' | 'all' | 'statistics';
type AppStatus = 'pending' | 'approved' | 'rejected' | 'waitlisted';

interface PendingApplication {
  id: string;
  name: string;
  country: string;
  flag: string;
  tier: string;
  farmSize: string;
  crops: string[];
  submissionDate: string;
  documents: { name: string; submitted: boolean }[];
  location: string;
  experience: string;
  expectedRevenue: string;
  references: string[];
}

interface AllApplication {
  id: string;
  name: string;
  country: string;
  tier: string;
  date: string;
  status: AppStatus;
  reviewer: string;
}

// ── Mock Data ──
const pendingApplications: PendingApplication[] = [
  {
    id: 'APP-2026-089', name: 'Tendai Moyo', country: 'Zimbabwe', flag: '🇿🇼', tier: 'Tier A - Commercial',
    farmSize: '45 hectares', crops: ['Blueberries', 'Avocados', 'Macadamia'],
    submissionDate: 'Mar 14, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: false }],
    location: 'Manicaland Province, Mutare', experience: '12 years', expectedRevenue: '$120,000/yr', references: ['John Kamau (AFU-2024-015)', 'Grace Nyathi (AFU-2024-003)'],
  },
  {
    id: 'APP-2026-088', name: 'Baraka Mwanga', country: 'Tanzania', flag: '🇹🇿', tier: 'Tier B - Smallholder',
    farmSize: '8 hectares', crops: ['Coffee', 'Vanilla'],
    submissionDate: 'Mar 13, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: false }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: true }],
    location: 'Kilimanjaro Region, Moshi', experience: '7 years', expectedRevenue: '$35,000/yr', references: ['Samuel Nkomo (AFU-2024-028)'],
  },
  {
    id: 'APP-2026-087', name: 'Amina Okafor', country: 'Kenya', flag: '🇰🇪', tier: 'Tier A - Commercial',
    farmSize: '60 hectares', crops: ['Tea', 'Flowers', 'Avocados'],
    submissionDate: 'Mar 12, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: true }],
    location: 'Nakuru County, Naivasha', experience: '15 years', expectedRevenue: '$200,000/yr', references: ['David Kamau (AFU-2024-012)', 'Rose Muthoni (AFU-2024-022)'],
  },
  {
    id: 'APP-2026-086', name: 'Peter Banda', country: 'Botswana', flag: '🇧🇼', tier: 'Tier B - Smallholder',
    farmSize: '12 hectares', crops: ['Sorghum', 'Cowpeas'],
    submissionDate: 'Mar 11, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: false }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: false }],
    location: 'North-East District, Francistown', experience: '5 years', expectedRevenue: '$18,000/yr', references: ['Sarah Dube (AFU-2024-005)'],
  },
  {
    id: 'APP-2026-085', name: 'Fatima Hassan', country: 'Tanzania', flag: '🇹🇿', tier: 'Tier A - Commercial',
    farmSize: '35 hectares', crops: ['Cashews', 'Sesame', 'Coconut'],
    submissionDate: 'Mar 10, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: true }],
    location: 'Lindi Region, Lindi', experience: '10 years', expectedRevenue: '$85,000/yr', references: ['Baraka Mwanga (AFU-2024-004)', 'Joseph Okello (AFU-2025-033)'],
  },
  {
    id: 'APP-2026-084', name: 'Blessing Chirwa', country: 'Zimbabwe', flag: '🇿🇼', tier: 'Tier C - Enterprise',
    farmSize: '120 hectares', crops: ['Tobacco', 'Maize', 'Soybeans', 'Wheat'],
    submissionDate: 'Mar 9, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: true }],
    location: 'Mashonaland Central, Bindura', experience: '20 years', expectedRevenue: '$450,000/yr', references: ['Tendai Chuma (AFU-2024-001)', 'Grace Nyathi (AFU-2024-003)', 'Sarah Dube (AFU-2024-005)'],
  },
  {
    id: 'APP-2026-083', name: 'Agnes Wanjiku', country: 'Kenya', flag: '🇰🇪', tier: 'Tier B - Smallholder',
    farmSize: '6 hectares', crops: ['Coffee', 'Bananas'],
    submissionDate: 'Mar 8, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: false }, { name: 'Bank Statement', submitted: false }, { name: 'Crop Certification', submitted: true }],
    location: 'Nyeri County, Nyeri', experience: '4 years', expectedRevenue: '$22,000/yr', references: ['Amina Okafor (pending)'],
  },
  {
    id: 'APP-2026-082', name: 'Thomas Mensah', country: 'Botswana', flag: '🇧🇼', tier: 'Tier A - Commercial',
    farmSize: '50 hectares', crops: ['Citrus', 'Grapes', 'Melons'],
    submissionDate: 'Mar 7, 2026',
    documents: [{ name: 'ID Document', submitted: true }, { name: 'Farm Title', submitted: true }, { name: 'Tax Clearance', submitted: true }, { name: 'Bank Statement', submitted: true }, { name: 'Crop Certification', submitted: false }],
    location: 'Gaborone District', experience: '9 years', expectedRevenue: '$95,000/yr', references: ['Peter Banda (pending)', 'Sarah Dube (AFU-2024-005)'],
  },
];

const allApplications: AllApplication[] = [
  { id: 'APP-2026-089', name: 'Tendai Moyo', country: 'Zimbabwe', tier: 'Tier A', date: 'Mar 14, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-088', name: 'Baraka Mwanga', country: 'Tanzania', tier: 'Tier B', date: 'Mar 13, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-087', name: 'Amina Okafor', country: 'Kenya', tier: 'Tier A', date: 'Mar 12, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-086', name: 'Peter Banda', country: 'Botswana', tier: 'Tier B', date: 'Mar 11, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-085', name: 'Fatima Hassan', country: 'Tanzania', tier: 'Tier A', date: 'Mar 10, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-084', name: 'Blessing Chirwa', country: 'Zimbabwe', tier: 'Tier C', date: 'Mar 9, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-083', name: 'Agnes Wanjiku', country: 'Kenya', tier: 'Tier B', date: 'Mar 8, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-082', name: 'Thomas Mensah', country: 'Botswana', tier: 'Tier A', date: 'Mar 7, 2026', status: 'pending', reviewer: '-' },
  { id: 'APP-2026-078', name: 'Grace Nyathi', country: 'Zimbabwe', tier: 'Tier A', date: 'Mar 1, 2026', status: 'approved', reviewer: 'Tendai C.' },
  { id: 'APP-2026-075', name: 'Samuel Nkomo', country: 'Tanzania', tier: 'Tier B', date: 'Feb 28, 2026', status: 'approved', reviewer: 'Sarah D.' },
  { id: 'APP-2026-072', name: 'Rose Muthoni', country: 'Kenya', tier: 'Tier A', date: 'Feb 25, 2026', status: 'approved', reviewer: 'Tendai C.' },
  { id: 'APP-2026-070', name: 'David Kamau', country: 'Kenya', tier: 'Tier C', date: 'Feb 22, 2026', status: 'approved', reviewer: 'Sarah D.' },
  { id: 'APP-2026-068', name: 'Joseph Okello', country: 'Tanzania', tier: 'Tier B', date: 'Feb 20, 2026', status: 'rejected', reviewer: 'Tendai C.' },
  { id: 'APP-2026-065', name: 'Martha Nzimande', country: 'Zimbabwe', tier: 'Tier B', date: 'Feb 18, 2026', status: 'approved', reviewer: 'Sarah D.' },
  { id: 'APP-2026-062', name: 'Michael Addo', country: 'Botswana', tier: 'Tier A', date: 'Feb 15, 2026', status: 'waitlisted', reviewer: 'Tendai C.' },
  { id: 'APP-2026-060', name: 'Lillian Okafor', country: 'Kenya', tier: 'Tier B', date: 'Feb 12, 2026', status: 'approved', reviewer: 'Sarah D.' },
  { id: 'APP-2026-055', name: 'James Kariuki', country: 'Kenya', tier: 'Tier A', date: 'Feb 8, 2026', status: 'rejected', reviewer: 'Tendai C.' },
  { id: 'APP-2026-050', name: 'Esther Wanjiku', country: 'Tanzania', tier: 'Tier C', date: 'Feb 5, 2026', status: 'approved', reviewer: 'Sarah D.' },
];

// ── Statistics Data ──
const monthlyApps = [
  { month: 'Oct', count: 12 }, { month: 'Nov', count: 18 }, { month: 'Dec', count: 15 },
  { month: 'Jan', count: 22 }, { month: 'Feb', count: 28 }, { month: 'Mar', count: 19 },
];
const approvalByTier = [
  { tier: 'Tier A', rate: 78 }, { tier: 'Tier B', rate: 65 }, { tier: 'Tier C', rate: 85 },
];
const topCountries = [
  { country: 'Kenya', count: 42 }, { country: 'Zimbabwe', count: 38 }, { country: 'Tanzania', count: 31 }, { country: 'Botswana', count: 18 },
];
const rejectionReasons = [
  { reason: 'Incomplete Documents', count: 12 }, { reason: 'Insufficient Experience', count: 8 },
  { reason: 'Below Farm Size Threshold', count: 5 }, { reason: 'Failed Verification', count: 3 },
  { reason: 'Region Not Covered', count: 2 },
];

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminApplicationsPage() {
  const { applications: liveApps, loading: appsLoading, stats: appStats, approveApplication, rejectApplication } = useApplications();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | AppStatus>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'pending', label: `Pending${appStats.pending > 0 ? ` (${appStats.pending})` : ''}` },
    { key: 'all', label: 'All Applications' },
    { key: 'statistics', label: 'Statistics' },
  ];

  // ── Stats — use live data if available, fall back to mock ──
  const totalApps = liveApps.length > 0 ? liveApps.length : allApplications.length;
  const pendingCount = liveApps.length > 0 ? appStats.pending : allApplications.filter((a) => a.status === 'pending').length;
  const approvedMtd = liveApps.length > 0 ? appStats.approved : allApplications.filter((a) => a.status === 'approved' && a.date.includes('Mar')).length;
  const rejectedMtd = liveApps.length > 0 ? appStats.rejected : allApplications.filter((a) => a.status === 'rejected' && a.date.includes('Mar')).length;

  // ── Filtered all applications (use live if available) ──
  const allAppsData = liveApps.length > 0
    ? liveApps.map(a => ({
        id: a.id.slice(0, 8),
        name: a.full_name,
        country: a.country,
        tier: a.requested_tier || 'smallholder',
        date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: a.status as AppStatus,
        reviewer: a.reviewed_by ? 'Admin' : '-',
      }))
    : allApplications;

  const filteredAll = allAppsData.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || a.country === countryFilter;
    const matchesSearch = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCountry && matchesSearch;
  });

  const maxMonthly = Math.max(...monthlyApps.map((m) => m.count));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Membership Applications</h1>
            <p className="text-gray-500 text-sm mt-0.5">Review and manage membership applications</p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: totalApps, icon: <Users className="w-5 h-5" />, color: 'text-[#1B2A4A]', iconBg: 'bg-[#1B2A4A]/10' },
          { label: 'Pending Review', value: pendingCount, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', iconBg: 'bg-amber-50' },
          { label: 'Approved (MTD)', value: approvedMtd, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', iconBg: 'bg-green-50' },
          { label: 'Rejected (MTD)', value: rejectedMtd, icon: <XCircle className="w-5 h-5" />, color: 'text-red-500', iconBg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Tab Switcher ── */}
      <motion.div variants={cardVariants} className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1B2A4A] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* ===== PENDING TAB ===== */}
      {activeTab === 'pending' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
          {pendingApplications.map((app) => {
            const isExpanded = expandedApp === app.id;
            const docsComplete = app.documents.filter((d) => d.submitted).length;
            const docsTotal = app.documents.length;
            return (
              <motion.div key={app.id} variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Summary Row */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {app.flag}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1B2A4A]">{app.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{app.country}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2AA198]/10 text-[#2AA198] font-medium">{app.tier}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Sprout className="w-3 h-3" /> {app.farmSize}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          {app.crops.map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 rounded text-[10px]">{c}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{app.submissionDate}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {app.documents.map((doc, i) => (
                            doc.submitted
                              ? <FileCheck key={i} className="w-3 h-3 text-green-500" />
                              : <FileX key={i} className="w-3 h-3 text-red-400" />
                          ))}
                          <span className="text-[10px] text-gray-400 ml-1">{docsComplete}/{docsTotal}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                        className="p-2 text-gray-400 hover:text-[#1B2A4A] hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Farm Details</h5>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs"><MapPin className="w-3 h-3 text-gray-400" /> <span className="text-gray-600">{app.location}</span></div>
                              <div className="flex items-center gap-2 text-xs"><Sprout className="w-3 h-3 text-gray-400" /> <span className="text-gray-600">{app.farmSize}</span></div>
                              <div className="flex items-center gap-2 text-xs"><Clock className="w-3 h-3 text-gray-400" /> <span className="text-gray-600">{app.experience} experience</span></div>
                              <div className="flex items-center gap-2 text-xs"><TrendingUp className="w-3 h-3 text-gray-400" /> <span className="text-gray-600">{app.expectedRevenue}</span></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase">Documents</h5>
                            <div className="space-y-1">
                              {app.documents.map((doc, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  {doc.submitted ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />}
                                  <span className={doc.submitted ? 'text-gray-600' : 'text-red-500'}>{doc.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase">References</h5>
                            <div className="space-y-1">
                              {app.references.map((ref, i) => (
                                <p key={i} className="text-xs text-gray-600">{ref}</p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                          <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <input
                            type="text"
                            placeholder="Reason (optional for approve, required for reject)"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#2AA198]/50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ===== ALL APPLICATIONS TAB ===== */}
      {activeTab === 'all' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {/* Filters */}
          <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/50 w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/50"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="waitlisted">Waitlisted</option>
            </select>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2AA198]/50"
            >
              <option value="all">All Countries</option>
              <option value="Zimbabwe">Zimbabwe</option>
              <option value="Tanzania">Tanzania</option>
              <option value="Kenya">Kenya</option>
              <option value="Botswana">Botswana</option>
            </select>
          </motion.div>

          {/* Table */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Country</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tier</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reviewer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAll.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-mono text-gray-500">{app.id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-[#1B2A4A]">{app.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{app.country}</td>
                      <td className="px-6 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{app.tier}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-400">{app.date}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          app.status === 'approved' ? 'bg-green-100 text-green-700' :
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">{app.reviewer}</td>
                      <td className="px-6 py-3">
                        <button className="text-xs font-medium text-[#2AA198] hover:text-[#2AA198]/80 transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ===== STATISTICS TAB ===== */}
      {activeTab === 'statistics' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications by Month */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Applications by Month
              </h3>
              <div className="flex items-end gap-3 h-40">
                {monthlyApps.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-[#1B2A4A]">{m.count}</span>
                    <div
                      className="w-full bg-[#2AA198] rounded-t-md transition-all"
                      style={{ height: `${(m.count / maxMonthly) * 100}%` }}
                    />
                    <span className="text-[10px] text-gray-400">{m.month}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Approval Rate by Tier */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Approval Rate by Tier
              </h3>
              <div className="space-y-4">
                {approvalByTier.map((t, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{t.tier}</span>
                      <span className="font-semibold text-[#1B2A4A]">{t.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          t.rate >= 80 ? 'bg-green-500' : t.rate >= 70 ? 'bg-[#2AA198]' : 'bg-[#D4A843]'
                        }`}
                        style={{ width: `${t.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Average Review Time</span>
                  <span className="font-semibold text-[#1B2A4A]">3.2 days</span>
                </div>
              </div>
            </motion.div>

            {/* Top Countries */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Top Countries of Origin
              </h3>
              <div className="space-y-3">
                {topCountries.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{c.country}</span>
                      <span className="font-medium text-[#1B2A4A]">{c.count} applications</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[#1B2A4A]"
                        style={{ width: `${(c.count / topCountries[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rejection Reasons */}
            <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Rejection Reasons
              </h3>
              <div className="space-y-3">
                {rejectionReasons.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm text-gray-600">{r.reason}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1B2A4A]">{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-400">
                Total rejections: {rejectionReasons.reduce((s, r) => s + r.count, 0)} (last 6 months)
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
