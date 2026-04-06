'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Zap, Plus, X, Loader2, CheckCircle2, XCircle, Clock, Mail,
  MessageSquare, Phone, Tag, Users, Bell, ArrowRight, Edit3,
  Trash2, Power, Search, RefreshCw, AlertTriangle, ChevronRight,
} from 'lucide-react';

/* ─── Types ─── */
interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  delay_minutes: number;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
}

const TRIGGER_TYPES: { value: string; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'new_application', label: 'New Application', desc: 'When someone submits a membership application', icon: <Users className="w-4 h-4" /> },
  { value: 'member_approved', label: 'Member Approved', desc: 'When a membership application is approved', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: 'ambassador_approved', label: 'Ambassador Approved', desc: 'When an ambassador application is approved', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: 'supplier_approved', label: 'Supplier Approved', desc: 'When a supplier is approved', icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: 'form_submitted', label: 'Contact Form', desc: 'When someone submits the contact form', icon: <Mail className="w-4 h-4" /> },
  { value: 'inactivity', label: 'Inactivity', desc: 'When a member has no activity for X days', icon: <Clock className="w-4 h-4" /> },
  { value: 'anniversary', label: 'Anniversary', desc: 'On member signup anniversary (30d, 90d, 365d)', icon: <Bell className="w-4 h-4" /> },
];

const ACTION_TYPES: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'send_email', label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'send_sms', label: 'Send SMS', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'send_whatsapp', label: 'Send WhatsApp', icon: <Phone className="w-4 h-4" /> },
  { value: 'add_tag', label: 'Add Tag', icon: <Tag className="w-4 h-4" /> },
  { value: 'create_notification', label: 'In-App Notification', icon: <Bell className="w-4 h-4" /> },
];

function formatDelay(mins: number): string {
  if (mins === 0) return 'Immediately';
  if (mins < 60) return `${mins} min`;
  if (mins < 1440) return `${Math.round(mins / 60)} hr`;
  return `${Math.round(mins / 1440)} days`;
}

/* ─── Component ─── */
export default function AdminAutomationsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AutomationRule | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger_type: 'new_application',
    trigger_config: {} as Record<string, string>,
    action_type: 'send_email',
    action_config: { subject: '', body: '' } as Record<string, string>,
    delay_minutes: 0,
    is_active: true,
  });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('automation_rules').select('*').order('created_at', { ascending: false });
    setRules((data || []) as AutomationRule[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const filtered = useMemo(() => {
    if (!searchTerm) return rules;
    const q = searchTerm.toLowerCase();
    return rules.filter(r => r.name.toLowerCase().includes(q) || r.trigger_type.includes(q) || r.action_type.includes(q));
  }, [rules, searchTerm]);

  // ── Toggle active ──
  const toggleRule = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/automations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !isActive }),
    });
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !isActive } : r));
  };

  // ── Delete rule ──
  const deleteRule = async (id: string) => {
    await fetch('/api/admin/automations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setRules(prev => prev.filter(r => r.id !== id));
  };

  // ── Open create/edit modal ──
  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', trigger_type: 'new_application', trigger_config: {}, action_type: 'send_email', action_config: { subject: '', body: '' }, delay_minutes: 0, is_active: true });
    setShowModal(true);
  };

  const openEdit = (rule: AutomationRule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      description: rule.description || '',
      trigger_type: rule.trigger_type,
      trigger_config: (rule.trigger_config || {}) as Record<string, string>,
      action_type: rule.action_type,
      action_config: (rule.action_config || {}) as Record<string, string>,
      delay_minutes: rule.delay_minutes,
      is_active: rule.is_active,
    });
    setShowModal(true);
  };

  // ── Save rule ──
  const handleSave = async () => {
    if (!form.name || !form.trigger_type || !form.action_type) return;
    setSaving(true);

    if (editing) {
      await fetch('/api/admin/automations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      });
    } else {
      await fetch('/api/admin/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }

    setShowModal(false);
    setSaving(false);
    fetchRules();
  };

  // ── Stats ──
  const activeCount = rules.filter(r => r.is_active).length;
  const totalRuns = rules.reduce((s, r) => s + (r.run_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Automations</h1>
          <p className="text-sm text-gray-500">Set up triggers and actions that run automatically</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> New Automation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Rules</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{rules.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-2xl font-bold text-[#5DB347]">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Executions</p>
          <p className="text-2xl font-bold text-blue-600">{totalRuns}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search automations..." className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#5DB347]" />
      </div>

      {/* Rules list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3"><Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" /><p className="text-sm text-gray-400">Loading...</p></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16">
          <Zap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">{rules.length === 0 ? 'No automations yet. Create your first one!' : 'No matching automations.'}</p>
          {rules.length === 0 && (
            <button onClick={openCreate} className="text-sm text-[#5DB347] font-medium hover:underline">Create Automation</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(rule => {
            const trigger = TRIGGER_TYPES.find(t => t.value === rule.trigger_type);
            const action = ACTION_TYPES.find(a => a.value === rule.action_type);
            return (
              <div key={rule.id} className={`bg-white rounded-xl border ${rule.is_active ? 'border-[#5DB347]/30' : 'border-gray-200'} p-5 transition-all hover:shadow-sm`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button onClick={() => toggleRule(rule.id, rule.is_active)} className={`w-10 h-6 rounded-full relative transition-colors ${rule.is_active ? 'bg-[#5DB347]' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${rule.is_active ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                      <h3 className="font-semibold text-[#1B2A4A]">{rule.name}</h3>
                      {!rule.is_active && <span className="text-xs text-gray-400">Paused</span>}
                    </div>
                    {rule.description && <p className="text-xs text-gray-500 mb-3">{rule.description}</p>}

                    {/* Trigger → Action flow */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                        {trigger?.icon} {trigger?.label || rule.trigger_type}
                      </span>
                      {rule.delay_minutes > 0 && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700">
                            <Clock className="w-3.5 h-3.5" /> Wait {formatDelay(rule.delay_minutes)}
                          </span>
                        </>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                        {action?.icon} {action?.label || rule.action_type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right mr-2">
                      <p className="text-xs text-gray-500">{rule.run_count} runs</p>
                      {rule.last_run_at && <p className="text-[10px] text-gray-400">Last: {new Date(rule.last_run_at).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => openEdit(rule)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => deleteRule(rule.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ CREATE / EDIT MODAL ═══ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editing ? 'Edit Automation' : 'New Automation'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Automation Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Welcome SMS for new members" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this automation do?" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm" />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">When this happens (Trigger)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRIGGER_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, trigger_type: t.value }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${form.trigger_type === t.value ? 'border-[#5DB347] bg-[#5DB347]/5' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={form.trigger_type === t.value ? 'text-[#5DB347]' : 'text-gray-400'}>{t.icon}</span>
                        <span className="text-sm font-medium text-[#1B2A4A]">{t.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger conditions */}
              {(form.trigger_type === 'new_application' || form.trigger_type === 'member_approved') && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Filter by tier (optional)</label>
                  <select value={form.trigger_config.tier || ''} onChange={e => setForm(p => ({ ...p, trigger_config: { ...p.trigger_config, tier: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Any tier</option>
                    <option value="free">Free</option>
                    <option value="smallholder">Smallholder</option>
                    <option value="commercial">Commercial</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="partner">Partner</option>
                    <option value="ambassador">Ambassador</option>
                  </select>
                </div>
              )}

              {form.trigger_type === 'inactivity' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Days of inactivity</label>
                  <input type="number" value={form.trigger_config.days || ''} onChange={e => setForm(p => ({ ...p, trigger_config: { ...p.trigger_config, days: e.target.value } }))} placeholder="30" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              )}

              {form.trigger_type === 'anniversary' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Anniversary milestone (days)</label>
                  <select value={form.trigger_config.days || ''} onChange={e => setForm(p => ({ ...p, trigger_config: { ...p.trigger_config, days: e.target.value } }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="30">30 days (1 month)</option>
                    <option value="90">90 days (3 months)</option>
                    <option value="180">180 days (6 months)</option>
                    <option value="365">365 days (1 year)</option>
                  </select>
                </div>
              )}

              {/* Delay */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Delay (optional)</label>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Wait</span>
                  <input type="number" min="0" value={form.delay_minutes} onChange={e => setForm(p => ({ ...p, delay_minutes: parseInt(e.target.value) || 0 }))} className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  <span className="text-sm text-gray-500">minutes before action</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">0 = immediately | 60 = 1 hour | 1440 = 1 day | 10080 = 1 week</p>
              </div>

              {/* Action */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Do this (Action)</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ACTION_TYPES.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, action_type: a.value }))}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${form.action_type === a.value ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                    >
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>

                {/* Action config */}
                {(form.action_type === 'send_email') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email Subject</label>
                      <input type="text" value={form.action_config.subject || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, subject: e.target.value } }))} placeholder="Welcome to AFU!" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Email Body</label>
                      <textarea value={form.action_config.body || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, body: e.target.value } }))} rows={4} placeholder="Hi {{name}}, welcome to AFU! ..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                      <p className="text-[10px] text-gray-400 mt-1">Variables: {'{{name}}'}, {'{{email}}'}, {'{{country}}'}, {'{{tier}}'}</p>
                    </div>
                  </div>
                )}

                {(form.action_type === 'send_sms' || form.action_type === 'send_whatsapp') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                    <textarea value={form.action_config.body || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, body: e.target.value } }))} rows={3} placeholder="Hi {{name}}, welcome to AFU! Dial *384*55# to access your dashboard." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                    <p className="text-[10px] text-gray-400 mt-1">Max 160 chars for SMS | Variables: {'{{name}}'}, {'{{phone}}'}, {'{{country}}'}</p>
                  </div>
                )}

                {form.action_type === 'add_tag' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tag to add</label>
                    <input type="text" value={form.action_config.tag || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, tag: e.target.value } }))} placeholder="e.g. new-member, follow-up, vip" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}

                {form.action_type === 'create_notification' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Notification Title</label>
                      <input type="text" value={form.action_config.title || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, title: e.target.value } }))} placeholder="Welcome!" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                      <textarea value={form.action_config.body || ''} onChange={e => setForm(p => ({ ...p, action_config: { ...p.action_config, body: e.target.value } }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.trigger_type || !form.action_type} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {editing ? 'Save Changes' : 'Create Automation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
