'use client';

/**
 * Farmer (buyer) view of marketplace orders.
 *
 * Lists every order placed by the signed-in member, grouped by status.
 * For delivered orders that have not yet been reviewed, the page shows a
 * "Leave Review" button that opens the shared <ReviewModal /> and writes a
 * row into the `reviews` table targeting the order's supplier.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Star,
  Inbox,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import ReviewModal from '@/components/farm/ReviewModal';

interface FarmOrderRow {
  id: string;
  order_number: string | null;
  status: string;
  created_at: string;
  total_amount: number | null;
  reviewed: boolean | null;
  review_id: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  product_name: string | null;
  quantity: number | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string; icon: any }> = {
  pending: { label: 'New', cls: 'bg-blue-50 text-blue-600', icon: Clock },
  processing: { label: 'Processing', cls: 'bg-amber-50 text-amber-600', icon: Clock },
  shipped: { label: 'Shipped', cls: 'bg-purple-50 text-purple-600', icon: Truck },
  delivered: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500', icon: Clock },
};

export default function FarmOrdersPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<FarmOrderRow[]>([]);
  const [reviewTarget, setReviewTarget] = useState<FarmOrderRow | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      const supabase = createClient();
      try {
        // 1. Resolve member id for the signed-in user
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (!member) {
          setLoading(false);
          return;
        }

        // 2. Fetch this member's orders + the first item line + supplier
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            created_at,
            total_amount,
            reviewed,
            review_id,
            order_items (
              quantity,
              supplier_id,
              product:products ( name ),
              supplier:suppliers ( id, business_name )
            )
          `)
          .eq('member_id', member.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mapped: FarmOrderRow[] = (data || []).map((o: any) => {
          const item = o.order_items?.[0];
          return {
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            created_at: o.created_at,
            total_amount: o.total_amount,
            reviewed: o.reviewed,
            review_id: o.review_id,
            supplier_id: item?.supplier?.id ?? item?.supplier_id ?? null,
            supplier_name: item?.supplier?.business_name ?? null,
            product_name: item?.product?.name ?? null,
            quantity: item?.quantity ?? null,
          };
        });
        setOrders(mapped);
      } catch (err) {
        console.error('Failed to fetch farmer orders:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const completedCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8CB89C]/10 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-[#8CB89C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {completedCount} delivered · {orders.length} total
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading your orders…
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No orders yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            When you place orders from the marketplace they will appear here.
          </p>
          <Link
            href="/farm/marketplace"
            className="inline-flex items-center gap-2 bg-[#8CB89C] text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const cfg = STATUS_LABEL[o.status] || STATUS_LABEL.pending;
            const StatusIcon = cfg.icon;
            const canReview =
              o.status === 'delivered' && !o.reviewed && o.supplier_id;
            return (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col lg:flex-row lg:items-center gap-4"
              >
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[#1B2A4A] font-mono">
                      {o.order_number || o.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {o.created_at?.split('T')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-[#1B2A4A] truncate">
                      {o.product_name || 'Marketplace order'}
                    </span>
                    {o.quantity ? (
                      <span className="text-xs text-gray-400">x{o.quantity}</span>
                    ) : null}
                  </div>
                  {o.supplier_name && (
                    <p className="text-xs text-gray-500">
                      From <span className="font-medium">{o.supplier_name}</span>
                    </p>
                  )}
                </div>

                {o.total_amount != null && (
                  <div className="text-xl font-bold text-[#8CB89C] tabular-nums">
                    ${Number(o.total_amount).toFixed(2)}
                  </div>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.cls}`}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </span>

                {canReview ? (
                  <button
                    onClick={() => setReviewTarget(o)}
                    className="inline-flex items-center gap-1.5 bg-[#8CB89C] text-white hover:bg-[#7aa589] px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Leave Review
                  </button>
                ) : o.reviewed ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 px-3 py-1.5">
                    <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                    Reviewed
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {reviewTarget && reviewTarget.supplier_id && (
        <ReviewModal
          open={true}
          onClose={() => setReviewTarget(null)}
          supplierId={reviewTarget.supplier_id}
          supplierName={reviewTarget.supplier_name || undefined}
          orderId={reviewTarget.id}
          onSaved={() => {
            setOrders((prev) =>
              prev.map((row) =>
                row.id === reviewTarget.id ? { ...row, reviewed: true } : row,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
