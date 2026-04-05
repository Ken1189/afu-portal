'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Search, Filter, Mail, MessageSquare, Phone, Send, Loader2, Plus,
  X, ChevronDown, Tag, User, Clock, CheckCircle2, AlertCircle,
  ArrowRight, RefreshCw, Inbox, Star, Archive, MoreVertical,
  Globe, Shield, Award, Building2, Users,
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
  sender_phone: string | null;
  subject: string | null;
  body: string;
  html_body: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  assigned: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-400',
  normal: 'text-blue-500',
  high: 'text-amber-500',
  urgent: 'text-red-500',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  member: <Users className="w-3.5 h-3.5" />,
  supplier: <Building2 className="w-3.5 h-3.5" />,
  ambassador: <Award className="w-3.5 h-3.5" />,
  investor: <Shield className="w-3.5 h-3.5" />,
  lead: <User className="w-3.5 h-3.5" />,
};

const CHANNEL_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  email: { icon: <Mail className="w-3.5 h-3.5" />, color: 'text-blue-500' },
  sms: { icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-green-500' },
  whatsapp: { icon: <Phone className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
  form: { icon: <Globe className="w-3.5 h-3.5" />, color: 'text-purple-500' },
  system: { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-gray-400' },
};

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

/* ─── Component ─── */
export default function AdminInboxPage() {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Reply
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState('email');

  // Compose
  const [showCompose, setShowCompose] = useState(false);
  const [compose, setCompose] = useState({ name: '', email: '', phone: '', type: 'lead', subject: '', message: '', channel: 'email' });

  // Actions
  const [showActions, setShowActions] = useState(false);

  // ── Fetch conversations ──
  const fetchConversations = useCallback(async () => {
    setLoading(true);

    // First try API (which creates conversations from contact_submissions if needed)
    const { data } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });

    if (data && data.length > 0) {
      setConversations(data);
    } else {
      // Import from contact_submissions as seed
      const { data: contacts } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      if (contacts && contacts.length > 0) {
        const convos: Partial<Conversation>[] = contacts.map(c => ({
          contact_name: c.full_name || c.name,
          contact_email: c.email,
          contact_type: c.subject === 'investor' ? 'investor' : c.subject === 'membership' ? 'member' : 'lead',
          subject: c.subject || 'Contact Form',
          status: 'open',
          priority: 'normal',
          unread_count: 1,
          last_message_at: c.created_at,
          tags: c.subject ? [c.subject] : [],
        }));

        const { data: inserted } = await supabase.from('conversations').insert(convos).select();
        if (inserted) {
          // Add the original messages
          const msgs = inserted.map((conv, i) => ({
            conversation_id: conv.id,
            direction: 'inbound',
            channel: 'form',
            sender_name: contacts[i].full_name || contacts[i].name,
            sender_email: contacts[i].email,
            body: contacts[i].message || `${contacts[i].subject}: Contact form submission`,
            status: 'delivered',
            created_at: contacts[i].created_at,
          }));
          await supabase.from('conversation_messages').insert(msgs);
          setConversations(inserted);
        }
      }

      // Also import from membership_applications
      const { data: apps } = await supabase.from('membership_applications').select('*').order('created_at', { ascending: false }).limit(50);
      if (apps && apps.length > 0) {
        const existingEmails = new Set(conversations.map(c => c.contact_email));
        const newApps = apps.filter(a => a.email && !existingEmails.has(a.email));
        if (newApps.length > 0) {
          const convos = newApps.map(a => ({
            contact_name: a.full_name,
            contact_email: a.email,
            contact_phone: a.phone || null,
            contact_type: a.requested_tier === 'ambassador' ? 'ambassador' : a.requested_tier === 'partner' ? 'supplier' : 'member',
            subject: `${a.requested_tier || 'Membership'} Application`,
            status: a.status === 'approved' ? 'resolved' : a.status === 'rejected' ? 'closed' : 'open',
            priority: 'normal',
            unread_count: a.status === 'pending' ? 1 : 0,
            last_message_at: a.created_at,
            tags: [a.requested_tier || 'application'],
          }));
          const { data: inserted2 } = await supabase.from('conversations').insert(convos).select();
          if (inserted2) {
            const msgs2 = inserted2.map((conv, i) => ({
              conversation_id: conv.id,
              direction: 'inbound',
              channel: 'form',
              sender_name: newApps[i].full_name,
              sender_email: newApps[i].email,
              body: `Application for ${newApps[i].requested_tier || 'membership'} tier.\nCountry: ${newApps[i].country || 'N/A'}\nPhone: ${newApps[i].phone || 'N/A'}\n${newApps[i].notes || ''}`.trim(),
              status: 'delivered',
              created_at: newApps[i].created_at,
            }));
            await supabase.from('conversation_messages').insert(msgs2);
            setConversations(prev => [...prev, ...inserted2]);
          }
        }
      }
    }

    // Re-fetch clean list
    const { data: final } = await supabase.from('conversations').select('*').order('last_message_at', { ascending: false });
    if (final) setConversations(final);
    setLoading(false);
  }, [supabase, conversations]);

  useEffect(() => { fetchConversations(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch messages for selected conversation ──
  const fetchMessages = useCallback(async (convId: string) => {
    setMessagesLoading(true);
    const { data } = await supabase.from('conversation_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    setMessages(data || []);
    setMessagesLoading(false);

    // Mark as read
    await supabase.from('conversations').update({ unread_count: 0 }).eq('id', convId);
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [supabase]);

  useEffect(() => { if (selectedId) fetchMessages(selectedId); }, [selectedId, fetchMessages]);

  // ── Send reply ──
  const handleReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);

    try {
      const res = await fetch(`/api/admin/inbox/${selectedId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText, channel: replyChannel }),
      });
      if (res.ok) {
        setReplyText('');
        fetchMessages(selectedId);
        fetchConversations();
      }
    } catch { /* ignore */ }

    setSending(false);
  };

  // ── Compose new ──
  const handleCompose = async () => {
    if (!compose.email && !compose.phone) return;
    setSending(true);

    try {
      const res = await fetch('/api/admin/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: compose.name,
          contact_email: compose.email,
          contact_phone: compose.phone,
          contact_type: compose.type,
          subject: compose.subject,
          message: compose.message,
          channel: compose.channel,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCompose(false);
        setCompose({ name: '', email: '', phone: '', type: 'lead', subject: '', message: '', channel: 'email' });
        fetchConversations();
        if (data.conversation?.id) setSelectedId(data.conversation.id);
      }
    } catch { /* ignore */ }

    setSending(false);
  };

  // ── Update conversation ──
  const updateConversation = async (updates: Record<string, unknown>) => {
    if (!selectedId) return;
    await fetch(`/api/admin/inbox/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setConversations(prev => prev.map(c => c.id === selectedId ? { ...c, ...updates } as Conversation : c));
  };

  // ── Filtered conversations ──
  const filtered = useMemo(() => {
    let list = conversations;
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (typeFilter !== 'all') list = list.filter(c => c.contact_type === typeFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(c =>
        c.contact_name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, statusFilter, typeFilter, searchTerm]);

  const selectedConv = conversations.find(c => c.id === selectedId);
  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50 -m-4 -mt-2">
      {/* ═══ LEFT PANEL — Conversation List ═══ */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[#1B2A4A]">Inbox</h1>
              {totalUnread > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{totalUnread}</span>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowCompose(true)} className="p-2 rounded-lg bg-[#5DB347] text-white hover:bg-[#449933]"><Plus className="w-4 h-4" /></button>
              <button onClick={fetchConversations} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><RefreshCw className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search conversations..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" />
          </div>

          {/* Quick filters */}
          <div className="flex gap-1 overflow-x-auto">
            {['all', 'open', 'assigned', 'resolved'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusFilter === s ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Type filter */}
        <div className="px-4 py-2 border-b border-gray-50 flex gap-1 overflow-x-auto">
          {['all', 'member', 'supplier', 'ambassador', 'investor', 'lead'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${typeFilter === t ? 'bg-[#1B2A4A] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#5DB347]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No conversations</p>
            </div>
          ) : (
            filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedId === conv.id ? 'bg-[#5DB347]/5 border-l-2 border-l-[#5DB347]' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`${PRIORITY_COLORS[conv.priority] || 'text-gray-400'}`}>
                        {TYPE_ICONS[conv.contact_type] || <User className="w-3.5 h-3.5" />}
                      </span>
                      <span className={`text-sm font-medium truncate ${conv.unread_count > 0 ? 'text-[#1B2A4A] font-semibold' : 'text-gray-700'}`}>
                        {conv.contact_name || conv.contact_email || 'Unknown'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 truncate ${conv.unread_count > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                      {conv.subject || 'No subject'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{timeAgo(conv.last_message_at)}</span>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#5DB347] text-white text-[10px] font-bold flex items-center justify-center">{conv.unread_count}</span>
                    )}
                  </div>
                </div>
                {conv.tags?.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {conv.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ═══ CENTER PANEL — Message Thread ═══ */}
      <div className="flex-1 flex flex-col bg-white">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Mail className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#1B2A4A]">{selectedConv?.contact_name || selectedConv?.contact_email}</h2>
                <p className="text-xs text-gray-400">{selectedConv?.subject || 'No subject'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedConv?.status || 'open']}`}>{selectedConv?.status}</span>
                <div className="relative">
                  <button onClick={() => setShowActions(!showActions)} className="p-1.5 rounded-lg hover:bg-gray-100"><MoreVertical className="w-4 h-4 text-gray-400" /></button>
                  {showActions && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-48 z-20">
                      <button onClick={() => { updateConversation({ status: 'resolved' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Mark Resolved</button>
                      <button onClick={() => { updateConversation({ status: 'closed' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Archive className="w-4 h-4 text-gray-400" /> Close</button>
                      <button onClick={() => { updateConversation({ priority: 'urgent' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Mark Urgent</button>
                      <button onClick={() => { updateConversation({ status: 'open' }); setShowActions(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-blue-500" /> Reopen</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#5DB347]" /></div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No messages yet</p>
              ) : (
                messages.map(msg => {
                  const ch = CHANNEL_ICONS[msg.channel] || CHANNEL_ICONS.email;
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 ${isOutbound ? 'bg-[#5DB347] text-white' : 'bg-gray-100 text-gray-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={isOutbound ? 'text-white/70' : ch.color}>{ch.icon}</span>
                          <span className={`text-xs font-medium ${isOutbound ? 'text-white/80' : 'text-gray-500'}`}>
                            {msg.sender_name || msg.sender_email || 'System'}
                          </span>
                          <span className={`text-[10px] ${isOutbound ? 'text-white/50' : 'text-gray-400'}`}>{timeAgo(msg.created_at)}</span>
                        </div>
                        {msg.subject && <p className={`text-xs font-semibold mb-1 ${isOutbound ? 'text-white/90' : 'text-gray-700'}`}>{msg.subject}</p>}
                        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isOutbound ? 'text-white' : 'text-gray-700'}`}>{msg.body}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply bar */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <select value={replyChannel} onChange={e => setReplyChannel(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
                <span className="text-xs text-gray-400">
                  to {replyChannel === 'email' ? selectedConv?.contact_email : selectedConv?.contact_phone || selectedConv?.contact_email}
                </span>
              </div>
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || sending}
                  className="px-4 rounded-xl bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Ctrl+Enter to send</p>
            </div>
          </>
        )}
      </div>

      {/* ═══ RIGHT PANEL — Contact Details ═══ */}
      {selectedConv && (
        <div className="w-72 flex-shrink-0 bg-gray-50 border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            {/* Contact card */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-lg font-bold mx-auto mb-3">
                {(selectedConv.contact_name || '?')[0].toUpperCase()}
              </div>
              <h3 className="text-center font-semibold text-[#1B2A4A] text-sm">{selectedConv.contact_name || 'Unknown'}</h3>
              <p className="text-center text-xs text-gray-400 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${selectedConv.contact_type === 'member' ? 'bg-green-100 text-green-700' : selectedConv.contact_type === 'investor' ? 'bg-purple-100 text-purple-700' : selectedConv.contact_type === 'supplier' ? 'bg-blue-100 text-blue-700' : selectedConv.contact_type === 'ambassador' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {TYPE_ICONS[selectedConv.contact_type]} {selectedConv.contact_type}
                </span>
              </p>

              <div className="mt-4 space-y-2">
                {selectedConv.contact_email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{selectedConv.contact_email}</span>
                  </div>
                )}
                {selectedConv.contact_phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {selectedConv.contact_phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedConv.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Actions</h4>
              <div className="space-y-2">
                <select
                  value={selectedConv.status}
                  onChange={e => updateConversation({ status: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={selectedConv.priority}
                  onChange={e => updateConversation({ priority: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>

                <select
                  value={selectedConv.assigned_to || ''}
                  onChange={e => updateConversation({ assigned_to: e.target.value || null })}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  <option value="0ebabea8-bb9d-43e8-b5f3-fe7866bdeed2">Devon K</option>
                  <option value="c7f6fe4f-d1fb-46ba-8cf8-7de6e3d113bd">Peter W</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {(selectedConv.tags || []).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#5DB347]/10 text-[#5DB347] font-medium">{t}</span>
                ))}
                {(!selectedConv.tags || selectedConv.tags.length === 0) && (
                  <span className="text-xs text-gray-400">No tags</span>
                )}
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
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                  <input type="text" value={compose.name} onChange={e => setCompose(p => ({ ...p, name: e.target.value }))} placeholder="Contact name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select value={compose.type} onChange={e => setCompose(p => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="lead">Lead</option>
                    <option value="member">Member</option>
                    <option value="supplier">Supplier</option>
                    <option value="ambassador">Ambassador</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                  <input type="email" value={compose.email} onChange={e => setCompose(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <input type="tel" value={compose.phone} onChange={e => setCompose(p => ({ ...p, phone: e.target.value }))} placeholder="+263 77 123 4567" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                  <input type="text" value={compose.subject} onChange={e => setCompose(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
                  <select value={compose.channel} onChange={e => setCompose(p => ({ ...p, channel: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                <textarea value={compose.message} onChange={e => setCompose(p => ({ ...p, message: e.target.value }))} rows={4} placeholder="Write your message..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
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
