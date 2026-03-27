'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Users,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  User,
  BookOpen,
  Leaf,
  DollarSign,
  Droplets,
  Package,
  FileText,
  Smartphone,
  Heart,
  ChevronDown,
  Eye,
  BarChart3,
} from 'lucide-react';

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
type TabKey = 'programs' | 'enrollments' | 'certificates';
type ProgramStatus = 'active' | 'upcoming' | 'completed';
type EnrollmentStatus = 'active' | 'completed' | 'dropped';

interface Program {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  duration: string;
  enrolled: number;
  capacity: number;
  completionRate: number;
  instructor: string;
  nextSession: string;
  status: ProgramStatus;
  icon: React.ReactNode;
}

interface Enrollment {
  id: number;
  farmerName: string;
  program: string;
  startDate: string;
  progress: number;
  status: EnrollmentStatus;
  hasCertificate: boolean;
}

interface Certificate {
  id: string;
  farmerName: string;
  program: string;
  issueDate: string;
}

// ── Mock Data ──
const fallback_programs: Program[] = [
  { id: 1, title: 'GlobalGAP Certification', category: 'Certification', categoryColor: 'bg-green-100 text-green-700', duration: '12 weeks', enrolled: 45, capacity: 50, completionRate: 78, instructor: 'Dr. Sarah Moyo', nextSession: 'Mar 20, 2026', status: 'active', icon: <CheckCircle2 className="w-5 h-5" /> },
  { id: 2, title: 'Organic Farming', category: 'Agriculture', categoryColor: 'bg-emerald-100 text-emerald-700', duration: '8 weeks', enrolled: 38, capacity: 40, completionRate: 85, instructor: 'Prof. James Banda', nextSession: 'Mar 25, 2026', status: 'active', icon: <Leaf className="w-5 h-5" /> },
  { id: 3, title: 'Financial Literacy', category: 'Business', categoryColor: 'bg-blue-100 text-blue-700', duration: '6 weeks', enrolled: 62, capacity: 80, completionRate: 72, instructor: 'Grace Nyathi, CPA', nextSession: 'Apr 1, 2026', status: 'active', icon: <DollarSign className="w-5 h-5" /> },
  { id: 4, title: 'Irrigation Management', category: 'Technical', categoryColor: 'bg-cyan-100 text-cyan-700', duration: '4 weeks', enrolled: 28, capacity: 30, completionRate: 90, instructor: 'Eng. Peter Dube', nextSession: 'Apr 5, 2026', status: 'upcoming', icon: <Droplets className="w-5 h-5" /> },
  { id: 5, title: 'Post-Harvest Handling', category: 'Agriculture', categoryColor: 'bg-emerald-100 text-emerald-700', duration: '5 weeks', enrolled: 35, capacity: 40, completionRate: 68, instructor: 'Dr. Baraka Mwanga', nextSession: 'Apr 10, 2026', status: 'active', icon: <Package className="w-5 h-5" /> },
  { id: 6, title: 'Export Documentation', category: 'Compliance', categoryColor: 'bg-amber-100 text-amber-700', duration: '3 weeks', enrolled: 22, capacity: 25, completionRate: 95, instructor: 'Tendai Chuma', nextSession: 'Apr 15, 2026', status: 'upcoming', icon: <FileText className="w-5 h-5" /> },
  { id: 7, title: 'Digital Agriculture', category: 'Technical', categoryColor: 'bg-cyan-100 text-cyan-700', duration: '6 weeks', enrolled: 40, capacity: 40, completionRate: 60, instructor: 'Dr. Amina Osei', nextSession: 'Completed', status: 'completed', icon: <Smartphone className="w-5 h-5" /> },
  { id: 8, title: 'Livestock Management', category: 'Agriculture', categoryColor: 'bg-emerald-100 text-emerald-700', duration: '10 weeks', enrolled: 18, capacity: 25, completionRate: 45, instructor: 'Dr. John Moyo', nextSession: 'Apr 20, 2026', status: 'active', icon: <Heart className="w-5 h-5" /> },
];

const fallback_enrollments: Enrollment[] = [
  { id: 1, farmerName: 'John Moyo', program: 'GlobalGAP Certification', startDate: 'Jan 15, 2026', progress: 85, status: 'active', hasCertificate: false },
  { id: 2, farmerName: 'Grace Nyathi', program: 'Organic Farming', startDate: 'Feb 1, 2026', progress: 100, status: 'completed', hasCertificate: true },
  { id: 3, farmerName: 'Baraka Mwanga', program: 'Financial Literacy', startDate: 'Jan 20, 2026', progress: 65, status: 'active', hasCertificate: false },
  { id: 4, farmerName: 'Sarah Dube', program: 'Irrigation Management', startDate: 'Feb 10, 2026', progress: 100, status: 'completed', hasCertificate: true },
  { id: 5, farmerName: 'Peter Banda', program: 'Post-Harvest Handling', startDate: 'Jan 8, 2026', progress: 30, status: 'dropped', hasCertificate: false },
  { id: 6, farmerName: 'Tendai Chuma', program: 'Export Documentation', startDate: 'Feb 15, 2026', progress: 92, status: 'active', hasCertificate: false },
  { id: 7, farmerName: 'Amina Osei', program: 'Digital Agriculture', startDate: 'Dec 1, 2025', progress: 100, status: 'completed', hasCertificate: true },
  { id: 8, farmerName: 'David Kamau', program: 'GlobalGAP Certification', startDate: 'Jan 15, 2026', progress: 72, status: 'active', hasCertificate: false },
  { id: 9, farmerName: 'Fatima Hassan', program: 'Organic Farming', startDate: 'Feb 1, 2026', progress: 55, status: 'active', hasCertificate: false },
  { id: 10, farmerName: 'Samuel Nkomo', program: 'Financial Literacy', startDate: 'Jan 20, 2026', progress: 100, status: 'completed', hasCertificate: true },
  { id: 11, farmerName: 'Blessing Phiri', program: 'Irrigation Management', startDate: 'Feb 10, 2026', progress: 40, status: 'active', hasCertificate: false },
  { id: 12, farmerName: 'Rose Muthoni', program: 'Post-Harvest Handling', startDate: 'Jan 8, 2026', progress: 100, status: 'completed', hasCertificate: true },
  { id: 13, farmerName: 'Michael Addo', program: 'Export Documentation', startDate: 'Feb 15, 2026', progress: 88, status: 'active', hasCertificate: false },
  { id: 14, farmerName: 'Esther Wanjiku', program: 'Digital Agriculture', startDate: 'Dec 1, 2025', progress: 15, status: 'dropped', hasCertificate: false },
  { id: 15, farmerName: 'Joseph Okello', program: 'Livestock Management', startDate: 'Mar 1, 2026', progress: 22, status: 'active', hasCertificate: false },
  { id: 16, farmerName: 'Agnes Chirwa', program: 'GlobalGAP Certification', startDate: 'Jan 15, 2026', progress: 95, status: 'active', hasCertificate: false },
  { id: 17, farmerName: 'Thomas Mensah', program: 'Financial Literacy', startDate: 'Jan 20, 2026', progress: 100, status: 'completed', hasCertificate: true },
  { id: 18, farmerName: 'Lillian Okafor', program: 'Organic Farming', startDate: 'Feb 1, 2026', progress: 78, status: 'active', hasCertificate: false },
  { id: 19, farmerName: 'James Kariuki', program: 'Irrigation Management', startDate: 'Feb 10, 2026', progress: 0, status: 'dropped', hasCertificate: false },
  { id: 20, farmerName: 'Martha Nzimande', program: 'Post-Harvest Handling', startDate: 'Jan 8, 2026', progress: 67, status: 'active', hasCertificate: false },
];

const fallback_certificates: Certificate[] = [
  { id: 'CERT-2026-001', farmerName: 'Grace Nyathi', program: 'Organic Farming', issueDate: 'Mar 10, 2026' },
  { id: 'CERT-2026-002', farmerName: 'Sarah Dube', program: 'Irrigation Management', issueDate: 'Mar 8, 2026' },
  { id: 'CERT-2026-003', farmerName: 'Amina Osei', program: 'Digital Agriculture', issueDate: 'Mar 5, 2026' },
  { id: 'CERT-2026-004', farmerName: 'Samuel Nkomo', program: 'Financial Literacy', issueDate: 'Mar 3, 2026' },
  { id: 'CERT-2026-005', farmerName: 'Rose Muthoni', program: 'Post-Harvest Handling', issueDate: 'Feb 28, 2026' },
  { id: 'CERT-2026-006', farmerName: 'Thomas Mensah', program: 'Financial Literacy', issueDate: 'Feb 25, 2026' },
  { id: 'CERT-2025-047', farmerName: 'David Kamau', program: 'GlobalGAP Certification', issueDate: 'Dec 20, 2025' },
  { id: 'CERT-2025-046', farmerName: 'Fatima Hassan', program: 'Export Documentation', issueDate: 'Dec 15, 2025' },
  { id: 'CERT-2025-045', farmerName: 'Blessing Phiri', program: 'Organic Farming', issueDate: 'Dec 10, 2025' },
  { id: 'CERT-2025-044', farmerName: 'Michael Addo', program: 'Livestock Management', issueDate: 'Dec 5, 2025' },
];

// ── Certificate stats by program ──
const certsByProgram = [
  { program: 'Financial Literacy', count: 28 },
  { program: 'Organic Farming', count: 24 },
  { program: 'GlobalGAP Certification', count: 22 },
  { program: 'Digital Agriculture', count: 18 },
  { program: 'Post-Harvest Handling', count: 15 },
  { program: 'Irrigation Management', count: 12 },
  { program: 'Export Documentation', count: 10 },
  { program: 'Livestock Management', count: 8 },
];

// ═══════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════

export default function AdminTrainingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('programs');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | EnrollmentStatus>('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [programs, setPrograms] = useState<Program[]>(fallback_programs);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(fallback_enrollments);
  const [certificates, setCertificates] = useState<Certificate[]>(fallback_certificates);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function fetchData() {
      try {
        // Fetch courses
        const { data: courseData } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        if (courseData && courseData.length > 0) {
          setPrograms(
            courseData.map((row: Record<string, unknown>, idx: number) => ({
              id: idx + 1,
              title: (row.title as string) || 'Untitled',
              category: (row.category as string) || 'General',
              categoryColor: 'bg-green-100 text-green-700',
              duration: (row.duration as string) || '4 weeks',
              enrolled: (row.enrolled_count as number) || 0,
              capacity: (row.capacity as number) || 50,
              completionRate: (row.completion_rate as number) || 0,
              instructor: (row.instructor as string) || 'TBA',
              nextSession: (row.next_session as string) || '',
              status: ((row.status as string) || 'active') as ProgramStatus,
              icon: <BookOpen className="w-5 h-5" />,
            }))
          );
        }

        // Fetch enrollments
        const { data: enrollData } = await supabase
          .from('course_enrollments')
          .select('*')
          .order('created_at', { ascending: false });
        if (enrollData && enrollData.length > 0) {
          setEnrollments(
            enrollData.map((row: Record<string, unknown>, idx: number) => ({
              id: idx + 1,
              farmerName: (row.farmer_name as string) || 'Unknown',
              program: (row.course_name as string) || (row.program as string) || 'Unknown',
              startDate: ((row.start_date as string) || (row.created_at as string) || '')?.split('T')[0] || '',
              progress: (row.progress as number) || 0,
              status: ((row.status as string) || 'active') as EnrollmentStatus,
              hasCertificate: (row.has_certificate as boolean) || false,
            }))
          );
        }
      } catch { /* fallback */ }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'programs', label: 'Programs' },
    { key: 'enrollments', label: 'Enrollments' },
    { key: 'certificates', label: 'Certificates' },
  ];

  // ── Stats ──
  const activePrograms = programs.filter((p) => p.status === 'active').length;
  const totalEnrolled = programs.reduce((sum, p) => sum + p.enrolled, 0);
  const avgCompletion = Math.round(programs.reduce((sum, p) => sum + p.completionRate, 0) / programs.length);
  const totalCerts = 137; // mock total

  // ── Filtered enrollments ──
  const filteredEnrollments = enrollments.filter((e) => {
    const matchesStatus = enrollmentFilter === 'all' || e.status === enrollmentFilter;
    const matchesProgram = programFilter === 'all' || e.program === programFilter;
    const matchesSearch = !searchQuery || e.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesProgram && matchesSearch;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={cardVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Training Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage programs, enrollments, and certifications</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#8CB89C] text-white rounded-lg text-sm font-semibold hover:bg-[#8CB89C]/90 transition-colors">
          + Create Program
        </button>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Programs', value: activePrograms, icon: <BookOpen className="w-5 h-5" />, color: 'text-[#1B2A4A]', iconBg: 'bg-[#1B2A4A]/10' },
          { label: 'Enrolled Farmers', value: totalEnrolled, icon: <Users className="w-5 h-5" />, color: 'text-[#8CB89C]', iconBg: 'bg-[#8CB89C]/10' },
          { label: 'Completion Rate', value: `${avgCompletion}%`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#D4A843]', iconBg: 'bg-[#D4A843]/10' },
          { label: 'Certificates Issued', value: totalCerts, icon: <Award className="w-5 h-5" />, color: 'text-purple-600', iconBg: 'bg-purple-50' },
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

      {/* ===== PROGRAMS TAB ===== */}
      {activeTab === 'programs' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((prog) => (
            <motion.div key={prog.id} variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    prog.status === 'active' ? 'bg-[#8CB89C]/10 text-[#8CB89C]' :
                    prog.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {prog.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">{prog.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${prog.categoryColor}`}>
                      {prog.category}
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase ${
                  prog.status === 'active' ? 'bg-green-100 text-green-700' :
                  prog.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {prog.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {prog.duration}
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Users className="w-3.5 h-3.5" /> {prog.enrolled}/{prog.capacity} enrolled
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <User className="w-3.5 h-3.5" /> {prog.instructor}
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Calendar className="w-3.5 h-3.5" /> {prog.nextSession}
                </div>
              </div>

              {/* Completion Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Completion Rate</span>
                  <span className="font-semibold text-[#1B2A4A]">{prog.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      prog.completionRate >= 80 ? 'bg-green-500' :
                      prog.completionRate >= 60 ? 'bg-[#8CB89C]' :
                      prog.completionRate >= 40 ? 'bg-[#D4A843]' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${prog.completionRate}%` }}
                  />
                </div>
              </div>

              <button className="w-full py-2 text-xs font-medium text-[#1B2A4A] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                Manage
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== ENROLLMENTS TAB ===== */}
      {activeTab === 'enrollments' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {/* Filters */}
          <motion.div variants={cardVariants} className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/50 w-56"
              />
            </div>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/50"
            >
              <option value="all">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.title}>{p.title}</option>
              ))}
            </select>
            <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
              {(['all', 'active', 'completed', 'dropped'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setEnrollmentFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    enrollmentFilter === s
                      ? 'bg-[#8CB89C] text-white'
                      : 'text-gray-500 hover:text-[#1B2A4A]'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Farmer Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Start Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Certificate</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium text-[#1B2A4A]">{enr.farmerName}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{enr.program}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{enr.startDate}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                enr.progress === 100 ? 'bg-green-500' :
                                enr.progress >= 60 ? 'bg-[#8CB89C]' :
                                'bg-[#D4A843]'
                              }`}
                              style={{ width: `${enr.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{enr.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          enr.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          enr.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {enr.status.charAt(0).toUpperCase() + enr.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {enr.hasCertificate ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <button className="text-xs font-medium text-[#8CB89C] hover:text-[#8CB89C]/80 transition-colors">
                          View
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

      {/* ===== CERTIFICATES TAB ===== */}
      {activeTab === 'certificates' && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Certificate Stats */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Total Issued */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Total Certificates Issued</h3>
                <span className="text-3xl font-bold text-[#8CB89C]">{totalCerts}</span>
              </div>
              <p className="text-xs text-gray-400">Across all programs since inception</p>
            </div>

            {/* By Program Breakdown */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Certificates by Program</h3>
              <div className="space-y-2">
                {certsByProgram.map((cp, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{cp.program}</span>
                      <span className="font-medium text-[#1B2A4A]">{cp.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-[#8CB89C]"
                        style={{ width: `${(cp.count / certsByProgram[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Certificates List */}
          <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">Recently Issued Certificates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Certificate ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Farmer Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Issue Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 text-sm font-mono text-gray-500">{cert.id}</td>
                      <td className="px-6 py-3 text-sm font-medium text-[#1B2A4A]">{cert.farmerName}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cert.program}</td>
                      <td className="px-6 py-3 text-sm text-gray-400">{cert.issueDate}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-1.5">
                          <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8CB89C] bg-[#8CB89C]/10 rounded-md hover:bg-[#8CB89C]/20 transition-colors">
                            <Download className="w-3 h-3" /> Download
                          </button>
                          <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1B2A4A] bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                            <CheckCircle2 className="w-3 h-3" /> Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
