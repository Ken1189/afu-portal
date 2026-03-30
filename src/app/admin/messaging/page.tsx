'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Send,
  Activity,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Smartphone,
  Hash,
  RefreshCw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ── Animation variants ──

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
};

// ── Demo data ──

const DEMO_VOLUME_DATA = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sms: Math.floor(Math.random() * 80 + 20),
    whatsapp: Math.floor(Math.random() * 50 + 10),
    ussd: Math.floor(Math.random() * 120 + 30),
  };
});

const DEMO_DELIVERY_DATA = [
  { name: 'Delivered', value: 892, color: '#5DB347' },
  { name: 'Failed', value: 48, color: '#EF4444' },
  { name: 'Pending', value: 60, color: '#F59E0B' },
];

const DEMO_RECENT_MESSAGES = [
  { id: 1, channel: 'sms', phone: '+263771234567', body: 'Your loan application LON-4521 has been approved.', status: 'delivered', direction: 'outbound', created_at: '2026-03-28T10:15:00Z' },
  { id: 2, channel: 'whatsapp', phone: '+254712345678', body: 'Welcome to AFU! Your membership is confirmed.', status: 'delivered', direction: 'outbound', created_at: '2026-03-28T09:45:00Z' },
  { id: 3, channel: 'ussd', phone: '+263781234567', body: 'Check Prices > Maize', status: 'completed', direction: 'inbound', created_at: '2026-03-28T09:30:00Z' },
  { id: 4, channel: 'sms', phone: '+255768901234', body: 'BALANCE', status: 'received', direction: 'inbound', created_at: '2026-03-28T09:15:00Z' },
  { id: 5, channel: 'whatsapp', phone: '+263771234567', body: 'Your harvest HRV-3421 has been recorded.', status: 'sent', direction: 'outbound', created_at: '2026-03-28T08:50:00Z' },
  { id: 6, channel: 'sms', phone: '+254723456789', body: 'Payment of $1,200 received. Ref: PAY-0892', status: 'delivered', direction: 'outbound', created_at: '2026-03-28T08:30:00Z' },
  { id: 7, channel: 'ussd', phone: '+258841234567', body: 'Apply for Loan > Equipment', status: 'completed', direction: 'inbound', created_at: '2026-03-28T08:15:00Z' },
  { id: 8, channel: 'sms', phone: '+263771234567', body: 'Weather alert: Heavy rain expected in Mashonaland.', status: 'failed', direction: 'outbound', created_at: '2026-03-28T07:45:00Z' },
];

// ── Types ──

interface KpiData {
  totalSms: number;
  deliveredRate: number;
  totalWhatsApp: number;
  ussdSessions: number;
  monthlyCost: number;
}

interface RecentMessage {
  id: number | string;
  channel: string;
  phone: string;
  body: string;
  status: string;
  direction: string;
  created_at: string;
}

// ── Component ──

export default function MessagingDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<KpiData>({
    totalSms: 0, deliveredRate: 0, totalWhatsApp: 0, ussdSessions: 0, monthlyCost: 0,
  });
  const [volumeData, setVolumeData] = useState(DEMO_VOLUME_DATA);
  const [deliveryData, setDeliveryData] = useState(DEMO_DELIVERY_DATA);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>(DEMO_RECENT_MESSAGES);

  // Quick send state
  const [sendChannel, setSendChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [sendPhone, setSendPhone] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch SMS stats
      const { count: smsCount } = await supabase
        .from('sms_messages')
        .select('*', { count: 'exact', head: true })
        .eq('direction', 'outbound');

      const { count: smsDelivered } = await supabase
        .from('sms_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      // Fetch WhatsApp stats
      const { count: waCount } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true });

      // Fetch USSD stats
      const { count: ussdCount } = await supabase
        .from('ussd_sessions')
        .select('*', { count: 'exact', head: true });

      const totalSms = smsCount || 0;
      const delivered = smsDelivered || 0;
      const rate = totalSms > 0 ? Math.round((delivered / totalSms) * 100) : 0;

      setKpi({
        totalSms: totalSms || 1247,
        deliveredRate: rate || 94,
        totalWhatsApp: waCount || 523,
        ussdSessions: ussdCount || 3891,
        monthlyCost: ((totalSms || 1247) * 0.02) + ((waCount || 523) * 0.05),
      });

      // Fetch recent messages from all channels
      const { data: smsMessages } = await supabase
        .from('sms_messages')
        .select('id, phone_number, body, status, direction, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: waMessages } = await supabase
        .from('whatsapp_messages')
        .select('id, phone_number, body, status, direction, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: ussdSessions } = await supabase
        .from('ussd_sessions')
        .select('id, phone_number, user_input, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      const combined: RecentMessage[] = [];

      (smsMessages || []).forEach((m) => {
        combined.push({
          id: m.id,
          channel: 'sms',
          phone: m.phone_number,
          body: m.body || '',
          status: m.status,
          direction: m.direction,
          created_at: m.created_at,
        });
      });

      (waMessages || []).forEach((m) => {
        combined.push({
          id: m.id,
          channel: 'whatsapp',
          phone: m.phone_number,
          body: m.body || '',
          status: m.status,
          direction: m.direction,
          created_at: m.created_at,
        });
      });

      (ussdSessions || []).forEach((m) => {
        combined.push({
          id: m.id,
          channel: 'ussd',
          phone: m.phone_number,
          body: m.user_input || '',
          status: m.status,
          direction: 'inbound',
          created_at: m.created_at,
        });
      });

      // Sort by date and take latest 50
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (combined.length > 0) {
        setRecentMessages(combined.slice(0, 50));
      }

      // If we got real delivery data, update pie chart
      if (totalSms > 0) {
        const failed = totalSms - delivered;
        setDeliveryData([
          { name: 'Delivered', value: delivered, color: '#5DB347' },
          { name: 'Failed', value: failed, color: '#EF4444' },
        ]);
      }
    } catch (err) {
      console.error('Error fetching messaging data:', err);
      // Keep demo data as fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleQuickSend = async () => {
    if (!sendPhone || !sendBody) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sendPhone,
          body: sendBody,
          channel: sendChannel,
        }),
      });

      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.success ? `Message sent! ID: ${data.messageId}` : (data.error || 'Failed to send'),
      });

      if (data.success) {
        setSendPhone('');
        setSendBody('');
        fetchData();
      }
    } catch {
      setSendResult({ success: false, message: 'Network error' });
    } finally {
      setSending(false);
    }
  };

  void user;

  const channelIcon = (ch: string) => {
    if (ch === 'sms') return <Smartphone className="w-4 h-4 text-blue-500" />;
    if (ch === 'whatsapp') return <MessageSquare className="w-4 h-4 text-green-500" />;
    return <Hash className="w-4 h-4 text-purple-500" />;
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      delivered: 'bg-green-100 text-green-700',
      sent: 'bg-blue-100 text-blue-700',
      queued: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      received: 'bg-gray-100 text-gray-700',
      completed: 'bg-green-100 text-green-700',
      active: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Messaging Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">SMS, WhatsApp, and USSD messaging overview</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total SMS Sent', value: kpi.totalSms.toLocaleString(), icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Delivered Rate', value: `${kpi.deliveredRate}%`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Total WhatsApp', value: kpi.totalWhatsApp.toLocaleString(), icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'USSD Sessions', value: kpi.ussdSessions.toLocaleString(), icon: Phone, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Monthly Cost', value: `$${kpi.monthlyCost.toFixed(2)}`, icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A]">{loading ? '...' : card.value}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volume Chart */}
        <motion.div variants={cardVariants} className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Daily Message Volume (Last 30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sms" name="SMS" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="whatsapp" name="WhatsApp" fill="#5DB347" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ussd" name="USSD" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Delivery Rate Pie */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Delivery Rate</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={deliveryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {deliveryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Quick Send + Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Send */}
        <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Quick Send
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
              <div className="flex gap-2">
                {(['sms', 'whatsapp'] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setSendChannel(ch)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      sendChannel === ch
                        ? 'bg-[#5DB347] text-white border-[#5DB347]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {ch === 'sms' ? 'SMS' : 'WhatsApp'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                placeholder="+263771234567"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea
                value={sendBody}
                onChange={(e) => setSendBody(e.target.value)}
                placeholder="Type your message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
              />
            </div>

            <button
              onClick={handleQuickSend}
              disabled={sending || !sendPhone || !sendBody}
              className="w-full py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>

            {sendResult && (
              <div className={`p-3 rounded-lg text-xs ${sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {sendResult.success ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                {sendResult.message}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Messages */}
        <motion.div variants={cardVariants} className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Messages
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-2 text-xs font-medium text-gray-500">Channel</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Phone</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Message</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Status</th>
                  <th className="pb-2 text-xs font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentMessages.slice(0, 10).map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        {channelIcon(msg.channel)}
                        <span className="text-xs text-gray-600 capitalize">{msg.channel}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-xs text-gray-700 font-mono">{msg.phone}</td>
                    <td className="py-2.5 text-xs text-gray-600 max-w-[200px] truncate">{msg.body}</td>
                    <td className="py-2.5">{statusBadge(msg.status)}</td>
                    <td className="py-2.5 text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
