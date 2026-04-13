'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Package, MapPin, Clock, CheckCircle2, AlertCircle, Truck, DollarSign, XCircle } from 'lucide-react';

type DeliveryStatus = 'requested' | 'accepted' | 'picking_up' | 'in_transit' | 'delivered' | 'cancelled';
const STATUS_COLORS: Record<DeliveryStatus, string> = {
  requested: 'bg-blue-100 text-blue-700',
  accepted: 'bg-indigo-100 text-indigo-700',
  picking_up: 'bg-amber-100 text-amber-700',
  in_transit: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function DriverDeliveriesPage() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'mine'>('available');
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();
      const { data: driver } = await supabase.from('foober_drivers').select('id, country').eq('profile_id', user!.id).maybeSingle();
      if (driver) {
        setDriverId(driver.id);
        // My deliveries
        const { data: mine } = await supabase
          .from('foober_deliveries')
          .select('*')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false });
        setDeliveries(mine || []);
        // Available (requested, no driver, same country)
        const query = supabase.from('foober_deliveries').select('*').eq('status', 'requested').is('driver_id', null).order('created_at', { ascending: false }).limit(20);
        // Note: country filter would need requester's country — skip for now, show all available
        const { data: avail } = await query;
        setAvailable(avail || []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const res = await fetch('/api/foober/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId }),
      });
      if (res.ok) {
        setAvailable((prev) => prev.filter((d) => d.id !== deliveryId));
        // Refetch mine
        const supabase = createClient();
        const { data: mine } = await supabase.from('foober_deliveries').select('*').eq('driver_id', driverId!).order('created_at', { ascending: false });
        setDeliveries(mine || []);
        setTab('mine');
      }
    } catch { /* silent */ }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB347]" /></div>;
  }

  const list = tab === 'available' ? available : deliveries;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1B2A4A]">Deliveries</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {(['available', 'mine'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? 'border-[#5DB347] text-[#5DB347]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'available' ? `Available (${available.length})` : `My Deliveries (${deliveries.length})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{tab === 'available' ? 'No deliveries available right now' : 'No deliveries yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-[#1B2A4A] text-sm">{d.delivery_number}</p>
                  <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()} — {d.distance_km?.toFixed(1) || '?'} km</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[d.status as DeliveryStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {d.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                <p className="text-sm text-gray-600"><MapPin className="w-3.5 h-3.5 inline mr-1 text-green-500" />{d.pickup_address}</p>
                <p className="text-sm text-gray-600"><MapPin className="w-3.5 h-3.5 inline mr-1 text-red-500" />{d.dropoff_address}</p>
                {d.description && <p className="text-xs text-gray-400"><Package className="w-3 h-3 inline mr-1" />{d.description}</p>}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-bold text-[#1B2A4A]">
                  <DollarSign className="w-3.5 h-3.5 inline" />
                  {tab === 'available' ? (d.fee || 0).toFixed(2) : (d.driver_payout || 0).toFixed(2)}
                  <span className="text-xs font-normal text-gray-400 ml-1">{tab === 'available' ? 'total fee' : 'your payout'}</span>
                </p>
                {tab === 'available' && d.status === 'requested' && (
                  <button onClick={() => acceptDelivery(d.id)} className="px-4 py-2 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4a9a39]">
                    Accept
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
