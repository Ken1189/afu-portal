'use client';

/**
 * Farmer's submitted reviews dashboard.
 *
 * Lists every review the signed-in user has written, with edit and delete
 * actions. Editing reuses the shared <ReviewModal />.
 */

import { useEffect, useState } from 'react';
import { Star, Pencil, Trash2, Loader2, Inbox } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import ReviewModal from '@/components/farm/ReviewModal';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  anonymous: boolean | null;
  created_at: string;
  target_id: string;
  target_type: string;
  order_id: string | null;
  supplier_name?: string | null;
}

export default function FarmReviewsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          anonymous,
          created_at,
          target_id,
          target_type,
          order_id
        `)
        .eq('reviewer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Best-effort: hydrate supplier names in a single follow-up query
      const supplierIds = Array.from(
        new Set(
          (data || [])
            .filter((r: any) => r.target_type === 'supplier')
            .map((r: any) => r.target_id),
        ),
      );

      let nameMap: Record<string, string> = {};
      if (supplierIds.length > 0) {
        const { data: sups } = await supabase
          .from('suppliers')
          .select('id, business_name')
          .in('id', supplierIds);
        nameMap = Object.fromEntries(
          (sups || []).map((s: any) => [s.id, s.business_name]),
        );
      }

      setReviews(
        (data || []).map((r: any) => ({
          ...r,
          supplier_name: nameMap[r.target_id] || null,
        })),
      );
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (review: ReviewRow) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeleting(review.id);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review.id);
      if (error) throw error;

      // Unflag the order so the farmer can leave a fresh review
      if (review.order_id) {
        await supabase
          .from('orders')
          .update({ reviewed: false, review_id: null })
          .eq('id', review.order_id);
      }

      // Recompute supplier rating
      try {
        await supabase.rpc('update_supplier_rating', {
          supplier_id_param: review.target_id,
        });
      } catch {
        /* RPC optional */
      }

      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete review.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#8CB89C]/10 flex items-center justify-center">
          <Star className="w-5 h-5 text-[#8CB89C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reviews.length} review{reviews.length === 1 ? '' : 's'} submitted
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading reviews…
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
            You have not written any reviews yet
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            After a marketplace order is delivered you can leave a review from
            the My Orders page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-4 h-4 ${
                          r.rating >= n
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {r.created_at?.split('T')[0]}
                    </span>
                    {r.anonymous && (
                      <span className="text-[10px] uppercase font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#1B2A4A]">
                    {r.supplier_name || 'Supplier'}
                  </p>
                  {r.comment && (
                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditing(r)}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                    aria-label="Edit review"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={deleting === r.id}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                    aria-label="Delete review"
                  >
                    {deleting === r.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ReviewModal
          open={true}
          onClose={() => setEditing(null)}
          supplierId={editing.target_id}
          supplierName={editing.supplier_name || undefined}
          orderId={editing.order_id || ''}
          initialReview={{
            id: editing.id,
            rating: editing.rating,
            comment: editing.comment,
            anonymous: !!editing.anonymous,
          }}
          onSaved={() => {
            setEditing(null);
            fetchReviews();
          }}
        />
      )}
    </div>
  );
}
