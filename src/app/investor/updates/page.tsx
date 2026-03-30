'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  LineChart,
  Sprout,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

interface InvestorUpdate {
  id: string;
  title: string;
  body: string;
  update_type: string;
  published_at: string;
  metrics_snapshot: Record<string, string | number> | null;
}

const typeConfig: Record<
  string,
  { color: string; bgColor: string; borderColor: string; label: string; icon: typeof Bell }
> = {
  quarterly_report: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Quarterly Report',
    icon: BarChart3,
  },
  fund_update: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Fund Update',
    icon: TrendingUp,
  },
  market_intelligence: {
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Market Intelligence',
    icon: LineChart,
  },
  impact_milestone: {
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Impact Milestone',
    icon: Sprout,
  },
  new_country_launch: {
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    label: 'New Country Launch',
    icon: Globe,
  },
};

const FALLBACK_UPDATES: InvestorUpdate[] = [
  {
    id: '1',
    title: 'Q1 2026 Quarterly Report Published',
    body: 'Fund I delivered 5.2% quarterly return, bringing YTD IRR to 21.3%. Zimbabwe blueberry program exceeded export targets by 15%. The loan portfolio maintained a 96.1% repayment rate with PAR30 improving to 3.9%. Total AUM reached $12.4M with new capital deployments into Kenya maize and Uganda coffee value chains.',
    update_type: 'quarterly_report',
    published_at: '2026-03-15T00:00:00Z',
    metrics_snapshot: { 'Quarterly Return': '5.2%', 'YTD IRR': '21.3%', 'Repayment Rate': '96.1%' },
  },
  {
    id: '2',
    title: 'Uganda Operations Launch',
    body: 'Officially launched Uganda operations with 2,400 farmers onboarded in first month. MTN MoMo integration live for seamless loan disbursements and repayments. Initial focus on Arabica coffee in the Mt Elgon region and vanilla in Bundibugyo district. Country manager Grace Nakamya leading a 12-person local team.',
    update_type: 'new_country_launch',
    published_at: '2026-02-18T00:00:00Z',
    metrics_snapshot: { 'Farmers Onboarded': '2,400', 'Crops': 'Coffee, Vanilla', 'Team Size': '12' },
  },
  {
    id: '3',
    title: '4,000 Farmer Milestone',
    body: 'Crossed 4,000 active farmers across 3 countries. Average farmer income increase of 42% since joining AFU. Women farmers now represent 44% of total membership, exceeding our 40% gender inclusion target. Carbon sequestration from agroforestry reached 18,000 tonnes CO2e for the year.',
    update_type: 'impact_milestone',
    published_at: '2026-02-05T00:00:00Z',
    metrics_snapshot: { 'Active Farmers': '4,000', 'Income Increase': '42%', 'Women Farmers': '44%' },
  },
  {
    id: '4',
    title: 'Zimbabwe Blueberry First Export',
    body: 'First commercial blueberry shipment to EU completed. 12 tonnes at $18/kg, generating $216,000 in export revenue. Cold chain infrastructure performing well with less than 1.5% spoilage. Tesco and Marks & Spencer confirmed as off-take partners for the 2026 season. Expansion to 85 hectares planned.',
    update_type: 'fund_update',
    published_at: '2026-01-22T00:00:00Z',
    metrics_snapshot: { 'Export Revenue': '$216,000', 'Price/kg': '$18', 'Spoilage': '<1.5%' },
  },
  {
    id: '5',
    title: 'Insurance Claims Performance',
    body: 'Q4 2025 claims ratio of 38% -- well below the 65% target. Parametric weather triggers performed as modelled with 98% correlation to actual crop losses. 1,200 farmers received payouts averaging $145, protecting household food security during the dry spell in Manicaland province.',
    update_type: 'quarterly_report',
    published_at: '2026-01-10T00:00:00Z',
    metrics_snapshot: { 'Claims Ratio': '38%', 'Avg Payout': '$145', 'Farmers Covered': '1,200' },
  },
  {
    id: '6',
    title: 'Kenya Market Entry',
    body: 'Kenya operations commenced with Safaricom M-Pesa integration complete. Initial 800 farmer registrations in Nakuru and Trans-Nzoia counties, focused on maize and horticulture. Partnership with Equity Bank for co-lending facility of KES 50M. Regulatory approval obtained from CMA Kenya.',
    update_type: 'new_country_launch',
    published_at: '2025-12-12T00:00:00Z',
    metrics_snapshot: { 'Initial Farmers': '800', 'Co-lending': 'KES 50M', 'Counties': '2' },
  },
  {
    id: '7',
    title: 'FY2025 Audited Results',
    body: 'Full year results: 18.7% net IRR, $8.2M deployed, 94.2% repayment rate. Exceeded all fund targets set at inception. The blended finance model proved resilient through commodity price volatility. Independent audit by Deloitte confirmed clean opinion on all financial statements.',
    update_type: 'quarterly_report',
    published_at: '2025-12-05T00:00:00Z',
    metrics_snapshot: { 'Net IRR': '18.7%', 'Capital Deployed': '$8.2M', 'Repayment Rate': '94.2%' },
  },
  {
    id: '8',
    title: 'Loan Portfolio Update',
    body: 'Agricultural loan book reached $3.8M. PAR30 at 5.8% -- in line with emerging market microfinance benchmarks. Average loan size $420 with 87-day average tenor. Mobile-first disbursement now accounts for 94% of all loans. Credit scoring model v3.2 deployed with improved default prediction accuracy of 89%.',
    update_type: 'fund_update',
    published_at: '2025-11-18T00:00:00Z',
    metrics_snapshot: { 'Loan Book': '$3.8M', 'PAR30': '5.8%', 'Avg Loan': '$420' },
  },
];

export default function UpdatesPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<InvestorUpdate[]>(FALLBACK_UPDATES);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        // Try investor_updates table first (column is is_published boolean, not status)
        const { data } = await supabase
          .from('investor_updates')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        if (data && data.length > 0) {
          // Map DB columns to component interface (metrics vs metrics_snapshot)
          const mapped: InvestorUpdate[] = data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            title: String(row.title || ''),
            body: String(row.body || ''),
            update_type: String(row.update_type || 'fund_update'),
            published_at: String(row.published_at || row.created_at || new Date().toISOString()),
            metrics_snapshot: (row.metrics_snapshot || row.metrics || null) as Record<string, string | number> | null,
          }));
          setUpdates(mapped);
        } else {
          // Fall back to notifications table
          const { data: notifs } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
          if (notifs && notifs.length > 0) {
            const mapped: InvestorUpdate[] = notifs.map((row: Record<string, unknown>) => ({
              id: String(row.id),
              title: String(row.title || row.subject || 'Update'),
              body: String(row.body || row.message || row.content || ''),
              update_type: String(row.update_type || row.type || row.category || 'fund_update'),
              published_at: String(row.published_at || row.created_at || new Date().toISOString()),
              metrics_snapshot: (row.metrics_snapshot as Record<string, string | number>) || null,
            }));
            setUpdates(mapped);
          }
        }
      } catch {
        // use demo
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const filteredUpdates =
    activeFilter === 'all'
      ? updates
      : updates.filter((u) => u.update_type === activeFilter);

  const filterOptions = [
    { key: 'all', label: 'All Updates' },
    ...Object.entries(typeConfig).map(([key, val]) => ({ key, label: val.label })),
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const formatFullDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Investor Updates</h1>
        <p className="text-gray-500 text-sm mt-1">
          Communications, reports, and milestones from the AFU management team.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActiveFilter(opt.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeFilter === opt.key
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#1B2A4A]/20 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#1B2A4A]/20 via-[#5DB347]/20 to-transparent hidden md:block" />

        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <div className="inline-flex items-center gap-3 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#5DB347] rounded-full animate-spin" />
                Loading updates...
              </div>
            </div>
          ) : filteredUpdates.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No updates found.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredUpdates.map((u, i) => {
                const config = typeConfig[u.update_type] || {
                  color: 'text-gray-600',
                  bgColor: 'bg-gray-50',
                  borderColor: 'border-gray-200',
                  label: u.update_type,
                  icon: Bell,
                };
                const TypeIcon = config.icon;
                const isExpanded = expandedId === u.id;
                const isBodyLong = u.body.length > 160;

                return (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="relative md:pl-14"
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-4 top-6 w-5 h-5 rounded-full border-2 border-white shadow-sm hidden md:flex items-center justify-center ${config.bgColor}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('bg-', 'bg-').replace('50', '500')}`} />
                    </div>

                    <div
                      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                        isExpanded ? 'ring-1 ring-gray-200' : ''
                      }`}
                    >
                      {/* Top color bar */}
                      <div className={`h-1 ${config.bgColor.replace('50', '400')}`} />

                      <div className="p-6">
                        {/* Meta row */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${config.bgColor} ${config.color} ${config.borderColor}`}
                          >
                            <TypeIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </div>
                          <span className="text-xs text-gray-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatFullDate(u.published_at)}
                          </span>
                          <span className="text-[11px] text-gray-300 font-medium ml-auto">
                            {formatDate(u.published_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-[#1B2A4A] text-base mb-2">{u.title}</h3>

                        {/* Body */}
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {isBodyLong && !isExpanded ? u.body.slice(0, 160) + '...' : u.body}
                        </p>

                        {/* Expand/Collapse */}
                        {isBodyLong && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : u.id)}
                            className="mt-2 flex items-center gap-1 text-[#5DB347] text-sm font-medium hover:underline"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}

                        {/* Metrics */}
                        {u.metrics_snapshot && Object.keys(u.metrics_snapshot).length > 0 && (
                          <motion.div
                            initial={false}
                            animate={{ opacity: 1 }}
                            className="mt-4 flex flex-wrap gap-3"
                          >
                            {Object.entries(u.metrics_snapshot).map(([key, val]) => (
                              <div
                                key={key}
                                className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl px-4 py-2.5 border border-gray-100"
                              >
                                <p className="text-[11px] text-gray-500 font-medium">{key}</p>
                                <p className="text-sm font-bold text-[#1B2A4A]">{String(val)}</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
