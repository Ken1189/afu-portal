'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Search, Download, Plus, Loader2, Mail, Phone, Globe,
  Tag, Filter, ChevronDown, CheckCircle2, X, Star, Building2,
  Award, Shield, User, MapPin, Calendar, MoreVertical, Eye,
  MessageSquare, RefreshCw, Hash, Zap,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Types ─── */
interface Contact {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  status: string;
  priority: string;
  tags: string[];
  assigned_to: string | null;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

interface SmartList {
  id: string;
  name: string;
  filters: { type?: string; status?: string; tag?: string; hasEmail?: boolean; hasPhone?: boolean };
  count: number;
}

const TYPE_COLORS: Record<string, string> = { member: 'bg-green-100 text-green-700', supplier: 'bg-blue-100 text-blue-700', ambassador: 'bg-amber-100 text-amber-700', investor: 'bg-purple-100 text-purple-700', lead: 'bg-gray-100 text-gray-600' };
const STATUS_COLORS: Record<string, string> = { open: 'bg-blue-100 text-blue-700', assigned: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' };

export default function AdminContactsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTag, setBulkTag] = useState('');

  // Smart lists
  const smartLists: SmartList[] = useMemo(() => {
    const c = contacts;
    return [
      { id: 'all', name: 'All Contacts', filters: {}, count: c.length },
      { id: 'leads', name: 'New Leads', filters: { type: 'lead', status: 'open' }, count: c.filter(x => x.contact_type === 'lead' && x.status === 'open').length },
      { id: 'members', name: 'Active Members', filters: { type: 'member' }, count: c.filter(x => x.contact_type === 'member').length },
      { id: 'suppliers', name: 'Suppliers', filters: { type: 'supplier' }, count: c.filter(x => x.contact_type === 'supplier').length },
      { id: 'ambassadors', name: 'Ambassadors', filters: { type: 'ambassador' }, count: c.filter(x => x.contact_type === 'ambassador').length },
      { id: 'investors', name: 'Investors', filters: { type: 'investor' }, count: c.filter(x => x.contact_type === 'investor').length },
      { id: 'with-email', name: 'Has Email', filters: { hasEmail: true }, count: c.filter(x => !!x.contact_email).length },
      { id: 'with-phone', name: 'Has Phone', filters: { hasPhone: true }, count: c.filter(x => !!x.contact_phone).length },
      { id: 'unread', name: 'Unread', filters: {}, count: c.filter(x => x.unread_count > 0).length },
      { id: 'urgent', name: 'Urgent', filters: {}, count: c.filter(x => x.priority === 'urgent' || x.priority === 'high').length },
    ];
  }, [contacts]);

  const [activeList, setActiveList] = useState('all');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    setContacts((data || []) as Contact[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // All unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach(c => (c.tags || []).forEach(t => set.add(t)));
    return [...set].sort();
  }, [contacts]);

  // Filtered
  const filtered = useMemo(() => {
    let list = contacts;

    // Smart list filter
    const sl = smartLists.find(s => s.id === activeList);
    if (sl && sl.filters.type) list = list.filter(c => c.contact_type === sl.filters.type);
    if (sl && sl.filters.status) list = list.filter(c => c.status === sl.filters.status);
    if (sl && sl.filters.hasEmail) list = list.filter(c => !!c.contact_email);
    if (sl && sl.filters.hasPhone) list = list.filter(c => !!c.contact_phone);
    if (activeList === 'unread') list = list.filter(c => c.unread_count > 0);
    if (activeList === 'urgent') list = list.filter(c => c.priority === 'urgent' || c.priority === 'high');

    // Additional filters
    if (typeFilter !== 'all') list = list.filter(c => c.contact_type === typeFilter);
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (tagFilter !== 'all') list = list.filter(c => (c.tags || []).includes(tagFilter));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.contact_name?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q) || c.contact_phone?.includes(q));
    }
    return list;
  }, [contacts, activeList, typeFilter, statusFilter, tagFilter, searchTerm, smartLists]);

  // Select all
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(c => c.id)));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  // Bulk actions
  const executeBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = [...selectedIds];

    if (bulkAction === 'tag' && bulkTag) {
      for (const id of ids) {
        const c = contacts.find(x => x.id === id);
        if (c) {
          const newTags = [...new Set([...(c.tags || []), bulkTag])];
          await supabase.from('conversations').update({ tags: newTags }).eq('id', id);
        }
      }
    } else if (bulkAction === 'close') {
      await supabase.from('conversations').update({ status: 'closed' }).in('id', ids);
    } else if (bulkAction === 'assign-devon') {
      await supabase.from('conversations').update({ assigned_to: '0ebabea8-bb9d-43e8-b5f3-fe7866bdeed2' }).in('id', ids);
    } else if (bulkAction === 'assign-peter') {
      await supabase.from('conversations').update({ assigned_to: 'c7f6fe4f-d1fb-46ba-8cf8-7de6e3d113bd' }).in('id', ids);
    }

    setSelectedIds(new Set());
    setBulkAction('');
    setBulkTag('');
    fetchContacts();
  };

  // CSV export
  const exportCSV = () => {
    const rows = filtered.map(c => ({
      Name: c.contact_name || '',
      Email: c.contact_email || '',
      Phone: c.contact_phone || '',
      Type: c.contact_type,
      Status: c.status,
      Priority: c.priority,
      Tags: (c.tags || []).join('; '),
      'Last Activity': c.last_message_at,
      Created: c.created_at,
    }));
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify((r as Record<string, string>)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `afu-contacts-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] -m-4 -mt-2">
      {/* ═══ LEFT SIDEBAR — Smart Lists ═══ */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#1B2A4A]">Smart Lists</h2>
        </div>
        <div className="py-1">
          {smartLists.map(sl => (
            <button key={sl.id} onClick={() => { setActiveList(sl.id); setTypeFilter('all'); setStatusFilter('all'); setTagFilter('all'); }} className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors ${activeList === sl.id ? 'bg-[#5DB347]/10 text-[#5DB347] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{sl.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeList === sl.id ? 'bg-[#5DB347]/20' : 'bg-gray-100'}`}>{sl.count}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-2">By Tag</h3>
          <div className="space-y-0.5">
            {allTags.slice(0, 15).map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? 'all' : t)} className={`w-full text-left px-3 py-1 text-[11px] rounded transition-colors ${tagFilter === t ? 'bg-[#5DB347]/10 text-[#5DB347] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Tag className="w-2.5 h-2.5 inline mr-1.5" />{t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MAIN TABLE ═══ */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-[#1B2A4A]">Contacts</h1>
              <p className="text-xs text-gray-400">{filtered.length} contacts{searchTerm ? ` matching "${searchTerm}"` : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-2"><Download className="w-3.5 h-3.5" /> Export CSV</button>
              <Link href="/admin/inbox" className="flex items-center gap-1.5 text-xs bg-[#5DB347] text-white rounded-lg px-3 py-2 hover:bg-[#449933]"><MessageSquare className="w-3.5 h-3.5" /> Inbox</Link>
              <button onClick={fetchContacts} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><RefreshCw className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, phone..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-xs">
              <option value="all">All Types</option>
              <option value="lead">Leads</option><option value="member">Members</option><option value="supplier">Suppliers</option><option value="ambassador">Ambassadors</option><option value="investor">Investors</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-xs">
              <option value="all">All Status</option>
              <option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
            </select>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="mt-3 flex items-center gap-3 bg-[#5DB347]/5 rounded-lg p-3">
              <span className="text-xs font-medium text-[#5DB347]">{selectedIds.size} selected</span>
              <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs">
                <option value="">Bulk action...</option>
                <option value="tag">Add Tag</option>
                <option value="close">Close All</option>
                <option value="assign-devon">Assign to Devon</option>
                <option value="assign-peter">Assign to Peter</option>
              </select>
              {bulkAction === 'tag' && (
                <input type="text" value={bulkTag} onChange={e => setBulkTag(e.target.value)} placeholder="Tag name" className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-32" />
              )}
              <button onClick={executeBulkAction} disabled={!bulkAction} className="text-xs bg-[#5DB347] text-white px-3 py-1.5 rounded-lg hover:bg-[#449933] disabled:opacity-50">Apply</button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16"><Users className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400">No contacts found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Phone</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Tags</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Last Activity</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(c.id) ? 'bg-[#5DB347]/5' : ''}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${TYPE_COLORS[c.contact_type] || 'bg-gray-100 text-gray-600'}`}>
                          {(c.contact_name || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-[#1B2A4A] text-sm">{c.contact_name || 'Unknown'}</p>
                          {c.unread_count > 0 && <span className="text-[9px] text-[#5DB347] font-medium">{c.unread_count} unread</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{c.contact_email || '—'}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{c.contact_phone || '—'}</td>
                    <td className="py-3 px-4"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[c.contact_type] || TYPE_COLORS.lead}`}>{c.contact_type}</span></td>
                    <td className="py-3 px-4"><span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || STATUS_COLORS.open}`}>{c.status}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {(c.tags || []).slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{new Date(c.last_message_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/admin/inbox?select=${c.id}`} className="text-xs text-[#5DB347] hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
