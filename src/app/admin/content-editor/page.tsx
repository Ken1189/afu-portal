'use client';

/**
 * Unified Content Editor with Live Preview — v2 (User-Friendly)
 *
 * Improvements over v1:
 * - Rich text editor (TipTap) for textarea/richtext fields
 * - Drag-and-drop reordering for list items
 * - Collapsible sections with open/close all
 * - Sidebar search + keyboard shortcuts (Ctrl+S, Ctrl+Shift+P)
 * - Auto-expanding textareas
 * - Field help text / character counts
 * - Mobile-responsive preview toggle
 * - Draft vs Published indicator
 * - Smoother animations and transitions
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import dynamic from 'next/dynamic';
import {
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  RotateCcw,
  RefreshCw,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Save,
  Menu,
  X,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  ALL_SCHEMAS,
  SCHEMA_GROUPS,
  HOMEPAGE_SCHEMA,
  type FieldDef,
  type PageSchema,
} from './schemas';
import ImageUploader from '@/components/ui/ImageUploader';

// Lazy-load the rich text editor to reduce bundle
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    </div>
  ),
});

// ───────────────────────────────────────────────────────────────────────
//  Types
// ───────────────────────────────────────────────────────────────────────

type ContentValue = string | string[] | Record<string, string>[] | undefined;
type Content = Record<string, ContentValue>;

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

// ───────────────────────────────────────────────────────────────────────
//  Auto-expanding textarea hook
// ───────────────────────────────────────────────────────────────────────

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  minRows = 3,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className: string;
  minRows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(el.scrollHeight, minRows * 24) + 'px';
  }, [value, minRows]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={`${className} resize-none overflow-hidden transition-[height] duration-150`}
    />
  );
}

// ───────────────────────────────────────────────────────────────────────
//  Component
// ───────────────────────────────────────────────────────────────────────

export default function ContentEditorPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activePageId, setActivePageId] = useState<string>('homepage');
  const activeSchema: PageSchema =
    ALL_SCHEMAS.find((s) => s.id === activePageId) || HOMEPAGE_SCHEMA;

  const [content, setContent] = useState<Content>({});
  const [publishedContent, setPublishedContent] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dragState, setDragState] = useState<{ fieldKey: string; index: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if content differs from published
  const isDraft = useMemo(() => {
    return JSON.stringify(content) !== JSON.stringify(publishedContent);
  }, [content, publishedContent]);

  // Load draft (or fall back to published) when switching pages
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setHasUnsavedChanges(false);
      try {
        // Load both draft and published
        const [draftRes, pubRes] = await Promise.all([
          supabase.from('site_config').select('value').eq('key', activeSchema.draftKey).maybeSingle(),
          supabase.from('site_config').select('value').eq('key', activeSchema.publishedKey).maybeSingle(),
        ]);
        const parsedPub = pubRes.data?.value
          ? typeof pubRes.data.value === 'string' ? JSON.parse(pubRes.data.value) : pubRes.data.value
          : {};
        const parsedDraft = draftRes.data?.value
          ? typeof draftRes.data.value === 'string' ? JSON.parse(draftRes.data.value) : draftRes.data.value
          : null;

        if (!cancelled) {
          setPublishedContent(parsedPub);
          setContent(parsedDraft || parsedPub || {});
        }
      } catch {
        if (!cancelled) {
          setContent({});
          setPublishedContent({});
        }
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [activeSchema.draftKey, activeSchema.publishedKey, supabase]);

  // Push live updates into the iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: 'preview-update', content },
        window.location.origin
      );
    } catch { /* ignore */ }
  }, [content]);

  // Debounced save-to-draft
  const persistDraft = useCallback(
    async (next: Content) => {
      setSaving(true);
      try {
        const { error } = await supabase.from('site_config').upsert(
          {
            key: activeSchema.draftKey,
            value: JSON.stringify(next),
            value_type: 'json',
            category: 'content_editor',
            label: `${activeSchema.label} Draft`,
            description: `Draft content for ${activeSchema.label}`,
          },
          { onConflict: 'key' }
        );
        if (error) throw error;
        setLastSavedAt(new Date());
        setHasUnsavedChanges(false);
      } catch {
        setToast({ message: 'Failed to save draft', type: 'error' });
      }
      setSaving(false);
    },
    [activeSchema.draftKey, activeSchema.label, supabase]
  );

  const updateField = (key: string, value: ContentValue) => {
    const next = { ...content, [key]: value };
    setContent(next);
    setHasUnsavedChanges(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistDraft(next), 800);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      await persistDraft(content);
      const { error } = await supabase.from('site_config').upsert(
        {
          key: activeSchema.publishedKey,
          value: JSON.stringify(content),
          value_type: 'json',
          category: 'content_editor',
          label: `${activeSchema.label} Published`,
          description: `Live content for ${activeSchema.label}`,
        },
        { onConflict: 'key' }
      );
      if (error) throw error;
      setPublishedContent(content);
      setToast({ message: 'Published live!', type: 'success' });
      setIframeKey((k) => k + 1);
    } catch {
      setToast({ message: 'Failed to publish', type: 'error' });
    }
    setPublishing(false);
  };

  const handleRevert = async () => {
    if (!confirm('Discard draft changes and reload from the published version?')) return;
    setLoading(true);
    try {
      setContent(publishedContent);
      await persistDraft(publishedContent);
      setIframeKey((k) => k + 1);
      setToast({ message: 'Reverted to published version', type: 'success' });
    } catch {
      setToast({ message: 'Failed to revert', type: 'error' });
    }
    setLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (saveTimer.current) clearTimeout(saveTimer.current);
        persistDraft(content);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        handlePublish();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, persistDraft]);

  // Warn on page leave with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Section collapse helpers
  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const expandAll = () => setCollapsedSections(new Set());
  const collapseAll = () => setCollapsedSections(new Set(activeSchema.sections.map((s) => s.id)));

  // Drag & drop for object-list and string-list
  const handleDragStart = (fieldKey: string, index: number) => {
    setDragState({ fieldKey, index });
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (fieldKey: string, targetIndex: number) => {
    if (!dragState || dragState.fieldKey !== fieldKey) return;
    const sourceIndex = dragState.index;
    if (sourceIndex === targetIndex) { setDragState(null); return; }
    const value = content[fieldKey];
    if (!Array.isArray(value)) { setDragState(null); return; }
    const list = [...value] as (string | Record<string, string>)[];
    const [moved] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, moved);
    updateField(fieldKey, list as ContentValue);
    setDragState(null);
  };

  // Move item up/down helpers
  const moveItem = (fieldKey: string, index: number, direction: 'up' | 'down') => {
    const value = content[fieldKey];
    if (!Array.isArray(value)) return;
    const list = [...value] as (string | Record<string, string>)[];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
    updateField(fieldKey, list as ContentValue);
  };

  // Duplicate item
  const duplicateItem = (fieldKey: string, index: number) => {
    const value = content[fieldKey];
    if (!Array.isArray(value)) return;
    const list = [...value] as (string | Record<string, string>)[];
    const copy = JSON.parse(JSON.stringify(list[index]));
    list.splice(index + 1, 0, copy);
    updateField(fieldKey, list as ContentValue);
  };

  // ─── Field renderers ───
  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-[#5DB347] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/20';

  const renderField = (field: FieldDef) => {
    const value = content[field.key];

    if (field.type === 'text') {
      return (
        <div className="relative">
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={inputBase}
          />
          {typeof value === 'string' && value.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300">
              {value.length}
            </span>
          )}
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <AutoTextarea
          value={(value as string) || ''}
          onChange={(val) => updateField(field.key, val)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
          className={`${inputBase} leading-relaxed`}
          minRows={3}
        />
      );
    }

    if (field.type === 'richtext') {
      return (
        <RichTextEditor
          value={(value as string) || ''}
          onChange={(html) => updateField(field.key, html)}
          placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
          minHeight="200px"
        />
      );
    }

    if (field.type === 'image') {
      return (
        <div className="rounded-xl border border-dashed border-gray-200 bg-[#FAF8F3]/60 p-3">
          <ImageUploader
            bucket="media"
            folder="content-editor"
            value={typeof value === 'string' ? value : ''}
            onChange={(url) => updateField(field.key, url)}
            label=""
            allowUrl
          />
        </div>
      );
    }

    if (field.type === 'string-list') {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          <div className="space-y-1.5">
            {list.map((item, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(field.key, i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(field.key, i)}
                className={`group flex items-center gap-2 rounded-xl border bg-white px-2 py-1.5 transition-all ${
                  dragState?.fieldKey === field.key && dragState?.index === i
                    ? 'border-[#5DB347] opacity-50'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-gray-300 active:cursor-grabbing" />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-400">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = e.target.value;
                    updateField(field.key, next);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateField(field.key, list.filter((_, j) => j !== i))}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  aria-label="Remove item"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updateField(field.key, [...list, field.defaultString || ''])}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#5DB347]/40 px-3 py-2 text-xs font-medium text-[#5DB347] transition-colors hover:border-[#5DB347] hover:bg-[#5DB347]/10"
          >
            <Plus className="h-3.5 w-3.5" /> Add Item
          </button>
        </div>
      );
    }

    if (field.type === 'object-list') {
      const list = Array.isArray(value) ? (value as Record<string, string>[]) : [];
      return (
        <div className="space-y-2">
          {list.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {list.length} item{list.length !== 1 ? 's' : ''}
              </span>
              <span className="text-[10px] text-gray-400">
                Drag to reorder
              </span>
            </div>
          )}
          {list.map((item, i) => {
            const firstFieldKey = field.itemFields?.[0]?.key;
            const titleVal = (firstFieldKey && (item[firstFieldKey] as string)) || `Item ${i + 1}`;
            return (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(field.key, i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(field.key, i)}
                className={`group overflow-hidden rounded-xl border bg-white shadow-sm transition-all ${
                  dragState?.fieldKey === field.key && dragState?.index === i
                    ? 'border-[#5DB347] opacity-50'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <details className="group/details">
                  <summary className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-[#FAF8F3] to-white px-3 py-2.5 select-none">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300 active:cursor-grabbing" />
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#5DB347]/10 text-[10px] font-bold text-[#5DB347]">
                      {i + 1}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open/details:rotate-90" />
                    <span className="flex-1 truncate text-sm font-medium text-[#1B2A4A]">
                      {titleVal || `Item ${i + 1}`}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(field.key, i, 'up'); }}
                        disabled={i === 0}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        title="Move up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveItem(field.key, i, 'down'); }}
                        disabled={i === list.length - 1}
                        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
                        title="Move down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); duplicateItem(field.key, i); }}
                        className="rounded-md p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                        title="Duplicate"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateField(field.key, list.filter((_, j) => j !== i));
                        }}
                        className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </summary>
                  <div className="space-y-3 border-t border-gray-100 p-4">
                    {field.itemFields?.map((sub) => (
                      <div key={sub.key}>
                        <label className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          {sub.label}
                        </label>
                        {sub.type === 'textarea' ? (
                          <AutoTextarea
                            value={(item[sub.key] as string) || ''}
                            onChange={(val) => {
                              const next = [...list];
                              next[i] = { ...next[i], [sub.key]: val };
                              updateField(field.key, next);
                            }}
                            className={`${inputBase} leading-relaxed`}
                            minRows={2}
                          />
                        ) : (
                          <input
                            type="text"
                            value={(item[sub.key] as string) || ''}
                            onChange={(e) => {
                              const next = [...list];
                              next[i] = { ...next[i], [sub.key]: e.target.value };
                              updateField(field.key, next);
                            }}
                            className={inputBase}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => updateField(field.key, [...list, { ...(field.defaultItem || {}) }])}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#5DB347]/30 px-3 py-3 text-sm font-medium text-[#5DB347] transition-all hover:border-[#5DB347] hover:bg-[#5DB347]/5 hover:shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add {field.label?.replace(/s$/, '') || 'Item'}
          </button>
        </div>
      );
    }
    return null;
  };

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Construct preview URL
  const previewSrc = useMemo(() => {
    const path = activeSchema.previewPath || '/';
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}preview=draft`;
  }, [activeSchema.previewPath]);

  const saveStatusLabel = saving
    ? 'Saving…'
    : lastSavedAt
    ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'All changes saved';

  // Filter sidebar schemas by search
  const filteredGroups = useMemo(() => {
    if (!sidebarSearch.trim()) return SCHEMA_GROUPS;
    const q = sidebarSearch.toLowerCase();
    return SCHEMA_GROUPS.map((g) => ({
      ...g,
      schemaIds: g.schemaIds.filter((id) => {
        const s = ALL_SCHEMAS.find((x) => x.id === id);
        return s?.label.toLowerCase().includes(q);
      }),
    })).filter((g) => g.schemaIds.length > 0);
  }, [sidebarSearch]);

  // Preview width based on device
  const previewWidth = previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-none';

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#FAF8F3]">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50 lg:hidden"
            aria-label="Toggle pages"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-[#1B2A4A] sm:text-lg">
                {activeSchema.label}
              </h1>
              {isDraft && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  DRAFT
                </span>
              )}
              {!isDraft && Object.keys(publishedContent).length > 0 && (
                <span className="shrink-0 rounded-full bg-[#5DB347]/10 px-2 py-0.5 text-[10px] font-bold text-[#5DB347]">
                  PUBLISHED
                </span>
              )}
            </div>
            <div className="hidden items-center gap-1 text-[10px] text-gray-400 sm:flex">
              <Keyboard className="h-2.5 w-2.5" />
              <span>Ctrl+S save · Ctrl+Shift+P publish</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${
              saving
                ? 'bg-amber-50 text-amber-700'
                : hasUnsavedChanges
                ? 'bg-orange-50 text-orange-600'
                : 'bg-[#5DB347]/10 text-[#449933]'
            }`}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : hasUnsavedChanges ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {saving ? 'Saving…' : hasUnsavedChanges ? 'Unsaved changes' : saveStatusLabel}
          </span>
          <button
            onClick={handleRevert}
            disabled={!isDraft}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
            title="Revert to published version"
          >
            <RotateCcw className="h-3 w-3" /> Revert
          </button>
          <button
            onClick={() => persistDraft(content)}
            disabled={saving}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
          <a
            href={activeSchema.previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 sm:flex"
          >
            <ExternalLink className="h-3 w-3" /> View
          </a>
          <button
            onClick={handlePublish}
            disabled={publishing || !isDraft}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#5DB347] to-[#449933] px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:from-[#449933] hover:to-[#387828] hover:shadow-lg disabled:opacity-50"
          >
            {publishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Publish
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`mx-3 mt-2 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-sm sm:mx-5 ${
            toast.type === 'success'
              ? 'border border-[#5DB347]/30 bg-[#5DB347]/10 text-[#1B2A4A]'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-[#5DB347]" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Sidebar + form + preview ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: page picker with search */}
        <aside
          className={`${
            sidebarOpen ? 'absolute inset-y-0 left-0 z-30' : 'hidden'
          } h-full w-[240px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white shadow-xl lg:relative lg:block lg:shadow-none`}
        >
          {/* Search */}
          <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-3 pb-2 pt-3">
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pages</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                placeholder="Search pages..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-700 placeholder:text-gray-400 focus:border-[#5DB347] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#5DB347]/30"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="py-2">
            {filteredGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.schemaIds.map((id) => {
                    const s = ALL_SCHEMAS.find((x) => x.id === id);
                    if (!s) return null;
                    const isActive = activePageId === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setActivePageId(id);
                          setSidebarOpen(false);
                          setCollapsedSections(new Set());
                        }}
                        className={`group flex w-full items-center gap-2 border-l-[3px] px-3 py-1.5 text-left text-[13px] transition-all ${
                          isActive
                            ? 'border-[#5DB347] bg-[#5DB347]/10 font-semibold text-[#1B2A4A]'
                            : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-[#FAF8F3] hover:text-[#1B2A4A]'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="flex-1 truncate">{s.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3 text-[#5DB347]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Middle: form */}
        <div className={`flex-1 overflow-y-auto border-r border-gray-200 bg-[#FAF8F3] ${showPreview ? 'xl:max-w-[640px]' : ''}`}>
          <div className="mx-auto max-w-2xl p-4 sm:p-5">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
                <Loader2 className="h-7 w-7 animate-spin" />
                <span className="text-sm">Loading content…</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick actions bar */}
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#5DB347]" />
                    <span className="text-xs font-medium text-[#1B2A4A]">
                      {activeSchema.sections.length} sections · {activeSchema.sections.reduce((sum, s) => sum + s.fields.length, 0)} fields
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={expandAll}
                      className="rounded-md px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100"
                    >
                      Expand all
                    </button>
                    <button
                      onClick={collapseAll}
                      className="rounded-md px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100"
                    >
                      Collapse all
                    </button>
                    <button
                      onClick={() => setShowPreview((v) => !v)}
                      className="hidden items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 lg:flex"
                      title={showPreview ? 'Hide preview' : 'Show preview'}
                    >
                      {showPreview ? <PanelLeftClose className="h-3 w-3" /> : <PanelLeftOpen className="h-3 w-3" />}
                      {showPreview ? 'Hide' : 'Show'} preview
                    </button>
                  </div>
                </div>

                {/* Sections */}
                {activeSchema.sections.map((section) => {
                  const isCollapsed = collapsedSections.has(section.id);
                  const filledCount = section.fields.filter((f) => {
                    const v = content[f.key];
                    if (Array.isArray(v)) return v.length > 0;
                    return typeof v === 'string' && v.trim().length > 0;
                  }).length;

                  return (
                    <section
                      key={section.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <header
                        className="flex cursor-pointer items-center gap-2 border-b border-gray-100 bg-gradient-to-r from-[#1B2A4A] to-[#2A3A5C] px-4 py-2.5"
                        onClick={() => toggleSection(section.id)}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-white/60" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
                        )}
                        <h3 className="flex-1 text-xs font-bold uppercase tracking-wider text-white">
                          {section.title}
                        </h3>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
                          {filledCount}/{section.fields.length}
                        </span>
                      </header>
                      {!isCollapsed && (
                        <div className="space-y-4 p-4">
                          {section.fields.length === 0 && (
                            <p className="flex items-center gap-2 text-xs italic text-gray-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              No editable fields in this section yet.
                            </p>
                          )}
                          {section.fields.map((field) => (
                            <div key={field.key}>
                              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#1B2A4A]">
                                {field.label}
                                {field.type === 'image' && (
                                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600">
                                    IMAGE
                                  </span>
                                )}
                                {(field.type === 'textarea' || field.type === 'richtext') && (
                                  <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-medium text-purple-600">
                                    RICH TEXT
                                  </span>
                                )}
                              </label>
                              {renderField(field)}
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })}

                {/* Bottom spacer */}
                <div className="h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Right: preview iframe */}
        {showPreview && (
          <div className="hidden flex-1 flex-col bg-gray-100 p-3 lg:flex">
            {/* Device switcher */}
            <div className="mb-2 flex items-center justify-center gap-1">
              {([
                { key: 'desktop', icon: Monitor, label: 'Desktop' },
                { key: 'tablet', icon: Tablet, label: 'Tablet' },
                { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setPreviewDevice(key)}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                    previewDevice === key
                      ? 'bg-white text-[#1B2A4A] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title={label}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className={`mx-auto flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md ${previewWidth} w-full transition-all duration-300`}>
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-[#FAF8F3] to-white px-3 py-1.5">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5DB347]" />
                </div>
                <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-lg border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-gray-500">
                  <Eye className="h-3 w-3 shrink-0 text-[#5DB347]" />
                  <span className="truncate">{activeSchema.previewPath}</span>
                </div>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh
                </button>
              </div>
              <iframe
                ref={iframeRef}
                key={`${activeSchema.id}-${iframeKey}`}
                src={previewSrc}
                className="flex-1 w-full bg-white"
                title="Live preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
