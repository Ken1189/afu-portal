'use client';

import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, Target, Megaphone, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { SectionTabs } from '@/components/admin/SectionTabs';
import { createClient } from '@/lib/supabase/client';

const IR_TABS = [
  { href: '/admin/investor-relations', label: 'Investors', Icon: TrendingUp },
  { href: '/admin/investor-relations/opportunities', label: 'Opportunities', Icon: Target },
  { href: '/admin/investor-relations/updates', label: 'Updates', Icon: Megaphone },
];

type UpdateType = 'quarterly' | 'milestone' | 'alert' | 'report' | 'announcement';

interface InvestorUpdate {
  id: string;
  title: string;
  body: string;
  update_type: UpdateType;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const UPDATE_TYPES: UpdateType[] = ['quarterly', 'milestone', 'alert', 'report', 'announcement'];

export default function InvestorUpdatesAdminPage() {
  const supabase = createClient();
  const [updates, setUpdates] = useState<InvestorUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    update_type: 'announcement' as UpdateType,
    is_published: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('investor_updates')
      .select('id, title, body, update_type, is_published, published_at, created_at')
      .order('created_at', { ascending: false });
    setUpdates((data as InvestorUpdate[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('investor_updates').insert({
      title: form.title.trim(),
      body: form.body.trim(),
      update_type: form.update_type,
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
    });
    setSubmitting(false);
    if (error) {
      alert('Failed to create update: ' + error.message);
      return;
    }
    setForm({ title: '', body: '', update_type: 'announcement', is_published: true });
    setShowForm(false);
    load();
  }

  async function togglePublished(u: InvestorUpdate) {
    const next = !u.is_published;
    const { error } = await supabase
      .from('investor_updates')
      .update({
        is_published: next,
        published_at: next ? new Date().toISOString() : null,
      })
      .eq('id', u.id);
    if (error) {
      alert('Failed: ' + error.message);
      return;
    }
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this update? This cannot be undone.')) return;
    const { error } = await supabase.from('investor_updates').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
      return;
    }
    load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <SectionTabs tabs={IR_TABS} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investor Updates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quarterly reports, milestones, and announcements visible to investors.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'New Update'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
              placeholder="Q2 2026 Portfolio Update"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Body *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
              placeholder="What happened this quarter, key metrics, milestones reached..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
              <select
                value={form.update_type}
                onChange={(e) => setForm({ ...form, update_type: e.target.value as UpdateType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347] focus:border-transparent"
              >
                {UPDATE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 text-[#5DB347] border-gray-300 rounded focus:ring-[#5DB347]"
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-[#5DB347] hover:bg-[#449933] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Create Update'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No investor updates yet. Create your first.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        u.update_type === 'milestone'
                          ? 'bg-amber-100 text-amber-700'
                          : u.update_type === 'alert'
                            ? 'bg-red-100 text-red-700'
                            : u.update_type === 'quarterly'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.update_type}
                    </span>
                    {u.is_published ? (
                      <span className="text-[10px] font-semibold text-[#5DB347] flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{u.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{u.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(u.published_at || u.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => togglePublished(u)}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                  >
                    {u.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
