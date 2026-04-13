'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Package, MapPin, Truck, DollarSign, Search, Loader2,
  Clock, CheckCircle2, XCircle, User,
} from 'lucide-react';

type DeliveryStatus = 'requested' | 'accepted' | 'picking_up' | 'in_transit' | 'delivered' | 'cancelled';

const STATUS_COLORS: Record<DeliveryStatus, string> = {
  requested: 'bg-blue-100 text-blue-700',
  accepted: 'bg-indigo-100 text-indigo-700',
  picking_up: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function FooberDeliveriesAdmin() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const supabase = createClient();

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('foober_deliveries')
      .select('*, driver:foober_drivers(full_name, vehicle_type), requester:profiles!requester_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    const { data } = await query;
    setDeliveries(data || []);
    setLoading(false);
  }, [supabase, filterStatus]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  const filtered = deliveries.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.delivery_number?.toLowerCase().includes(s) || d.pickup_address?.toLowerCase().includes(s) || d.dropoff_address?.toLowerCase().includes(s);
  });

  // Stats
  const total = deliveries.length;
  const active = deliveries.filter(d => ['accepted', 'picking_up', 'in_transit'].includes(d.status)).length;
  const delivered = deliveries.filter(d => d.status === 'delivered').length;
  const totalRevenue = deliveries.filter(d => d.status === 'delivered').reduce((s, d) => s + (d.platform_commission || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Foober Deliveries</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor all delivery activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Deliveries', value: total, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Now', value: active, icon: Truck, color: 'text-amber-600 bg-amber-50' },
          { label: 'Completed', value: delivered, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Platform Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-4 h-4" /></div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-[#1B2A4A]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by delivery #, address..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'requested', 'accepted', 'in_transit', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${filterStatus === s ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Package className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No deliveries found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono font-semibold text-[#1B2A4A] text-sm">{d.delivery_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[d.status as DeliveryStatus] || 'bg-gray-100'}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-600">
                    <p><MapPin className="w-3 h-3 inline mr-1 text-green-500" />{d.pickup_address}</p>
                    <p><MapPin className="w-3 h-3 inline mr-1 text-red-500" />{d.dropoff_address}</p>
                    {d.description && <p><Package className="w-3 h-3 inline mr-1 text-gray-400" />{d.description}</p>}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-400">
                    <span><User className="w-3 h-3 inline mr-0.5" />Requester: {(d.requester as any)?.full_name || 'Unknown'}</span>
                    <span><Truck className="w-3 h-3 inline mr-0.5" />Driver: {(d.driver as any)?.full_name || 'Unassigned'} {(d.driver as any)?.vehicle_type && `(${(d.driver as any).vehicle_type})`}</span>
                    <span><DollarSign className="w-3 h-3 inline mr-0.5" />Fee: ${(d.fee || 0).toFixed(2)} (platform: ${(d.platform_commission || 0).toFixed(2)})</span>
                    <span>{d.distance_km?.toFixed(1) || '?'} km | {d.package_size}</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  <p>{new Date(d.created_at).toLocaleString()}</p>
                  {d.pickup_time && <p>Picked up: {new Date(d.pickup_time).toLocaleTimeString()}</p>}
                  {d.dropoff_time && <p>Delivered: {new Date(d.dropoff_time).toLocaleTimeString()}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
