'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  BarChart3,
  Megaphone,
  Leaf,
  DollarSign,
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

const demoUpdates: InvestorUpdate[] = [
  {
    id: '1',
    title: 'Q4 2025 Portfolio Performance Report',
    body: 'Strong performance across all asset classes with 12.4% annualized returns driven by bumper maize harvests in Zimbabwe. The debt portfolio maintained a 97% repayment rate while equity positions in processing hubs showed significant value appreciation. Our blended finance instruments continue to outperform benchmarks.',
    update_type: 'report',
    published_at: '2025-12-15T00:00:00Z',
    metrics_snapshot: { 'Portfolio Return': '12.4%', 'Repayment Rate': '97%', 'New Farmers': '1,200' },
  },
  {
    id: '2',
    title: 'New Partnership: Stanbic Bank Tanzania',
    body: 'AFU has partnered with Stanbic Bank Tanzania to co-finance smallholder input loans, expanding our reach to 15,000 additional farmers in the Dodoma and Morogoro regions. This partnership leverages our farmer data and credit scoring with Stanbic\'s balance sheet for maximum impact.',
    update_type: 'announcement',
    published_at: '2025-11-28T00:00:00Z',
    metrics_snapshot: null,
  },
  {
    id: '3',
    title: 'ESG Impact Assessment Published',
    body: 'Our annual ESG impact assessment shows significant improvements in farmer livelihoods, with average income increases of 35% among AFU members. Carbon sequestration from agroforestry programs reached 12,000 tonnes CO2e. Gender inclusion improved with 42% of new members being women farmers.',
    update_type: 'impact',
    published_at: '2025-11-10T00:00:00Z',
    metrics_snapshot: { 'Income Increase': '35%', 'CO2 Sequestered': '12K tonnes', 'Women Farmers': '42%' },
  },
  {
    id: '4',
    title: 'Zimbabwe Blueberry Season Results',
    body: 'The 2025 blueberry export season delivered exceptional results with 340 tonnes shipped to EU markets, generating $2.1M in export revenue for AFU farmer members. Cold chain investments are paying dividends with less than 2% spoilage rates.',
    update_type: 'financial',
    published_at: '2025-10-20T00:00:00Z',
    metrics_snapshot: { 'Tonnes Exported': '340', 'Revenue': '$2.1M', 'Spoilage': '<2%' },
  },
  {
    id: '5',
    title: 'Platform Technology Upgrade Complete',
    body: 'We have completed a major technology upgrade to our farmer management platform including real-time crop monitoring, automated credit scoring, and mobile-first loan applications. These improvements will drive efficiency and reduce operational costs by an estimated 25%.',
    update_type: 'announcement',
    published_at: '2025-09-15T00:00:00Z',
    metrics_snapshot: null,
  },
];

const typeConfig: Record<string, { color: string; icon: typeof Bell }> = {
  report: { color: 'bg-blue-50 text-blue-700', icon: BarChart3 },
  announcement: { color: 'bg-[#EBF7E5] text-[#5DB347]', icon: Megaphone },
  impact: { color: 'bg-purple-50 text-purple-700', icon: Leaf },
  financial: { color: 'bg-amber-50 text-amber-700', icon: DollarSign },
};

export default function UpdatesPage() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<InvestorUpdate[]>(demoUpdates);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      try {
        const { data } = await supabase
          .from('investor_updates')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (data && data.length > 0) setUpdates(data);
      } catch {
        // use demo
      }
      setLoading(false);
    }
    load();
  }, [user, supabase]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Investor Updates</h1>
        <p className="text-gray-500 text-sm mt-1">Latest news, reports, and announcements from AFU.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-sm">No updates published yet.</div>
        ) : (
          updates.map((u) => {
            const config = typeConfig[u.update_type] || { color: 'bg-gray-100 text-gray-600', icon: Bell };
            const TypeIcon = config.icon;
            return (
              <div key={u.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    <TypeIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${config.color}`}>
                        {u.update_type}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(u.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#1B2A4A] text-base mb-2">{u.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{u.body}</p>

                    {u.metrics_snapshot && Object.keys(u.metrics_snapshot).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {Object.entries(u.metrics_snapshot).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 rounded-xl px-4 py-2.5">
                            <p className="text-xs text-gray-500">{key}</p>
                            <p className="text-sm font-bold text-[#1B2A4A]">{String(val)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
