'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

interface Investment {
  id: string;
  name: string;
  investment_type: string;
  amount: number;
  status: string;
  project: string | null;
  expected_return_pct: number | null;
  actual_return: number | null;
  invested_at: string;
}

const demoInvestments: Investment[] = [
  { id: '1', name: 'Zimbabwe Maize Input Finance', investment_type: 'debt', amount: 500000, status: 'active', project: 'Zimbabwe Maize 2025', expected_return_pct: 14, actual_return: 35000, invested_at: '2025-01-15T00:00:00Z' },
  { id: '2', name: 'Botswana Sesame Offtake Fund', investment_type: 'equity', amount: 350000, status: 'active', project: 'Botswana Sesame Export', expected_return_pct: 18, actual_return: 28000, invested_at: '2025-03-01T00:00:00Z' },
  { id: '3', name: 'Tanzania Cassava Processing', investment_type: 'debt', amount: 250000, status: 'active', project: 'Dodoma Processing Hub', expected_return_pct: 12, actual_return: 15000, invested_at: '2025-04-20T00:00:00Z' },
  { id: '4', name: 'Zimbabwe Blueberry Cold Chain', investment_type: 'equity', amount: 400000, status: 'exited', project: 'Export Cold Chain Infra', expected_return_pct: 22, actual_return: 88000, invested_at: '2024-06-10T00:00:00Z' },
  { id: '5', name: 'Regional Equipment Leasing', investment_type: 'debt', amount: 350000, status: 'active', project: 'Equipment Finance Pool', expected_return_pct: 10, actual_return: 17500, invested_at: '2025-07-01T00:00:00Z' },
];

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

const statusColors: Record<string, string> = {
  active: 'bg-[#EBF7E5] text-[#5DB347]',
  exited: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  defaulted: 'bg-red-50 text-red-700',
};

const typeColors: Record<string, string> = {
  debt: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  equity: 'bg-purple-50 text-purple-700',
  blended: 'bg-teal-50 text-teal-700',
};

export default function PortfolioPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>(demoInvestments);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('investments')
          .select('*')
          .eq('investor_user_id', user.id)
          .order('invested_at', { ascending: false });
        if (data && data.length > 0) setInvestments(data);
      } catch {
        // use demo data
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalReturns = investments.reduce((s, i) => s + (i.actual_return || 0), 0);
  const activeCount = investments.filter((i) => i.status === 'active').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Portfolio</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of all your investments with AFU.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs text-gray-500">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(totalInvested)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs text-gray-500">Total Returns</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{formatCurrency(totalReturns)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-[#1B2A4A] rounded-xl flex items-center justify-center">
              <Briefcase className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xs text-gray-500">Active Investments</span>
          </div>
          <p className="text-2xl font-bold text-[#1B2A4A]">{activeCount}</p>
        </div>
      </div>

      {/* Investment Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">Loading investments...</div>
        ) : investments.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No investments found.</div>
        ) : (
          investments.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A] text-sm">{inv.name}</h3>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${typeColors[inv.investment_type] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.investment_type}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusColors[inv.status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.status}
                    </span>
                  </div>
                  {inv.project && <p className="text-xs text-gray-500">{inv.project}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(inv.invested_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                    </span>
                    {inv.expected_return_pct && (
                      <span className="flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        {inv.expected_return_pct}% target
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#1B2A4A]">{formatCurrency(inv.amount)}</p>
                  {inv.actual_return != null && inv.actual_return > 0 && (
                    <p className="text-xs text-[#5DB347] font-medium flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      +{formatCurrency(inv.actual_return)} return
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
