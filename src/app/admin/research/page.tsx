'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Search,
  Globe,
  Users,
  Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ResearchCentre {
  id: string;
  name: string;
  description: string;
  focus_areas: string[];
  country: string;
  region: string | null;
  photo_url: string | null;
  website: string | null;
  established_year: number | null;
  team_size: number | null;
  key_projects: string[];
  partner_institutions: string[];
  created_at: string;
}

type FormData = Omit<ResearchCentre, 'id' | 'created_at'>;

const emptyForm: FormData = {
  name: '',
  description: '',
  focus_areas: [],
  country: '',
  region: null,
  photo_url: null,
  website: null,
  established_year: null,
  team_size: null,
  key_projects: [],
  partner_institutions: [],
};

export default function AdminResearchPage() {
  const supabase = createClient();
  const [centres, setCentres] = useState<ResearchCentre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Tag input state
  const [focusInput, setFocusInput] = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [partnerInput, setPartnerInput] = useState('');

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCentres = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('research_centres')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('Failed to load research centres', 'error');
    } else {
      setCentres(data || []);
    }
    setLoading(false);
  }, [supabase, showToast]);

  useEffect(() => {
    fetchCentres();
  }, [fetchCentres]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFocusInput('');
    setProjectInput('');
    setPartnerInput('');
    setShowForm(true);
  };

  const openEdit = (c: ResearchCentre) => {
    setForm({
      name: c.name,
      description: c.description,
      focus_areas: c.focus_areas || [],
      country: c.country,
      region: c.region,
      photo_url: c.photo_url,
      website: c.website,
      established_year: c.established_year,
      team_size: c.team_size,
      key_projects: c.key_projects || [],
      partner_institutions: c.partner_institutions || [],
    });
    setEditingId(c.id);
    setFocusInput('');
    setProjectInput('');
    setPartnerInput('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.country) {
      showToast('Name and country are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('research_centres')
          .update(form)
          .eq('id', editingId);
        if (error) throw error;
        showToast('Research centre updated');
      } else {
        const { error } = await supabase
          .from('research_centres')
          .insert(form);
        if (error) throw error;
        showToast('Research centre created');
      }
      setShowForm(false);
      fetchCentres();
    } catch {
      showToast('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this research centre?')) return;
    const { error } = await supabase.from('research_centres').delete().eq('id', id);
    if (error) {
      showToast('Failed to delete', 'error');
    } else {
      showToast('Research centre deleted');
      fetchCentres();
    }
  };

  const addTag = (field: 'focus_areas' | 'key_projects' | 'partner_institutions', value: string, setter: (v: string) => void) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (!form[field].includes(trimmed)) {
      setForm({ ...form, [field]: [...form[field], trimmed] });
    }
    setter('');
  };

  const removeTag = (field: 'focus_areas' | 'key_projects' | 'partner_institutions', index: number) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== index) });
  };

  const filtered = centres.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Research Centres</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage AFU research centres across Africa</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Centre
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search centres..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1B2A4A]">
                {editingId ? 'Edit Research Centre' : 'Add Research Centre'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              </div>

              {/* Country + Region */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={form.region || ''}
                    onChange={(e) => setForm({ ...form, region: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Year + Team size */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                  <input
                    type="number"
                    value={form.established_year || ''}
                    onChange={(e) => setForm({ ...form, established_year: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                  <input
                    type="number"
                    value={form.team_size || ''}
                    onChange={(e) => setForm({ ...form, team_size: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Photo + Website */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                  <input
                    type="url"
                    value={form.photo_url || ''}
                    onChange={(e) => setForm({ ...form, photo_url: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={form.website || ''}
                    onChange={(e) => setForm({ ...form, website: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                </div>
              </div>

              {/* Focus Areas Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.focus_areas.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF7E5] text-[#5DB347] text-xs font-medium">
                      {t}
                      <button onClick={() => removeTag('focus_areas', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={focusInput}
                    onChange={(e) => setFocusInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('focus_areas', focusInput, setFocusInput))}
                    placeholder="Type and press Enter"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                  <button
                    onClick={() => addTag('focus_areas', focusInput, setFocusInput)}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Key Projects Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key Projects</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.key_projects.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                      {t}
                      <button onClick={() => removeTag('key_projects', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('key_projects', projectInput, setProjectInput))}
                    placeholder="Type and press Enter"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                  <button
                    onClick={() => addTag('key_projects', projectInput, setProjectInput)}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Partner Institutions Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Institutions</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.partner_institutions.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium">
                      {t}
                      <button onClick={() => removeTag('partner_institutions', i)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerInput}
                    onChange={(e) => setPartnerInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('partner_institutions', partnerInput, setPartnerInput))}
                    placeholder="Type and press Enter"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                  />
                  <button
                    onClick={() => addTag('partner_institutions', partnerInput, setPartnerInput)}
                    className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No research centres found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#1B2A4A] text-sm">{c.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{c.region ? `${c.region}, ` : ''}{c.country}</span>
                    {c.established_year && (
                      <>
                        <span className="text-gray-300">|</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Est. {c.established_year}</span>
                      </>
                    )}
                    {c.team_size && (
                      <>
                        <span className="text-gray-300">|</span>
                        <Users className="w-3.5 h-3.5" />
                        <span>{c.team_size} team</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#5DB347]">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {c.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{c.description}</p>
              )}

              {c.focus_areas && c.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {c.focus_areas.map((fa, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-[#EBF7E5] text-[#5DB347] text-[11px] font-medium">
                      {fa}
                    </span>
                  ))}
                </div>
              )}

              {c.partner_institutions && c.partner_institutions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.partner_institutions.map((p, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-[#5DB347] text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
