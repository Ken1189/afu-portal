'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  ToggleLeft,
  Settings,
  Bell,
  Megaphone,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Eye,
  EyeOff,
  Globe,
  Zap,
  CreditCard,
  FlaskConical,
  Link2,
  Mail,
  MessageSquare,
  Smartphone,
  Send,
  Clock,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Trash2,
  ImageIcon,
  Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ═══════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════

interface SiteContent {
  id: string;
  page: string;
  section: string;
  key: string;
  value: string;
  content_type: string;
  updated_at: string;
}

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  countries: string[];
  category: string;
  updated_at: string;
}

interface SiteConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  value_type: string;
  label: string;
  description: string | null;
  updated_at: string;
}

interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[];
  is_active: boolean;
  updated_at: string;
}

interface Broadcast {
  id: string;
  title: string;
  message: string;
  channel: string;
  target_audience: string;
  target_countries: string[];
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

interface CountryTeamMember {
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
}

interface CountryTeamData {
  code: string;
  name: string;
  flag: string;
  tagline: string;
  members: CountryTeamMember[];
}

type TabId = 'content' | 'flags' | 'config' | 'templates' | 'broadcasts' | 'country_teams' | 'branding' | 'hero';

// ═══════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'content', label: 'Site Content', icon: <FileText className="w-4 h-4" /> },
  { id: 'flags', label: 'Feature Flags', icon: <ToggleLeft className="w-4 h-4" /> },
  { id: 'config', label: 'Site Config', icon: <Settings className="w-4 h-4" /> },
  { id: 'templates', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'broadcasts', label: 'Broadcasts', icon: <Megaphone className="w-4 h-4" /> },
  { id: 'country_teams', label: 'Country Teams', icon: <Users className="w-4 h-4" /> },
  { id: 'branding', label: 'Branding', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'hero', label: 'Hero Banner', icon: <Globe className="w-4 h-4" /> },
];

const CATEGORY_COLORS: Record<string, string> = {
  payments: 'bg-blue-100 text-blue-700',
  features: 'bg-green-100 text-green-700',
  integrations: 'bg-purple-100 text-purple-700',
  experimental: 'bg-amber-100 text-amber-700',
  general: 'bg-gray-100 text-gray-600',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  payments: <CreditCard className="w-3.5 h-3.5" />,
  features: <Zap className="w-3.5 h-3.5" />,
  integrations: <Link2 className="w-3.5 h-3.5" />,
  experimental: <FlaskConical className="w-3.5 h-3.5" />,
  general: <Settings className="w-3.5 h-3.5" />,
};

const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  push: 'bg-purple-100 text-purple-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  in_app: 'bg-gray-100 text-gray-700',
};

const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="w-3.5 h-3.5" />,
  sms: <MessageSquare className="w-3.5 h-3.5" />,
  push: <Smartphone className="w-3.5 h-3.5" />,
  whatsapp: <MessageSquare className="w-3.5 h-3.5" />,
  in_app: <Bell className="w-3.5 h-3.5" />,
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-amber-100 text-amber-700',
  sent: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

const COUNTRY_NAMES: Record<string, string> = {
  KE: 'Kenya', TZ: 'Tanzania', ZW: 'Zimbabwe', BW: 'Botswana',
  NG: 'Nigeria', ZM: 'Zambia', SL: 'Sierra Leone', UG: 'Uganda', MW: 'Malawi', MZ: 'Mozambique',
};

const ALL_COUNTRIES = Object.keys(COUNTRY_NAMES);

const COUNTRY_TEAMS_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'BW', name: 'Botswana', flag: '\ud83c\udde7\ud83c\uddfc' },
  { code: 'ZW', name: 'Zimbabwe', flag: '\ud83c\uddff\ud83c\uddfc' },
  { code: 'TZ', name: 'Tanzania', flag: '\ud83c\uddf9\ud83c\uddff' },
  { code: 'KE', name: 'Kenya', flag: '\ud83c\uddf0\ud83c\uddea' },
  { code: 'NG', name: 'Nigeria', flag: '\ud83c\uddf3\ud83c\uddec' },
  { code: 'ZM', name: 'Zambia', flag: '\ud83c\uddff\ud83c\uddf2' },
  { code: 'MZ', name: 'Mozambique', flag: '\ud83c\uddf2\ud83c\uddff' },
  { code: 'ZA', name: 'South Africa', flag: '\ud83c\uddff\ud83c\udde6' },
  { code: 'GH', name: 'Ghana', flag: '\ud83c\uddec\ud83c\udded' },
  { code: 'UG', name: 'Uganda', flag: '\ud83c\uddfa\ud83c\uddec' },
];

// ═══════════════════════════════════════════════════════
//  TOAST COMPONENT
// ═══════════════════════════════════════════════════════

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TOGGLE SWITCH
// ═══════════════════════════════════════════════════════

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30
        ${checked ? 'bg-[#5DB347]' : 'bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabId>('content');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Site Content & Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage site content, feature flags, configuration, notifications, broadcasts, and country teams</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-[#5DB347] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && <SiteContentTab showToast={showToast} />}
      {activeTab === 'flags' && <FeatureFlagsTab showToast={showToast} />}
      {activeTab === 'config' && <SiteConfigTab showToast={showToast} />}
      {activeTab === 'templates' && <NotificationTemplatesTab showToast={showToast} />}
      {activeTab === 'broadcasts' && <BroadcastsTab showToast={showToast} />}
      {activeTab === 'country_teams' && <CountryTeamsTab showToast={showToast} />}
      {activeTab === 'branding' && <BrandingTab showToast={showToast} />}
      {activeTab === 'hero' && <HeroBannerTab showToast={showToast} />}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 1: SITE CONTENT
// ═══════════════════════════════════════════════════════

function SiteContentTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [collapsedPages, setCollapsedPages] = useState<Record<string, boolean>>({});

  async function loadContent() {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('page')
      .order('section')
      .order('key');
    if (error) {
      showToast('Failed to load content', 'error');
    } else {
      setContent(data || []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadContent(); }, []);

  // Group by page then section
  const grouped = content.reduce<Record<string, Record<string, SiteContent[]>>>((acc, item) => {
    if (!acc[item.page]) acc[item.page] = {};
    if (!acc[item.page][item.section]) acc[item.page][item.section] = [];
    acc[item.page][item.section].push(item);
    return acc;
  }, {});

  function handleEdit(id: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  }

  async function saveSection(page: string, section: string, items: SiteContent[]) {
    const sectionKey = `${page}/${section}`;
    setSaving(sectionKey);
    let hasError = false;

    for (const item of items) {
      const newValue = editedValues[item.id];
      if (newValue !== undefined && newValue !== item.value) {
        const { error } = await supabase
          .from('site_content')
          .update({ value: newValue })
          .eq('id', item.id);
        if (error) hasError = true;
      }
    }

    if (hasError) {
      showToast('Some content failed to save', 'error');
    } else {
      showToast('Content saved successfully');
      setEditedValues({});
      await loadContent();
    }
    setSaving(null);
  }

  function hasSectionChanges(items: SiteContent[]) {
    return items.some((item) => editedValues[item.id] !== undefined && editedValues[item.id] !== item.value);
  }

  function togglePage(page: string) {
    setCollapsedPages((prev) => ({ ...prev, [page]: !prev[page] }));
  }

  if (loading) return <LoadingState />;

  const pageNames: Record<string, string> = {
    homepage: 'Homepage',
    about: 'About',
    sponsor: 'Sponsor a Farmer',
    services: 'Services',
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([page, sections]) => (
        <div key={page} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => togglePage(page)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {collapsedPages[page] ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              <h3 className="text-lg font-semibold text-navy">{pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1)}</h3>
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
                {Object.values(sections).flat().length} fields
              </span>
            </div>
          </button>

          {!collapsedPages[page] && (
            <div className="border-t border-gray-100">
              {Object.entries(sections).map(([section, items]) => (
                <div key={section} className="border-b border-gray-50 last:border-0">
                  <div className="px-6 py-3 bg-gray-50/50 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {section.replace(/_/g, ' ')}
                    </h4>
                    <button
                      onClick={() => saveSection(page, section, items)}
                      disabled={!hasSectionChanges(items) || saving === `${page}/${section}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${hasSectionChanges(items)
                          ? 'bg-[#5DB347] text-white hover:bg-[#4a9a38] shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {saving === `${page}/${section}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Section
                    </button>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <label className="sm:w-48 flex-shrink-0 text-sm font-medium text-gray-600 sm:pt-2">
                          {item.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </label>
                        <div className="flex-1">
                          {item.value.length > 80 || item.content_type === 'html' ? (
                            <textarea
                              value={editedValues[item.id] ?? item.value}
                              onChange={(e) => handleEdit(item.id, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all resize-y"
                            />
                          ) : (
                            <input
                              type={item.content_type === 'number' ? 'number' : 'text'}
                              value={editedValues[item.id] ?? item.value}
                              onChange={(e) => handleEdit(item.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
                            />
                          )}
                          <p className="text-[11px] text-gray-400 mt-1">
                            Updated {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 2: FEATURE FLAGS
// ═══════════════════════════════════════════════════════

function FeatureFlagsTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  async function loadFlags() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('category')
      .order('name');
    if (error) {
      showToast('Failed to load feature flags', 'error');
    } else {
      setFlags(data || []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadFlags(); }, []);

  async function toggleFlag(flag: FeatureFlag) {
    setToggling(flag.id);
    const { error } = await supabase
      .from('feature_flags')
      .update({ enabled: !flag.enabled })
      .eq('id', flag.id);
    if (error) {
      showToast('Failed to update flag', 'error');
    } else {
      showToast(`${flag.name} ${!flag.enabled ? 'enabled' : 'disabled'}`);
      await loadFlags();
    }
    setToggling(null);
  }

  async function saveFlag(flag: FeatureFlag) {
    const { error } = await supabase
      .from('feature_flags')
      .update({
        name: flag.name,
        description: flag.description,
        countries: flag.countries,
        enabled: flag.enabled,
      })
      .eq('id', flag.id);
    if (error) {
      showToast('Failed to save flag', 'error');
    } else {
      showToast('Feature flag updated');
      setEditingFlag(null);
      await loadFlags();
    }
  }

  const categories = [...new Set(flags.map((f) => f.category))];

  const filtered = flags.filter((f) => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.key.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
              ${categoryFilter === 'all' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All ({flags.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                ${categoryFilter === cat ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {CATEGORY_ICONS[cat]}
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
              <span className="opacity-60">({flags.filter((f) => f.category === cat).length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((flag) => (
          <div key={flag.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-navy text-sm truncate">{flag.name}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CATEGORY_COLORS[flag.category] || CATEGORY_COLORS.general}`}>
                    {CATEGORY_ICONS[flag.category]}
                    {flag.category}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{flag.description || 'No description'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {flag.countries.length === 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                      <Globe className="w-3 h-3" /> All Countries
                    </span>
                  ) : (
                    flag.countries.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">
                        {COUNTRY_NAMES[c] || c}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Toggle
                  checked={flag.enabled}
                  onChange={() => toggleFlag(flag)}
                  disabled={toggling === flag.id}
                />
                <button
                  onClick={() => setEditingFlag({ ...flag })}
                  className="text-xs text-gray-400 hover:text-[#5DB347] font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-50">
              <code className="bg-gray-50 px-1.5 py-0.5 rounded text-[10px]">{flag.key}</code>
              {' '}&middot; Updated {new Date(flag.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingFlag && (
        <FlagEditModal
          flag={editingFlag}
          onSave={saveFlag}
          onChange={setEditingFlag}
          onClose={() => setEditingFlag(null)}
        />
      )}
    </div>
  );
}

function FlagEditModal({
  flag,
  onSave,
  onChange,
  onClose,
}: {
  flag: FeatureFlag;
  onSave: (f: FeatureFlag) => void;
  onChange: (f: FeatureFlag) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(flag);
    setSaving(false);
  }

  function toggleCountry(code: string) {
    const countries = flag.countries.includes(code)
      ? flag.countries.filter((c) => c !== code)
      : [...flag.countries, code];
    onChange({ ...flag, countries });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy">Edit Feature Flag</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={flag.name}
              onChange={(e) => onChange({ ...flag, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={flag.description || ''}
              onChange={(e) => onChange({ ...flag, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Enabled</label>
            <Toggle checked={flag.enabled} onChange={(v) => onChange({ ...flag, enabled: v })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Countries (empty = all)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_COUNTRIES.map((code) => (
                <button
                  key={code}
                  onClick={() => toggleCountry(code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${flag.countries.includes(code)
                      ? 'bg-[#5DB347] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {COUNTRY_NAMES[code]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 3: SITE CONFIG
// ═══════════════════════════════════════════════════════

function SiteConfigTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  async function loadConfigs() {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .order('category')
      .order('label');
    if (error) {
      showToast('Failed to load config', 'error');
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadConfigs(); }, []);

  const grouped = configs.reduce<Record<string, SiteConfig[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  function handleEdit(id: string, value: string) {
    setEditedValues((prev) => ({ ...prev, [id]: value }));
  }

  async function saveCategory(category: string, items: SiteConfig[]) {
    setSaving(category);
    let hasError = false;

    for (const item of items) {
      const newValue = editedValues[item.id];
      if (newValue !== undefined && newValue !== item.value) {
        const { error } = await supabase
          .from('site_config')
          .update({ value: newValue })
          .eq('id', item.id);
        if (error) hasError = true;
      }
    }

    if (hasError) {
      showToast('Some settings failed to save', 'error');
    } else {
      showToast('Settings saved');
      setEditedValues({});
      await loadConfigs();
    }
    setSaving(null);
  }

  function hasCategoryChanges(items: SiteConfig[]) {
    return items.some((item) => editedValues[item.id] !== undefined && editedValues[item.id] !== item.value);
  }

  if (loading) return <LoadingState />;

  const categoryLabels: Record<string, string> = {
    general: 'General',
    branding: 'Branding',
    loans: 'Loans',
    membership: 'Membership',
    notifications: 'Notifications',
    payments: 'Payments',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    general: <Settings className="w-5 h-5 text-gray-400" />,
    branding: <Eye className="w-5 h-5 text-purple-400" />,
    loans: <CreditCard className="w-5 h-5 text-blue-400" />,
    membership: <Globe className="w-5 h-5 text-green-400" />,
    notifications: <Bell className="w-5 h-5 text-amber-400" />,
    payments: <CreditCard className="w-5 h-5 text-teal" />,
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {categoryIcons[category] || <Settings className="w-5 h-5 text-gray-400" />}
              <h3 className="text-lg font-semibold text-navy">
                {categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
                {items.length} settings
              </span>
            </div>
            <button
              onClick={() => saveCategory(category, items)}
              disabled={!hasCategoryChanges(items) || saving === category}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${hasCategoryChanges(items)
                  ? 'bg-[#5DB347] text-white hover:bg-[#4a9a38] shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              {saving === category ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="sm:w-64 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  )}
                </div>
                <div className="flex-1">
                  {item.value_type === 'boolean' ? (
                    <Toggle
                      checked={(editedValues[item.id] ?? item.value) === 'true'}
                      onChange={(v) => handleEdit(item.id, v ? 'true' : 'false')}
                    />
                  ) : item.value_type === 'number' ? (
                    <input
                      type="number"
                      value={editedValues[item.id] ?? item.value}
                      onChange={(e) => handleEdit(item.id, e.target.value)}
                      className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editedValues[item.id] ?? item.value}
                      onChange={(e) => handleEdit(item.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
                    />
                  )}
                </div>
                <p className="text-[10px] text-gray-400 sm:w-24 text-right flex-shrink-0">
                  <code className="bg-gray-50 px-1 py-0.5 rounded">{item.key}</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 4: NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════

function NotificationTemplatesTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  async function loadTemplates() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .order('channel')
      .order('name');
    if (error) {
      showToast('Failed to load templates', 'error');
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadTemplates(); }, []);

  async function toggleActive(template: NotificationTemplate) {
    const { error } = await supabase
      .from('notification_templates')
      .update({ is_active: !template.is_active })
      .eq('id', template.id);
    if (error) {
      showToast('Failed to update template', 'error');
    } else {
      showToast(`${template.name} ${!template.is_active ? 'activated' : 'deactivated'}`);
      await loadTemplates();
    }
  }

  async function saveTemplate(template: NotificationTemplate) {
    const { error } = await supabase
      .from('notification_templates')
      .update({
        subject: template.subject,
        body: template.body,
        is_active: template.is_active,
      })
      .eq('id', template.id);
    if (error) {
      showToast('Failed to save template', 'error');
    } else {
      showToast('Template saved');
      setEditingTemplate(null);
      await loadTemplates();
    }
  }

  // Replace {{variables}} with sample values for preview
  function renderPreview(body: string, variables: string[]) {
    let result = body;
    const sampleValues: Record<string, string> = {
      member_name: 'John Doe',
      membership_tier: 'Smallholder',
      member_id: 'AFU-BW-001234',
      loan_amount: '5,000',
      currency: 'USD',
      interest_rate: '12',
      term_months: '24',
      monthly_payment: '235',
      amount: '235',
      due_date: 'April 15, 2026',
      loan_number: 'LN-2026-0042',
      crop: 'maize',
      plot_name: 'North Field',
      harvest_date: 'May 20, 2026',
      sponsor_name: 'Jane Smith',
      farmer_name: 'Tendai Moyo',
      country: 'Zimbabwe',
      tier: 'Gold',
      impact_description: '- 2 hectares of certified seed\n- Crop insurance coverage\n- Market-linked offtake agreement',
      alert_type: 'Heavy Rainfall',
      region: 'Mashonaland',
      date: 'March 25, 2026',
      recommendation: 'Ensure drainage channels are clear. Consider delaying planting by 3 days.',
    };

    variables.forEach((v) => {
      const regex = new RegExp(`\\{\\{${v}\\}\\}`, 'g');
      result = result.replace(regex, sampleValues[v] || `[${v}]`);
    });
    return result;
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${CHANNEL_COLORS[template.channel]}`}>
                  {CHANNEL_ICONS[template.channel]}
                  {template.channel.toUpperCase()}
                </span>
                <h4 className="font-semibold text-navy">{template.name}</h4>
                {template.subject && (
                  <span className="text-xs text-gray-400 hidden sm:inline">Subject: {template.subject}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Toggle checked={template.is_active} onChange={() => toggleActive(template)} />
                <button
                  onClick={() => { setEditingTemplate({ ...template }); setPreviewMode(false); }}
                  className="text-xs text-gray-400 hover:text-[#5DB347] font-medium transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 font-mono whitespace-pre-wrap max-h-24 overflow-hidden relative">
                {template.body}
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-50 to-transparent" />
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {template.variables.map((v) => (
                  <span key={v} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-mono">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <TemplateEditModal
          template={editingTemplate}
          previewMode={previewMode}
          onTogglePreview={() => setPreviewMode(!previewMode)}
          onSave={saveTemplate}
          onChange={setEditingTemplate}
          onClose={() => setEditingTemplate(null)}
          renderPreview={renderPreview}
        />
      )}
    </div>
  );
}

function TemplateEditModal({
  template,
  previewMode,
  onTogglePreview,
  onSave,
  onChange,
  onClose,
  renderPreview,
}: {
  template: NotificationTemplate;
  previewMode: boolean;
  onTogglePreview: () => void;
  onSave: (t: NotificationTemplate) => void;
  onChange: (t: NotificationTemplate) => void;
  onClose: () => void;
  renderPreview: (body: string, variables: string[]) => string;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(template);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-navy">Edit Template</h3>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${CHANNEL_COLORS[template.channel]}`}>
              {CHANNEL_ICONS[template.channel]}
              {template.channel.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          {template.channel === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                value={template.subject || ''}
                onChange={(e) => onChange({ ...template, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Body</label>
              <button
                onClick={onTogglePreview}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#5DB347] transition-colors"
              >
                {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
            {previewMode ? (
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm whitespace-pre-wrap font-mono min-h-[200px]">
                {renderPreview(template.body, template.variables)}
              </div>
            ) : (
              <textarea
                value={template.body}
                onChange={(e) => onChange({ ...template, body: e.target.value })}
                rows={10}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Variables</label>
            <div className="flex flex-wrap gap-1.5">
              {template.variables.map((v) => (
                <span key={v} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-mono">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <Toggle checked={template.is_active} onChange={(v) => onChange({ ...template, is_active: v })} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 5: BROADCASTS
// ═══════════════════════════════════════════════════════

function BroadcastsTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    channel: 'in_app',
    target_audience: 'all',
    target_countries: [] as string[],
    scheduled_at: '',
  });

  async function loadBroadcasts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      showToast('Failed to load broadcasts', 'error');
    } else {
      setBroadcasts(data || []);
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadBroadcasts(); }, []);

  async function createBroadcast() {
    if (!form.title || !form.message) {
      showToast('Title and message are required', 'error');
      return;
    }
    setSaving(true);
    const payload: Record<string, unknown> = {
      title: form.title,
      message: form.message,
      channel: form.channel,
      target_audience: form.target_audience,
      target_countries: form.target_countries,
      status: form.scheduled_at ? 'scheduled' : 'draft',
    };
    if (form.scheduled_at) {
      payload.scheduled_at = new Date(form.scheduled_at).toISOString();
    }

    const { error } = await supabase.from('broadcasts').insert(payload);
    if (error) {
      showToast('Failed to create broadcast', 'error');
    } else {
      showToast('Broadcast created');
      setShowForm(false);
      setForm({ title: '', message: '', channel: 'in_app', target_audience: 'all', target_countries: [], scheduled_at: '' });
      await loadBroadcasts();
    }
    setSaving(false);
  }

  function toggleCountry(code: string) {
    setForm((prev) => ({
      ...prev,
      target_countries: prev.target_countries.includes(code)
        ? prev.target_countries.filter((c) => c !== code)
        : [...prev.target_countries, code],
    }));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Create Button / Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Broadcast
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-navy">Create Broadcast</h3>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Broadcast title..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                placeholder="Broadcast message..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
              >
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={form.target_audience}
                onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
              >
                <option value="all">All Users</option>
                <option value="members">Members Only</option>
                <option value="suppliers">Suppliers Only</option>
                <option value="tier:smallholder">Smallholder Tier</option>
                <option value="tier:commercial">Commercial Tier</option>
                <option value="tier:enterprise">Enterprise Tier</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Countries (optional)</label>
              <div className="flex flex-wrap gap-2">
                {ALL_COUNTRIES.map((code) => (
                  <button
                    key={code}
                    onClick={() => toggleCountry(code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${form.target_countries.includes(code)
                        ? 'bg-[#5DB347] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {COUNTRY_NAMES[code]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={createBroadcast}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4a9a38] disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {form.scheduled_at ? 'Schedule Broadcast' : 'Save as Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Broadcasts List */}
      {broadcasts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Broadcasts Yet</h3>
          <p className="text-sm text-gray-500">Create your first broadcast to communicate with your users.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Audience</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipients</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy">{b.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{b.message}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CHANNEL_COLORS[b.channel] || 'bg-gray-100 text-gray-600'}`}>
                        {CHANNEL_ICONS[b.channel]}
                        {b.channel.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600">
                      {b.target_audience === 'all' ? 'All Users' : b.target_audience.replace(/[:_]/g, ' ')}
                      {b.target_countries.length > 0 && (
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          {b.target_countries.map((c) => COUNTRY_NAMES[c] || c).join(', ')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[b.status]}`}>
                        {b.status === 'scheduled' && <Clock className="w-3 h-3" />}
                        {b.status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-gray-700">
                      {b.recipient_count > 0 ? b.recipient_count.toLocaleString() : '--'}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {b.sent_at
                        ? new Date(b.sent_at).toLocaleDateString()
                        : b.scheduled_at
                        ? new Date(b.scheduled_at).toLocaleDateString()
                        : new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 6: COUNTRY TEAMS
// ═══════════════════════════════════════════════════════

function CountryTeamsTab({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [teamData, setTeamData] = useState<CountryTeamData | null>(null);
  const [allTeams, setAllTeams] = useState<Record<string, CountryTeamData>>({});

  // Load all country team data from site_content
  async function loadAllTeams() {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('section', 'country_teams');

    if (error) {
      showToast('Failed to load country teams', 'error');
      setLoading(false);
      return;
    }

    const teams: Record<string, CountryTeamData> = {};
    for (const row of data || []) {
      try {
        teams[row.key] = JSON.parse(row.value);
      } catch {
        // skip invalid JSON
      }
    }
    setAllTeams(teams);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAllTeams(); }, []);

  // When country changes, load that country's team
  useEffect(() => {
    if (!selectedCountry) {
      setTeamData(null);
      return;
    }
    if (allTeams[selectedCountry]) {
      setTeamData(JSON.parse(JSON.stringify(allTeams[selectedCountry])));
    } else {
      // Initialize with default empty team for this country
      const info = COUNTRY_TEAMS_COUNTRIES.find((c) => c.code === selectedCountry);
      if (info) {
        setTeamData({
          code: info.code,
          name: info.name,
          flag: info.flag,
          tagline: '',
          members: [
            { name: '', title: 'Country Director', bio: '', avatar_url: '' },
            { name: '', title: 'Agricultural Officer', bio: '', avatar_url: '' },
            { name: '', title: 'Finance & Operations', bio: '', avatar_url: '' },
          ],
        });
      }
    }
  }, [selectedCountry, allTeams]);

  function updateMember(index: number, field: keyof CountryTeamMember, value: string) {
    if (!teamData) return;
    const updated = { ...teamData };
    updated.members = [...updated.members];
    updated.members[index] = { ...updated.members[index], [field]: value };
    setTeamData(updated);
  }

  function addMember() {
    if (!teamData) return;
    setTeamData({
      ...teamData,
      members: [...teamData.members, { name: '', title: '', bio: '', avatar_url: '' }],
    });
  }

  function removeMember(index: number) {
    if (!teamData || teamData.members.length <= 1) return;
    const updated = { ...teamData };
    updated.members = updated.members.filter((_, i) => i !== index);
    setTeamData(updated);
  }

  async function saveTeam() {
    if (!teamData || !selectedCountry) return;
    setSaving(true);

    const jsonValue = JSON.stringify(teamData);

    // Check if row exists
    const { data: existing } = await supabase
      .from('site_content')
      .select('id')
      .eq('section', 'country_teams')
      .eq('key', selectedCountry)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_content')
        .update({ value: jsonValue, updated_at: new Date().toISOString() })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('site_content')
        .insert({
          page: 'about',
          section: 'country_teams',
          key: selectedCountry,
          value: jsonValue,
          content_type: 'json',
        }));
    }

    if (error) {
      showToast('Failed to save team data', 'error');
    } else {
      showToast(`${teamData.name} team saved successfully`);
      await loadAllTeams();
    }
    setSaving(false);
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full sm:w-72 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
            >
              <option value="">Choose a country...</option>
              {COUNTRY_TEAMS_COUNTRIES.map((c) => {
                const hasData = !!allTeams[c.code];
                return (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} {hasData ? '(configured)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-[#5DB347]">{Object.keys(allTeams).length}</span> of {COUNTRY_TEAMS_COUNTRIES.length} countries configured
          </div>
        </div>

        {/* Quick status grid */}
        <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2">
          {COUNTRY_TEAMS_COUNTRIES.map((c) => {
            const hasData = !!allTeams[c.code];
            const isSelected = selectedCountry === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all border-2
                  ${isSelected
                    ? 'border-[#5DB347] bg-[#EBF7E5]'
                    : hasData
                    ? 'border-green-200 bg-green-50 hover:border-[#5DB347]'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className={`mt-0.5 font-medium ${isSelected ? 'text-[#5DB347]' : 'text-gray-600'}`}>
                  {c.code}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Editor */}
      {teamData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{teamData.flag}</span>
              <div>
                <h3 className="font-semibold text-navy">{teamData.name} Team</h3>
                <p className="text-xs text-gray-500">{teamData.members.length} team members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={addMember}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </button>
              <button
                onClick={saveTeam}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-[#5DB347] text-white hover:bg-[#4a9a38] shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Team
              </button>
            </div>
          </div>

          {/* Tagline */}
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <label className="block text-xs font-medium text-gray-600 mb-1">Country Tagline</label>
            <input
              type="text"
              value={teamData.tagline}
              onChange={(e) => setTeamData({ ...teamData, tagline: e.target.value })}
              placeholder="e.g. Innovation-driven agricultural finance"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
            />
          </div>

          {/* Member Cards */}
          <div className="p-6 space-y-4">
            {teamData.members.map((member, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100 relative group">
                {teamData.members.length > 1 && (
                  <button
                    onClick={() => removeMember(i)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-start gap-4">
                  {/* Avatar preview */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        member.avatar_url ||
                        (member.name
                          ? `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1B2A4A&color=5DB347&size=128&bold=true`
                          : `https://ui-avatars.com/api/?name=?&background=1B2A4A&color=5DB347&size=128&bold=true`)
                      }
                      alt={member.name || 'Avatar'}
                      className="w-14 h-14 rounded-full"
                    />
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(i, 'name', e.target.value)}
                        placeholder="e.g. James Otieno"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Job Title</label>
                      <input
                        type="text"
                        value={member.title}
                        onChange={(e) => updateMember(i, 'title', e.target.value)}
                        placeholder="e.g. Country Director"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">Bio</label>
                      <textarea
                        value={member.bio}
                        onChange={(e) => updateMember(i, 'bio', e.target.value)}
                        rows={2}
                        placeholder="Brief description of role and expertise..."
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all resize-y"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-gray-500 mb-0.5">
                        Custom Avatar URL <span className="text-gray-400">(optional - auto-generated from name)</span>
                      </label>
                      <input
                        type="text"
                        value={member.avatar_url}
                        onChange={(e) => updateMember(i, 'avatar_url', e.target.value)}
                        placeholder="https://... (leave blank for auto-avatar)"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#5DB347]/20 focus:border-[#5DB347] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCountry && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-navy mb-1">Select a Country</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Choose a country above to view and edit its leadership team. Team data is stored in
            site_content and displayed on the About page.
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SHARED: Loading state
// ═══════════════════════════════════════════════════════

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 7: BRANDING
// ═══════════════════════════════════════════════════════

function BrandingTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [logoUrl, setLogoUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .eq('key', 'site_logo_url')
          .single();
        if (data) {
          setLogoUrl(data.value || '');
          setPreviewUrl(data.value || '');
        }
      } catch {
        // config row may not exist yet
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setLogoUrl(url);
    setPreviewUrl(url);
    setSelectedFile(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalUrl = logoUrl;

      // If a file was selected, upload it to Supabase storage
      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop();
        const filePath = `branding/logo-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('public-assets')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) {
          // Fall back to just saving the data URL or existing URL
          console.warn('Upload failed, saving URL directly:', uploadError.message);
        } else {
          const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(filePath);
          finalUrl = urlData.publicUrl;
        }
      }

      // Upsert into site_config
      const { error } = await supabase
        .from('site_config')
        .upsert(
          {
            category: 'branding',
            key: 'site_logo_url',
            value: finalUrl,
            value_type: 'string',
            label: 'Site Logo URL',
            description: 'URL for the site logo displayed across the platform',
          },
          { onConflict: 'key' }
        );

      if (error) throw error;
      setLogoUrl(finalUrl);
      setPreviewUrl(finalUrl);
      setSelectedFile(null);
      showToast('Logo updated successfully');
    } catch {
      showToast('Failed to save logo', 'error');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">Site Logo</h3>
        <p className="text-sm text-gray-500 mb-6">Upload or provide a URL for the site logo used across the platform.</p>

        {/* Current Logo Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
          <div className="w-full max-w-xs h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Site logo preview"
                className="max-h-full max-w-full object-contain p-3"
              />
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs">No logo set</p>
              </div>
            )}
          </div>
        </div>

        {/* Upload File */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Logo</label>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-gray-500" />
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {selectedFile && (
            <span className="ml-3 text-sm text-gray-500">{selectedFile.name}</span>
          )}
        </div>

        {/* Or URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Or enter logo URL</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full max-w-lg px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Logo
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  TAB 8: HERO BANNER
// ═══════════════════════════════════════════════════════

const HERO_FIELDS = [
  { key: 'hero_headline', label: 'Hero Headline', type: 'text', placeholder: "Let's Grow Together" },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'By farmers, for farmers...' },
  { key: 'hero_cta_text', label: 'Hero CTA Text', type: 'text', placeholder: 'Join Our Farming Family' },
  { key: 'hero_cta_link', label: 'Hero CTA Link', type: 'text', placeholder: '/apply' },
  { key: 'hero_bg_image', label: 'Hero Background Image URL', type: 'text', placeholder: 'https://images.unsplash.com/...' },
] as const;

function HeroBannerTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const supabase = createClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('site_config')
          .select('*')
          .in('key', HERO_FIELDS.map((f) => f.key));
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((row: SiteConfig) => {
            map[row.key] = row.value || '';
          });
          setValues(map);
        }
      } catch {
        // config rows may not exist yet
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = HERO_FIELDS.map((f) => ({
        category: 'hero',
        key: f.key,
        value: values[f.key] || '',
        value_type: 'string',
        label: f.label,
        description: `Hero banner: ${f.label}`,
      }));

      const { error } = await supabase
        .from('site_config')
        .upsert(rows, { onConflict: 'key' });

      if (error) throw error;
      showToast('Hero banner updated successfully');
    } catch {
      showToast('Failed to save hero banner', 'error');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-[#1B2A4A] mb-1">Hero Banner</h3>
        <p className="text-sm text-gray-500 mb-6">Edit the homepage hero section headline, subtitle, call-to-action, and background image.</p>

        <div className="space-y-5 max-w-xl">
          {HERO_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                />
              )}
            </div>
          ))}
        </div>

        {/* Preview */}
        {values.hero_bg_image && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Background Preview</label>
            <div className="relative w-full max-w-xl h-40 rounded-xl overflow-hidden border border-gray-200">
              <img src={values.hero_bg_image} alt="Hero background preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A]/80 to-transparent flex items-center px-6">
                <div>
                  <p className="text-white font-bold text-lg">{values.hero_headline || 'Headline'}</p>
                  <p className="text-gray-300 text-sm mt-1 line-clamp-2">{values.hero_subtitle || 'Subtitle'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Hero Banner
        </button>
      </div>
    </div>
  );
}
