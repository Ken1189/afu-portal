'use client';

import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';

export interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Supplier UUID being reviewed (target_id) */
  supplierId: string;
  /** Optional supplier display name for the modal heading */
  supplierName?: string;
  /** Order this review relates to */
  orderId: string;
  /** Existing review (for edit mode) */
  initialReview?: {
    id: string;
    rating: number;
    comment: string | null;
    anonymous: boolean;
  };
  /** Called after a successful save with the new/updated review id */
  onSaved?: (reviewId: string) => void;
}

/**
 * ReviewModal — 1-5 star rating + comment + anonymous toggle.
 * Inserts (or updates) a row in the `reviews` table, then calls the
 * `update_supplier_rating` RPC so the supplier's average is recomputed.
 *
 * Also marks the originating order as `reviewed = true` and stores the
 * review_id back on the order row.
 */
export default function ReviewModal({
  open,
  onClose,
  supplierId,
  supplierName,
  orderId,
  initialReview,
  onSaved,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(initialReview?.comment ?? '');
  const [anonymous, setAnonymous] = useState(initialReview?.anonymous ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    setError(null);
    if (!user) {
      setError('You must be signed in to leave a review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please choose a star rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    try {
      let reviewId = initialReview?.id;

      if (initialReview?.id) {
        // ── Edit existing review ──
        const { error: updErr } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            anonymous,
          })
          .eq('id', initialReview.id);
        if (updErr) throw updErr;
      } else {
        // ── Insert new review ──
        const { data: inserted, error: insErr } = await supabase
          .from('reviews')
          .insert({
            reviewer_id: user.id,
            target_id: supplierId,
            target_type: 'supplier',
            rating,
            comment: comment.trim() || null,
            anonymous,
            order_id: orderId,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        if (insErr) throw insErr;
        reviewId = inserted?.id;

        // Mark the order as reviewed (best-effort, do not block the toast)
        if (reviewId) {
          await supabase
            .from('orders')
            .update({ reviewed: true, review_id: reviewId })
            .eq('id', orderId);
        }
      }

      // Recalculate supplier's aggregate rating
      try {
        await supabase.rpc('update_supplier_rating', {
          supplier_id_param: supplierId,
        });
      } catch {
        // RPC may not exist in every environment — fail soft.
      }

      setToast('Review submitted');
      if (reviewId) onSaved?.(reviewId);
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 900);
    } catch (e: any) {
      console.error('Review submit failed:', e);
      setError(e?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Leave a review"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-bold text-[#1B2A4A]">
          {initialReview ? 'Edit your review' : 'Leave a review'}
        </h2>
        {supplierName && (
          <p className="text-sm text-gray-500 mt-0.5">For {supplierName}</p>
        )}

        {/* Stars */}
        <div className="mt-5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Rating
          </label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = (hoverRating || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="mt-5">
          <label
            htmlFor="review-comment"
            className="text-xs font-semibold text-gray-600 uppercase tracking-wide"
          >
            Comment (optional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share details about your experience…"
            className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C]"
          />
        </div>

        {/* Anonymous toggle */}
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#8CB89C] focus:ring-[#8CB89C]"
          />
          Post this review anonymously
        </label>

        {error && (
          <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
            {error}
          </p>
        )}
        {toast && (
          <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2">
            {toast}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || rating < 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#8CB89C] hover:bg-[#7aa589] rounded-lg disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialReview ? 'Save changes' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
}
