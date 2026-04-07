'use client';

/**
 * Unified Content Editor with Live Preview
 *
 * - Left sidebar: grouped list of every editable page on the public site
 * - Middle:       schema-driven form for the active page
 * - Right:        <iframe src="<previewPath>"> showing live draft content
 *
 * Storage model (site_config rows):
 *   <draftKey>     ← what the editor writes on every change (debounced)
 *   <publishedKey> ← what the public site reads by default
 *
 * "Save & Publish" copies draft → published.
 *
 * Public pages read ?preview=draft to load the draft blob, and listen for
 * window.postMessage({ type: 'preview-update', content }) for instant updates.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  Save,
  Menu,
  X,
} from 'lucide-react';
import {
  ALL_SCHEMAS,
  SCHEMA_GROUPS,
  HOMEPAGE_SCHEMA,
  type FieldDef,
  type PageSchema,
} from './schemas';
import ImageUploader from '@/components/ui/ImageUploader';

// ───────────────────────────────────────────────────────────────────────
//  Component
// ───────────────────────────────────────────────────────────────────────

type ContentValue = string | string[] | Record<string, string>[] | undefined;
type Content = Record<string, ContentValue>;

export default function ContentEditorPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activePageId, setActivePageId] = useState<string>('homepage');
  const activeSchema: PageSchema =
    ALL_SCHEMAS.find((s) => s.id === activePageId) || HOMEPAGE_SCHEMA;

  const [content, setContent] = useState<Content>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft (or fall back to published) when switching pages
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: draft } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', activeSchema.draftKey)
          .maybeSingle();
        let value: Content = {};
        if (draft?.value) {
          value = typeof draft.value === 'string' ? JSON.parse(draft.value) : draft.value;
        } else {
          const { data: pub } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', activeSchema.publishedKey)
            .maybeSingle();
          if (pub?.value) {
            value = typeof pub.value === 'string' ? JSON.parse(pub.value) : pub.value;
          }
        }
        if (!cancelled) setContent(value || {});
      } catch {
        if (!cancelled) setContent({});
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeSchema.draftKey, activeSchema.publishedKey, supabase]);

  // Push live updates into the iframe via postMessage
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    try {
      iframeRef.current.contentWindow.postMessage(
        { type: 'preview-update', content },
        window.location.origin
      );
    } catch {
      // ignore
    }
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
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistDraft(next), 600);
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
      setToast({ message: 'Published live!', type: 'success' });
      setIframeKey((k) => k + 1);
    } catch {
      setToast({ message: 'Failed to publish', type: 'error' });
    }
    setPublishing(false);
  };

  const handleRevert = async () => {
    if (!confirm('Discard draft changes and reload from published version?')) return;
    setLoading(true);
    try {
      const { data: pub } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', activeSchema.publishedKey)
        .maybeSingle();
      const value = pub?.value
        ? typeof pub.value === 'string'
          ? JSON.parse(pub.value)
          : pub.value
        : {};
      setContent(value);
      await persistDraft(value);
      setIframeKey((k) => k + 1);
      setToast({ message: 'Reverted to published version', type: 'success' });
    } catch {
      setToast({ message: 'Failed to revert', type: 'error' });
    }
    setLoading(false);
  };

  // ─── Field renderers ───
  const inputBase =
    'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-[#5DB347] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/20';

  const renderField = (field: FieldDef) => {
    const value = content[field.key];
    if (field.type === 'text') {
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={inputBase}
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${inputBase} min-h-24 resize-y leading-relaxed`}
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
          <div className="flex flex-wrap gap-2">
            {list.map((item, i) => (
              <div
                key={i}
                className="group flex items-center gap-1.5 rounded-full border border-[#5DB347]/30 bg-[#5DB347]/10 py-1 pl-1 pr-1 text-sm text-[#1B2A4A] focus-within:border-[#5DB347] focus-within:ring-2 focus-within:ring-[#5DB347]/20"
              >
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = e.target.value;
                    updateField(field.key, next);
                  }}
                  className="min-w-[6rem] max-w-[14rem] bg-transparent px-2 py-0.5 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      field.key,
                      list.filter((_, j) => j !== i)
                    )
                  }
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[#1B2A4A]/50 hover:bg-red-100 hover:text-red-600"
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
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#5DB347]/40 px-3 py-1 text-xs font-medium text-[#5DB347] transition-colors hover:bg-[#5DB347]/10"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      );
    }
    if (field.type === 'object-list') {
      const list = Array.isArray(value) ? (value as Record<string, string>[]) : [];
      return (
        <div className="space-y-3">
          {list.map((item, i) => {
            const firstFieldKey = field.itemFields?.[0]?.key;
            const titleVal =
              (firstFieldKey && (item[firstFieldKey] as string)) || `Item ${i + 1}`;
            return (
              <details
                key={i}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow open:shadow-md"
              >
                <summary className="flex cursor-pointer items-center gap-2 bg-gradient-to-r from-[#FAF8F3] to-white px-3 py-2.5 hover:bg-[#FAF8F3]">
                  <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-open:rotate-90" />
                  <span className="flex-1 truncate text-sm font-medium text-[#1B2A4A]">
                    {titleVal || `Item ${i + 1}`}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateField(
                        field.key,
                        list.filter((_, j) => j !== i)
                      );
                    }}
                    className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </summary>
                <div className="space-y-2.5 border-t border-gray-100 p-3">
                  {field.itemFields?.map((sub) => (
                    <div key={sub.key}>
                      <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                        {sub.label}
                      </label>
                      {sub.type === 'textarea' ? (
                        <textarea
                          value={(item[sub.key] as string) || ''}
                          onChange={(e) => {
                            const next = [...list];
                            next[i] = { ...next[i], [sub.key]: e.target.value };
                            updateField(field.key, next);
                          }}
                          rows={3}
                          className={`${inputBase} min-h-20`}
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
            );
          })}
          <button
            type="button"
            onClick={() =>
              updateField(field.key, [...list, { ...(field.defaultItem || {}) }])
            }
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#5DB347]/40 px-3 py-2.5 text-sm font-medium text-[#5DB347] transition-colors hover:bg-[#5DB347]/10"
          >
            <Plus className="h-4 w-4" /> Add Item
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

  // Construct preview URL with ?preview=draft to load the draft blob
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#FAF8F3]">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 lg:hidden"
            aria-label="Toggle pages"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-[#1B2A4A]">Content Editor</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>Pages</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-[#1B2A4A]">{activeSchema.label}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              saving
                ? 'bg-amber-50 text-amber-700'
                : 'bg-[#5DB347]/10 text-[#449933]'
            }`}
          >
            {saving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {saveStatusLabel}
          </span>
          <button
            onClick={handleRevert}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert
          </button>
          <button
            onClick={() => persistDraft(content)}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Draft
          </button>
          <a
            href={activeSchema.previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Live
          </a>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5DB347] to-[#449933] px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:from-[#449933] hover:to-[#387828] hover:shadow-lg disabled:opacity-50"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Publish
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`mx-4 mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm shadow-sm sm:mx-6 ${
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
        {/* Left sidebar: page picker */}
        <aside
          className={`${
            sidebarOpen ? 'absolute inset-y-0 left-0 z-30' : 'hidden'
          } h-full w-[260px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-4 shadow-xl lg:relative lg:block lg:shadow-none`}
        >
          <div className="mb-2 flex items-center justify-between px-4 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Pages
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {SCHEMA_GROUPS.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="px-4 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
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
                      }}
                      className={`group flex w-full items-center gap-2 border-l-[3px] px-4 py-2 text-left text-sm transition-all ${
                        isActive
                          ? 'border-[#5DB347] bg-[#5DB347]/10 font-semibold text-[#1B2A4A]'
                          : 'border-transparent text-gray-600 hover:border-gray-200 hover:bg-[#FAF8F3] hover:text-[#1B2A4A]'
                      }`}
                    >
                      <span className="flex-1 truncate">{s.label}</span>
                      {isActive && (
                        <ChevronRight className="h-3.5 w-3.5 text-[#5DB347]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Middle: form */}
        <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-[#FAF8F3] xl:max-w-[640px]">
          <div className="mx-auto max-w-2xl p-5 sm:p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center text-gray-400">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#5DB347]/20 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5DB347]/10 text-[#5DB347]">
                      <Eye className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-[#1B2A4A]">
                        {activeSchema.label}
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Edits auto-save to draft. Click <strong>Publish</strong> to push live.
                      </p>
                    </div>
                  </div>
                </div>

                {activeSchema.sections.map((section) => (
                  <section
                    key={section.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    <header className="border-b border-gray-100 bg-gradient-to-r from-[#1B2A4A] to-[#2A3A5C] px-5 py-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                        {section.title}
                      </h3>
                    </header>
                    <div className="space-y-4 p-5">
                      {section.fields.length === 0 && (
                        <p className="text-xs italic text-gray-400">
                          No editable fields in this section yet.
                        </p>
                      )}
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="mb-1.5 block text-xs font-semibold text-[#1B2A4A]">
                            {field.label}
                          </label>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: preview iframe */}
        <div className="hidden flex-1 flex-col bg-gray-100 p-4 lg:flex">
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-[#FAF8F3] to-white px-3 py-2">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5DB347]" />
              </div>
              <div className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500">
                <Eye className="h-3 w-3 shrink-0 text-[#5DB347]" />
                <span className="truncate">{previewSrc}</span>
              </div>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
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
      </div>
    </div>
  );
}
