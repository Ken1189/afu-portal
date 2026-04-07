'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

interface Dispute {
  id: string;
  raised_by: string;
  against_user: string | null;
  category: string | null;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  status: string;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

const STATUSES = ['all', 'open', 'in_review', 'resolved', 'closed'];

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Record<string, { status: string; resolution: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/disputes');
      const json = await res.json();
      setDisputes(json.disputes ?? []);
    } catch (err) {
      console.error('[admin disputes] load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? disputes : disputes.filter((d) => d.status === filter)),
    [disputes, filter]
  );

  const startEdit = (d: Dispute) => {
    setEditing((prev) => ({
      ...prev,
      [d.id]: { status: d.status, resolution: d.resolution ?? '' },
    }));
  };

  const save = async (id: string) => {
    const draft = editing[id];
    if (!draft) return;
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: draft.status, resolution: draft.resolution }),
      });
      if (res.ok) {
        await load();
        setEditing((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        const j = await res.json().catch(() => ({}));
        alert(`Update failed: ${j.error ?? 'Unknown error'}`);
      }
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Disputes</h1>
        <p className="text-sm text-gray-500">Review and resolve member-raised disputes.</p>
      </div>

      <div className="mb-4 flex gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
              filter === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <AlertTriangle className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">No disputes match this filter.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="w-8 p-3"></th>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Raised by</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const isExpanded = expanded === d.id;
                const draft = editing[d.id];
                return (
                  <Fragment key={d.id}>
                    <tr
                      className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
                      onClick={() => {
                        setExpanded(isExpanded ? null : d.id);
                        if (!isExpanded && !draft) startEdit(d);
                      }}
                    >
                      <td className="p-3">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                      <td className="p-3 text-xs text-gray-500">{new Date(d.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-xs uppercase text-gray-600">{d.category}</td>
                      <td className="p-3 text-xs text-gray-600">{d.raised_by.slice(0, 8)}</td>
                      <td className="max-w-md truncate p-3 text-gray-700">{d.description}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-t border-gray-100 bg-gray-50">
                        <td colSpan={6} className="p-5">
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-gray-500">Full description</p>
                              <p className="mt-1 text-sm text-gray-700">{d.description}</p>
                            </div>
                            {d.entity_type && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-gray-500">Related</p>
                                <p className="mt-1 text-sm text-gray-700">
                                  {d.entity_type} {d.entity_id ?? ''}
                                </p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Status</label>
                                <select
                                  value={draft?.status ?? d.status}
                                  onChange={(e) =>
                                    setEditing((prev) => ({
                                      ...prev,
                                      [d.id]: { ...(prev[d.id] ?? { status: d.status, resolution: d.resolution ?? '' }), status: e.target.value },
                                    }))
                                  }
                                  className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                >
                                  <option value="open">open</option>
                                  <option value="in_review">in_review</option>
                                  <option value="resolved">resolved</option>
                                  <option value="closed">closed</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Resolution notes</label>
                              <textarea
                                value={draft?.resolution ?? d.resolution ?? ''}
                                onChange={(e) =>
                                  setEditing((prev) => ({
                                    ...prev,
                                    [d.id]: { ...(prev[d.id] ?? { status: d.status, resolution: d.resolution ?? '' }), resolution: e.target.value },
                                  }))
                                }
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => save(d.id)}
                                disabled={savingId === d.id}
                                className="rounded-lg bg-[#5DB347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#449933] disabled:opacity-50"
                              >
                                {savingId === d.id ? 'Saving...' : 'Save changes'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
