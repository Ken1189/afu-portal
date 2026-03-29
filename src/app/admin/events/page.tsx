'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  RotateCcw,
  Search,
  Zap,
} from 'lucide-react';

// ── Types ──

interface EventLogEntry {
  id: string;
  event_type: string;
  actor_id: string | null;
  target_id: string | null;
  payload: Record<string, unknown>;
  handlers_run: string[];
  status: string;
  error: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

// ── Event type colors & labels ──

const EVENT_CATEGORIES: Record<string, { color: string; bg: string; label: string }> = {
  COMMODITY_RECEIVED: { color: 'text-green-700', bg: 'bg-green-100', label: 'Warehouse' },
  COMMODITY_RELEASED: { color: 'text-green-700', bg: 'bg-green-100', label: 'Warehouse' },
  QUALITY_INSPECTION_COMPLETE: { color: 'text-green-700', bg: 'bg-green-100', label: 'Warehouse' },
  TRADE_ORDER_CREATED: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Trade' },
  TRADE_ORDER_MATCHED: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Trade' },
  TRADE_EXECUTED: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Trade' },
  QUOTE_RECEIVED: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Trade' },
  PAYMENT_RECEIVED: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Finance' },
  LOAN_APPROVED: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Finance' },
  LOAN_DISBURSED: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Finance' },
  LOAN_REPAYMENT: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Finance' },
  INSURANCE_PAYOUT: { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Insurance' },
  MEMBER_JOINED: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Membership' },
  APPLICATION_APPROVED: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Membership' },
  KYC_APPROVED: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Membership' },
  MEMBERSHIP_PAYMENT: { color: 'text-emerald-700', bg: 'bg-emerald-100', label: 'Membership' },
  COOPERATIVE_ORDER_CREATED: { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Cooperative' },
  COOPERATIVE_MEMBER_JOINED: { color: 'text-teal-700', bg: 'bg-teal-100', label: 'Cooperative' },
};

function getEventMeta(type: string) {
  return EVENT_CATEGORIES[type] || { color: 'text-gray-700', bg: 'bg-gray-100', label: 'System' };
}

// ── Status badge ──

function StatusBadge({ status }: { status: string }) {
  if (status === 'processed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" /> Processed
      </span>
    );
  }
  if (status === 'partial_failure') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <AlertTriangle className="w-3 h-3" /> Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      <AlertTriangle className="w-3 h-3" /> Failed
    </span>
  );
}

// ── Main page ──

export default function EventMonitorPage() {
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventLogEntry | null>(null);
  const [replaying, setReplaying] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (filterType) params.set('type', filterType);
      const res = await fetch(`/api/events/emit?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // ── KPI calculations ──

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const eventsToday = events.filter((e) => e.created_at >= todayStart).length;
  const eventsThisWeek = events.filter((e) => e.created_at >= weekAgo).length;
  const failedEvents = events.filter((e) => e.status === 'failed' || e.status === 'partial_failure').length;
  const avgProcessingTime = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + (e.processing_time_ms || 0), 0) / events.length)
    : 0;

  // ── Filter events by search ──

  const filteredEvents = events.filter((e) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      e.event_type.toLowerCase().includes(term) ||
      e.status.toLowerCase().includes(term) ||
      JSON.stringify(e.payload).toLowerCase().includes(term)
    );
  });

  // ── Event volume by type (last 7 days) ──

  const weekEvents = events.filter((e) => e.created_at >= weekAgo);
  const volumeByType: Record<string, number> = {};
  weekEvents.forEach((e) => {
    volumeByType[e.event_type] = (volumeByType[e.event_type] || 0) + 1;
  });
  const sortedVolume = Object.entries(volumeByType).sort(([, a], [, b]) => b - a).slice(0, 8);
  const maxVolume = sortedVolume.length > 0 ? sortedVolume[0][1] : 1;

  // ── Replay event ──

  const handleReplay = async (event: EventLogEntry) => {
    setReplaying(true);
    try {
      const res = await fetch('/api/events/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: event.event_type, data: event.payload }),
      });
      if (res.ok) {
        await fetchEvents();
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error('Replay failed:', err);
    } finally {
      setReplaying(false);
    }
  };

  // ── Unique event types for filter dropdown ──

  const allEventTypes = Array.from(new Set(events.map((e) => e.event_type))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">Cross-system event flow dashboard</p>
        </div>
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Events Today</p>
              <p className="text-2xl font-bold text-gray-900">{eventsToday}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{eventsThisWeek}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed Events</p>
              <p className="text-2xl font-bold text-gray-900">{failedEvents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Processing</p>
              <p className="text-2xl font-bold text-gray-900">{avgProcessingTime}ms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Volume Chart (simple bar chart) */}
      {sortedVolume.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Event Volume (Last 7 Days)
          </h2>
          <div className="space-y-2">
            {sortedVolume.map(([type, count]) => {
              const meta = getEventMeta(type);
              const pct = Math.round((count / maxVolume) * 100);
              return (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-48 text-xs text-gray-600 truncate">{type.replace(/_/g, ' ')}</div>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${meta.bg}`}
                      style={{ width: `${pct}%`, minWidth: '20px' }}
                    />
                  </div>
                  <div className="w-10 text-xs font-medium text-gray-700 text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Event Types</option>
            {allEventTypes.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Feed Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Event Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actor</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Activity className="w-6 h-6 mx-auto mb-2" />
                    No events found
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 100).map((event) => {
                  const meta = getEventMeta(event.event_type);
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {event.event_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[120px]">
                        {event.actor_id ? event.actor_id.slice(0, 8) + '...' : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {event.processing_time_ms != null ? `${event.processing_time_ms}ms` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          className="text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Event Type</label>
                  <p className="font-mono text-sm mt-1">{selectedEvent.event_type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="mt-1"><StatusBadge status={selectedEvent.status} /></div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Timestamp</label>
                  <p className="text-sm mt-1">{new Date(selectedEvent.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Processing Time</label>
                  <p className="text-sm mt-1">{selectedEvent.processing_time_ms ?? '-'}ms</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Actor ID</label>
                  <p className="font-mono text-xs mt-1 break-all">{selectedEvent.actor_id || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Target ID</label>
                  <p className="font-mono text-xs mt-1 break-all">{selectedEvent.target_id || '-'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Payload</label>
                <pre className="mt-1 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto border border-gray-200">
                  {JSON.stringify(selectedEvent.payload, null, 2)}
                </pre>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Handlers Executed</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedEvent.handlers_run.length > 0 ? (
                    selectedEvent.handlers_run.map((h, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          h.endsWith(':FAILED') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No handlers registered for this event type</span>
                  )}
                </div>
              </div>

              {selectedEvent.error && (
                <div>
                  <label className="text-xs font-medium text-red-500 uppercase">Error</label>
                  <pre className="mt-1 p-3 bg-red-50 rounded-lg text-xs text-red-700 border border-red-200">
                    {selectedEvent.error}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {(selectedEvent.status === 'failed' || selectedEvent.status === 'partial_failure') && (
                <button
                  onClick={() => handleReplay(selectedEvent)}
                  disabled={replaying}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  <RotateCcw className={`w-4 h-4 ${replaying ? 'animate-spin' : ''}`} />
                  Replay Event
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
