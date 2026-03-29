'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell, Plus, Pencil, Trash2, Save, Loader2, X, CheckCircle2, AlertCircle,
  Eye, EyeOff, Info, AlertTriangle, XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link_url: string | null;
  link_text: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  display_order: number;
  bg_color: string;
  text_color: string;
  created_at: string;
}

interface FormData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link_url: string;
  link_text: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const EMPTY_FORM: FormData = {
  title: '', message: '', type: 'info', link_url: '', link_text: '', start_date: '', end_date: '', is_active: true,
};

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; bg: string; text: string; badge: string }> = {
  info: { icon: <Info className="w-4 h-4" />, label: 'Info', bg: '#1B2A4A', text: '#FFFFFF', badge: 'bg-blue-100 text-blue-700' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Warning', bg: '#F59E0B', text: '#1B2A4A', badge: 'bg-amber-100 text-amber-700' },
  success: { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Success', bg: '#5DB347', text: '#FFFFFF', badge: 'bg-green-100 text-green-700' },
  error: { icon: <XCircle className="w-4 h-4" />, label: 'Error', bg: '#DC2626', text: '#FFFFFF', badge: 'bg-red-100 text-red-700' },
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [deleting, setDeleting] = useState(false);

  const supabase = createClient();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('announcements').select('*').order('display_order', { ascending: true });
    if (error) {
      setAnnouncements([]);
    } else {
      setAnnouncements((data || []) as Announcement[]);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const openCreate = () => { setEditingId(null); setFormData(EMPTY_FORM); setShowModal(true); };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({
      title: a.title || '', message: a.message, type: a.type || 'info',
      link_url: a.link_url || '', link_text: a.link_text || '',
      start_date: a.start_date ? a.start_date.split('T')[0] : '',
      end_date: a.end_date ? a.end_date.split('T')[0] : '',
      is_active: a.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.message.trim()) { setToast({ message: 'Message is required', type: 'error' }); return; }
    setSaving(true);
    const tc = TYPE_CONFIG[formData.type];
    const payload = {
      title: formData.title || null,
      message: formData.message,
      type: formData.type,
      link_url: formData.link_url || null,
      link_text: formData.link_text || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
      bg_color: tc.bg,
      text_color: tc.text,
    };
    if (editingId) {
      const { error } = await supabase.from('announcements').update(payload).eq('id', editingId);
      if (error) { setToast({ message: 'Failed to update', type: 'error' }); }
      else { setToast({ message: 'Announcement updated', type: 'success' }); setShowModal(false); await fetchAnnouncements(); }
    } else {
      const { error } = await supabase.from('announcements').insert(payload);
      if (error) { setToast({ message: 'Failed to create', type: 'error' }); }
      else { setToast({ message: 'Announcement created', type: 'success' }); setShowModal(false); await fetchAnnouncements(); }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase.from('announcements').delete().eq('id', deleteTarget.id);
    if (error) { setToast({ message: 'Failed to delete', type: 'error' }); }
    else { setToast({ message: 'Announcement deleted', type: 'success' }); setAnnouncements((p) => p.filter((a) => a.id !== deleteTarget.id)); }
    setDeleteTarget(null); setDeleting(false);
  };

  const toggleActive = async (a: Announcement) => {
    await supabase.from('announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    setAnnouncements((p) => p.map((x) => x.id === a.id ? { ...x, is_active: !x.is_active } : x));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site-wide banner announcements</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-[#1B2A4A]">{announcements.length}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-[#5DB347]">{announcements.filter((a) => a.is_active).length}</p>
          <p className="text-xs text-gray-500">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-400">{announcements.filter((a) => !a.is_active).length}</p>
          <p className="text-xs text-gray-500">Inactive</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#5DB347] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#1B2A4A]">No announcements</h3>
          <p className="text-sm text-gray-500 mt-1">Create your first announcement to show a banner on the public site.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => {
            const tc = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;
            return (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Banner Preview */}
                <div className="px-4 py-2.5 text-center text-sm font-medium relative" style={{ background: a.bg_color, color: a.text_color }}>
                  <span className="flex items-center justify-center gap-2">
                    {tc.icon}
                    {a.message}
                    {a.link_url && <span className="underline ml-1">{a.link_text || 'Learn more'}</span>}
                  </span>
                </div>
                {/* Details */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tc.badge}`}>
                      {tc.icon} {tc.label}
                    </span>
                    {a.title && <span className="text-sm font-medium text-[#1B2A4A]">{a.title}</span>}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {a.start_date && <span className="text-xs text-gray-400">From {new Date(a.start_date).toLocaleDateString()}</span>}
                    {a.end_date && <span className="text-xs text-gray-400">to {new Date(a.end_date).toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(a)}
                      className={`p-1.5 rounded-lg transition-colors ${a.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      title={a.is_active ? 'Deactivate' : 'Activate'}>
                      {a.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1B2A4A]">{editingId ? 'Edit Announcement' : 'Create Announcement'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Optional title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} placeholder="Announcement message..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button key={key} onClick={() => setFormData({ ...formData, type: key as FormData['type'] })}
                      className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${formData.type === key ? 'border-[#5DB347] bg-[#5DB347]/10 text-[#5DB347]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                  <input value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                  <input value={formData.link_text} onChange={(e) => setFormData({ ...formData, link_text: e.target.value })} placeholder="Learn more"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-[#5DB347]' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              {/* Preview */}
              {formData.message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                  <div className="rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 text-center text-sm font-medium" style={{ background: TYPE_CONFIG[formData.type].bg, color: TYPE_CONFIG[formData.type].text }}>
                      {formData.message}
                      {formData.link_url && <span className="ml-2 underline">{formData.link_text || 'Learn more'}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !formData.message.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Delete Announcement</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete this announcement? This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50">
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
