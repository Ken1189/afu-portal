'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FileText, Plus, X, Loader2, Search, Edit3, Trash2, Save,
  Mail, MessageSquare, Phone, Image, Video, Eye, Copy,
  RefreshCw, Upload, Palette,
} from 'lucide-react';

/* ─── Types ─── */
interface Template {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface MediaFile { name: string; url: string; type: string }

const CHANNEL_ICONS: Record<string, React.ReactNode> = { email: <Mail className="w-4 h-4" />, sms: <MessageSquare className="w-4 h-4" />, whatsapp: <Phone className="w-4 h-4" /> };

const DEMO_TEMPLATES: Template[] = [
  { id: 'demo-1', name: 'Welcome Email', channel: 'email', subject: 'Welcome to AFU, {{name}}!', body: '<h2 style="color:#1B2A4A">Welcome to the African Farming Union!</h2>\n<p>Dear {{name}},</p>\n<p>Thank you for joining AFU. We are excited to have you as part of our farming family.</p>\n<img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=300&fit=crop" alt="Farm" style="width:100%;border-radius:12px;margin:16px 0" />\n<p>Here is what you can do next:</p>\n<ul>\n<li>Complete your farm profile</li>\n<li>Browse the marketplace</li>\n<li>Apply for financing</li>\n</ul>\n<a href="https://africanfarmingunion.org/dashboard" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a>', variables: ['name', 'email', 'tier'], is_active: true, created_at: '2026-03-20T00:00:00Z' },
  { id: 'demo-2', name: 'Welcome SMS', channel: 'sms', subject: null, body: 'Welcome to AFU, {{name}}! Your membership is active. Dial *384*55# or visit africanfarmingunion.org to get started.', variables: ['name', 'phone'], is_active: true, created_at: '2026-03-20T00:00:00Z' },
  { id: 'demo-3', name: 'Payment Reminder', channel: 'email', subject: 'Payment Reminder — AFU Membership', body: '<h2 style="color:#1B2A4A">Payment Reminder</h2>\n<p>Dear {{name}},</p>\n<p>Your membership payment of <strong>{{amount}}</strong> is due on <strong>{{due_date}}</strong>.</p>\n<a href="https://africanfarmingunion.org/dashboard/wallet" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Pay Now</a>', variables: ['name', 'amount', 'due_date'], is_active: true, created_at: '2026-03-20T00:00:00Z' },
  { id: 'demo-4', name: 'Crop Price Alert', channel: 'sms', subject: null, body: 'AFU Price Alert: {{commodity}} is now {{price}}/{{unit}} in {{market}}. Check the latest prices on your dashboard.', variables: ['commodity', 'price', 'unit', 'market'], is_active: true, created_at: '2026-03-20T00:00:00Z' },
];

export default function AdminTemplatesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', channel: 'email', subject: '', body: '', variables: '', is_active: true });
  const [showPreview, setShowPreview] = useState(true);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('message_templates').select('*').order('created_at', { ascending: false });
    setTemplates(data && data.length > 0 ? (data as Template[]) : DEMO_TEMPLATES);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const fetchMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const { data } = await supabase.storage.from('media').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (data) {
        setMediaFiles(data.filter(f => !f.name.startsWith('.')).map(f => {
          const { data: u } = supabase.storage.from('media').getPublicUrl(f.name);
          const ext = f.name.split('.').pop()?.toLowerCase() || '';
          return { name: f.name, url: u.publicUrl, type: ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'image' };
        }));
      }
    } catch { /* bucket may not exist */ }
    setMediaLoading(false);
  }, [supabase]);

  const filtered = useMemo(() => {
    let list = templates;
    if (channelFilter !== 'all') list = list.filter(t => t.channel === channelFilter);
    if (searchTerm) list = list.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return list;
  }, [templates, channelFilter, searchTerm]);

  const openCreate = () => { setEditing(null); setForm({ name: '', channel: 'email', subject: '', body: '', variables: '', is_active: true }); setShowEditor(true); };
  const openEdit = (t: Template) => { setEditing(t); setForm({ name: t.name, channel: t.channel, subject: t.subject || '', body: t.body, variables: (t.variables || []).join(', '), is_active: t.is_active }); setShowEditor(true); };

  const handleSave = async () => {
    if (!form.name || !form.body) return;
    setSaving(true);
    const payload = { name: form.name, channel: form.channel, subject: form.channel === 'email' ? form.subject || null : null, body: form.body, variables: form.variables ? form.variables.split(',').map(v => v.trim()).filter(Boolean) : [], is_active: form.is_active };
    if (editing && !editing.id.startsWith('demo')) await supabase.from('message_templates').update(payload).eq('id', editing.id);
    else await supabase.from('message_templates').insert(payload);
    setShowEditor(false); setSaving(false); fetchTemplates();
  };

  const toggleActive = async (id: string, active: boolean) => { if (id.startsWith('demo')) return; await supabase.from('message_templates').update({ is_active: !active }).eq('id', id); setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_active: !active } : t)); };
  const deleteTemplate = async (id: string) => { if (id.startsWith('demo')) return; await supabase.from('message_templates').delete().eq('id', id); fetchTemplates(); };

  const insertMedia = (url: string, type: string) => {
    const tag = type === 'video' ? `\n<video src="${url}" controls style="width:100%;border-radius:12px;margin:16px 0"></video>\n` : `\n<img src="${url}" alt="Media" style="width:100%;border-radius:12px;margin:16px 0" />\n`;
    setForm(p => ({ ...p, body: p.body + tag })); setShowMediaPicker(false);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const name = `template-${Date.now()}.${file.name.split('.').pop()}`;
    await supabase.storage.from('media').upload(name, file, { cacheControl: '3600', upsert: false });
    setUploading(false); fetchMedia();
  };

  const previewHtml = form.body.replace(/\{\{name\}\}/g, 'Grace Moyo').replace(/\{\{email\}\}/g, 'grace@farm.co').replace(/\{\{phone\}\}/g, '+263 77 123 4567').replace(/\{\{tier\}\}/g, 'Smallholder').replace(/\{\{country\}\}/g, 'Zimbabwe').replace(/\{\{amount\}\}/g, '$48.00').replace(/\{\{due_date\}\}/g, 'April 15, 2026').replace(/\{\{commodity\}\}/g, 'Maize').replace(/\{\{price\}\}/g, '$340').replace(/\{\{unit\}\}/g, 'tonne').replace(/\{\{market\}\}/g, 'Harare');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-[#1B2A4A]">Message Templates</h1><p className="text-sm text-gray-500">Rich email, SMS, and WhatsApp templates with media</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2.5 rounded-xl"><Plus className="w-4 h-4" /> New Template</button>
      </div>

      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search templates..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]" /></div>
        <div className="flex gap-1">
          {['all', 'email', 'sms', 'whatsapp'].map(ch => (
            <button key={ch} onClick={() => setChannelFilter(ch)} className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 ${channelFilter === ch ? 'bg-[#1B2A4A] text-white' : 'text-gray-400 hover:bg-gray-100'}`}>{ch !== 'all' && CHANNEL_ICONS[ch]} {ch === 'all' ? 'All' : ch.charAt(0).toUpperCase() + ch.slice(1)}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className={`bg-white rounded-xl border ${t.is_active ? 'border-gray-100' : 'border-gray-200 opacity-60'} overflow-hidden hover:shadow-md transition-all`}>
              <div className="h-40 overflow-hidden bg-gray-50 relative">
                {t.channel === 'email' ? (
                  <div className="p-4 text-xs text-gray-600 overflow-hidden" dangerouslySetInnerHTML={{ __html: t.body.substring(0, 500) }} />
                ) : (
                  <div className="p-4 flex items-start gap-2"><div className="bg-green-100 rounded-2xl rounded-bl-md p-3 text-xs text-gray-700 max-w-[80%]">{t.body.substring(0, 200)}</div></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${t.channel === 'email' ? 'bg-blue-100 text-blue-700' : t.channel === 'sms' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>{CHANNEL_ICONS[t.channel]} {t.channel}</span>
                  <button onClick={() => toggleActive(t.id, t.is_active)} className={`w-8 h-5 rounded-full relative ${t.is_active ? 'bg-[#5DB347]' : 'bg-gray-300'}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${t.is_active ? 'left-[14px]' : 'left-0.5'}`} /></button>
                </div>
                <h3 className="font-semibold text-[#1B2A4A] text-sm mb-1">{t.name}</h3>
                {t.subject && <p className="text-[11px] text-gray-400 truncate">Subject: {t.subject}</p>}
                {t.variables?.length ? <div className="flex gap-1 mt-2 flex-wrap">{t.variables.map(v => <span key={v} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 font-mono">{`{{${v}}}`}</span>)}</div> : null}
                <div className="flex gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => openEdit(t)} className="flex-1 text-xs text-center py-1.5 rounded-lg hover:bg-gray-50 text-gray-500 font-medium">Edit</button>
                  <button onClick={() => deleteTemplate(t.id)} className="text-xs py-1.5 px-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ EDITOR MODAL ═══ */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editing ? 'Edit Template' : 'New Template'}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${showPreview ? 'border-[#5DB347] text-[#5DB347]' : 'border-gray-200 text-gray-500'}`}><Eye className="w-3.5 h-3.5" /> Preview</button>
                <button onClick={() => setShowEditor(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-gray-500 mb-1">Name *</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="block text-xs font-medium text-gray-500 mb-1">Channel</label><select value={form.channel} onChange={e => setForm(p => ({ ...p, channel: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></select></div>
                  </div>
                  {form.channel === 'email' && <div><label className="block text-xs font-medium text-gray-500 mb-1">Subject</label><input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-500">Body {form.channel === 'email' ? '(HTML)' : ''}</label>
                      {form.channel === 'email' && (
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { fetchMedia(); setShowMediaPicker(true); }} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#5DB347] px-2 py-1 rounded border border-gray-200"><Image className="w-3 h-3" /> Image</button>
                          <button type="button" onClick={() => { fetchMedia(); setShowMediaPicker(true); }} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#5DB347] px-2 py-1 rounded border border-gray-200"><Video className="w-3 h-3" /> Video</button>
                          <button type="button" onClick={() => setForm(p => ({ ...p, body: p.body + '\n<a href="https://africanfarmingunion.org" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Button Text</a>\n' }))} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#5DB347] px-2 py-1 rounded border border-gray-200"><Palette className="w-3 h-3" /> Button</button>
                        </div>
                      )}
                    </div>
                    <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={form.channel === 'email' ? 16 : 6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:ring-2 focus:ring-[#5DB347]" />
                    {form.channel === 'sms' && <p className="text-[10px] text-gray-400 mt-1">{form.body.length}/160 chars</p>}
                  </div>
                  <div><label className="block text-xs font-medium text-gray-500 mb-1">Variables</label><input type="text" value={form.variables} onChange={e => setForm(p => ({ ...p, variables: e.target.value }))} placeholder="name, email, country, tier" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /><p className="text-[10px] text-gray-400 mt-1">Use {'{{variable}}'} in body</p></div>
                </div>
                {showPreview && (
                  <div className="sticky top-0">
                    <label className="block text-xs font-medium text-gray-500 mb-2">Live Preview</label>
                    {form.channel === 'email' ? (
                      <div className="border border-gray-200 rounded-xl overflow-hidden"><div style={{ background: '#1B2A4A', padding: '16px', textAlign: 'center' }}><span style={{ color: '#5DB347', fontWeight: 'bold', fontSize: '16px' }}>African Farming Union</span></div><div className="p-5" dangerouslySetInnerHTML={{ __html: previewHtml }} /><div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '11px', borderTop: '1px solid #eee' }}>africanfarmingunion.org</div></div>
                    ) : (
                      <div className="bg-[#e5ddd5] rounded-xl p-4 min-h-[200px]"><div className="bg-white rounded-2xl rounded-bl-md p-3 text-sm text-gray-800 max-w-[85%] shadow-sm">{previewHtml || 'Message preview...'}</div></div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.body} className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-[#5DB347] text-white hover:bg-[#449933] disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editing ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MEDIA PICKER ═══ */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#1B2A4A]">Media Library</h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs bg-[#5DB347] text-white px-3 py-1.5 rounded-lg cursor-pointer"><Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload'}<input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" /></label>
                <button onClick={() => setShowMediaPicker(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[#5DB347]" /></div> : mediaFiles.length === 0 ? (
                <div className="text-center py-12"><Image className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-sm text-gray-400">No media files. Upload images or videos.</p></div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaFiles.map(f => (
                    <button key={f.name} onClick={() => insertMedia(f.url, f.type)} className="relative rounded-xl overflow-hidden border border-gray-200 hover:border-[#5DB347] hover:shadow-md aspect-square group">
                      {f.type === 'video' ? <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Video className="w-8 h-8 text-gray-400" /></div> : <img src={f.url} alt={f.name} className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center"><span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 bg-[#5DB347] px-3 py-1.5 rounded-lg">Insert</span></div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-2 py-1 truncate">{f.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
