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

const FALLBACK_UPDATES: InvestorUpdate[] = [];

export default function UpdatesPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<InvestorUpdate[]>([]);
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
