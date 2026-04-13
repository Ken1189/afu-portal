'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Truck, User, MapPin, Star, Package, Search, Loader2,
  CheckCircle2, XCircle, Eye, ToggleLeft, ToggleRight, Car,
} from 'lucide-react';

export default function FooberDriversAdmin() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const supabase = createClient();

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('foober_drivers').select('*').order('created_at', { ascending: false });
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    const { data } = await query;
    setDrivers(data || []);
    setLoading(false);
  }, [supabase, filterStatus]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'active' ? 'suspended' : 'active';
    await supabase.from('foober_drivers').update({ status: next }).eq('id', id);
    fetchDrivers();
  };

  const toggleDocVerified = async (id: string, current: boolean) => {
    await supabase.from('foober_drivers').update({ documents_verified: !current }).eq('id', id);
    fetchDrivers();
  };

  const filtered = drivers.filter((d) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return d.full_name?.toLowerCase().includes(s) || d.email?.toLowerCase().includes(s) || d.city?.toLowerCase().includes(s);
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-600',
    inactive: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Foober Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">{drivers.length} drivers total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, city..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'suspended'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filterStatus === s ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400"><Truck className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>No drivers found</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Driver info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#5DB347]/10 text-[#5DB347] font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {d.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#1B2A4A] text-sm">{d.full_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[d.status] || 'bg-gray-100'}`}>{d.status}</span>
                      {d.documents_verified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Docs Verified</span>}
                      {d.is_available && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">Online</span>}
                    </div>
                    <p className="text-xs text-gray-500">{d.email} {d.phone && `| ${d.phone}`}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5"><Car className="w-3 h-3" />{d.vehicle_type} {d.vehicle_make && `— ${d.vehicle_make} ${d.vehicle_model || ''}`} {d.vehicle_year && `(${d.vehicle_year})`}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{[d.city, d.country].filter(Boolean).join(', ') || 'No location'}</span>
                      <span className="flex items-center gap-0.5"><Package className="w-3 h-3" />{d.total_deliveries || 0} deliveries</span>
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3" />{(d.rating || 5.0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleDocVerified(d.id, d.documents_verified)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${d.documents_verified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                    title={d.documents_verified ? 'Unverify docs' : 'Verify docs'}
                  >
                    {d.documents_verified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toggleStatus(d.id, d.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${d.status === 'active' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}
                    title={d.status === 'active' ? 'Suspend' : 'Activate'}
                  >
                    {d.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Joined {new Date(d.created_at).toLocaleDateString()} | Earned ${(d.total_earned || 0).toFixed(2)} | Reg: {d.vehicle_registration || 'N/A'} | License: {d.license_number || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
