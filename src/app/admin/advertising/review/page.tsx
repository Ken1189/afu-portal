'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Globe,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink,
  ArrowLeft,
  Search,
  Building2,
  Mail,
  User,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ───────────────────────────────────────────────────────────────────

interface PendingAd {
  id: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  status: string;
  budget: number;
  placement_type: string;
  creative_type: string;
  target_countries: string[];
  created_at: string;
  package_name: string | null;
  supplier_id: string;
  supplier_name: string;
  supplier_email: string;
  supplier_company: string;
  rejection_reason?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  pending: 'bg-blue-100 text-blue-700',
  'pending-review': 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  pending: 'Pending Review',
  'pending-review': 'Pending Review',
  rejected: 'Rejected',
  draft: 'Draft',
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function AdminAdReviewPage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<PendingAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'}|null>(null);
  const showToast = (message: string, type: 'success'|'error' = 'success') => { setToast({message, type}); setTimeout(() => setToast(null), 3000); };

  // ── Fetch all ads ───────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAds() {
      try {
        const supabase = createClient();
        const { data: dbAds, error: adsError } = await supabase
          .from('advertisements')
          .select(`
            *,
            ad_packages(name),
            suppliers!advertisements_supplier_id_fkey(company_name, email, contact_name)
          `)
          .order('created_at', { ascending: false });

        if (adsError) throw adsError;

        if (dbAds) {
          const mapped: PendingAd[] = dbAds.map((a: any) => ({
            id: a.id,
            title: a.title || 'Untitled',
            description: a.description || '',
            image_url: a.image_url || '',
            target_url: a.target_url || '',
            status: a.status || 'pending',
            budget: Number(a.budget) || 0,
            placement_type: a.placement_type || 'banner',
            creative_type: a.creative_type || 'image',
            target_countries: Array.isArray(a.target_countries) ? a.target_countries : [],
            created_at: a.created_at || '',
            package_name: a.ad_packages?.name || null,
            supplier_id: a.supplier_id,
            supplier_name: a.suppliers?.contact_name || 'Unknown',
            supplier_email: a.suppliers?.email || '',
            supplier_company: a.suppliers?.company_name || 'Unknown Company',
            rejection_reason: a.rejection_reason || undefined,
          }));
          setAds(mapped);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load ads');
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  // ── Approve ad ──────────────────────────────────────────────────────────
  const handleApprove = async (adId: string) => {
    setProcessingId(adId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('advertisements')
        .update({
          status: 'active',
          approved_by: user?.id || null,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', adId);

      if (error) throw error;

      setAds((prev) =>
        prev.map((ad) =>
          ad.id === adId ? { ...ad, status: 'active' } : ad
        )
      );
    } catch (err: any) {
      showToast('Failed to approve: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject ad ───────────────────────────────────────────────────────────
  const handleReject = async (adId: string) => {
    const reason = rejectionReasons[adId]?.trim();
    if (!reason) {
      showToast('Please provide a rejection reason.', 'error');
      return;
    }

    setProcessingId(adId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('advertisements')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adId);

      if (error) throw error;

      setAds((prev) =>
        prev.map((ad) =>
          ad.id === adId ? { ...ad, status: 'rejected', rejection_reason: reason } : ad
        )
      );
      setShowRejectInput(null);
      setRejectionReasons((prev) => {
        const copy = { ...prev };
        delete copy[adId];
        return copy;
      });
    } catch (err: any) {
      showToast('Failed to reject: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filter and search ──────────────────────────────────────────────────
  const filteredAds = ads.filter((ad) => {
    if (filter === 'pending' && ad.status !== 'pending' && ad.status !== 'pending-review') return false;
    if (filter === 'active' && ad.status !== 'active') return false;
    if (filter === 'rejected' && ad.status !== 'rejected') return false;
    if (filter !== 'all' && filter !== 'pending' && filter !== 'active' && filter !== 'rejected') return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !ad.title.toLowerCase().includes(s) &&
        !ad.supplier_company.toLowerCase().includes(s) &&
        !ad.supplier_name.toLowerCase().includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  const pendingCount = ads.filter((a) => a.status === 'pending' || a.status === 'pending-review').length;
  const activeCount = ads.filter((a) => a.status === 'active').length;
  const rejectedCount = ads.filter((a) => a.status === 'rejected').length;

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#5DB347] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading ad review queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Review Queue</h1>
          <p className="text-gray-500 mt-1">Review, approve, or reject supplier advertisements</p>
        </div>
        <Link
          href="/admin/advertising"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Advertising
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Pending Review</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Clock className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
          <div className="text-xs text-gray-400 mt-1">Needs your attention</div>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Active</span>
            <div className="p-2 rounded-lg bg-green-50 text-green-600"><CheckCircle2 className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-xs text-gray-400 mt-1">Currently running</div>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Rejected</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600"><XCircle className="w-4 h-4" /></div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{rejectedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Declined ads</div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-white border rounded-xl">
        <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1">
            {[
              { key: 'pending', label: 'Pending', count: pendingCount },
              { key: 'active', label: 'Active', count: activeCount },
              { key: 'rejected', label: 'Rejected', count: rejectedCount },
              { key: 'all', label: 'All', count: ads.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === tab.key ? 'bg-[#1B2A4A] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === tab.key
                      ? tab.key === 'pending' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ads or suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
            />
          </div>
        </div>

        {/* Ad list */}
        <div className="divide-y">
          {filteredAds.length === 0 && (
            <div className="px-5 py-12 text-center">
              <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No ads match this filter.</p>
            </div>
          )}

          {filteredAds.map((ad) => {
            const isExpanded = expanded === ad.id;
            const isProcessing = processingId === ad.id;
            const isPending = ad.status === 'pending' || ad.status === 'pending-review';

            return (
              <div key={ad.id}>
                {/* Collapsed row */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : ad.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      isPending ? 'bg-blue-500' : ad.status === 'active' ? 'bg-green-500' : ad.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{ad.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadgeColors[ad.status] || 'bg-gray-100'}`}>
                          {statusLabels[ad.status] || ad.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        <Building2 className="w-3 h-3 inline mr-1" />
                        {ad.supplier_company} &middot; {ad.placement_type} &middot; ${ad.budget.toLocaleString()}
                        &middot; {new Date(ad.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending && (
                      <span className="hidden sm:inline-flex px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full">
                        Needs Review
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 bg-gray-50 border-t">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                      {/* Left: Ad Preview */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ad Preview</h4>
                        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                          <div className="bg-gradient-to-r from-[#8CB89C]/10 to-[#1B2A4A]/5 p-5">
                            <div className="flex items-start gap-3">
                              {ad.image_url ? (
                                <img
                                  src={ad.image_url}
                                  alt={ad.title}
                                  className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-24 h-16 bg-[#8CB89C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <ImageIcon className="w-6 h-6 text-[#8CB89C]" />
                                </div>
                              )}
                              <div>
                                <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#D4A843]/20 text-[#D4A843] font-semibold uppercase tracking-wider mb-1">
                                  Sponsored
                                </span>
                                <h4 className="font-semibold text-[#1B2A4A] text-sm">{ad.title}</h4>
                                {ad.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ad.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          {ad.target_url && (
                            <div className="px-5 py-2 bg-gray-50 border-t">
                              <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                {ad.target_url} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Details */}
                      <div className="space-y-4">
                        {/* Advertiser details */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Advertiser</h4>
                          <div className="bg-white rounded-lg border p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">{ad.supplier_company}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{ad.supplier_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{ad.supplier_email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Targeting summary */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Targeting</h4>
                          <div className="bg-white rounded-lg border p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Megaphone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700 capitalize">{ad.placement_type.replace('-', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-700">${ad.budget.toLocaleString()} budget</span>
                              {ad.package_name && <span className="text-xs text-gray-400">({ad.package_name})</span>}
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {ad.target_countries.length > 0 ? (
                                  ad.target_countries.map((c) => (
                                    <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-gray-400">All countries</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rejection reason display */}
                    {ad.status === 'rejected' && ad.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-700">
                          <strong>Rejection reason:</strong> {ad.rejection_reason}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {isPending && (
                      <div className="flex flex-col gap-3 pt-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(ad.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5DB347] text-white rounded-lg text-sm font-medium hover:bg-[#449933] transition-colors disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => setShowRejectInput(showRejectInput === ad.id ? null : ad.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>

                        {showRejectInput === ad.id && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                            <label className="block text-xs font-medium text-red-700">Rejection Reason *</label>
                            <textarea
                              value={rejectionReasons[ad.id] || ''}
                              onChange={(e) =>
                                setRejectionReasons((prev) => ({ ...prev, [ad.id]: e.target.value }))
                              }
                              placeholder="Explain why this ad is being rejected..."
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReject(ad.id)}
                                disabled={isProcessing || !rejectionReasons[ad.id]?.trim()}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />
                                ) : null}
                                Confirm Rejection
                              </button>
                              <button
                                onClick={() => {
                                  setShowRejectInput(null);
                                  setRejectionReasons((prev) => {
                                    const copy = { ...prev };
                                    delete copy[ad.id];
                                    return copy;
                                  });
                                }}
                                className="px-3 py-1.5 border text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
