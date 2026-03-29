'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plus,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  BarChart3,
  X,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Types ──

interface Campaign {
  id: string;
  name: string;
  channel: string;
  template_id: string | null;
  template_name?: string;
  target_audience: {
    country_code?: string[];
    membership_tier?: string[];
    cooperative_id?: string[];
    role?: string[];
  };
  body: string | null;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Template {
  id: string;
  name: string;
  channel: string;
  body: string;
}

// ── Demo data ──

const DEMO_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'March Price Update', channel: 'sms', template_id: '4', template_name: 'price_alert', target_audience: { country_code: ['ZW', 'MZ'] }, body: null, status: 'completed', total_recipients: 342, sent_count: 340, delivered_count: 328, failed_count: 14, scheduled_at: null, started_at: '2026-03-15T08:00:00Z', completed_at: '2026-03-15T08:15:00Z', created_at: '2026-03-14T10:00:00Z' },
  { id: '2', name: 'New Member Welcome', channel: 'whatsapp', template_id: '3', template_name: 'welcome_member', target_audience: { membership_tier: ['A', 'B'] }, body: null, status: 'completed', total_recipients: 28, sent_count: 28, delivered_count: 26, failed_count: 2, scheduled_at: null, started_at: '2026-03-20T10:00:00Z', completed_at: '2026-03-20T10:05:00Z', created_at: '2026-03-19T14:00:00Z' },
  { id: '3', name: 'April Loan Promo', channel: 'sms', template_id: '8', template_name: 'campaign_promo', target_audience: { country_code: ['ZW', 'TZ', 'MZ'] }, body: null, status: 'scheduled', total_recipients: 0, sent_count: 0, delivered_count: 0, failed_count: 0, scheduled_at: '2026-04-01T08:00:00Z', started_at: null, completed_at: null, created_at: '2026-03-25T11:00:00Z' },
  { id: '4', name: 'Weather Alert - Mashonaland', channel: 'sms', template_id: null, target_audience: { country_code: ['ZW'] }, body: 'AFU Weather Alert: Heavy rain expected in Mashonaland East 28-30 March. Protect stored harvests.', status: 'draft', total_recipients: 0, sent_count: 0, delivered_count: 0, failed_count: 0, scheduled_at: null, started_at: null, completed_at: null, created_at: '2026-03-27T09:00:00Z' },
];

// ── Component ──

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(DEMO_CAMPAIGNS);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Create campaign wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardName, setWizardName] = useState('');
  const [wizardChannel, setWizardChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [wizardTemplateId, setWizardTemplateId] = useState('');
  const [wizardBody, setWizardBody] = useState('');
  const [wizardCountries, setWizardCountries] = useState<string[]>([]);
  const [wizardTiers, setWizardTiers] = useState<string[]>([]);
  const [wizardRoles, setWizardRoles] = useState<string[]>([]);
  const [wizardSchedule, setWizardSchedule] = useState<'now' | 'later'>('now');
  const [wizardScheduleDate, setWizardScheduleDate] = useState('');

  // Detail view
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data: campaignsData } = await supabase
        .from('message_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignsData && campaignsData.length > 0) {
        setCampaigns(campaignsData);
      }

      const { data: templatesData } = await supabase
        .from('message_templates')
        .select('id, name, channel, body')
        .eq('is_active', true)
        .order('name');

      if (templatesData) {
        setTemplates(templatesData);
      }
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  void user;

  // Wizard helpers
  const resetWizard = () => {
    setWizardStep(1);
    setWizardName('');
    setWizardChannel('sms');
    setWizardTemplateId('');
    setWizardBody('');
    setWizardCountries([]);
    setWizardTiers([]);
    setWizardRoles([]);
    setWizardSchedule('now');
    setWizardScheduleDate('');
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (a: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const filteredTemplates = templates.filter((t) => t.channel === wizardChannel);

  const handleCreateCampaign = async () => {
    if (!wizardName) {
      showToast('error', 'Campaign name is required');
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.from('message_campaigns').insert({
        name: wizardName,
        channel: wizardChannel,
        template_id: wizardTemplateId || null,
        body: wizardBody || null,
        target_audience: {
          country_code: wizardCountries.length > 0 ? wizardCountries : undefined,
          membership_tier: wizardTiers.length > 0 ? wizardTiers : undefined,
          role: wizardRoles.length > 0 ? wizardRoles : undefined,
        },
        status: wizardSchedule === 'later' && wizardScheduleDate ? 'scheduled' : 'draft',
        scheduled_at: wizardSchedule === 'later' && wizardScheduleDate ? wizardScheduleDate : null,
        total_recipients: 0,
        sent_count: 0,
        delivered_count: 0,
        failed_count: 0,
      });

      if (error) throw error;

      showToast('success', 'Campaign created');
      setShowWizard(false);
      resetWizard();
      fetchData();
    } catch (err) {
      showToast('error', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // S3.7: Call the campaign send API instead of just updating status
  const handleSendCampaign = async (campaignId: string) => {
    setSending(campaignId);
    try {
      const res = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Send failed' }));
        throw new Error(data.error || 'Send failed');
      }

      showToast('success', 'Campaign sent successfully');
      fetchData();
    } catch (err) {
      showToast('error', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(null);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('message_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', campaignId);

      if (error) throw error;
      showToast('success', 'Campaign cancelled');
      fetchData();
    } catch (err) {
      showToast('error', `Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Filter campaigns
  const filtered = campaigns.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.channel.includes(q);
    }
    return true;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-red-50 text-red-500',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const channelBadge = (ch: string) => {
    const colors: Record<string, string> = {
      sms: 'bg-blue-100 text-blue-700',
      whatsapp: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[ch] || 'bg-gray-100 text-gray-700'}`}>{ch.toUpperCase()}</span>;
  };

  const COUNTRIES = [
    { code: 'ZW', name: 'Zimbabwe' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'MW', name: 'Malawi' },
  ];

  const TIERS = ['A', 'B', 'C', 'D'];
  const ROLES = ['member', 'farmer', 'cooperative_lead', 'supplier'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage message campaigns</p>
        </div>
        <button
          onClick={() => { resetWizard(); setShowWizard(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'scheduled', 'sending', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No campaigns found</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <div key={c.id}>
                <div
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpandedCampaign(expandedCampaign === c.id ? null : c.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#1B2A4A]">{c.name}</p>
                        {channelBadge(c.channel)}
                        {statusBadge(c.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {c.total_recipients} recipients
                        </span>
                        <span>{c.sent_count}/{c.total_recipients} sent</span>
                        {c.scheduled_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(c.scheduled_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(c.status === 'draft' || c.status === 'scheduled') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSendCampaign(c.id); }}
                        disabled={sending === c.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4A9A38] disabled:opacity-50"
                      >
                        {sending === c.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Send
                      </button>
                    )}
                    {c.status === 'scheduled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelCampaign(c.id); }}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                      >
                        <Pause className="w-3 h-3" />
                        Cancel
                      </button>
                    )}
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedCampaign === c.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {expandedCampaign === c.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Total Recipients</p>
                            <p className="text-lg font-bold text-[#1B2A4A]">{c.total_recipients}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Sent</p>
                            <p className="text-lg font-bold text-blue-600">{c.sent_count}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Delivered</p>
                            <p className="text-lg font-bold text-green-600">{c.delivered_count}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Failed</p>
                            <p className="text-lg font-bold text-red-600">{c.failed_count}</p>
                          </div>
                        </div>

                        {/* Delivery progress bar */}
                        {c.total_recipients > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Delivery Progress</span>
                              <span>{c.total_recipients > 0 ? Math.round((c.delivered_count / c.total_recipients) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5DB347] rounded-full transition-all"
                                style={{ width: `${c.total_recipients > 0 ? (c.delivered_count / c.total_recipients) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Audience info */}
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-500">Audience:</span>
                          {c.target_audience?.country_code?.map((cc) => (
                            <span key={cc} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{cc}</span>
                          ))}
                          {c.target_audience?.membership_tier?.map((t) => (
                            <span key={t} className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">Tier {t}</span>
                          ))}
                          {c.target_audience?.role?.map((r) => (
                            <span key={r} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{r}</span>
                          ))}
                          {!c.target_audience?.country_code?.length && !c.target_audience?.membership_tier?.length && !c.target_audience?.role?.length && (
                            <span className="text-xs text-gray-400">All members</span>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="mt-3 flex gap-4 text-xs text-gray-400">
                          <span>Created: {new Date(c.created_at).toLocaleDateString()}</span>
                          {c.started_at && <span>Started: {new Date(c.started_at).toLocaleString()}</span>}
                          {c.completed_at && <span>Completed: {new Date(c.completed_at).toLocaleString()}</span>}
                        </div>

                        {/* Retry failed */}
                        {c.status === 'completed' && c.failed_count > 0 && (
                          <button
                            onClick={() => showToast('success', 'Retry queued for failed messages')}
                            className="mt-3 flex items-center gap-1 px-3 py-1.5 border border-orange-200 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Retry {c.failed_count} Failed
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Wizard */}
      <AnimatePresence>
        {showWizard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowWizard(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Create Campaign — Step {wizardStep} of 5
                </h3>
                <button onClick={() => setShowWizard(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-1 px-4 pt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full ${s <= wizardStep ? 'bg-[#5DB347]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>

              <div className="p-4">
                {/* Step 1: Name + Channel */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">Campaign Details</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Campaign Name</label>
                      <input
                        type="text"
                        value={wizardName}
                        onChange={(e) => setWizardName(e.target.value)}
                        placeholder="e.g., April Price Update"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
                      <div className="flex gap-3">
                        {(['sms', 'whatsapp'] as const).map((ch) => (
                          <button
                            key={ch}
                            onClick={() => setWizardChannel(ch)}
                            className={`flex-1 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                              wizardChannel === ch
                                ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {ch === 'sms' ? 'SMS' : 'WhatsApp'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Template */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">Select Template</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredTemplates.length > 0 ? (
                        filteredTemplates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { setWizardTemplateId(t.id); setWizardBody(t.body); }}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                              wizardTemplateId === t.id
                                ? 'border-[#5DB347] bg-[#5DB347]/5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <p className="text-sm font-medium text-[#1B2A4A]">{t.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{t.body}</p>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No templates for {wizardChannel.toUpperCase()}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Or write custom message</label>
                      <textarea
                        value={wizardBody}
                        onChange={(e) => { setWizardBody(e.target.value); setWizardTemplateId(''); }}
                        placeholder="Type your message..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Audience */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">Define Audience</h4>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">By Country</p>
                      <div className="flex flex-wrap gap-2">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => toggleArrayItem(wizardCountries, c.code, setWizardCountries)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              wizardCountries.includes(c.code)
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">By Membership Tier</p>
                      <div className="flex gap-2">
                        {TIERS.map((t) => (
                          <button
                            key={t}
                            onClick={() => toggleArrayItem(wizardTiers, t, setWizardTiers)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              wizardTiers.includes(t)
                                ? 'bg-green-100 border-green-300 text-green-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            Tier {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">By Role</p>
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map((r) => (
                          <button
                            key={r}
                            onClick={() => toggleArrayItem(wizardRoles, r, setWizardRoles)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                              wizardRoles.includes(r)
                                ? 'bg-purple-100 border-purple-300 text-purple-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {r.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {!wizardCountries.length && !wizardTiers.length && !wizardRoles.length && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                        No filters selected — campaign will target all members with phone numbers.
                      </p>
                    )}
                  </div>
                )}

                {/* Step 4: Schedule */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">Schedule</h4>
                    <div className="flex gap-3">
                      {(['now', 'later'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setWizardSchedule(opt)}
                          className={`flex-1 py-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                            wizardSchedule === opt
                              ? 'bg-[#5DB347]/10 border-[#5DB347] text-[#5DB347]'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {opt === 'now' ? 'Send Now' : 'Schedule for Later'}
                        </button>
                      ))}
                    </div>

                    {wizardSchedule === 'later' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date & Time</label>
                        <input
                          type="datetime-local"
                          value={wizardScheduleDate}
                          onChange={(e) => setWizardScheduleDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Review */}
                {wizardStep === 5 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-[#1B2A4A]">Review & Confirm</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Campaign Name</span>
                        <span className="text-sm font-medium text-[#1B2A4A]">{wizardName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Channel</span>
                        {channelBadge(wizardChannel)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Template</span>
                        <span className="text-sm text-[#1B2A4A]">
                          {wizardTemplateId
                            ? templates.find((t) => t.id === wizardTemplateId)?.name || 'Selected'
                            : 'Custom message'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Audience</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {wizardCountries.map((c) => <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{c}</span>)}
                          {wizardTiers.map((t) => <span key={t} className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs">Tier {t}</span>)}
                          {wizardRoles.map((r) => <span key={r} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">{r}</span>)}
                          {!wizardCountries.length && !wizardTiers.length && !wizardRoles.length && (
                            <span className="text-xs text-gray-400">All members</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Schedule</span>
                        <span className="text-sm text-[#1B2A4A]">
                          {wizardSchedule === 'now' ? 'Send immediately' : new Date(wizardScheduleDate).toLocaleString()}
                        </span>
                      </div>
                      {wizardBody && (
                        <div>
                          <span className="text-xs text-gray-500">Message</span>
                          <p className="text-xs text-gray-700 mt-1 bg-white p-2 rounded border">{wizardBody.slice(0, 200)}{wizardBody.length > 200 ? '...' : ''}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between p-4 border-t">
                <button
                  onClick={() => wizardStep === 1 ? setShowWizard(false) : setWizardStep(wizardStep - 1)}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {wizardStep < 5 ? (
                  <button
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={wizardStep === 1 && !wizardName}
                    className="flex items-center gap-1 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38] disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateCampaign}
                    className="flex items-center gap-1 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38]"
                  >
                    <Send className="w-4 h-4" />
                    {wizardSchedule === 'now' ? 'Create & Send' : 'Create & Schedule'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
