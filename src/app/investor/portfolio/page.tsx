'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Wallet,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

interface Investment {
  id: string;
  name: string;
  type: 'Debt' | 'Equity' | 'Insurance';
  committed: number;
  deployed: number;
  returns: number;
  irr: number;
  status: 'Active' | 'Exited' | 'Pending';
  vintage: number;
}

const demoInvestments: Investment[] = [
  { id: '1', name: 'Zim Blueberry Export Program', type: 'Equity', committed: 125000, deployed: 125000, returns: 24.5, irr: 24.5, status: 'Active', vintage: 2025 },
  { id: '2', name: 'Uganda Smallholder Lending Pool', type: 'Debt', committed: 500000, deployed: 420000, returns: 19.2, irr: 19.2, status: 'Active', vintage: 2026 },
  { id: '3', name: 'East Africa Crop Insurance Fund', type: 'Insurance', committed: 500000, deployed: 380000, returns: 16.8, irr: 16.8, status: 'Active', vintage: 2026 },
  { id: '4', name: 'Zimbabwe Maize Lending', type: 'Debt', committed: 500000, deployed: 500000, returns: 22.1, irr: 22.1, status: 'Active', vintage: 2025 },
  { id: '5', name: 'Kenya Trade Finance Facility', type: 'Debt', committed: 375000, deployed: 290000, returns: 18.5, irr: 18.5, status: 'Active', vintage: 2026 },
  { id: '6', name: 'Zimbabwe Input Finance', type: 'Debt', committed: 500000, deployed: 470000, returns: 20.3, irr: 20.3, status: 'Active', vintage: 2025 },
];

const allocationData = [
  { name: 'AFU Agricultural Debt Fund', pct: 60, amount: 1500000, color: '#1B2A4A' },
  { name: 'AFU Insurance Premium Pool', pct: 20, amount: 500000, color: '#5DB347' },
  { name: 'AFU Trade Finance Facility', pct: 15, amount: 375000, color: '#3B82F6' },
  { name: 'AFU Direct Farm Equity', pct: 5, amount: 125000, color: '#8B5CF6' },
];

const quarterlyReturns = [
  { label: 'Q1 2025', value: 4.2 },
  { label: 'Q2 2025', value: 5.1 },
  { label: 'Q3 2025', value: 5.6 },
  { label: 'Q4 2025', value: 4.8 },
  { label: 'Q1 2026', value: 4.9 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtCurrency(val: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Exited: 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const typeStyle: Record<string, string> = {
  Debt: 'bg-blue-50 text-blue-700 border border-blue-200',
  Equity: 'bg-purple-50 text-purple-700 border border-purple-200',
  Insurance: 'bg-teal-50 text-teal-700 border border-teal-200',
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PortfolioPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>(demoInvestments);
  const [_loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        // Try investments table first
        const { data } = await supabase
          .from('investments')
          .select('*')
          .eq('investor_user_id', user.id)
          .order('invested_at', { ascending: false });
        if (data && data.length > 0) {
          setInvestments(data as unknown as Investment[]);
        } else {
          // Fall back to investor_interests table
          const { data: interests } = await supabase
            .from('investor_interests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (interests && interests.length > 0) {
            const mapped: Investment[] = interests.map((row: Record<string, unknown>, idx: number) => ({
              id: String(row.id || idx),
              name: String(row.opportunity_name || row.name || `Investment ${idx + 1}`),
              type: (String(row.investment_type || row.type || 'Debt')) as Investment['type'],
              committed: Number(row.amount || row.committed || 0),
              deployed: Number(row.deployed_amount || row.deployed || row.amount || 0),
              returns: Number(row.returns || row.irr || 0),
              irr: Number(row.irr || row.returns || 0),
              status: (String(row.status || 'Active') === 'active' ? 'Active' : String(row.status || 'Active')) as Investment['status'],
              vintage: new Date(String(row.created_at || new Date())).getFullYear(),
            }));
            setInvestments(mapped);
          }
        }
      } catch {
        // use demo data on error
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const maxQuarterlyReturn = Math.max(...quarterlyReturns.map((q) => q.value));

  return (
    <motion.div
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Portfolio</h1>
        <p className="text-gray-500 text-sm mt-1">
          Comprehensive overview of your investment portfolio with AFU.
        </p>
      </motion.div>

      {/* ============================================================ */}
      {/*  PORTFOLIO SUMMARY HEADER                                     */}
      {/* ============================================================ */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invested */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">$2,500,000</p>
        </div>

        {/* Current Value */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">$2,832,500</p>
        </div>

        {/* Total Returns */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Returns</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">$332,500</p>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 13.3%
          </span>
        </div>

        {/* Unrealised Gains */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Unrealised Gains</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">$187,200</p>
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  INVESTMENT ALLOCATION                                        */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <PieChart className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Investment Allocation</h2>
        </div>

        {/* Segmented bar */}
        <div className="flex h-5 rounded-full overflow-hidden mb-6">
          {allocationData.map((seg) => (
            <motion.div
              key={seg.name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: seg.color, width: `${seg.pct}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allocationData.map((seg) => (
            <div key={seg.name} className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1B2A4A] truncate">{seg.name}</p>
                <p className="text-xs text-gray-500">{seg.pct}% &middot; {fmtCurrency(seg.amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ============================================================ */}
      {/*  ACTIVE INVESTMENTS TABLE                                     */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-6 pb-4">
          <Briefcase className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Active Investments</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading investments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide">Investment Name</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Committed</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Deployed</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">Returns</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-right">IRR</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-[#1B2A4A] text-xs uppercase tracking-wide text-center">Vintage</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, idx) => (
                  <motion.tr
                    key={inv.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                  >
                    <td className="px-6 py-4 font-medium text-[#1B2A4A] whitespace-nowrap">{inv.name}</td>
                    <td className="px-4 py-4">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${typeStyle[inv.type] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-gray-700 font-medium">{fmtCurrency(inv.committed)}</td>
                    <td className="px-4 py-4 text-right text-gray-700 font-medium">{fmtCurrency(inv.deployed)}</td>
                    <td className="px-4 py-4 text-right font-semibold text-emerald-600">{inv.returns}%</td>
                    <td className="px-4 py-4 text-right font-semibold text-[#1B2A4A]">{inv.irr}%</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">{inv.vintage}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ============================================================ */}
      {/*  PERFORMANCE CHART (div-based bar chart)                      */}
      {/* ============================================================ */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Quarterly Performance</h2>
        </div>

        <div className="flex items-end gap-4 h-52">
          {quarterlyReturns.map((q, idx) => {
            const heightPct = (q.value / (maxQuarterlyReturn + 1)) * 100;
            return (
              <div key={q.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                {/* Value label */}
                <span className="text-xs font-bold text-[#1B2A4A]">{q.value}%</span>
                {/* Bar */}
                <motion.div
                  className="w-full rounded-t-lg"
                  style={{
                    background: 'linear-gradient(to top, #1B2A4A, #5DB347)',
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5, ease: 'easeOut' }}
                />
                {/* Quarter label */}
                <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">{q.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
