'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Search,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  Copy,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Types ──

interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
  category: string;
  language: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Demo data ──

const DEMO_TEMPLATES: MessageTemplate[] = [
  { id: '1', name: 'loan_approval', channel: 'sms', category: 'transactional', language: 'en', body: 'Dear {{name}}, your loan application {{reference}} has been approved for ${{amount}}. Funds will be disbursed within 48 hours.', variables: ['name', 'reference', 'amount'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '2', name: 'payment_reminder', channel: 'sms', category: 'transactional', language: 'en', body: 'Hi {{name}}, your payment of ${{amount}} is due on {{due_date}}. Please ensure timely payment to maintain your credit score.', variables: ['name', 'amount', 'due_date'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '3', name: 'welcome_member', channel: 'whatsapp', category: 'transactional', language: 'en', body: 'Welcome to AFU, {{name}}! Your membership number is {{member_id}}. Dial *384*123# for services or visit our portal.', variables: ['name', 'member_id'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '4', name: 'price_alert', channel: 'sms', category: 'marketing', language: 'en', body: 'AFU Price Update: {{commodity}} is now at ${{price}}/tonne in {{market}}. Contact us to list your harvest.', variables: ['commodity', 'price', 'market'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '5', name: 'otp_verification', channel: 'sms', category: 'otp', language: 'en', body: 'Your AFU verification code is {{code}}. Valid for 10 minutes. Do not share this code.', variables: ['code'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '6', name: 'harvest_recorded', channel: 'whatsapp', category: 'transactional', language: 'en', body: 'Hi {{name}}, your harvest of {{quantity}}kg {{commodity}} has been recorded. Ref: {{reference}}', variables: ['name', 'quantity', 'commodity', 'reference'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '7', name: 'weather_alert', channel: 'sms', category: 'marketing', language: 'en', body: 'Weather Alert for {{region}}: {{forecast}}. Plan your farm activities accordingly.', variables: ['region', 'forecast'], is_active: false, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: '8', name: 'campaign_promo', channel: 'sms', category: 'marketing', language: 'en', body: 'Special offer for AFU members! {{offer_details}}. Valid until {{expiry_date}}. Reply STOP to opt out.', variables: ['offer_details', 'expiry_date'], is_active: true, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
];

const SAMPLE_VARIABLES: Record<string, string> = {
  name: 'Grace Nyathi',
  reference: 'LON-4521',
  amount: '5,000',
  due_date: 'April 15, 2026',
  member_id: 'AFU-2024-089',
  commodity: 'Maize',
  price: '220',
  market: 'Harare',
  code: '482917',
  quantity: '2500',
  region: 'Mashonaland East',
  forecast: 'Heavy rain expected Thursday-Friday',
  offer_details: '20% off input finance rates',
  expiry_date: 'April 30, 2026',
};

// ── Component ──

export default function TemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEMO_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formChannel, setFormChannel] = useState('sms');
  const [formCategory, setFormCategory] = useState('transactional');
  const [formBody, setFormBody] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');
  const [toast, setToast] = useState<{ type: string; message: string } | null>(null);

  const showToast = (type: string, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setTemplates(data);
      }
    } catch {
      // keep demo data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  void user;

  // Extract variables from body text
  const extractVariables = (body: string): string[] => {
    const matches = body.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))];
  };

  const renderPreview = (body: string): string => {
    let rendered = body;
    for (const [key, value] of Object.entries(SAMPLE_VARIABLES)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return rendered;
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormChannel('sms');
    setFormCategory('transactional');
    setFormBody('');
    setFormLanguage('en');
    setShowModal(true);
  };

  const openEditModal = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setFormName(t.name);
    setFormChannel(t.channel);
    setFormCategory(t.category);
    setFormBody(t.body);
    setFormLanguage(t.language || 'en');
    setShowModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!formName || !formBody) {
      showToast('error', 'Name and body are required');
      return;
    }

    const variables = extractVariables(formBody);
    const supabase = createClient();

    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('message_templates')
          .update({
            name: formName,
            channel: formChannel,
            category: formCategory,
            body: formBody,
            language: formLanguage,
            variables,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        showToast('success', 'Template updated');
      } else {
        const { error } = await supabase
          .from('message_templates')
          .insert({
            name: formName,
            channel: formChannel,
            category: formCategory,
            body: formBody,
            language: formLanguage,
            variables,
            is_active: true,
          });

        if (error) throw error;
        showToast('success', 'Template created');
      }

      setShowModal(false);
      fetchTemplates();
    } catch (err) {
      showToast('error', `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase.from('message_templates').delete().eq('id', id);
      if (error) throw error;
      showToast('success', 'Template deleted');
      setShowDeleteConfirm(null);
      fetchTemplates();
    } catch (err) {
      showToast('error', `Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleToggleActive = async (t: MessageTemplate) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: !t.is_active })
        .eq('id', t.id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((tpl) => (tpl.id === t.id ? { ...tpl, is_active: !tpl.is_active } : tpl)),
      );
    } catch {
      showToast('error', 'Failed to toggle template');
    }
  };

  // Filter templates
  const filtered = templates.filter((t) => {
    if (filterChannel !== 'all' && t.channel !== filterChannel) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    }
    return true;
  });

  const channelBadge = (ch: string) => {
    const colors: Record<string, string> = {
      sms: 'bg-blue-100 text-blue-700',
      whatsapp: 'bg-green-100 text-green-700',
      ussd: 'bg-purple-100 text-purple-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[ch] || 'bg-gray-100 text-gray-700'}`}>{ch.toUpperCase()}</span>;
  };

  const categoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      transactional: 'bg-indigo-100 text-indigo-700',
      marketing: 'bg-orange-100 text-orange-700',
      otp: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[cat] || 'bg-gray-100 text-gray-700'}`}>{cat}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Message Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage SMS, WhatsApp, and USSD message templates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
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
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'sms', 'whatsapp', 'ussd'].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filterChannel === ch
                  ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {ch === 'all' ? 'All' : ch.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading templates...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No templates found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variables</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[300px] truncate">{t.body}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{channelBadge(t.channel)}</td>
                    <td className="px-4 py-3">{categoryBadge(t.category)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.variables || []).map((v) => (
                          <span key={v} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(t)}>
                        {t.is_active ? (
                          <ToggleRight className="w-6 h-6 text-[#5DB347]" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setPreviewTemplate(t); setShowPreview(true); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(t.body); showToast('success', 'Copied to clipboard'); }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(t.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
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
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., loan_approval"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Channel</label>
                    <select
                      value={formChannel}
                      onChange={(e) => setFormChannel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="ussd">USSD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                    >
                      <option value="transactional">Transactional</option>
                      <option value="marketing">Marketing</option>
                      <option value="otp">OTP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Body <span className="text-gray-400">(use {"{{variable}}"} syntax)</span>
                  </label>
                  <textarea
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="Dear {{name}}, your application {{reference}} has been..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Detected variables: {extractVariables(formBody).map((v) => `{{${v}}}`).join(', ') || 'none'}
                  </p>
                </div>

                {/* Live Preview */}
                {formBody && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">Preview (with sample data)</p>
                    <p className="text-sm text-gray-700">{renderPreview(formBody)}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#4A9A38]"
                >
                  {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Template Preview
                </h3>
                <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500">Name</p>
                  <p className="text-sm font-medium text-[#1B2A4A]">{previewTemplate.name}</p>
                </div>
                <div className="flex gap-2">
                  {channelBadge(previewTemplate.channel)}
                  {categoryBadge(previewTemplate.category)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Raw Template</p>
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-sm font-mono text-gray-700">{previewTemplate.body}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Rendered Preview</p>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-gray-700">{renderPreview(previewTemplate.body)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Delete Template?</h3>
              <p className="text-sm text-gray-500 mb-4">This action cannot be undone. The template will be permanently removed.</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
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
