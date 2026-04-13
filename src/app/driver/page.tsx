'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Package, DollarSign, Star, Truck, MapPin, Clock,
  CheckCircle2, AlertCircle, ToggleLeft, ToggleRight,
  ArrowRight, TrendingUp,
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const supabase = createClient();

      // Get driver record
      const { data: d } = await supabase
        .from('foober_drivers')
        .select('*')
        .eq('profile_id', user!.id)
        .maybeSingle();
      setDriver(d);

      if (d) {
        // Active delivery (not delivered/cancelled)
        const { data: active } = await supabase
          .from('foober_deliveries')
          .select('*')
          .eq('driver_id', d.id)
          .in('status', ['accepted', 'picking_up', 'in_transit'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setActiveDelivery(active);

        // Recent completed
        const { data: recent } = await supabase
          .from('foober_deliveries')
          .select('*')
          .eq('driver_id', d.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentDeliveries(recent || []);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleAvailability = async () => {
    if (!driver) return;
    const supabase = createClient();
    const newVal = !driver.is_available;
    await supabase.from('foober_drivers').update({ is_available: newVal }).eq('id', driver.id);
    setDriver({ ...driver, is_available: newVal });
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/foober/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryId, status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === 'delivered') {
          setActiveDelivery(null);
        } else {
          setActiveDelivery({ ...activeDelivery, status: newStatus });
        }
      }
    } catch { /* silent */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB347]" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center py-20">
        <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#1B2A4A] mb-2">Driver Profile Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">Your driver account may still be pending approval.</p>
        <Link href="/driver/apply" className="text-[#5DB347] font-medium hover:underline">Apply to become a driver</Link>
      </div>
    );
  }

  const statusColor = driver.is_available ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Driver Dashboard</h1>
          <p className="text-sm text-gray-500">{driver.vehicle_type} — {driver.city || driver.country || 'Location not set'}</p>
        </div>
        <button
          onClick={toggleAvailability}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${statusColor}`}
        >
          {driver.is_available ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          {driver.is_available ? 'Available' : 'Offline'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Deliveries', value: driver.total_deliveries || 0, icon: Package, color: 'text-blue-600 bg-blue-50' },
          { label: 'Total Earned', value: `$${(driver.total_earned || 0).toFixed(2)}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Rating', value: `${(driver.rating || 5.0).toFixed(1)} / 5`, icon: Star, color: 'text-amber-600 bg-amber-50' },
          { label: 'Status', value: driver.status, icon: CheckCircle2, color: driver.status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-lg font-bold text-[#1B2A4A]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="bg-[#5DB347]/5 border border-[#5DB347]/20 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-[#5DB347]" />
            <h2 className="font-bold text-[#1B2A4A]">Active Delivery</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[#5DB347]/20 text-[#5DB347]">
              {activeDelivery.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1"><MapPin className="w-3.5 h-3.5 inline mr-1" /><strong>Pickup:</strong> {activeDelivery.pickup_address}</p>
          <p className="text-sm text-gray-600 mb-3"><MapPin className="w-3.5 h-3.5 inline mr-1" /><strong>Dropoff:</strong> {activeDelivery.dropoff_address}</p>
          <p className="text-sm font-semibold text-[#1B2A4A] mb-4">Fee: ${(activeDelivery.driver_payout || 0).toFixed(2)}</p>
          <div className="flex gap-2">
            {activeDelivery.status === 'accepted' && (
              <button onClick={() => updateDeliveryStatus(activeDelivery.id, 'picking_up')} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                Heading to Pickup
              </button>
            )}
            {activeDelivery.status === 'picking_up' && (
              <button onClick={() => updateDeliveryStatus(activeDelivery.id, 'in_transit')} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
                Picked Up — In Transit
              </button>
            )}
            {activeDelivery.status === 'in_transit' && (
              <button onClick={() => updateDeliveryStatus(activeDelivery.id, 'delivered')} className="px-4 py-2 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4a9a39]">
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Available Deliveries CTA */}
      {!activeDelivery && driver.is_available && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-[#1B2A4A] mb-1">Waiting for Deliveries</h3>
          <p className="text-sm text-gray-500 mb-3">You are online and will be notified when a delivery request comes in.</p>
          <Link href="/driver/deliveries" className="text-sm text-[#5DB347] font-medium hover:underline inline-flex items-center gap-1">
            View Available Requests <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Recent Deliveries */}
      {recentDeliveries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-[#1B2A4A]">Recent Deliveries</h2>
            <Link href="/driver/deliveries" className="text-xs text-[#5DB347] hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {recentDeliveries.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${d.status === 'delivered' ? 'bg-green-50 text-green-600' : d.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}>
                  {d.status === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> : d.status === 'cancelled' ? <AlertCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2A4A] truncate">{d.delivery_number}</p>
                  <p className="text-xs text-gray-400 truncate">{d.pickup_address} → {d.dropoff_address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1B2A4A]">${(d.driver_payout || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-gray-400">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
