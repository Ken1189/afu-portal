'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

interface ServiceRequestRow {
  id: string;
  provider_id: string;
  request_type: string | null;
  subject: string;
  description: string | null;
  status: string;
  preferred_date: string | null;
  preferred_time: string | null;
  commodity: string | null;
  quantity: number | null;
  unit: string | null;
  provider_notes: string | null;
  farmer_notes: string | null;
  created_at: string;
  provider?: {
    id: string;
    business_name: string;
    email: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-600', icon: Clock },
  accepted: { label: 'Accepted', cls: 'bg-blue-50 text-blue-600', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', cls: 'bg-purple-50 text-purple-600', icon: Clock },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500', icon: XCircle },
  rejected: { label: 'Rejected', cls: 'bg-red-50 text-red-500', icon: XCircle },
};

type TabFilter = 'all' | 'pending' | 'accepted' | 'completed';

export default function FarmServiceRequestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequestRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from('service_requests')
          .select(`
            *,
            provider:service_providers (
              id,
              business_name,
              email
            )
          `)
          .eq('farmer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error('Failed to fetch service requests:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return requests;
    if (activeTab === 'completed') {
      return requests.filter((r) => r.status === 'completed');
    }
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted' || r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  }), [requests]);

  async function handleCancel(id: string) {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    setCancelling(id);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('farmer_id', user!.id);

      if (error) throw error;
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
      );
    } catch (err) {
      console.error('Failed to cancel request:', err);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setCancelling(null);
    }
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
          <Send className="w-5 h-5 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Service Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.completed} completed · {counts.all} total
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-[#1B2A4A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading your requests...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
            {activeTab === 'all' ? 'No requests yet' : `No ${activeTab} requests`}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {activeTab === 'all'
              ? 'Browse our directory to find service providers and request their services.'
              : 'No requests match this filter.'}
          </p>
          {activeTab === 'all' && (
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5DB347] text-white text-sm font-medium rounded-lg hover:bg-[#4ea23d] transition-colors"
            >
              Browse Directory
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const config = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Row summary */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-400">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="font-medium text-[#1B2A4A] truncate">{req.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-500 truncate">
                        {req.provider?.business_name || 'Unknown provider'}
                      </span>
                      {req.request_type && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {req.request_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.cls}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </span>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {req.description && (
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {req.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                      {req.preferred_date && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Preferred Date</p>
                          <p className="text-gray-700">{req.preferred_date}</p>
                        </div>
                      )}
                      {req.preferred_time && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Preferred Time</p>
                          <p className="text-gray-700">{req.preferred_time}</p>
                        </div>
                      )}
                      {req.commodity && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Commodity</p>
                          <p className="text-gray-700">
                            {req.commodity}
                            {req.quantity ? ` (${req.quantity} ${req.unit || ''})` : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    {req.provider_notes && (
                      <div className="bg-blue-50/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-600 mb-1">Provider Notes</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {req.provider_notes}
                        </p>
                      </div>
                    )}

                    {req.farmer_notes && (
                      <div className="bg-green-50/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-600 mb-1">Your Notes</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {req.farmer_notes}
                        </p>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancel(req.id)}
                          disabled={cancelling === req.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {cancelling === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
