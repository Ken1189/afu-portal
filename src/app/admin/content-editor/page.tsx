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
  const renderField = (field: FieldDef) => {
    const value = content[field.key];
    if (field.type === 'text') {
      return (
        <input
          type="text"
          value={(value as string) || ''}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          value={(value as string) || ''}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
        />
      );
    }
    if (field.type === 'image') {
      return (
        <ImageUploader
          bucket="media"
          folder="content-editor"
          value={typeof value === 'string' ? value : ''}
          onChange={(url) => updateField(field.key, url)}
          label=""
          allowUrl
        />
      );
    }
    if (field.type === 'string-list') {
      const list = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="space-y-2">
          {list.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = e.target.value;
                  updateField(field.key, next);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]"
              />
              <button
                type="button"
                onClick={() => updateField(field.key, list.filter((_, j) => j !== i))}
                className="rounded-lg border border-gray-300 px-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => updateField(field.key, [...list, field.defaultString || ''])}
            className="flex items-center gap-1 text-xs text-[#5DB347] hover:text-[#449933]"
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
          {list.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Item {i + 1}</span>
                <button
                  type="button"
                  onClick={() => updateField(field.key, list.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-600"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {field.itemFields?.map((sub) => (
                  <div key={sub.key}>
                    <label className="mb-0.5 block text-xs text-gray-500">{sub.label}</label>
                    {sub.type === 'textarea' ? (
                      <textarea
                        value={(item[sub.key] as string) || ''}
                        onChange={(e) => {
                          const next = [...list];
                          next[i] = { ...next[i], [sub.key]: e.target.value };
                          updateField(field.key, next);
                        }}
                        rows={2}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
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
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#5DB347]"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateField(field.key, [...list, { ...(field.defaultItem || {}) }])
            }
            className="flex items-center gap-1 text-xs text-[#5DB347] hover:text-[#449933]"
          >
            <Plus className="h-3 w-3" /> Add Item
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#1B2A4A]">Content Editor</h1>
          <span className="text-sm text-gray-500">
            Editing: <strong className="text-gray-700">{activeSchema.label}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving draft…
            </span>
          )}
          <button
            onClick={handleRevert}
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Revert
          </button>
          <a
            href={activeSchema.previewPath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Preview
          </a>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1 rounded-lg bg-[#5DB347] px-4 py-1.5 text-sm font-bold text-white shadow-sm hover:bg-[#449933] disabled:opacity-50"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Save & Publish
          </button>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`mx-4 mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* ── Sidebar + form + preview ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: page picker */}
        <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-white py-3">
          {SCHEMA_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {group.title}
              </div>
              {group.schemaIds.map((id) => {
                const s = ALL_SCHEMAS.find((x) => x.id === id);
                if (!s) return null;
                const isActive = activePageId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActivePageId(id)}
                    className={`block w-full px-3 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'border-l-2 border-[#5DB347] bg-[#5DB347]/10 font-semibold text-[#5DB347]'
                        : 'border-l-2 border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Middle: form */}
        <div className="w-[42%] overflow-y-auto border-r border-gray-200 bg-white p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {activeSchema.sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#1B2A4A]">
                    {section.title}
                  </h3>
                  <div className="space-y-3">
                    {section.fields.length === 0 && (
                      <p className="text-xs italic text-gray-400">
                        No editable fields in this section yet.
                      </p>
                    )}
                    {section.fields.map((field) => (
                      <div key={field.key}>
                        <label className="mb-1 block text-xs font-medium text-gray-700">
                          {field.label}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                <Eye className="h-4 w-4" />
                Changes auto-save to draft. Click <strong>Save &amp; Publish</strong> to push live.
              </div>
            </div>
          )}
        </div>

        {/* Right: preview iframe */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Live Preview — {activeSchema.previewPath}</span>
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
          <div className="h-[calc(100%-1.5rem)] overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
            <iframe
              ref={iframeRef}
              key={`${activeSchema.id}-${iframeKey}`}
              src={activeSchema.previewPath}
              className="h-full w-full"
              title="Live preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
