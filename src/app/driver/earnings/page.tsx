'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { DollarSign, TrendingUp, Package, Calendar, Download } from 'lucide-react';

export default function DriverEarningsPage() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();
      const { data: d } = await supabase.from('foober_drivers').select('*').eq('profile_id', user!.id).maybeSingle();
      setDriver(d);
      if (d) {
        const { data } = await supabase
          .from('foober_deliveries')
          .select('id, delivery_number, driver_payout, fee, platform_commission, distance_km, status, created_at, dropoff_time')
          .eq('driver_id', d.id)
          .eq('status', 'delivered')
          .order('created_at', { ascending: false });
        setDeliveries(data || []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    const now = new Date();
    return deliveries.filter((d) => {
      const date = new Date(d.created_at);
      if (period === 'week') return now.getTime() - date.getTime() < 7 * 86400000;
      if (period === 'month') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      return true;
    });
  }, [deliveries, period]);

  const totalEarned = filtered.reduce((s, d) => s + (d.driver_payout || 0), 0);
  const totalDeliveries = filtered.length;
  const avgPerDelivery = totalDeliveries > 0 ? totalEarned / totalDeliveries : 0;
  const totalKm = filtered.reduce((s, d) => s + (d.distance_km || 0), 0);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB347]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Earnings</h1>
        <div className="flex gap-2">
          {(['week', 'month', 'all'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Deliveries', value: totalDeliveries, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Avg per Delivery', value: `$${avgPerDelivery.toFixed(2)}`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Distance', value: `${totalKm.toFixed(0)} km`, icon: Calendar, color: 'text-amber-600 bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-[#1B2A4A]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Delivery History */}
      <div>
        <h2 className="font-bold text-[#1B2A4A] mb-3">Completed Deliveries</h2>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p>No completed deliveries in this period</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A4A]">{d.delivery_number}</p>
                  <p className="text-xs text-gray-400">{d.distance_km?.toFixed(1)} km — {new Date(d.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-bold text-green-600">+${(d.driver_payout || 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lifetime stats */}
      {driver && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Lifetime Earnings</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">${(driver.total_earned || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{driver.total_deliveries || 0} total deliveries</p>
        </div>
      )}
    </div>
  );
}
