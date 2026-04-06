'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Users, Search, Plus, Loader2, ChevronRight, Mail, Phone,
  MessageSquare, Clock, Star, Tag, MoreVertical, X, Globe,
  Building2, Award, Shield, User, ArrowRight, RefreshCw,
} from 'lucide-react';

/* ─── Types ─── */
interface Conversation {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  subject: string | null;
  status: string;
  assigned_to: string | null;
  priority: string;
  last_message_at: string;
  unread_count: number;
  tags: string[];
  created_at: string;
}

const PIPELINE_STAGES = [
  { key: 'open', label: 'New Leads', color: 'border-blue-400', bg: 'bg-blue-50', badge: 'bg-blue-500' },
  { key: 'assigned', label: 'Contacted', color: 'border-amber-400', bg: 'bg-amber-50', badge: 'bg-amber-500' },
  { key: 'resolved', label: 'Qualified', color: 'border-green-400', bg: 'bg-green-50', badge: 'bg-green-500' },
  { key: 'closed', label: 'Closed / Won', color: 'border-gray-400', bg: 'bg-gray-50', badge: 'bg-gray-500' },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  member: <Users className="w-3 h-3" />,
  supplier: <Building2 className="w-3 h-3" />,
  ambassador: <Award className="w-3 h-3" />,
  investor: <Shield className="w-3 h-3" />,
  lead: <User className="w-3 h-3" />,
};

const PRIORITY_DOTS: Record<string, string> = {
  low: 'bg-gray-300',
  normal: 'bg-blue-400',
  high: 'bg-amber-400',
  urgent: 'bg-red-500',
};

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default function PipelinePage() {
  const supabase = useMemo(() => createClient(), []);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dragging, setDragging] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    setConversations((data || []) as Conversation[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const filtered = useMemo(() => {
    let list = conversations;
    if (typeFilter !== 'all') list = list.filter(c => c.contact_type === typeFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c => c.contact_name?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, typeFilter, searchTerm]);

  const stageConversations = (stageKey: string) => filtered.filter(c => c.status === stageKey);

  const moveToStage = async (convId: string, newStatus: string) => {
    await supabase.from('conversations').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, status: newStatus } : c));
  };

  // Drag handlers
  const handleDragStart = (convId: string) => setDragging(convId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (stageKey: string) => {
    if (dragging) {
      moveToStage(dragging, stageKey);
      setDragging(null);
    }
  };

  // Stats
  const totalValue = conversations.length;
  const newLeads = conversations.filter(c => c.status === 'open').length;
  const contacted = conversations.filter(c => c.status === 'assigned').length;
  const qualified = conversations.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">CRM Pipeline</h1>
          <p className="text-sm text-gray-500">Drag contacts through your sales pipeline</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/inbox" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2A4A] border border-gray-200 rounded-xl px-4 py-2">
            <MessageSquare className="w-4 h-4" /> Inbox View
          </a>
          <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-xs text-gray-500">Total Contacts</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{totalValue}</p>
        </div>
        <div className="bg-white rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-xs text-blue-500">New Leads</p>
          <p className="text-2xl font-bold text-blue-600">{newLeads}</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 text-center">
          <p className="text-xs text-amber-500">Contacted</p>
          <p className="text-2xl font-bold text-amber-600">{contacted}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center">
          <p className="text-xs text-green-500">Qualified</p>
          <p className="text-2xl font-bold text-green-600">{qualified}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search contacts..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
        </div>
        <div className="flex gap-1">
          {['all', 'lead', 'member', 'supplier', 'ambassador', 'investor'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${typeFilter === t ? 'bg-[#1B2A4A] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pipeline Kanban */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /><p className="text-sm text-gray-400">Loading...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PIPELINE_STAGES.map(stage => {
            const cards = stageConversations(stage.key);
            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.key)}
                className={`rounded-2xl border-2 ${stage.color} ${stage.bg} min-h-[400px] flex flex-col`}
              >
                {/* Stage header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stage.badge}`} />
                    <h3 className="text-sm font-bold text-[#1B2A4A]">{stage.label}</h3>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-0.5 rounded-full">{cards.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {cards.map(conv => (
                    <div
                      key={conv.id}
                      draggable
                      onDragStart={() => handleDragStart(conv.id)}
                      className={`bg-white rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing border border-gray-100 hover:shadow-md transition-shadow ${dragging === conv.id ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[conv.priority] || PRIORITY_DOTS.normal}`} />
                          <span className="text-xs font-semibold text-[#1B2A4A] truncate max-w-[140px]">
                            {conv.contact_name || conv.contact_email || 'Unknown'}
                          </span>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#5DB347] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{conv.unread_count}</span>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-400 truncate mb-2">{conv.subject || conv.contact_email}</p>

                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded ${conv.contact_type === 'investor' ? 'bg-purple-100 text-purple-600' : conv.contact_type === 'supplier' ? 'bg-blue-100 text-blue-600' : conv.contact_type === 'ambassador' ? 'bg-amber-100 text-amber-600' : conv.contact_type === 'member' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {TYPE_ICONS[conv.contact_type] || <User className="w-2.5 h-2.5" />} {conv.contact_type}
                        </span>
                        <span className="text-[9px] text-gray-400">{timeAgo(conv.last_message_at)}</span>
                      </div>

                      {conv.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {conv.tags.slice(0, 2).map(t => (
                            <span key={t} className="text-[8px] px-1.5 py-0.5 rounded bg-gray-50 text-gray-400">{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Quick actions */}
                      <div className="flex gap-1 mt-2 pt-2 border-t border-gray-50">
                        <a href={`/admin/inbox?id=${conv.id}`} className="text-[9px] text-[#5DB347] hover:underline font-medium">View Thread</a>
                        {conv.contact_email && (
                          <a href={`mailto:${conv.contact_email}`} className="text-[9px] text-blue-500 hover:underline ml-auto">Email</a>
                        )}
                      </div>
                    </div>
                  ))}

                  {cards.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-gray-400">No contacts in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
