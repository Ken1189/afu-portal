'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShoppingCart, Search, Loader2, Package, DollarSign, User,
  MapPin, Clock, CheckCircle2, XCircle, Truck, Eye,
} from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  refunded: 'bg-gray-100 text-gray-600',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, member:members!member_id(profile:profiles(full_name, country)), items:order_items(id, product_id, quantity, unit_price, total_price, supplier_id)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  }, [supabase, filterStatus]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.order_number?.toLowerCase().includes(s) || (o.member as any)?.profile?.full_name?.toLowerCase().includes(s);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s: number, o: any) => s + Number(o.total || 0), 0),
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Order Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all marketplace orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Processing', value: stats.processing, icon: Package, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50' },
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
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order # or customer..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${filterStatus === s ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const buyer = (o.member as any)?.profile?.full_name || 'Customer';
            const itemCount = Array.isArray(o.items) ? o.items.length : 0;
            return (
              <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono font-semibold text-[#1B2A4A] text-sm">{o.order_number || o.id?.slice(0, 8)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span><User className="w-3 h-3 inline mr-0.5" />{buyer}</span>
                      <span><Package className="w-3 h-3 inline mr-0.5" />{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      <span><DollarSign className="w-3 h-3 inline mr-0.5" />${Number(o.total || 0).toFixed(2)} {o.currency || 'USD'}</span>
                      <span><Clock className="w-3 h-3 inline mr-0.5" />{new Date(o.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {o.status === 'pending' && (
                      <button onClick={() => updateStatus(o.id, 'processing')} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">Process</button>
                    )}
                    {o.status === 'processing' && (
                      <button onClick={() => updateStatus(o.id, 'shipped')} className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium">Ship</button>
                    )}
                    {o.status === 'shipped' && (
                      <button onClick={() => updateStatus(o.id, 'delivered')} className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium">Delivered</button>
                    )}
                    {['pending', 'processing'].includes(o.status) && (
                      <button onClick={() => updateStatus(o.id, 'cancelled')} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
