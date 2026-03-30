'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Plus,
  Trash2,
  Pencil,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Link2,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

// ── Toast ─────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  visible: boolean;
  order: number;
  children: NavChild[];
}

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface FooterConfig {
  columns: FooterColumn[];
  social_links: SocialLink[];
}

const defaultNavbar: NavItem[] = [
  { label: 'Home', href: '/', visible: true, order: 0, children: [] },
  { label: 'Services', href: '/services', visible: true, order: 1, children: [] },
  { label: 'Memberships', href: '/memberships', visible: true, order: 2, children: [] },
  { label: 'Partners', href: '/partners', visible: true, order: 3, children: [] },
  { label: 'Jobs', href: '/jobs', visible: true, order: 4, children: [] },
  { label: 'Blog', href: '/blog', visible: true, order: 5, children: [] },
  { label: 'FAQ', href: '/faq', visible: true, order: 6, children: [] },
  { label: 'Sponsor', href: '/sponsor', visible: true, order: 7, children: [] },
  { label: 'About', href: '/about', visible: true, order: 8, children: [] },
];

const defaultFooter: FooterConfig = {
  columns: [
    {
      title: 'Platform',
      links: [
        { label: 'Services', href: '/services' },
        { label: 'Memberships', href: '/memberships' },
        { label: 'Partners', href: '/partners' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Training', href: '/training' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Jobs', href: '/jobs' },
        { label: 'Sponsor', href: '/sponsor' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ],
  social_links: [
    { platform: 'Facebook', url: '', icon: 'facebook' },
    { platform: 'Twitter', url: '', icon: 'twitter' },
    { platform: 'LinkedIn', url: '', icon: 'linkedin' },
    { platform: 'Instagram', url: '', icon: 'instagram' },
  ],
};

// ── Main Page ─────────────────────────────────────────────

export default function NavigationConfigPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<'navbar' | 'footer'>('navbar');
  const [navbar, setNavbar] = useState<NavItem[]>(defaultNavbar);
  const [footer, setFooter] = useState<FooterConfig>(defaultFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [navModal, setNavModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [navForm, setNavForm] = useState<NavItem>({ label: '', href: '', visible: true, order: 0, children: [] });
  const [expandedNav, setExpandedNav] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: navData } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'navbar_config')
          .single();
        if (navData) {
          const parsed = typeof navData.value === 'string' ? JSON.parse(navData.value) : navData.value;
          if (Array.isArray(parsed)) setNavbar(parsed);
        }
      } catch { /* use defaults */ }

      try {
        const { data: footerData } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'footer_config')
          .single();
        if (footerData) {
          const parsed = typeof footerData.value === 'string' ? JSON.parse(footerData.value) : footerData.value;
          if (parsed?.columns) setFooter(parsed);
        }
      } catch { /* use defaults */ }

      setLoading(false);
    }
    load();
  }, [supabase]);

  const saveNavbar = async (items: NavItem[]) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'navbar_config',
            value: JSON.stringify(items),
            value_type: 'json',
            category: 'navigation',
            label: 'Navbar Configuration',
            description: 'Main navigation menu items',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setNavbar(items);
      setToast({ message: 'Navbar saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save navbar', type: 'error' });
    }
    setSaving(false);
  };

  const saveFooter = async (data: FooterConfig) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            key: 'footer_config',
            value: JSON.stringify(data),
            value_type: 'json',
            category: 'navigation',
            label: 'Footer Configuration',
            description: 'Footer link columns and social links',
          },
          { onConflict: 'key' }
        );
      if (error) throw error;
      setFooter(data);
      setToast({ message: 'Footer saved', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save footer', type: 'error' });
    }
    setSaving(false);
  };

  const moveNav = (idx: number, dir: -1 | 1) => {
    const items = [...navbar];
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    [items[idx], items[target]] = [items[target], items[idx]];
    items.forEach((item, i) => item.order = i);
    saveNavbar(items);
  };

  const toggleNavVisibility = (idx: number) => {
    const items = [...navbar];
    items[idx].visible = !items[idx].visible;
    saveNavbar(items);
  };

  const openAddNav = () => {
    setEditingIdx(null);
    setNavForm({ label: '', href: '', visible: true, order: navbar.length, children: [] });
    setNavModal(true);
  };

  const openEditNav = (idx: number) => {
    setEditingIdx(idx);
    setNavForm({ ...navbar[idx] });
    setNavModal(true);
  };

  const submitNav = () => {
    if (!navForm.label.trim()) return;
    let items: NavItem[];
    if (editingIdx !== null) {
      items = navbar.map((n, i) => i === editingIdx ? { ...navForm } : n);
    } else {
      items = [...navbar, { ...navForm, order: navbar.length }];
    }
    setNavModal(false);
    saveNavbar(items);
  };

  const deleteNav = (idx: number) => {
    const items = navbar.filter((_, i) => i !== idx);
    items.forEach((item, i) => item.order = i);
    saveNavbar(items);
  };

  // Footer helpers
  const addFooterColumn = () => {
    const updated = { ...footer, columns: [...footer.columns, { title: 'New Column', links: [] }] };
    saveFooter(updated);
  };

  const updateColumnTitle = (colIdx: number, title: string) => {
    const cols = [...footer.columns];
    cols[colIdx] = { ...cols[colIdx], title };
    setFooter({ ...footer, columns: cols });
  };

  const addFooterLink = (colIdx: number) => {
    const cols = [...footer.columns];
    cols[colIdx] = { ...cols[colIdx], links: [...cols[colIdx].links, { label: 'New Link', href: '/' }] };
    setFooter({ ...footer, columns: cols });
  };

  const updateFooterLink = (colIdx: number, linkIdx: number, field: 'label' | 'href', val: string) => {
    const cols = [...footer.columns];
    const links = [...cols[colIdx].links];
    links[linkIdx] = { ...links[linkIdx], [field]: val };
    cols[colIdx] = { ...cols[colIdx], links };
    setFooter({ ...footer, columns: cols });
  };

  const removeFooterLink = (colIdx: number, linkIdx: number) => {
    const cols = [...footer.columns];
    cols[colIdx] = { ...cols[colIdx], links: cols[colIdx].links.filter((_, i) => i !== linkIdx) };
    const updated = { ...footer, columns: cols };
    setFooter(updated);
    saveFooter(updated);
  };

  const removeFooterColumn = (colIdx: number) => {
    const updated = { ...footer, columns: footer.columns.filter((_, i) => i !== colIdx) };
    saveFooter(updated);
  };

  const updateSocial = (idx: number, field: 'platform' | 'url' | 'icon', val: string) => {
    const links = [...footer.social_links];
    links[idx] = { ...links[idx], [field]: val };
    setFooter({ ...footer, social_links: links });
  };

  const addSocial = () => {
    setFooter({ ...footer, social_links: [...footer.social_links, { platform: '', url: '', icon: '' }] });
  };

  const removeSocial = (idx: number) => {
    const updated = { ...footer, social_links: footer.social_links.filter((_, i) => i !== idx) };
    setFooter(updated);
    saveFooter(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/admin/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B2A4A] mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <Navigation className="w-6 h-6 text-[#5DB347]" />
          Navigation Config
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage navbar menu and footer links</p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
          {(['navbar', 'footer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-[#5DB347] text-white' : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-50'}`}
            >
              {t === 'navbar' ? 'Navbar' : 'Footer'}
            </button>
          ))}
        </div>
      </div>

      {/* ── NAVBAR TAB ── */}
      {tab === 'navbar' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={openAddNav}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white rounded-xl text-sm font-medium hover:bg-[#4a9a38] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 font-medium text-gray-600 w-10">Order</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Label</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Path</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600">Visible</th>
                  <th className="text-center px-5 py-3 font-medium text-gray-600">Children</th>
                  <th className="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {navbar.sort((a, b) => a.order - b.order).map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveNav(idx, -1)} disabled={idx === 0} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveNav(idx, 1)} disabled={idx === navbar.length - 1} className="p-0.5 rounded hover:bg-gray-200 disabled:opacity-30">
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-[#1B2A4A]">{item.label}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{item.href}</td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleNavVisibility(idx)} className="p-1 rounded-lg hover:bg-gray-100">
                        {item.visible
                          ? <Eye className="w-4 h-4 text-[#5DB347]" />
                          : <EyeOff className="w-4 h-4 text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {item.children.length > 0 && (
                        <button onClick={() => setExpandedNav(expandedNav === idx ? null : idx)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500">
                          {expandedNav === idx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          <span className="text-xs ml-1">{item.children.length}</span>
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditNav(idx)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#1B2A4A]">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteNav(idx)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FOOTER TAB ── */}
      {tab === 'footer' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Link Columns */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-[#1B2A4A]">Link Columns</h2>
            <button onClick={addFooterColumn} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4a9a38]">
              <Plus className="w-3 h-3" /> Column
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {footer.columns.map((col, colIdx) => (
              <div key={colIdx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => updateColumnTitle(colIdx, e.target.value)}
                    className="font-semibold text-[#1B2A4A] text-sm border-b border-transparent hover:border-gray-300 focus:border-[#5DB347] outline-none pb-0.5"
                  />
                  <button onClick={() => removeFooterColumn(colIdx)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateFooterLink(colIdx, linkIdx, 'label', e.target.value)}
                        placeholder="Label"
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                      />
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateFooterLink(colIdx, linkIdx, 'href', e.target.value)}
                        placeholder="/path"
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                      />
                      <button onClick={() => removeFooterLink(colIdx, linkIdx)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addFooterLink(colIdx)} className="text-xs text-[#5DB347] hover:text-[#4a9a38] font-medium flex items-center gap-1 mt-1">
                    <Plus className="w-3 h-3" /> Add link
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1B2A4A] flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#5DB347]" />
                Social Links
              </h2>
              <button onClick={addSocial} className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5DB347] text-white rounded-lg text-xs font-medium hover:bg-[#4a9a38]">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {footer.social_links.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={s.platform}
                    onChange={(e) => updateSocial(idx, 'platform', e.target.value)}
                    placeholder="Platform"
                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                  <input
                    type="text"
                    value={s.url}
                    onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                  <input
                    type="text"
                    value={s.icon}
                    onChange={(e) => updateSocial(idx, 'icon', e.target.value)}
                    placeholder="icon name"
                    className="w-28 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                  />
                  <button onClick={() => removeSocial(idx)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Footer */}
          <div className="flex justify-end">
            <button
              onClick={() => saveFooter(footer)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white rounded-xl font-medium text-sm hover:bg-[#4a9a38] disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Footer
            </button>
          </div>
        </div>
      )}

      {/* Nav Modal */}
      {navModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#1B2A4A]">{editingIdx !== null ? 'Edit Nav Item' : 'Add Nav Item'}</h2>
              <button onClick={() => setNavModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={navForm.label}
                  onChange={(e) => setNavForm({ ...navForm, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Path</label>
                <input
                  type="text"
                  value={navForm.href}
                  onChange={(e) => setNavForm({ ...navForm, href: e.target.value })}
                  placeholder="/about"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={navForm.visible}
                  onChange={(e) => setNavForm({ ...navForm, visible: e.target.checked })}
                  className="rounded border-gray-300 text-[#5DB347] focus:ring-[#5DB347]"
                />
                <span className="text-gray-700">Visible</span>
              </label>

              {/* Children */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Dropdown Children</label>
                  <button
                    onClick={() => setNavForm({ ...navForm, children: [...navForm.children, { label: '', href: '' }] })}
                    className="text-xs text-[#5DB347] hover:text-[#4a9a38] font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add child
                  </button>
                </div>
                <div className="space-y-2">
                  {navForm.children.map((child, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={child.label}
                        onChange={(e) => {
                          const c = [...navForm.children];
                          c[ci] = { ...c[ci], label: e.target.value };
                          setNavForm({ ...navForm, children: c });
                        }}
                        placeholder="Label"
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#5DB347]/20 outline-none"
                      />
                      <input
                        type="text"
                        value={child.href}
                        onChange={(e) => {
                          const c = [...navForm.children];
                          c[ci] = { ...c[ci], href: e.target.value };
                          setNavForm({ ...navForm, children: c });
                        }}
                        placeholder="/path"
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#5DB347]/20 outline-none"
                      />
                      <button
                        onClick={() => setNavForm({ ...navForm, children: navForm.children.filter((_, i) => i !== ci) })}
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setNavModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100">Cancel</button>
              <button
                onClick={submitNav}
                disabled={saving || !navForm.label.trim()}
                className="px-5 py-2 text-sm bg-[#5DB347] text-white rounded-xl font-medium hover:bg-[#4a9a38] disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingIdx !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
