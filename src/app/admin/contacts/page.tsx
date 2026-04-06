'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Users, Search, Download, Plus, Loader2, Mail, Phone, Globe,
  Tag, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X,
  Building2, Award, Shield, User, Calendar, RefreshCw, Upload,
  MessageSquare, Filter, ArrowUpDown,
} from 'lucide-react';

/* ─── Types ─── */
interface Contact {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  business_name: string | null;
  country: string | null;
  status: string;
  priority: string;
  tags: string[];
  assigned_to: string | null;
  owner_name: string | null;
  dnd: boolean;
  last_message_at: string;
  unread_count: number;
  source: string | null;
  created_at: string;
}

interface SmartList { id: string; name: string; count: number; filter: (c: Contact) => boolean }

const TYPE_COLORS: Record<string, string> = { member: 'bg-green-100 text-green-700', supplier: 'bg-blue-100 text-blue-700', ambassador: 'bg-amber-100 text-amber-700', investor: 'bg-purple-100 text-purple-700', lead: 'bg-gray-100 text-gray-600' };

type SortField = 'contact_name' | 'contact_email' | 'business_name' | 'created_at' | 'last_message_at' | 'contact_type';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 25;

export default function AdminContactsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('last_message_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeList, setActiveList] = useState('all');
  const [showAdvFilters, setShowAdvFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', business: '', type: 'lead', country: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Bulk
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTag, setBulkTag] = useState('');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    setContacts((data || []) as Contact[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    contacts.forEach(c => (c.tags || []).forEach(t => s.add(t)));
    return [...s].sort();
  }, [contacts]);

  // Smart lists
  const smartLists: SmartList[] = useMemo(() => [
    { id: 'all', name: 'All', count: contacts.length, filter: () => true },
    { id: 'leads', name: 'New Leads', count: contacts.filter((c: Contact) => c.contact_type === 'lead' && c.status === 'open').length, filter: (c: Contact) => c.contact_type === 'lead' && c.status === 'open' },
    { id: 'members', name: 'Members', count: contacts.filter((c: Contact) => c.contact_type === 'member').length, filter: (c: Contact) => c.contact_type === 'member' },
    { id: 'suppliers', name: 'Suppliers', count: contacts.filter((c: Contact) => c.contact_type === 'supplier').length, filter: (c: Contact) => c.contact_type === 'supplier' },
    { id: 'ambassadors', name: 'Ambassadors', count: contacts.filter((c: Contact) => c.contact_type === 'ambassador').length, filter: (c: Contact) => c.contact_type === 'ambassador' },
    { id: 'investors', name: 'Investors', count: contacts.filter((c: Contact) => c.contact_type === 'investor').length, filter: (c: Contact) => c.contact_type === 'investor' },
    { id: 'with-email', name: 'Has Email', count: contacts.filter((c: Contact) => !!c.contact_email).length, filter: (c: Contact) => !!c.contact_email },
    { id: 'with-phone', name: 'Has Phone', count: contacts.filter((c: Contact) => !!c.contact_phone).length, filter: (c: Contact) => !!c.contact_phone },
  ], [contacts]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    const sl = smartLists.find(s => s.id === activeList);
    let list = sl ? contacts.filter(sl.filter) : contacts;
    if (typeFilter !== 'all') list = list.filter(c => c.contact_type === typeFilter);
    if (tagFilter !== 'all') list = list.filter(c => (c.tags || []).includes(tagFilter));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.contact_name?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q) || c.contact_phone?.includes(q) || c.business_name?.toLowerCase().includes(q));
    }
    // Sort
    list = [...list].sort((a, b) => {
      const av = (a[sortField] || '') as string;
      const bv = (b[sortField] || '') as string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [contacts, activeList, typeFilter, tagFilter, searchTerm, sortField, sortDir, smartLists]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={`w-2.5 h-2.5 ${sortField === field && sortDir === 'asc' ? 'text-[#5DB347]' : 'text-gray-300'}`} />
      <ChevronDown className={`w-2.5 h-2.5 -mt-1 ${sortField === field && sortDir === 'desc' ? 'text-[#5DB347]' : 'text-gray-300'}`} />
    </span>
  );

  const toggleSelectAll = () => { if (selectedIds.size === paged.length) setSelectedIds(new Set()); else setSelectedIds(new Set(paged.map(c => c.id))); };
  const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };

  const executeBulk = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    const ids = [...selectedIds];
    if (bulkAction === 'tag' && bulkTag) {
      for (const id of ids) { const c = contacts.find(x => x.id === id); if (c) await supabase.from('conversations').update({ tags: [...new Set([...(c.tags || []), bulkTag])] }).eq('id', id); }
    } else if (bulkAction === 'close') { await supabase.from('conversations').update({ status: 'closed' }).in('id', ids); }
    else if (bulkAction === 'assign-devon') { await supabase.from('conversations').update({ assigned_to: '0ebabea8-bb9d-43e8-b5f3-fe7866bdeed2', owner_name: 'Devon K' }).in('id', ids); }
    else if (bulkAction === 'assign-peter') { await supabase.from('conversations').update({ assigned_to: 'c7f6fe4f-d1fb-46ba-8cf8-7de6e3d113bd', owner_name: 'Peter W' }).in('id', ids); }
    else if (bulkAction === 'dnd') { await supabase.from('conversations').update({ dnd: true }).in('id', ids); }
    setSelectedIds(new Set()); setBulkAction(''); setBulkTag(''); fetchContacts();
  };

  const addContact = async () => {
    if (!newContact.name && !newContact.email) return;
    setSaving(true);
    await supabase.from('conversations').insert({
      contact_name: newContact.name || null, contact_email: newContact.email || null,
      contact_phone: newContact.phone || null, business_name: newContact.business || null,
      contact_type: newContact.type, country: newContact.country || null,
      tags: newContact.tags ? newContact.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      status: 'open', priority: 'normal', source: 'manual',
    });
    setShowAddContact(false); setNewContact({ name: '', email: '', phone: '', business: '', type: 'lead', country: '', tags: '' });
    setSaving(false); fetchContacts();
  };

  const exportCSV = () => {
    const rows = filtered.map(c => [c.contact_name || '', c.contact_phone || '', c.contact_email || '', c.business_name || '', c.contact_type, new Date(c.created_at).toLocaleString(), new Date(c.last_message_at).toLocaleString(), (c.tags || []).join('; ')].map(v => `"${v}"`).join(','));
    const csv = ['Contact name,Phone,Email,Business name,Type,Created,Last activity,Tags', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `afu-contacts-${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  function timeAgoShort(d: string) { const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000); if (s < 3600) return `${Math.floor(s / 60)}m ago`; if (s < 86400) return `${Math.floor(s / 3600)}h ago`; if (s < 604800) return `${Math.floor(s / 86400)}d ago`; return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' }); }

  return (
    <div className="flex h-[calc(100vh-80px)] -m-4 -mt-2">
      {/* ═══ SMART LISTS SIDEBAR ═══ */}
      <div className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase">Smart Lists</span>
          <button className="text-[10px] text-[#5DB347] hover:underline font-medium">+ Add</button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {smartLists.map(sl => (
            <button key={sl.id} onClick={() => { setActiveList(sl.id); setPage(1); }} className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between ${activeList === sl.id ? 'bg-[#5DB347]/10 text-[#5DB347] font-semibold border-r-2 border-[#5DB347]' : 'text-gray-600 hover:bg-gray-50'}`}>
              {sl.name}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeList === sl.id ? 'bg-[#5DB347]/20' : 'bg-gray-100 text-gray-400'}`}>{sl.count}</span>
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="border-t border-gray-100 p-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Tags</span>
            <div className="mt-2 space-y-0.5 max-h-40 overflow-y-auto">
              {allTags.map(t => (
                <button key={t} onClick={() => { setTagFilter(tagFilter === t ? 'all' : t); setPage(1); }} className={`w-full text-left px-2 py-1 text-[11px] rounded ${tagFilter === t ? 'bg-[#5DB347]/10 text-[#5DB347]' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Tag className="w-2.5 h-2.5 inline mr-1" />{t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#1B2A4A]">Contacts</h1>
              <span className="text-xs font-medium text-[#5DB347] bg-[#5DB347]/10 px-2.5 py-1 rounded-full">{filtered.length} Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportCSV} className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"><Download className="w-3.5 h-3.5" /> Export CSV</button>
              <button onClick={() => setShowAddContact(true)} className="flex items-center gap-1.5 text-xs bg-[#5DB347] text-white rounded-lg px-3 py-2 hover:bg-[#449933]"><Plus className="w-3.5 h-3.5" /> Add Contact</button>
            </div>
          </div>

          {/* Smart list tabs */}
          <div className="flex items-center gap-1 mb-3 overflow-x-auto">
            {smartLists.slice(0, 6).map(sl => (
              <button key={sl.id} onClick={() => { setActiveList(sl.id); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${activeList === sl.id ? 'bg-gray-100 text-[#1B2A4A]' : 'text-gray-400 hover:text-gray-600'}`}>
                {sl.name}
              </button>
            ))}
            <span className="text-gray-300">|</span>
            <button className="text-xs text-gray-400 hover:text-[#5DB347] whitespace-nowrap">+ Add smart list</button>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAdvFilters(!showAdvFilters)} className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-2 ${showAdvFilters ? 'border-[#5DB347] text-[#5DB347] bg-[#5DB347]/5' : 'border-gray-200 text-gray-500'}`}>
              <Filter className="w-3.5 h-3.5" /> Advanced filters
            </button>
            <div className="relative">
              <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1.5 text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-50">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort ({sortField.replace(/_/g, ' ')})
              </button>
              {showSortMenu && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-20">
                  {[
                    { field: 'contact_name' as SortField, label: 'Name' },
                    { field: 'contact_email' as SortField, label: 'Email' },
                    { field: 'business_name' as SortField, label: 'Business' },
                    { field: 'contact_type' as SortField, label: 'Type' },
                    { field: 'created_at' as SortField, label: 'Created' },
                    { field: 'last_message_at' as SortField, label: 'Last activity' },
                  ].map(s => (
                    <button key={s.field} onClick={() => { toggleSort(s.field); setShowSortMenu(false); }} className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center justify-between ${sortField === s.field ? 'text-[#5DB347] font-medium' : 'text-gray-600'}`}>
                      {s.label}
                      {sortField === s.field && <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1" />
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} placeholder="Search Contacts" className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#5DB347]" />
            </div>
          </div>

          {/* Advanced filters */}
          {showAdvFilters && (
            <div className="mt-3 flex gap-2 items-center bg-gray-50 rounded-lg p-3">
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs"><option value="all">All Types</option><option value="lead">Lead</option><option value="member">Member</option><option value="supplier">Supplier</option><option value="ambassador">Ambassador</option><option value="investor">Investor</option></select>
              <select value={tagFilter} onChange={e => { setTagFilter(e.target.value); setPage(1); }} className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs"><option value="all">All Tags</option>{allTags.map(t => <option key={t} value={t}>{t}</option>)}</select>
              {(typeFilter !== 'all' || tagFilter !== 'all') && <button onClick={() => { setTypeFilter('all'); setTagFilter('all'); }} className="text-xs text-red-500 hover:underline">Clear</button>}
            </div>
          )}

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="mt-3 flex items-center gap-3 bg-blue-50 rounded-lg p-3">
              <span className="text-xs font-medium text-blue-700">{selectedIds.size} selected</span>
              <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs"><option value="">Action...</option><option value="tag">Add Tag</option><option value="close">Close</option><option value="assign-devon">Assign Devon</option><option value="assign-peter">Assign Peter</option><option value="dnd">Set DND</option></select>
              {bulkAction === 'tag' && <input type="text" value={bulkTag} onChange={e => setBulkTag(e.target.value)} placeholder="Tag" className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-28" />}
              <button onClick={executeBulk} disabled={!bulkAction} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg disabled:opacity-50">Apply</button>
              <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400">Clear</button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /><p className="text-sm text-gray-400">Loading...</p></div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16"><Users className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400">No contacts found</p></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 w-10"><input type="checkbox" checked={selectedIds.size === paged.length && paged.length > 0} onChange={toggleSelectAll} className="rounded border-gray-300 text-[#5DB347]" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('contact_name')}>Contact name <SortIcon field="contact_name" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('contact_type')}>Phone <SortIcon field="contact_type" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('business_name')}>Business name <SortIcon field="business_name" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('created_at')}>Created <SortIcon field="created_at" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 cursor-pointer select-none" onClick={() => toggleSort('last_message_at')}>Last activity <SortIcon field="last_message_at" /></th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map(c => (
                  <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.has(c.id) ? 'bg-blue-50/30' : ''}`}>
                    <td className="py-3 px-4"><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-gray-300 text-[#5DB347]" /></td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/inbox?conversation=${c.id}`} className="flex items-center gap-3 group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${TYPE_COLORS[c.contact_type] || 'bg-gray-100 text-gray-600'}`}>
                          {(c.contact_name || '?').substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-[#1B2A4A] group-hover:text-[#5DB347] transition-colors">{c.contact_name || 'Unknown'}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {c.contact_phone ? (
                        <span className="flex items-center gap-1.5 text-xs text-gray-600"><Phone className="w-3 h-3 text-gray-400" /> {c.contact_phone}</span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      {c.contact_email ? (
                        <span className="flex items-center gap-1.5 text-xs text-gray-600"><Mail className="w-3 h-3 text-gray-400" /> {c.contact_email.length > 24 ? c.contact_email.substring(0, 24) + '...' : c.contact_email}</span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">{c.business_name || <span className="text-gray-300">—</span>}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{new Date(c.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}<br /><span className="text-gray-400">{new Date(c.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span></td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3 h-3 text-gray-400" /> {timeAgoShort(c.last_message_at)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {(c.tags || []).slice(0, 2).map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 whitespace-nowrap">{t}</span>
                        ))}
                        {(c.tags || []).length > 2 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">+{(c.tags || []).length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-white">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <select value={PAGE_SIZE} className="border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-500 mr-2" disabled>
              <option value="25">25</option>
            </select>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page + i - 2;
              if (p < 1 || p > totalPages) return null;
              return <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium ${p === page ? 'bg-[#5DB347] text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>{p}</button>;
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            <span className="text-xs text-gray-400 ml-2">Next</span>
          </div>
        </div>
      </div>

      {/* ═══ ADD CONTACT MODAL ═══ */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">Add Contact</h3>
              <button onClick={() => setShowAddContact(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Name *</label><input type="text" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label><input type="text" value={newContact.business} onChange={e => setNewContact(p => ({ ...p, business: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label><input type="email" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input type="tel" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Type</label><select value={newContact.type} onChange={e => setNewContact(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="lead">Lead</option><option value="member">Member</option><option value="supplier">Supplier</option><option value="ambassador">Ambassador</option><option value="investor">Investor</option></select></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Country</label><input type="text" value={newContact.country} onChange={e => setNewContact(p => ({ ...p, country: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Tags (comma-separated)</label><input type="text" value={newContact.tags} onChange={e => setNewContact(p => ({ ...p, tags: e.target.value }))} placeholder="lead, hot, kenya" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowAddContact(false)} className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={addContact} disabled={saving || (!newContact.name && !newContact.email)} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Contact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
