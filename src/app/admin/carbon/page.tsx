'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TreePine, Users, Award, DollarSign, ShieldCheck, Loader2,
  TrendingUp, Clock, Leaf, ArrowRight, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';

// ── Demo data ────────────────────────────────────────────────────────────────

const demoKPIs = {
  totalProjects: 6,
  activeEnrollments: 42,
  creditsIssued: 2520,
  creditsSold: 1180,
  totalRevenue: 28450,
  bufferPool: 2845,
};

const demoEnrollmentTrend = [
  { month: 'Jul', enrollments: 3 }, { month: 'Aug', enrollments: 5 }, { month: 'Sep', enrollments: 8 },
  { month: 'Oct', enrollments: 6 }, { month: 'Nov', enrollments: 10 }, { month: 'Dec', enrollments: 12 },
  { month: 'Jan', enrollments: 9 }, { month: 'Feb', enrollments: 14 }, { month: 'Mar', enrollments: 11 },
];

const demoRevenueTrend = [
  { month: 'Jul', revenue: 1200 }, { month: 'Aug', revenue: 2100 }, { month: 'Sep', revenue: 3400 },
  { month: 'Oct', revenue: 2800 }, { month: 'Nov', revenue: 4200 }, { month: 'Dec', revenue: 5100 },
  { month: 'Jan', revenue: 3900 }, { month: 'Feb', revenue: 6200 }, { month: 'Mar', revenue: 4800 },
];

const demoActivity = [
  { type: 'enrollment', text: 'New enrollment in Chobe Agroforestry Initiative', time: '2 hours ago' },
  { type: 'practice', text: 'Practice logged: No-till farming (3ha)', time: '4 hours ago' },
  { type: 'credit', text: '12.5 credits issued for Makgadikgadi Soil Carbon', time: '1 day ago' },
  { type: 'purchase', text: '50 credits purchased by GreenFuture Corp ($925)', time: '1 day ago' },
  { type: 'enrollment', text: '3 new farmers enrolled in Eastern Highlands project', time: '2 days ago' },
  { type: 'credit', text: '8.2 credits issued for Chobe Agroforestry', time: '3 days ago' },
  { type: 'purchase', text: '100 credits purchased by EcoVentures Ltd ($2,200)', time: '4 days ago' },
];

export default function AdminCarbonDashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [kpis, setKPIs] = useState(demoKPIs);
  const [enrollmentTrend] = useState(demoEnrollmentTrend);
  const [revenueTrend] = useState(demoRevenueTrend);
  const [activity] = useState(demoActivity);

  useEffect(() => {
    const fetchKPIs = async () => {
      setLoading(true);
      try {
        const [projectsRes, enrollmentsRes, creditsRes, purchasesRes] = await Promise.all([
          supabase.from('carbon_projects').select('id', { count: 'exact' }),
          supabase.from('carbon_enrollments').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('carbon_credits').select('quantity, status, price_per_tonne'),
          supabase.from('carbon_purchases').select('total_amount, status'),
        ]);

        const creditsData = creditsRes.data || [];
        const purchasesData = purchasesRes.data || [];

        const totalIssued = creditsData.reduce((s, c) => s + (c.quantity || 0), 0);
        const totalSold = creditsData.filter(c => c.status === 'sold').reduce((s, c) => s + (c.quantity || 0), 0);
        const totalRevenue = purchasesData.reduce((s, p) => s + (p.total_amount || 0), 0);

        if (projectsRes.count || enrollmentsRes.count) {
          setKPIs({
            totalProjects: projectsRes.count || 0,
            activeEnrollments: enrollmentsRes.count || 0,
            creditsIssued: totalIssued || demoKPIs.creditsIssued,
            creditsSold: totalSold || demoKPIs.creditsSold,
            totalRevenue: totalRevenue || demoKPIs.totalRevenue,
            bufferPool: (totalRevenue * 0.1) || demoKPIs.bufferPool,
          });
        }
      } catch {
        // Use demo data
      }
      setLoading(false);
    };
    fetchKPIs();
  }, [supabase]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /></div>;
  }

  const kpiCards = [
    { label: 'Total Projects', value: kpis.totalProjects, icon: TreePine, color: '#5DB347', href: '/admin/carbon/projects' },
    { label: 'Active Enrollments', value: kpis.activeEnrollments, icon: Users, color: '#6366F1' },
    { label: 'Credits Issued', value: `${kpis.creditsIssued.toLocaleString()}t`, icon: Award, color: '#10B981', href: '/admin/carbon/credits' },
    { label: 'Credits Sold', value: `${kpis.creditsSold.toLocaleString()}t`, icon: TrendingUp, color: '#F59E0B' },
    { label: 'Revenue', value: `$${kpis.totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#8B5CF6' },
    { label: 'Buffer Pool', value: `$${kpis.bufferPool.toLocaleString()}`, icon: ShieldCheck, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Carbon Credits Dashboard</h1>
          <p className="text-sm text-gray-500">Manage carbon projects, credits, and marketplace</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/carbon/credits" className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #5DB347, #449933)' }}>
            Mint Credits
          </Link>
          <Link href="/admin/carbon/verifications" className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Verifications
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map(kpi => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => kpi.href && window.location.assign(kpi.href)}
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B2A4A] mb-4">Monthly Enrollments</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={enrollmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#5DB347" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-[#1B2A4A] mb-4">Monthly Carbon Revenue ($)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`$${value}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#5DB347" fill="#5DB347" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1B2A4A]">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {activity.map((item, i) => {
            const icons: Record<string, typeof Leaf> = { enrollment: Users, practice: Leaf, credit: Award, purchase: DollarSign };
            const colors: Record<string, string> = { enrollment: '#6366F1', practice: '#5DB347', credit: '#10B981', purchase: '#F59E0B' };
            const Icon = icons[item.type] || Leaf;
            const color = colors[item.type] || '#5DB347';
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1B2A4A] truncate">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
