'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Mail, Download, Trash2, Search, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Subscriber {
  id: string;
  value: string; // JSON with name, email, country, interests, subscribed_at
  created_at: string;
}

interface ParsedSub {
  name?: string;
  email?: string;
  country?: string;
  interests?: string[];
  subscribed_at?: string;
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

export default function NewsletterAdmin() {
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
      .eq('section', 'newsletter_subscribers')
      .order('created_at', { ascending: false });
    setItems((data as Subscriber[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const parse = (val: string): ParsedSub => {
    try { return JSON.parse(val); } catch { return {}; }
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const p = parse(item.value);
    const s = search.toLowerCase();
    return (p.name?.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s) || p.country?.toLowerCase().includes(s));
  });

  const handleExport = () => {
    const rows = items.map((item) => {
      const p = parse(item.value);
      return `"${p.name || ''}","${p.email || ''}","${p.country || ''}","${(p.interests || []).join('; ')}","${p.subscribed_at || item.created_at}"`;
    });
    const csv = `Name,Email,Country,Interests,Subscribed At\n${rows.join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} total subscribers</p>
        </div>
        <button onClick={handleExport} disabled={items.length === 0} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium bg-[#5DB347] hover:bg-[#4a9a39] disabled:opacity-50 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or country..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{search ? 'No matching subscribers' : 'No subscribers yet'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="hidden sm:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Country</th>
                <th className="hidden md:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Interests</th>
                <th className="hidden sm:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => {
                const p = parse(item.value);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-[#1B2A4A]">{p.name || '—'}</td>
                    <td className="py-2.5 px-3 text-gray-600">{p.email || '—'}</td>
                    <td className="hidden sm:table-cell py-2.5 px-3 text-gray-500">{p.country || '—'}</td>
                    <td className="hidden md:table-cell py-2.5 px-3 text-gray-400 text-xs">{(p.interests || []).join(', ') || '—'}</td>
                    <td className="hidden sm:table-cell py-2.5 px-3 text-gray-400 text-xs">{new Date(p.subscribed_at || item.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
