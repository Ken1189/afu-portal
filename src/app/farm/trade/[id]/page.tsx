'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowLeftRight,
  ShoppingCart,
  Package,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  X,
  ChevronRight,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
interface TradeOrder {
  id: string;
  order_number: string;
  user_id: string;
  type: 'buy' | 'sell';
  commodity: string;
  quantity: number;
  unit: string;
  quality_grade: string;
  country: string;
  delivery_location: string;
  deadline: string;
  target_price: number;
  currency: string;
  status: string;
  afu_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TradeQuote {
  id: string;
  order_id: string;
  supplier_id: string;
  price_per_unit: number;
  quantity_available: number;
  delivery_date: string;
  delivery_terms: string;
  notes: string | null;
  status: string;
  created_at: string;
  supplier_name?: string;
}

// ── Status timeline ────────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'open', label: 'Open' },
  { key: 'afu_review', label: 'AFU Review' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'quoted', label: 'Quoted' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  afu_review: 'bg-yellow-100 text-yellow-700',
  afu_fulfilling: 'bg-green-100 text-green-700',
  marketplace: 'bg-purple-100 text-purple-700',
  quoted: 'bg-indigo-100 text-indigo-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  delivered: 'bg-teal-100 text-teal-700',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  const orderId = params.id as string;

  const [order, setOrder] = useState<TradeOrder | null>(null);
  const [quotes, setQuotes] = useState<TradeQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/trading/${orderId}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      setOrder(data.order);
      setQuotes(data.quotes || []);
    } catch {
      // handle error
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Accept or reject a quote
  const handleQuoteAction = async (quoteId: string, action: 'accepted' | 'rejected') => {
    setActionLoading(quoteId);
    try {
      const res = await fetch('/api/trading/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_id: quoteId, status: action, order_id: orderId }),
      });
      if (res.ok) {
        await fetchOrder();
      }
    } catch {
      // handle error
    }
    setActionLoading(null);
  };

  // Status timeline
  const getStepStatus = (stepKey: string) => {
    if (!order) return 'upcoming';
    const orderIdx = STATUS_STEPS.findIndex(s => s.key === order.status);
    const stepIdx = STATUS_STEPS.findIndex(s => s.key === stepKey);

    // Handle afu_fulfilling as sitting between afu_review and accepted
    if (order.status === 'afu_fulfilling') {
      if (stepKey === 'marketplace' || stepKey === 'quoted') return 'skipped';
      if (stepIdx <= 1) return 'done';
      if (stepKey === 'accepted') return 'upcoming';
    }

    if (order.status === 'cancelled') return stepIdx === 0 ? 'done' : 'cancelled';
    if (stepIdx < orderIdx) return 'done';
    if (stepIdx === orderIdx) return 'current';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-gray-600">Order not found.</p>
        <Link href="/farm/trade" className="text-[#5DB347] text-sm font-medium mt-2 inline-block">
          Back to Trading Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/farm/trade" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5DB347] mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Trading Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              order.type === 'buy' ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              {order.type === 'buy'
                ? <ShoppingCart className="w-5 h-5 text-blue-600" />
                : <Package className="w-5 h-5 text-green-600" />
              }
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1B2A4A]">{order.order_number}</h1>
              <p className="text-sm text-gray-500">{order.type === 'buy' ? 'Buy Request' : 'Sell Offer'} — {order.commodity}</p>
            </div>
          </div>
          <span className={`inline-flex self-start sm:self-auto px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status === 'afu_fulfilling' ? 'AFU Fulfilling' : order.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Order Progress</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {STATUS_STEPS.map((step, i) => {
            const status = getStepStatus(step.key);
            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    status === 'done' ? 'bg-[#5DB347] text-white'
                      : status === 'current' ? 'bg-[#5DB347]/20 text-[#5DB347] ring-2 ring-[#5DB347]'
                        : status === 'skipped' ? 'bg-gray-200 text-gray-400 line-through'
                          : 'bg-gray-100 text-gray-400'
                  }`}>
                    {status === 'done' ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 text-center leading-tight ${
                    status === 'current' ? 'text-[#5DB347] font-semibold' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`w-6 h-0.5 -mt-4 ${
                    status === 'done' ? 'bg-[#5DB347]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">Order Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem icon={<Package className="w-4 h-4 text-gray-400" />} label="Commodity" value={order.commodity} />
          <DetailItem icon={<Star className="w-4 h-4 text-gray-400" />} label="Quality" value={order.quality_grade} />
          <DetailItem icon={<ArrowLeftRight className="w-4 h-4 text-gray-400" />} label="Quantity" value={`${order.quantity.toLocaleString()} ${order.unit}`} />
          <DetailItem icon={<MapPin className="w-4 h-4 text-gray-400" />} label="Location" value={`${order.delivery_location}, ${order.country}`} />
          <DetailItem icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Deadline" value={new Date(order.deadline).toLocaleDateString()} />
          <DetailItem icon={<DollarSign className="w-4 h-4 text-gray-400" />} label="Target Price" value={`${order.currency} ${order.target_price?.toLocaleString()} / ${order.unit}`} />
          {order.afu_price && (
            <DetailItem icon={<DollarSign className="w-4 h-4 text-[#5DB347]" />} label="AFU Price" value={`${order.currency} ${order.afu_price.toLocaleString()} / ${order.unit}`} highlight />
          )}
          <DetailItem icon={<Clock className="w-4 h-4 text-gray-400" />} label="Created" value={new Date(order.created_at).toLocaleString()} />
        </div>
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Quotes section (show if marketplace or quoted) */}
      {(order.status === 'marketplace' || order.status === 'quoted' || quotes.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#1B2A4A] mb-4">
            Supplier Quotes ({quotes.length})
          </h3>
          {quotes.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Waiting for supplier quotes...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map(quote => (
                <div key={quote.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1B2A4A]">
                        {order.currency} {quote.price_per_unit.toLocaleString()} / {order.unit}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Qty: {quote.quantity_available.toLocaleString()} &bull;
                        Delivery: {new Date(quote.delivery_date).toLocaleDateString()} &bull;
                        Terms: {quote.delivery_terms}
                      </p>
                      {quote.notes && <p className="text-xs text-gray-400 mt-1">{quote.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {quote.status === 'pending' && order.status !== 'accepted' && (
                        <>
                          <button
                            onClick={() => handleQuoteAction(quote.id, 'accepted')}
                            disabled={actionLoading === quote.id}
                            className="flex items-center gap-1.5 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === quote.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Accept
                          </button>
                          <button
                            onClick={() => handleQuoteAction(quote.id, 'rejected')}
                            disabled={actionLoading === quote.id}
                            className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {quote.status !== 'pending' && (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          quote.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {quote.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail item component ──────────────────────────────────────────────────
function DetailItem({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-2.5 p-3 rounded-lg ${highlight ? 'bg-green-50' : 'bg-gray-50'}`}>
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-[#5DB347]' : 'text-[#1B2A4A]'}`}>{value}</p>
      </div>
    </div>
  );
}
