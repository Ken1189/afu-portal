'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Award, TrendingUp, DollarSign, ClipboardList, CheckCircle2,
  Clock, MapPin, Camera, Calendar, ChevronDown, ArrowLeft, Loader2,
  BadgeCheck, ShieldCheck, TreePine, Sprout as SproutIcon, Recycle,
  Wallet, Users, FileText, Plus, X, AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CarbonProject {
  id: string;
  name: string;
  description: string;
  methodology: string;
  registry: string;
  country: string;
  region: string;
  eligible_practices: string[];
  price_per_credit: number;
  co_benefits: string[];
  status: string;
  target_credits: number;
}

interface Enrollment {
  id: string;
  project_id: string;
  plot_id: string;
  practices_committed: string[];
  status: string;
  enrolled_at: string;
  credits_earned: number;
  revenue_earned: number;
  carbon_projects?: { name: string; registry: string };
}

interface CarbonPractice {
  id: string;
  practice_type: string;
  description: string;
  practice_date: string;
  gps_lat: number | null;
  gps_lng: number | null;
  photo_url: string | null;
  carbon_estimate_tonnes: number;
  verification_status: string;
}

interface CarbonCredit {
  id: string;
  serial_number: string;
  vintage_year: number;
  quantity: number;
  status: string;
  price_per_tonne: number;
  project_id: string;
  carbon_projects?: { name: string; registry: string };
}

interface FarmPlot {
  id: string;
  name: string;
  size_ha: number | null;
  crop: string | null;
  location: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const PRACTICE_TYPES = [
  { value: 'no_till', label: 'No-Till Farming', icon: '🌱' },
  { value: 'cover_crops', label: 'Cover Crops', icon: '🌿' },
  { value: 'crop_rotation', label: 'Crop Rotation', icon: '🔄' },
  { value: 'agroforestry', label: 'Agroforestry', icon: '🌳' },
  { value: 'tree_planting', label: 'Tree Planting', icon: '🌲' },
  { value: 'composting', label: 'Composting', icon: '♻️' },
  { value: 'organic_farming', label: 'Organic Farming', icon: '🌾' },
  { value: 'biochar', label: 'Biochar', icon: '🔥' },
  { value: 'rotational_grazing', label: 'Rotational Grazing', icon: '🐄' },
  { value: 'mulching', label: 'Mulching', icon: '🍂' },
];

const TABS = [
  { key: 'projects', label: 'Available Projects', icon: TreePine },
  { key: 'enrollments', label: 'My Enrollments', icon: ClipboardList },
  { key: 'log', label: 'Log Practice', icon: SproutIcon },
  { key: 'credits', label: 'My Credits', icon: Award },
  { key: 'earnings', label: 'Earnings', icon: Wallet },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── Demo fallback data ───────────────────────────────────────────────────────

const demoProjects: CarbonProject[] = [
  { id: 'p1', name: 'Chobe Agroforestry Initiative', description: 'Large-scale agroforestry carbon sequestration across Chobe District', methodology: 'VM0042 - Agroforestry', registry: 'Verra', country: 'Botswana', region: 'Chobe', eligible_practices: ['agroforestry', 'tree_planting', 'composting'], price_per_credit: 18.5, co_benefits: ['Biodiversity', 'Water Conservation', 'Community'], status: 'active', target_credits: 5000 },
  { id: 'p2', name: 'Makgadikgadi Soil Carbon Project', description: 'Regenerative agriculture practices increasing soil organic carbon', methodology: 'GS-Soil-001 - Soil Carbon', registry: 'Gold Standard', country: 'Botswana', region: 'Makgadikgadi', eligible_practices: ['no_till', 'cover_crops', 'crop_rotation', 'composting'], price_per_credit: 22, co_benefits: ['Soil Health', 'Water Retention', 'Biodiversity'], status: 'active', target_credits: 3000 },
  { id: 'p3', name: 'Eastern Highlands Conservation Tillage', description: 'Conservation tillage reducing emissions across Zimbabwe highlands', methodology: 'VM0017 - Conservation Tillage', registry: 'Verra', country: 'Zimbabwe', region: 'Mashonaland', eligible_practices: ['no_till', 'cover_crops', 'mulching', 'crop_rotation'], price_per_credit: 14.25, co_benefits: ['Soil Health', 'Erosion Prevention'], status: 'active', target_credits: 4000 },
  { id: 'p4', name: 'Serengeti Biochar Programme', description: 'Biochar production from agricultural waste in buffer zones', methodology: 'Puro-BC-001 - Biochar', registry: 'Gold Standard', country: 'Tanzania', region: 'Serengeti', eligible_practices: ['biochar', 'composting', 'organic_farming'], price_per_credit: 85, co_benefits: ['Soil Fertility', 'Waste Reduction', 'Community'], status: 'active', target_credits: 1000 },
];

const demoEnrollments: Enrollment[] = [
  { id: 'e1', project_id: 'p1', plot_id: 'plot1', practices_committed: ['agroforestry', 'tree_planting'], status: 'active', enrolled_at: '2025-06-15', credits_earned: 12.5, revenue_earned: 231.25, carbon_projects: { name: 'Chobe Agroforestry Initiative', registry: 'Verra' } },
  { id: 'e2', project_id: 'p2', plot_id: 'plot2', practices_committed: ['no_till', 'cover_crops', 'composting'], status: 'active', enrolled_at: '2025-08-01', credits_earned: 8.2, revenue_earned: 180.4, carbon_projects: { name: 'Makgadikgadi Soil Carbon Project', registry: 'Gold Standard' } },
];

const demoPractices: CarbonPractice[] = [
  { id: 'pr1', practice_type: 'no_till', description: 'Applied no-till farming on 3ha maize plot', practice_date: '2025-11-15', gps_lat: -20.15, gps_lng: 28.58, photo_url: null, carbon_estimate_tonnes: 1.5, verification_status: 'verified' },
  { id: 'pr2', practice_type: 'cover_crops', description: 'Planted velvet bean cover crop after maize harvest', practice_date: '2025-10-20', gps_lat: -20.16, gps_lng: 28.59, photo_url: null, carbon_estimate_tonnes: 2.4, verification_status: 'pending' },
  { id: 'pr3', practice_type: 'composting', description: 'Applied 2 tonnes of compost to vegetable garden', practice_date: '2025-09-10', gps_lat: null, gps_lng: null, photo_url: null, carbon_estimate_tonnes: 1.2, verification_status: 'verified' },
];

const demoCredits: CarbonCredit[] = [
  { id: 'c1', serial_number: 'ACR-2025-0012', vintage_year: 2025, quantity: 12.5, status: 'issued', price_per_tonne: 18.5, project_id: 'p1', carbon_projects: { name: 'Chobe Agroforestry Initiative', registry: 'Verra' } },
  { id: 'c2', serial_number: 'ACR-2025-0045', vintage_year: 2025, quantity: 8.2, status: 'issued', price_per_tonne: 22, project_id: 'p2', carbon_projects: { name: 'Makgadikgadi Soil Carbon Project', registry: 'Gold Standard' } },
];

const demoPlots: FarmPlot[] = [
  { id: 'plot1', name: 'North Field', size_ha: 5, crop: 'Maize', location: 'Chobe District' },
  { id: 'plot2', name: 'South Plot', size_ha: 3, crop: 'Sorghum', location: 'Makgadikgadi' },
  { id: 'plot3', name: 'Vegetable Garden', size_ha: 1, crop: 'Mixed vegetables', location: 'Home Farm' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function CarbonCreditsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabKey>('projects');
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<CarbonProject[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [practices, setPractices] = useState<CarbonPractice[]>([]);
  const [credits, setCredits] = useState<CarbonCredit[]>([]);
  const [plots, setPlots] = useState<FarmPlot[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Enroll form state
  const [enrollModal, setEnrollModal] = useState<CarbonProject | null>(null);
  const [enrollPlot, setEnrollPlot] = useState('');
  const [enrollPractices, setEnrollPractices] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);

  // Practice log form state
  const [practiceForm, setPracticeForm] = useState({
    practice_type: '',
    description: '',
    practice_date: new Date().toISOString().split('T')[0],
    gps_lat: '',
    gps_lng: '',
    photo_url: '',
  });
  const [loggingPractice, setLoggingPractice] = useState(false);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Fetch data ───────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projRes = await fetch('/api/carbon/projects');
      const projData = await projRes.json();
      setProjects(projData.projects?.length ? projData.projects : demoProjects);

      if (user) {
        // Fetch enrollments
        const { data: enrollData } = await supabase
          .from('carbon_enrollments')
          .select('*, carbon_projects(name, registry)')
          .eq('farmer_id', user.id)
          .order('enrolled_at', { ascending: false });
        setEnrollments(enrollData?.length ? enrollData : demoEnrollments);

        // Fetch practices
        const practRes = await fetch('/api/carbon/practices');
        const practData = await practRes.json();
        setPractices(practData.practices?.length ? practData.practices : demoPractices);

        // Fetch credits
        const { data: creditData } = await supabase
          .from('carbon_credits')
          .select('*, carbon_projects(name, registry)')
          .order('created_at', { ascending: false });
        setCredits(creditData?.length ? creditData : demoCredits);

        // Fetch farm plots
        const { data: plotData } = await supabase
          .from('farm_plots')
          .select('id, name, size_ha, crop, location')
          .eq('member_id', user.id);
        setPlots(plotData?.length ? plotData : demoPlots);
      } else {
        setEnrollments(demoEnrollments);
        setPractices(demoPractices);
        setCredits(demoCredits);
        setPlots(demoPlots);
      }
    } catch {
      setProjects(demoProjects);
      setEnrollments(demoEnrollments);
      setPractices(demoPractices);
      setCredits(demoCredits);
      setPlots(demoPlots);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── KPI calculations ─────────────────────────────────────────────────────

  const totalCreditsEarned = credits.reduce((s, c) => s + (c.quantity || 0), 0);
  const totalRevenue = credits.reduce((s, c) => s + (c.quantity || 0) * (c.price_per_tonne || 0), 0);
  const activeEnrollments = enrollments.filter(e => e.status === 'active').length;
  const practicesLogged = practices.length;

  // ── Enroll handler ────────────────────────────────────────────────────────

  const handleEnroll = async () => {
    if (!enrollModal || !enrollPlot || !enrollPractices.length) return;
    setEnrolling(true);
    try {
      const res = await fetch('/api/carbon/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: enrollModal.id,
          plot_id: enrollPlot,
          practices: enrollPractices,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', `Successfully enrolled in ${enrollModal.name}!`);
        setEnrollModal(null);
        setEnrollPlot('');
        setEnrollPractices([]);
        fetchData();
      } else {
        showToast('error', data.error || 'Failed to enroll');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    }
    setEnrolling(false);
  };

  // ── Log practice handler ──────────────────────────────────────────────────

  const handleLogPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceForm.practice_type || !practiceForm.practice_date) return;
    setLoggingPractice(true);
    try {
      const res = await fetch('/api/carbon/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...practiceForm,
          gps_lat: practiceForm.gps_lat ? parseFloat(practiceForm.gps_lat) : null,
          gps_lng: practiceForm.gps_lng ? parseFloat(practiceForm.gps_lng) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('success', 'Practice logged successfully!');
        setPracticeForm({ practice_type: '', description: '', practice_date: new Date().toISOString().split('T')[0], gps_lat: '', gps_lng: '', photo_url: '' });
        fetchData();
      } else {
        showToast('error', data.error || 'Failed to log practice');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    }
    setLoggingPractice(false);
  };

  const getGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPracticeForm(p => ({ ...p, gps_lat: String(pos.coords.latitude), gps_lng: String(pos.coords.longitude) }));
          showToast('success', 'GPS location captured');
        },
        () => showToast('error', 'Could not get GPS location')
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-[#5DB347]' : 'bg-red-500'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/farm/sustainability" className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Carbon Credits</h1>
          <p className="text-sm text-gray-500">Earn income from sustainable farming practices</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Credits Earned', value: `${totalCreditsEarned.toFixed(1)} t`, icon: Award, color: '#5DB347' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: '#10B981' },
          { label: 'Active Enrollments', value: activeEnrollments, icon: ClipboardList, color: '#6366F1' },
          { label: 'Practices Logged', value: practicesLogged, icon: Leaf, color: '#F59E0B' },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}15` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-[#1B2A4A]">{kpi.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#1B2A4A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── Available Projects ──────────────────────────────────────── */}
          {activeTab === 'projects' && (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[#1B2A4A] text-lg leading-tight">{project.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      project.registry === 'Verra' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.registry}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.eligible_practices?.slice(0, 4).map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-xs">
                        {PRACTICE_TYPES.find(t => t.value === p)?.label || p}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.country}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />${project.price_per_credit}/tonne</span>
                  </div>
                  {project.co_benefits?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.co_benefits.map((b) => (
                        <span key={b} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md text-xs">{b}</span>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setEnrollModal(project)}
                    className="w-full py-2.5 rounded-xl text-white font-medium text-sm transition hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                  >
                    Enroll in Project
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── My Enrollments ─────────────────────────────────────────── */}
          {activeTab === 'enrollments' && (
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No enrollments yet. Browse available projects to get started.</p>
                </div>
              ) : enrollments.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[#1B2A4A]">{e.carbon_projects?.name || 'Project'}</h3>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        e.carbon_projects?.registry === 'Verra' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{e.carbon_projects?.registry}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{e.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {e.practices_committed?.map((p) => (
                      <span key={p} className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-xs">
                        {PRACTICE_TYPES.find(t => t.value === p)?.label || p}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-gray-400 text-xs">Enrolled</p><p className="font-medium text-[#1B2A4A]">{new Date(e.enrolled_at).toLocaleDateString()}</p></div>
                    <div><p className="text-gray-400 text-xs">Credits Earned</p><p className="font-medium text-[#5DB347]">{e.credits_earned || 0} t</p></div>
                    <div><p className="text-gray-400 text-xs">Revenue</p><p className="font-medium text-[#1B2A4A]">${(e.revenue_earned || 0).toFixed(2)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Log Practice ───────────────────────────────────────────── */}
          {activeTab === 'log' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm max-w-2xl">
              <h3 className="font-semibold text-[#1B2A4A] text-lg mb-4">Log Sustainable Practice</h3>
              <form onSubmit={handleLogPractice} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Practice Type *</label>
                  <select
                    value={practiceForm.practice_type}
                    onChange={e => setPracticeForm(p => ({ ...p, practice_type: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    required
                  >
                    <option value="">Select practice...</option>
                    {PRACTICE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={practiceForm.description}
                    onChange={e => setPracticeForm(p => ({ ...p, description: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    rows={3}
                    placeholder="Describe what you did..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={practiceForm.practice_date}
                    onChange={e => setPracticeForm(p => ({ ...p, practice_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Latitude</label>
                    <input
                      type="text"
                      value={practiceForm.gps_lat}
                      onChange={e => setPracticeForm(p => ({ ...p, gps_lat: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                      placeholder="-20.1234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPS Longitude</label>
                    <input
                      type="text"
                      value={practiceForm.gps_lng}
                      onChange={e => setPracticeForm(p => ({ ...p, gps_lng: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                      placeholder="28.5678"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={getGPS}
                  className="flex items-center gap-2 text-sm text-[#5DB347] hover:underline"
                >
                  <MapPin className="w-4 h-4" /> Use current GPS location
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={practiceForm.photo_url}
                    onChange={e => setPracticeForm(p => ({ ...p, photo_url: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loggingPractice || !practiceForm.practice_type}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {loggingPractice ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log Practice'}
                </button>
              </form>

              {/* Recent practices */}
              {practices.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-medium text-[#1B2A4A] mb-3">Recent Practices</h4>
                  <div className="space-y-2">
                    {practices.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                        <div className="flex items-center gap-2">
                          <span>{PRACTICE_TYPES.find(t => t.value === p.practice_type)?.icon || '🌱'}</span>
                          <span className="font-medium">{PRACTICE_TYPES.find(t => t.value === p.practice_type)?.label || p.practice_type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{new Date(p.practice_date).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{p.verification_status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── My Credits ─────────────────────────────────────────────── */}
          {activeTab === 'credits' && (
            <div className="space-y-4">
              {credits.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No credits earned yet. Enroll in a project and log practices to start earning.</p>
                </div>
              ) : credits.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono text-sm text-[#5DB347] font-semibold">{c.serial_number}</p>
                      <h3 className="font-semibold text-[#1B2A4A]">{c.carbon_projects?.name || 'Project'}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      c.status === 'issued' ? 'bg-green-100 text-green-700' :
                      c.status === 'listed' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'sold' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{c.status}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mt-3">
                    <div><p className="text-gray-400 text-xs">Vintage</p><p className="font-medium">{c.vintage_year}</p></div>
                    <div><p className="text-gray-400 text-xs">Quantity</p><p className="font-medium">{c.quantity} t</p></div>
                    <div><p className="text-gray-400 text-xs">Price</p><p className="font-medium">${c.price_per_tonne}/t</p></div>
                    <div><p className="text-gray-400 text-xs">Value</p><p className="font-medium text-[#5DB347]">${(c.quantity * c.price_per_tonne).toFixed(2)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Earnings ───────────────────────────────────────────────── */}
          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-[#1B2A4A] text-lg mb-4">Carbon Revenue Summary</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Total Carbon Revenue</p>
                    <p className="text-2xl font-bold text-green-700">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600">Your Share (70%)</p>
                    <p className="text-2xl font-bold text-blue-700">${(totalRevenue * 0.7).toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-600">Credits Issued</p>
                    <p className="text-2xl font-bold text-purple-700">{totalCreditsEarned.toFixed(1)} t</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600">Pending Payout</p>
                    <p className="text-2xl font-bold text-amber-700">${(totalRevenue * 0.7 * 0.3).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-[#1B2A4A] mb-4">Payment History</h3>
                <div className="space-y-3">
                  {[
                    { date: '2025-11-15', amount: totalRevenue * 0.7 * 0.4, type: 'Mobile Money', status: 'completed' },
                    { date: '2025-10-15', amount: totalRevenue * 0.7 * 0.3, type: 'Bank Transfer', status: 'completed' },
                    { date: '2025-12-15', amount: totalRevenue * 0.7 * 0.3, type: 'Mobile Money', status: 'pending' },
                  ].map((pay, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-[#5DB347]" />
                        <div>
                          <p className="font-medium text-[#1B2A4A]">${pay.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{pay.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{new Date(pay.date).toLocaleDateString()}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          pay.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{pay.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Enroll Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {enrollModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setEnrollModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1B2A4A] text-lg">Enroll in Project</h3>
                <button onClick={() => setEnrollModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-gray-500 mb-4">{enrollModal.name}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Farm Plot *</label>
                  <select
                    value={enrollPlot}
                    onChange={e => setEnrollPlot(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#5DB347]"
                  >
                    <option value="">Choose a plot...</option>
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.size_ha}ha - {p.crop || 'No crop'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Practices to Commit *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {enrollModal.eligible_practices?.map(practice => {
                      const pt = PRACTICE_TYPES.find(t => t.value === practice);
                      const selected = enrollPractices.includes(practice);
                      return (
                        <button
                          key={practice}
                          type="button"
                          onClick={() => setEnrollPractices(prev =>
                            selected ? prev.filter(p => p !== practice) : [...prev, practice]
                          )}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition ${
                            selected ? 'border-[#5DB347] bg-green-50 text-[#5DB347]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span>{pt?.icon || '🌱'}</span>
                          <span>{pt?.label || practice}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !enrollPlot || !enrollPractices.length}
                  className="w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}
                >
                  {enrolling ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Enrollment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
