'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowRight,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

interface ReceiptRow {
  id: string;
  receipt_number: string;
  farmer_name: string | null;
  commodity: string;
  net_weight_kg: number;
  grade: string | null;
  status: string;
  total_value: number;
  created_at: string;
}

interface DashboardStats {
  pendingArrivals: number;
  receivedToday: number;
  capacityUsedPercent: number;
  totalValueToday: number;
}

interface CommodityBreakdown {
  commodity: string;
  totalKg: number;
  count: number;
}

export default function WarehouseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    pendingArrivals: 0,
    receivedToday: 0,
    capacityUsedPercent: 0,
    totalValueToday: 0,
  });
  const [pendingReceipts, setPendingReceipts] = useState<ReceiptRow[]>([]);
  const [recentActivity, setRecentActivity] = useState<ReceiptRow[]>([]);
  const [commodityBreakdown, setCommodityBreakdown] = useState<CommodityBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    async function fetchData() {
      try {
        // Pending arrivals
        const { count: pendingCount } = await supabase
          .from('warehouse_receipts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Received today
        const { data: todayReceipts } = await supabase
          .from('warehouse_receipts')
          .select('id, net_weight_kg, total_value, commodity, grade')
          .eq('status', 'received')
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`);

        const receivedToday = todayReceipts?.length || 0;
        const totalValueToday = todayReceipts?.reduce((sum, r) => sum + (r.total_value || 0), 0) || 0;

        // Commodity breakdown for today
        const commodityMap = new Map<string, { totalKg: number; count: number }>();
        todayReceipts?.forEach((r) => {
          const existing = commodityMap.get(r.commodity) || { totalKg: 0, count: 0 };
          commodityMap.set(r.commodity, {
            totalKg: existing.totalKg + (r.net_weight_kg || 0),
            count: existing.count + 1,
          });
        });
        const breakdown: CommodityBreakdown[] = [];
        commodityMap.forEach((v, k) => breakdown.push({ commodity: k, ...v }));
        breakdown.sort((a, b) => b.totalKg - a.totalKg);

        // Capacity — get warehouse total capacity and used
        const { data: warehouseData } = await supabase
          .from('warehouses')
          .select('capacity_mt, current_stock_mt')
          .limit(1)
          .single();

        const capacityUsedPercent = warehouseData
          ? Math.round(((warehouseData.current_stock_mt || 0) / (warehouseData.capacity_mt || 1)) * 100)
          : 0;

        // Pending receipts (expected arrivals)
        const { data: pending } = await supabase
          .from('warehouse_receipts')
          .select('id, receipt_number, farmer_name, commodity, net_weight_kg, grade, status, total_value, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(10);

        // Recent activity
        const { data: recent } = await supabase
          .from('warehouse_receipts')
          .select('id, receipt_number, farmer_name, commodity, net_weight_kg, grade, status, total_value, created_at')
          .order('created_at', { ascending: false })
          .limit(20);

        setStats({
          pendingArrivals: pendingCount || 0,
          receivedToday,
          capacityUsedPercent,
          totalValueToday,
        });
        setPendingReceipts(pending || []);
        setRecentActivity(recent || []);
        setCommodityBreakdown(breakdown);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const formatWeight = (kg: number) =>
    kg >= 1000 ? `${(kg / 1000).toFixed(1)} MT` : `${kg.toFixed(0)} kg`;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'released': return 'bg-blue-100 text-blue-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clock and Date */}
      <div className="bg-[#1B2A4A] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
              {formatTime(currentTime)}
            </p>
            <p className="text-gray-300 mt-1 text-lg">{formatDate(currentTime)}</p>
          </div>
          <Link
            href="/warehouse/receive"
            className="inline-flex items-center justify-center gap-3 bg-[#5DB347] hover:bg-[#4ea03c] text-white text-xl font-bold px-8 py-4 rounded-2xl transition-colors min-h-[56px] shadow-lg"
          >
            <Package className="w-6 h-6" />
            Start Receiving
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-500 font-medium">Pending Arrivals</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#1B2A4A]">{stats.pendingArrivals}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 font-medium">Received Today</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#1B2A4A]">{stats.receivedToday}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 font-medium">Capacity Used</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#1B2A4A]">{stats.capacityUsedPercent}%</p>
          <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                stats.capacityUsedPercent > 90 ? 'bg-red-500' : stats.capacityUsedPercent > 70 ? 'bg-yellow-500' : 'bg-[#5DB347]'
              }`}
              style={{ width: `${Math.min(stats.capacityUsedPercent, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500 font-medium">Value Today</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[#1B2A4A]">{formatCurrency(stats.totalValueToday)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Expected Arrivals */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#1B2A4A] text-lg">Pending Arrivals</h3>
            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendingReceipts.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingReceipts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-base">No pending arrivals</p>
              </div>
            ) : (
              pendingReceipts.slice(0, 6).map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1B2A4A] text-base truncate">{r.farmer_name || 'Unknown Farmer'}</p>
                    <p className="text-sm text-gray-500">{r.commodity} &middot; {formatWeight(r.net_weight_kg || 0)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Commodity Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#1B2A4A] text-lg">Today by Commodity</h3>
          </div>
          <div className="p-5 space-y-4">
            {commodityBreakdown.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-base">No commodities received today</p>
              </div>
            ) : (
              commodityBreakdown.map((c) => (
                <div key={c.commodity}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-[#1B2A4A] text-base capitalize">{c.commodity}</span>
                    <span className="text-sm text-gray-500">{formatWeight(c.totalKg)} ({c.count} receipts)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#5DB347] rounded-full"
                      style={{
                        width: `${Math.min(
                          (c.totalKg / Math.max(...commodityBreakdown.map((x) => x.totalKg), 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1B2A4A] text-lg">Recent Activity</h3>
          <Link href="/warehouse/receipts" className="text-sm text-[#5DB347] hover:underline font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Receipt #</th>
                <th className="px-5 py-3 font-medium">Farmer</th>
                <th className="px-5 py-3 font-medium">Commodity</th>
                <th className="px-5 py-3 font-medium">Weight</th>
                <th className="px-5 py-3 font-medium">Grade</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentActivity.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    No recent activity
                  </td>
                </tr>
              ) : (
                recentActivity.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-mono text-[#1B2A4A]">{r.receipt_number}</td>
                    <td className="px-5 py-3 text-sm">{r.farmer_name || 'Walk-in'}</td>
                    <td className="px-5 py-3 text-sm capitalize">{r.commodity}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatWeight(r.net_weight_kg || 0)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        r.grade === 'A' ? 'bg-green-100 text-green-700' :
                        r.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        r.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        r.grade === 'Reject' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {r.grade || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{timeAgo(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
