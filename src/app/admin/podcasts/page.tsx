'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Download, Trash2, Search, Mic, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Subscriber {
  id: string;
  value: string;
  created_at: string;
}

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function PodcastsAdmin() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', 'podcast_subscribers')
      .order('created_at', { ascending: false });
    setItems((data as Subscriber[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const parseEmail = (val: string): string => {
    try {
      const parsed = JSON.parse(val);
      return parsed.email || parsed || val;
    } catch { return val; }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    return parseEmail(item.value).toLowerCase().includes(search.toLowerCase());
  });

  const handleExport = () => {
    const rows = items.map((item) => `"${parseEmail(item.value)}","${item.created_at}"`);
    const csv = `Email,Subscribed At\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: `Exported ${items.length} subscribers`, type: 'success' });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('site_content').delete().eq('id', id);
    setToast({ message: 'Subscriber removed', type: 'success' });
    fetchItems();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Podcast Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} people waiting for the podcast launch</p>
        </div>
        <button onClick={handleExport} disabled={items.length === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] disabled:opacity-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Mic className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{search ? 'No matching subscribers' : 'No podcast subscribers yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200">
              <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-[#1B2A4A]">{parseEmail(item.value)}</span>
              <span className="text-xs text-gray-400 hidden sm:block">{new Date(item.created_at).toLocaleDateString()}</span>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
