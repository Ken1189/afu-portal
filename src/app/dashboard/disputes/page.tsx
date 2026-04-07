'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, X } from 'lucide-react';

interface Dispute {
  id: string;
  category: string | null;
  entity_type: string | null;
  entity_id: string | null;
  description: string;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

const CATEGORIES = ['order', 'payment', 'supplier', 'ambassador', 'other'];

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_review: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: 'order',
    entity_type: '',
    entity_id: '',
    description: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/disputes');
      const json = await res.json();
      setDisputes(json.disputes ?? []);
    } catch (err) {
      console.error('[disputes] load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ category: 'order', entity_type: '', entity_id: '', description: '' });
        await load();
      } else {
        const j = await res.json().catch(() => ({}));
        alert(`Failed to raise dispute: ${j.error ?? 'Unknown error'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Disputes</h1>
          <p className="text-sm text-gray-500">Raise and track issues with orders, payments, suppliers, or ambassadors.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#5DB347] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#449933]"
        >
          <Plus size={16} />
          Raise New Dispute
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : disputes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <AlertTriangle className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">No disputes raised yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-gray-500">{d.category}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[d.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700">{d.description}</p>
              {d.entity_type && (
                <p className="mt-1 text-xs text-gray-500">
                  Related: {d.entity_type} {d.entity_id ? `#${d.entity_id.slice(0, 8)}` : ''}
                </p>
              )}
              {d.resolution && (
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900">
                  <strong>Resolution:</strong> {d.resolution}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy">Raise a dispute</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="mb-1 block text-xs font-medium text-gray-600">Related entity type (optional)</label>
            <input
              value={form.entity_type}
              onChange={(e) => setForm({ ...form, entity_type: e.target.value })}
              placeholder="e.g. order, payment"
              className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />

            <label className="mb-1 block text-xs font-medium text-gray-600">Related entity ID (optional)</label>
            <input
              value={form.entity_id}
              onChange={(e) => setForm({ ...form, entity_id: e.target.value })}
              placeholder="UUID"
              className="mb-3 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />

            <label className="mb-1 block text-xs font-medium text-gray-600">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={5}
              placeholder="Describe the issue..."
              className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-sm"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.description.trim()}
                className="rounded-lg bg-[#5DB347] px-4 py-2 text-sm font-semibold text-white hover:bg-[#449933] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit dispute'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
