'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';
import {
  Search, Mail, MessageSquare, Phone, Send, Loader2, Plus,
  X, Tag, User, Clock, CheckCircle2, AlertCircle,
  RefreshCw, Inbox, Star, Archive, MoreVertical,
  Globe, Shield, Award, Building2, Users, StickyNote,
  ChevronDown, Zap, Copy, ExternalLink, MapPin, Calendar,
  FileText, DollarSign, Hash, Eye,
} from 'lucide-react';

/* ─── Types ─── */
interface Conversation {
  id: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_type: string;
  profile_id: string | null;
  subject: string | null;
  status: string;
  assigned_to: string | null;
  priority: string;
  last_message_at: string;
  unread_count: number;
  tags: string[];
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  channel: string;
  sender_name: string | null;
  sender_email: string | null;
  body: string;
  status: string;
  subject: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

type ListTab = 'all' | 'unread' | 'starred' | 'mine';
type DetailTab = 'conversation' | 'notes' | 'activity';

const STATUS_COLORS: Record<string, string> = { open: 'bg-blue-100 text-blue-700', assigned: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' };
const PRIORITY_COLORS: Record<string, string> = { low: 'border-gray-200', normal: 'border-blue-200', high: 'border-amber-300', urgent: 'border-red-400' };
const TYPE_ICONS: Record<string, React.ReactNode> = { member: <Users className="w-3.5 h-3.5" />, supplier: <Building2 className="w-3.5 h-3.5" />, ambassador: <Award className="w-3.5 h-3.5" />, investor: <Shield className="w-3.5 h-3.5" />, lead: <User className="w-3.5 h-3.5" /> };
const TYPE_COLORS: Record<string, string> = { member: 'bg-green-100 text-green-700', supplier: 'bg-blue-100 text-blue-700', ambassador: 'bg-amber-100 text-amber-700', investor: 'bg-purple-100 text-purple-700', lead: 'bg-gray-100 text-gray-600' };
const CHANNEL_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  email: { icon: <Mail className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-50', label: 'Email' },
  sms: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-green-500 bg-green-50', label: 'SMS' },
  whatsapp: { icon: <Phone className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50', label: 'WhatsApp' },
  form: { icon: <Globe className="w-3.5 h-3.5" />, color: 'text-purple-500 bg-purple-50', label: 'Form' },
  note: { icon: <StickyNote className="w-3.5 h-3.5" />, color: 'text-amber-500 bg-amber-50', label: 'Note' },
  system: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-gray-400 bg-gray-50', label: 'System' },
};

const QUICK_REPLIES = [
  { label: 'Thanks for reaching out', body: 'Thank you for reaching out to the African Farming Union. We appreciate your interest and will get back to you shortly.' },
  { label: 'Application received', body: 'We have received your application and our team is reviewing it. You will hear from us within 3-5 business days.' },
  { label: 'Schedule a call', body: 'We would love to discuss this further. Would you be available for a call this week? Please let us know your preferred time.' },
  { label: 'Welcome to AFU', body: 'Welcome to the African Farming Union family! We are excited to have you on board. Please let us know if you have any questions.' },
];

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/* ─── Component ─── */
export default function AdminInboxPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user, profile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Core state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // List filters
  const [listTab, setListTab] = useState<ListTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  // Reply
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState('email');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Detail panel
  const [detailTab, setDetailTab] = useState<DetailTab>('conversation');
  const [noteText, setNoteText] = useState('');

  // Compose
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ name: '', email: '', phone: '', type: 'lead', subject: '', message: '', channel: 'email' });

  // Actions menu
  const [showActions, setShowActions] = useState(false);

  // ── Fetch ──
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });

    if (!data || data.length === 0) {
      // Auto-import from contact_submissions + membership_applications
      const { data: contacts } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      const { data: apps } = await supabase.from('membership_applications').select('*').order('created_at', { ascending: false }).limit(50);

      const convos: Record<string, unknown>[] = [];
      const msgQueue: { convIdx: number; msg: Record<string, unknown> }[] = [];

      (contacts || []).forEach((c, i) => {
        convos.push({
          contact_name: c.full_name || c.name,
          contact_email: c.email,
          contact_type: c.subject === 'investor' ? 'investor' : c.subject === 'membership' ? 'member' : 'lead',
          subject: c.subject || 'Contact Form',
          status: 'open', priority: 'normal', unread_count: 1,
          last_message_at: c.created_at, tags: c.subject ? [c.subject] : [],
        });
        msgQueue.push({ convIdx: convos.length - 1, msg: { direction: 'inbound', channel: 'form', sender_name: c.full_name || c.name, sender_email: c.email, body: c.message || 'Contact form submission', status: 'delivered', created_at: c.created_at } });
      });

      const seenEmails = new Set((contacts || []).map(c => c.email));
      (apps || []).forEach(a => {
        if (!a.email || seenEmails.has(a.email)) return;
        seenEmails.add(a.email);
        convos.push({
          contact_name: a.full_name, contact_email: a.email, contact_phone: a.phone || null,
          contact_type: a.requested_tier === 'ambassador' ? 'ambassador' : a.requested_tier === 'partner' ? 'supplier' : 'member',
          subject: `${a.requested_tier || 'Membership'} Application`,
          status: a.status === 'approved' ? 'resolved' : a.status === 'rejected' ? 'closed' : 'open',
          priority: 'normal', unread_count: a.status === 'pending' ? 1 : 0,
          last_message_at: a.created_at, tags: [a.requested_tier || 'application'],
        });
        msgQueue.push({ convIdx: convos.length - 1, msg: { direction: 'inbound', channel: 'form', sender_name: a.full_name, sender_email: a.email, body: `Application: ${a.requested_tier || 'membership'}\nCountry: ${a.country || 'N/A'}\nPhone: ${a.phone || 'N/A'}\n${a.notes || ''}`.trim(), status: 'delivered', created_at: a.created_at } });
      });

      if (convos.length > 0) {
        const { data: inserted } = await supabase.from('conversations').insert(convos).select();
        if (inserted) {
          const msgs = msgQueue.map(q => ({ ...q.msg, conversation_id: inserted[q.convIdx].id }));
          await supabase.from('conversation_messages').insert(msgs);
        }
      }
    }

    // Re-fetch clean
    const { data: final } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    setConversations((final || []) as Conversation[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    const { data } = await supabase.from('conversation_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    setMessages((data || []) as Message[]);
    setMessagesLoading(false);
    await supabase.from('conversations').update({ unread_count: 0 }).eq('id', convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [supabase]);

  useEffect(() => { if (selectedId) { fetchMessages(selectedId); setDetailTab('conversation'); } }, [selectedId, fetchMessages]);

  // ── Actions ──
  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/inbox/${selectedId}/reply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: replyText, channel: replyChannel }) });
      if (res.ok) { setReplyText(''); fetchMessages(selectedId); fetchConversations(); }
    } catch { /* ignore */ }
    setSending(false);
  };

  const addNote = async () => {
    if (!noteText.trim() || !selectedId) return;
    setSending(true);
    await supabase.from('conversation_messages').insert({
      conversation_id: selectedId, direction: 'outbound', channel: 'note',
      sender_name: profile?.full_name || 'Admin', sender_email: profile?.email,
      body: noteText, status: 'delivered', metadata: { is_note: true },
    });
    setNoteText('');
    fetchMessages(selectedId);
    setSending(false);
  };

  const handleCompose = async () => {
    if (!compose.email && !compose.phone) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/inbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contact_name: compose.name, contact_email: compose.email, contact_phone: compose.phone, contact_type: compose.type, subject: compose.subject, message: compose.message, channel: compose.channel }) });
      if (res.ok) { const d = await res.json(); setShowCompose(false); setCompose({ name: '', email: '', phone: '', type: 'lead', subject: '', message: '', channel: 'email' }); fetchConversations(); if (d.conversation?.id) setSelectedId(d.conversation.id); }
    } catch { /* ignore */ }
    setSending(false);
  };

  const updateConversation = async (updates: Record<string, unknown>) => {
    if (!selectedId) return;
    await fetch(`/api/admin/inbox/${selectedId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) });
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, ...updates } as Conversation : c));
  };

  const toggleStar = (id: string) => {
    setStarredIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  // ── Filtered ──
  const filtered = useMemo(() => {
    let list = conversations;
    if (listTab === 'unread') list = list.filter(c => c.unread_count > 0);
    if (listTab === 'starred') list = list.filter(c => starredIds.has(c.id));
    if (listTab === 'mine') list = list.filter(c => c.assigned_to === user?.id);
    if (typeFilter !== 'all') list = list.filter(c => c.contact_type === typeFilter);
    if (searchTerm) { const q = searchTerm.toLowerCase(); list = list.filter(c => c.contact_name?.toLowerCase().includes(q) || c.contact_email?.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q)); }
    return list;
  }, [conversations, listTab, typeFilter, searchTerm, starredIds, user?.id]);

  const selectedConv = conversations.find(c => c.id === selectedId);
  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 -m-4 -mt-2">
      {/* ═══ LEFT PANEL ═══ */}
      <div className="w-[340px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1B2A4A]">Conversations</h1>
              {totalUnread > 0 && <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{totalUnread}</span>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowCompose(true)} className="p-2 rounded-lg bg-[#5DB347] text-white hover:bg-[#449933]" title="New conversation"><Plus className="w-4 h-4" /></button>
              <Link href="/admin/inbox/pipeline" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="Pipeline view"><Zap className="w-4 h-4" /></Link>
              <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search name, email, subject..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
          </div>

          {/* Tabs - GHL style */}
          <div className="flex border-b border-gray-100 -mx-4 px-4">
            {([['all', 'All'], ['unread', `Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}`], ['starred', 'Starred'], ['mine', 'Mine']] as [ListTab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setListTab(key)} className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${listTab === key ? 'border-[#5DB347] text-[#5DB347]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter chips */}
        <div className="px-4 py-2 flex gap-1 overflow-x-auto border-b border-gray-50">
          {['all', 'lead', 'member', 'supplier', 'ambassador', 'investor'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${typeFilter === t ? 'bg-[#1B2A4A] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#5DB347]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4"><Inbox className="w-8 h-8 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400">{conversations.length === 0 ? 'No conversations yet' : 'No results'}</p></div>
          ) : (
            filtered.map(conv => {
              const isSelected = selectedId === conv.id;
              const isStarred = starredIds.has(conv.id);
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`relative px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors group ${isSelected ? 'bg-[#5DB347]/5' : 'hover:bg-gray-50'} ${conv.unread_count > 0 ? 'bg-blue-50/30' : ''}`}
                >
                  {/* Priority stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${conv.priority === 'urgent' ? 'bg-red-500' : conv.priority === 'high' ? 'bg-amber-400' : isSelected ? 'bg-[#5DB347]' : 'bg-transparent'}`} />

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${conv.contact_type === 'investor' ? 'bg-purple-100 text-purple-700' : conv.contact_type === 'supplier' ? 'bg-blue-100 text-blue-700' : conv.contact_type === 'ambassador' ? 'bg-amber-100 text-amber-700' : conv.contact_type === 'member' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {(conv.contact_name || conv.contact_email || '?')[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-[#1B2A4A]' : 'font-medium text-gray-700'}`}>
                          {conv.contact_name || conv.contact_email || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(conv.last_message_at)}</span>
                      </div>

                      <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                        {conv.subject || 'No subject'}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded ${TYPE_COLORS[conv.contact_type] || TYPE_COLORS.lead}`}>
                          {TYPE_ICONS[conv.contact_type] || TYPE_ICONS.lead} {conv.contact_type}
                        </span>
                        {conv.tags?.slice(0, 2).map(t => (
                          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-400">{t}</span>
                        ))}
                      </div>
                    </div>

                    {/* Right indicators */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); toggleStar(conv.id); }} className={`p-0.5 ${isStarred ? 'text-amber-400' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`}>
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400' : ''}`} />
                      </button>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#5DB347] text-white text-[10px] font-bold flex items-center justify-center">{conv.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ CENTER PANEL — Thread ═══ */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center"><div className="text-center"><Mail className="w-16 h-16 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 text-sm font-medium">Select a conversation</p><p className="text-gray-300 text-xs mt-1">or start a new one</p></div></div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${selectedConv?.contact_type === 'investor' ? 'bg-purple-100 text-purple-700' : selectedConv?.contact_type === 'supplier' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {(selectedConv?.contact_name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#1B2A4A] text-sm truncate">{selectedConv?.contact_name || selectedConv?.contact_email}</h2>
                  <p className="text-[11px] text-gray-400 truncate">{selectedConv?.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selectedConv?.status || 'open']}`}>{selectedConv?.status}</span>
                <div className="relative">
                  <button onClick={() => setShowActions(!showActions)} className="p-1.5 rounded-lg hover:bg-gray-100"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                  {showActions && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-52 z-20">
                      <button onClick={() => { updateConversation({ status: 'resolved' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Mark Resolved</button>
                      <button onClick={() => { updateConversation({ status: 'closed' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Archive className="w-3.5 h-3.5 text-gray-400" /> Close Conversation</button>
                      <button onClick={() => { updateConversation({ priority: 'urgent' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5 text-red-500" /> Mark Urgent</button>
                      <button onClick={() => { updateConversation({ status: 'open' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Reopen</button>
                      <hr className="my-1" />
                      <button onClick={() => { toggleStar(selectedId!); setShowActions(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"><Star className="w-3.5 h-3.5 text-amber-400" /> {starredIds.has(selectedId!) ? 'Unstar' : 'Star'}</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detail tabs */}
            <div className="flex border-b border-gray-100 px-5">
              {([['conversation', 'Messages'], ['notes', 'Internal Notes'], ['activity', 'Activity']] as [DetailTab, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setDetailTab(key)} className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${detailTab === key ? 'border-[#5DB347] text-[#5DB347]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Messages / Notes / Activity */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#5DB347]" /></div>
              ) : detailTab === 'conversation' ? (
                messages.filter(m => m.channel !== 'note').length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
                ) : (
                  messages.filter(m => m.channel !== 'note').map(msg => {
                    const ch = CHANNEL_ICONS[msg.channel] || CHANNEL_ICONS.email;
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] ${isOutbound ? '' : ''}`}>
                          {/* Channel + sender + time */}
                          <div className={`flex items-center gap-2 mb-1 ${isOutbound ? 'justify-end' : ''}`}>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${ch.color}`}>{ch.icon} {ch.label}</span>
                            <span className="text-[10px] text-gray-400">{msg.sender_name || msg.sender_email}</span>
                            <span className="text-[10px] text-gray-300">{timeAgo(msg.created_at)}</span>
                          </div>
                          {/* Body */}
                          <div className={`rounded-2xl px-4 py-3 ${isOutbound ? 'bg-[#5DB347] text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                            {msg.subject && <p className={`text-xs font-semibold mb-1 ${isOutbound ? 'text-white/80' : 'text-gray-600'}`}>{msg.subject}</p>}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : detailTab === 'notes' ? (
                <>
                  {messages.filter(m => m.channel === 'note').length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-8">No internal notes yet</p>
                  ) : (
                    messages.filter(m => m.channel === 'note').map(msg => (
                      <div key={msg.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-xs font-medium text-amber-700">{msg.sender_name}</span>
                          <span className="text-[10px] text-amber-400">{timeAgo(msg.created_at)}</span>
                        </div>
                        <p className="text-sm text-amber-900 whitespace-pre-wrap">{msg.body}</p>
                      </div>
                    ))
                  )}
                  {/* Add note */}
                  <div className="border-t border-amber-100 pt-3 mt-3">
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add internal note (only visible to your team)..." rows={2} className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-amber-300 bg-amber-50/50" />
                    <div className="flex justify-end mt-2">
                      <button onClick={addNote} disabled={!noteText.trim() || sending} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50">
                        <StickyNote className="w-3.5 h-3.5" /> Add Note
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Activity tab */
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.channel === 'note' ? 'bg-amber-100' : msg.direction === 'outbound' ? 'bg-[#5DB347]/10' : 'bg-blue-50'}`}>
                        {(CHANNEL_ICONS[msg.channel] || CHANNEL_ICONS.email).icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700">
                          <span className="font-medium">{msg.sender_name || 'System'}</span>
                          {msg.channel === 'note' ? ' added a note' : msg.direction === 'outbound' ? ` sent ${msg.channel}` : ` received ${msg.channel}`}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">{msg.body.substring(0, 80)}{msg.body.length > 80 ? '...' : ''}</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(msg.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-green-50"><Plus className="w-3.5 h-3.5 text-green-500" /></div>
                    <div><p className="text-xs text-gray-700"><span className="font-medium">Conversation created</span></p><p className="text-[10px] text-gray-300">{selectedConv ? timeAgo(selectedConv.created_at) : ''}</p></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar */}
            {detailTab === 'conversation' && (
              <div className="p-4 border-t border-gray-100">
                {/* Channel selector — GHL style tabs */}
                <div className="flex items-center gap-1 mb-2">
                  {['email', 'sms', 'whatsapp'].map(ch => {
                    const c = CHANNEL_ICONS[ch];
                    return (
                      <button key={ch} onClick={() => setReplyChannel(ch)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${replyChannel === ch ? `${c.color} ring-1 ring-current` : 'text-gray-400 hover:bg-gray-50'}`}>
                        {c.icon} {c.label}
                      </button>
                    );
                  })}
                  <div className="ml-auto relative">
                    <button onClick={() => setShowQuickReplies(!showQuickReplies)} className="text-[10px] text-gray-400 hover:text-[#5DB347] flex items-center gap-1"><Zap className="w-3 h-3" /> Quick Reply</button>
                    {showQuickReplies && (
                      <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-64 z-20">
                        {QUICK_REPLIES.map((qr, i) => (
                          <button key={i} onClick={() => { setReplyText(qr.body); setShowQuickReplies(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 text-gray-600">{qr.label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={`Send ${replyChannel} to ${replyChannel === 'email' ? selectedConv?.contact_email : selectedConv?.contact_phone || selectedConv?.contact_email}...`} rows={3} className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-[#5DB347] focus:border-transparent" onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }} />
                  <div className="flex flex-col gap-1">
                    <button onClick={handleReply} disabled={!replyText.trim() || sending} className="flex-1 px-4 rounded-xl bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50 transition-colors flex items-center justify-center">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-300 mt-1">Ctrl+Enter to send</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ RIGHT PANEL — Contact Profile ═══ */}
      {selectedConv && (
        <div className="w-[300px] flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Contact card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 ${selectedConv.contact_type === 'investor' ? 'bg-purple-100 text-purple-700' : selectedConv.contact_type === 'supplier' ? 'bg-blue-100 text-blue-700' : selectedConv.contact_type === 'ambassador' ? 'bg-amber-100 text-amber-700' : selectedConv.contact_type === 'member' ? 'bg-green-100 text-green-700' : 'bg-[#1B2A4A] text-white'}`}>
                {(selectedConv.contact_name || '?')[0].toUpperCase()}
              </div>
              <h3 className="font-bold text-[#1B2A4A]">{selectedConv.contact_name || 'Unknown'}</h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${TYPE_COLORS[selectedConv.contact_type] || TYPE_COLORS.lead}`}>
                {TYPE_ICONS[selectedConv.contact_type]} {selectedConv.contact_type}
              </span>
            </div>

            {/* Contact details */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Info</h4>
              {selectedConv.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-700 truncate flex-1">{selectedConv.contact_email}</span>
                  <button onClick={() => navigator.clipboard.writeText(selectedConv.contact_email!)} className="text-gray-300 hover:text-gray-500"><Copy className="w-3 h-3" /></button>
                </div>
              )}
              {selectedConv.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-700">{selectedConv.contact_phone}</span>
                  <button onClick={() => navigator.clipboard.writeText(selectedConv.contact_phone!)} className="text-gray-300 hover:text-gray-500"><Copy className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Created {new Date(selectedConv.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">Last activity {timeAgo(selectedConv.last_message_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Manage</h4>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Status</label>
                <select value={selectedConv.status} onChange={e => updateConversation({ status: e.target.value })} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                  <option value="open">Open</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Priority</label>
                <select value={selectedConv.priority} onChange={e => updateConversation({ priority: e.target.value })} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                  <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 mb-1 block">Assigned To</label>
                <select value={selectedConv.assigned_to || ''} onChange={e => updateConversation({ assigned_to: e.target.value || null })} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2">
                  <option value="">Unassigned</option>
                  <option value="0ebabea8-bb9d-43e8-b5f3-fe7866bdeed2">Devon K</option>
                  <option value="c7f6fe4f-d1fb-46ba-8cf8-7de6e3d113bd">Peter W</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {(selectedConv.tags || []).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#5DB347]/10 text-[#5DB347] font-medium">{t}</span>
                ))}
                {(!selectedConv.tags || selectedConv.tags.length === 0) && <span className="text-xs text-gray-300">No tags</span>}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Links</h4>
              <div className="space-y-1">
                <Link href="/admin/applications" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#5DB347] py-1"><FileText className="w-3.5 h-3.5" /> Applications</Link>
                <Link href="/admin/members" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#5DB347] py-1"><Users className="w-3.5 h-3.5" /> Members</Link>
                <Link href="/admin/contracts" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#5DB347] py-1"><DollarSign className="w-3.5 h-3.5" /> Contracts</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ COMPOSE MODAL ═══ */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">New Conversation</h3>
              <button onClick={() => setShowCompose(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Name</label><input type="text" value={compose.name} onChange={e => setCompose(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Type</label><select value={compose.type} onChange={e => setCompose(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="lead">Lead</option><option value="member">Member</option><option value="supplier">Supplier</option><option value="ambassador">Ambassador</option><option value="investor">Investor</option></select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Email</label><input type="email" value={compose.email} onChange={e => setCompose(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Phone</label><input type="tel" value={compose.phone} onChange={e => setCompose(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Subject</label><input type="text" value={compose.subject} onChange={e => setCompose(p => ({ ...p, subject: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-500 mb-1">Channel</label><select value={compose.channel} onChange={e => setCompose(p => ({ ...p, channel: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></div>
              </div>
              <div><label className="block text-xs font-medium text-gray-500 mb-1">Message</label><textarea value={compose.message} onChange={e => setCompose(p => ({ ...p, message: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" /></div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowCompose(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleCompose} disabled={sending || (!compose.email && !compose.phone) || !compose.message} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
