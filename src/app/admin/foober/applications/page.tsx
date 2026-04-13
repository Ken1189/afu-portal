'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, XCircle, Truck, User, MapPin, Car } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function FooberApplicationsAdmin() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

  const supabase = createClient();

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const query = supabase.from('foober_driver_applications').select('*').order('created_at', { ascending: false });
    if (tab === 'pending') query.eq('status', 'pending');
    const { data } = await query;
    setApps(data || []);
    setLoading(false);
  }, [supabase, tab]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      const res = await fetch('/api/admin/foober/approve-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: 'Driver approved and account created', type: 'success' });
        fetchApps();
      } else {
        setToast({ message: data.error || 'Failed to approve', type: 'error' });
      }
    } catch {
      setToast({ message: 'Network error', type: 'error' });
    }
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    await supabase.from('foober_driver_applications').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', id);
    setToast({ message: 'Application rejected', type: 'success' });
    fetchApps();
    setProcessing(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Foober Driver Applications</h1>
          <p className="text-sm text-gray-500 mt-1">{apps.length} applications</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['pending', 'all'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${tab === t ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t === 'pending' ? 'Pending' : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : apps.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Truck className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No {tab === 'pending' ? 'pending ' : ''}applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-[#1B2A4A]">{app.full_name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.status === 'pending' ? 'bg-amber-100 text-amber-700' : app.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{app.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{app.email} {app.phone && `- ${app.phone}`}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[app.city, app.region, app.country].filter(Boolean).join(', ') || 'No location'}</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" />{app.vehicle_type} {app.vehicle_registration && `(${app.vehicle_registration})`}</span>
                  </div>
                  {app.experience_description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{app.experience_description}</p>}
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleApprove(app.id)} disabled={processing === app.id} className="px-4 py-2 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4a9a39] disabled:opacity-50 flex items-center gap-1.5">
                      {processing === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                    </button>
                    <button onClick={() => handleReject(app.id)} disabled={processing === app.id} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 disabled:opacity-50 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">{new Date(app.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
