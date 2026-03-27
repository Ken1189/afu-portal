'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  TrendingUp,
  Send,
  ChevronDown,
  Package,
  X,
} from 'lucide-react';

// -- Animation variants -------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// -- Star rating breakdown ----------------------------------------------------

const ratingBreakdown = [
  { stars: 5, count: 165, percentage: 53 },
  { stars: 4, count: 89, percentage: 29 },
  { stars: 3, count: 34, percentage: 11 },
  { stars: 2, count: 15, percentage: 5 },
  { stars: 1, count: 9, percentage: 3 },
];

// -- Mock reviews (12) --------------------------------------------------------

interface Review {
  id: string;
  buyerName: string;
  buyerInitials: string;
  buyerColor: string;
  rating: number;
  text: string;
  date: string;
  productName: string;
  productId: string;
  response: string | null;
}

const mockReviews: Review[] = [
  {
    id: 'REV-001',
    buyerName: 'Kgosi Mosweu',
    buyerInitials: 'KM',
    buyerColor: 'bg-blue-500',
    rating: 5,
    text: 'Excellent groundnut seeds! Germination rate was over 95% and the crop yield exceeded our expectations. Will definitely reorder for next season.',
    date: '2026-03-14',
    productName: 'Groundnut Seed (Nyanda)',
    productId: 'SPROD-005',
    response: 'Thank you, Kgosi! We are delighted to hear about your excellent germination rates. Looking forward to serving you again next season.',
  },
  {
    id: 'REV-002',
    buyerName: 'Mashonaland Growers Co-op',
    buyerInitials: 'MG',
    buyerColor: 'bg-green-500',
    rating: 4,
    text: 'Good quality sprayers, arrived well packaged. One unit had a minor nozzle alignment issue but customer service resolved it quickly.',
    date: '2026-03-12',
    productName: 'Knapsack Sprayer (16L Manual)',
    productId: 'SPROD-035',
    response: 'We appreciate your feedback and glad our support team could help with the nozzle issue. Quality checks have been tightened.',
  },
  {
    id: 'REV-003',
    buyerName: 'Tatenda Chikaura',
    buyerInitials: 'TC',
    buyerColor: 'bg-purple-500',
    rating: 5,
    text: 'The fungicide worked perfectly on my tomato crop. Controlled late blight within days. Very effective product at a fair price for smallholders.',
    date: '2026-03-10',
    productName: 'Metalaxyl + Mancozeb Fungicide',
    productId: 'SPROD-014',
    response: null,
  },
  {
    id: 'REV-004',
    buyerName: 'Central District Farmers Union',
    buyerInitials: 'CF',
    buyerColor: 'bg-amber-500',
    rating: 5,
    text: 'Soil pH kits are a game-changer for our members. Easy to use with clear instructions. Results helped us adjust fertilizer application and improve yields significantly.',
    date: '2026-03-08',
    productName: 'Soil pH Test Kit (50 tests)',
    productId: 'SPROD-036',
    response: 'Wonderful to hear how the kits are helping your cooperative members make better soil management decisions. Data-driven farming is the future!',
  },
  {
    id: 'REV-005',
    buyerName: 'Sipho Dlamini',
    buyerInitials: 'SD',
    buyerColor: 'bg-red-500',
    rating: 3,
    text: 'Delivery took longer than expected. The seeds themselves seem fine but I was hoping for faster turnaround given the planting season urgency.',
    date: '2026-03-06',
    productName: 'Groundnut Seed (Nyanda)',
    productId: 'SPROD-005',
    response: null,
  },
  {
    id: 'REV-006',
    buyerName: 'Rudo Chidyamakono',
    buyerInitials: 'RC',
    buyerColor: 'bg-teal-500',
    rating: 4,
    text: 'Pruning shears are sharp and comfortable to use. Good build quality for the price. The safety lock mechanism is a nice touch.',
    date: '2026-03-04',
    productName: 'Pruning Shears (Bypass, Professional)',
    productId: 'SPROD-038',
    response: null,
  },
  {
    id: 'REV-007',
    buyerName: 'Gaborone Agri Enterprise',
    buyerInitials: 'GA',
    buyerColor: 'bg-indigo-500',
    rating: 5,
    text: 'Bulk order handled professionally. All 100kg of fungicide arrived in perfect condition. The AFU member discount makes this very competitive pricing.',
    date: '2026-03-02',
    productName: 'Metalaxyl + Mancozeb Fungicide',
    productId: 'SPROD-014',
    response: 'Thank you for your continued trust in our products. We value our enterprise-level partnerships and always strive for seamless bulk deliveries.',
  },
  {
    id: 'REV-008',
    buyerName: 'Mosetse Farms',
    buyerInitials: 'MF',
    buyerColor: 'bg-orange-500',
    rating: 4,
    text: 'Reliable supplier. The pH test kits are accurate when compared to our lab results. Good option for quick field testing during soil sampling.',
    date: '2026-02-28',
    productName: 'Soil pH Test Kit (50 tests)',
    productId: 'SPROD-036',
    response: null,
  },
  {
    id: 'REV-009',
    buyerName: 'Chimanimani Horticulture',
    buyerInitials: 'CH',
    buyerColor: 'bg-pink-500',
    rating: 2,
    text: 'Some of the sprayers had leaking seals. Had to fix them ourselves before we could use them. Expected better quality control for this price.',
    date: '2026-02-25',
    productName: 'Knapsack Sprayer (16L Manual)',
    productId: 'SPROD-035',
    response: null,
  },
  {
    id: 'REV-010',
    buyerName: 'Nata Farmers Cooperative',
    buyerInitials: 'NF',
    buyerColor: 'bg-cyan-500',
    rating: 5,
    text: 'Our cooperative ordered 80 bags and every single one was of top quality. The Nyanda variety performs exceptionally well in our sandy soils.',
    date: '2026-02-22',
    productName: 'Groundnut Seed (Nyanda)',
    productId: 'SPROD-005',
    response: null,
  },
  {
    id: 'REV-011',
    buyerName: 'Tongaat Farms Ltd',
    buyerInitials: 'TF',
    buyerColor: 'bg-violet-500',
    rating: 4,
    text: 'Good commercial-grade sprayers. We equip all our field teams with these. Durable enough for daily use across large estates.',
    date: '2026-02-18',
    productName: 'Knapsack Sprayer (16L Manual)',
    productId: 'SPROD-035',
    response: null,
  },
  {
    id: 'REV-012',
    buyerName: 'Palapye Vegetable Growers',
    buyerInitials: 'PV',
    buyerColor: 'bg-emerald-500',
    rating: 1,
    text: 'Product arrived damaged. Packaging was insufficient for the shipping method. Still waiting on the replacement after 2 weeks.',
    date: '2026-02-15',
    productName: 'Metalaxyl + Mancozeb Fungicide',
    productId: 'SPROD-014',
    response: null,
  },
];

// -- Sentiment data -----------------------------------------------------------

const sentimentData = [
  { label: 'Positive', percentage: 78, color: 'bg-[#8CB89C]' },
  { label: 'Neutral', percentage: 15, color: 'bg-[#D4A843]' },
  { label: 'Negative', percentage: 7, color: 'bg-red-400' },
];

// =============================================================================
//  MAIN COMPONENT
// =============================================================================

export default function SupplierReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [filterStars, setFilterStars] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(312);
  const [averageRating, setAverageRating] = useState(4.8);

  // ── Fetch reviews from Supabase ─────────────────────────────────────────
  useEffect(() => {
    async function fetchReviews() {
      try {
        const supabase = createClient();
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id, rating, review_count')
          .eq('email', user?.email ?? '')
          .single();

        if (supplier) {
          if (supplier.review_count) setTotalReviews(supplier.review_count);
          if (supplier.rating) setAverageRating(supplier.rating);

          // Try to fetch reviews if the table exists
          const { data: dbReviews } = await supabase
            .from('reviews')
            .select('*, product:products(name)')
            .eq('supplier_id', supplier.id)
            .order('created_at', { ascending: false });

          if (dbReviews && dbReviews.length > 0) {
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-cyan-500'];
            const mapped: Review[] = dbReviews.map((r: any, i: number) => ({
              id: r.id,
              buyerName: r.reviewer_name || 'Anonymous',
              buyerInitials: (r.reviewer_name || 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
              buyerColor: colors[i % colors.length],
              rating: r.rating || 5,
              text: r.comment || r.text || '',
              date: r.created_at?.split('T')[0] || '',
              productName: (r.product as any)?.name || 'Product',
              productId: r.product_id || '',
              response: r.response || null,
            }));
            setReviews(mapped);
          }
        }
      } catch (err) {
        // Keep fallback demo data — table may not exist yet
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchReviews();
    else setLoading(false);
  }, [user]);

  const filteredReviews = filterStars
    ? reviews.filter((r) => r.rating === filterStars)
    : reviews;

  const displayedReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 8);

  const handleSubmitResponse = (reviewId: string) => {
    if (!responseText.trim()) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, response: responseText.trim() } : r))
    );
    setRespondingTo(null);
    setResponseText('');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* =====================================================================
          1. PAGE HEADER
      ====================================================================== */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8CB89C]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#8CB89C]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Reviews &amp; Ratings</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              See what buyers are saying about your products
            </p>
          </div>
        </div>

        {/* Overall rating badge */}
        <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-5 py-3">
          <div className="text-center">
            <p className="text-4xl font-bold text-[#1B2A4A] tabular-nums">{averageRating}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? 'text-[#D4A843] fill-[#D4A843]'
                      : i < averageRating
                        ? 'text-[#D4A843] fill-[#D4A843]/50'
                        : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">{totalReviews} reviews</p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================================
          2. STATS ROW
      ====================================================================== */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-5 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-[#8CB89C]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#8CB89C]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1B2A4A] tabular-nums">{totalReviews}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Reviews</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-5 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#D4A843]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1B2A4A] tabular-nums">{averageRating}</p>
          <p className="text-xs text-gray-500 mt-0.5">Average Rating</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-5 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#1B2A4A] tabular-nums">82%</p>
          <p className="text-xs text-gray-500 mt-0.5">5-star &amp; 4-star</p>
        </motion.div>
      </motion.div>

      {/* =====================================================================
          3. RATING BREAKDOWN BAR CHART
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4">Rating Breakdown</h3>
        <div className="space-y-2.5">
          {ratingBreakdown.map((item) => (
            <button
              key={item.stars}
              onClick={() =>
                setFilterStars(filterStars === item.stars ? null : item.stars)
              }
              className={`w-full flex items-center gap-3 group rounded-lg p-1.5 transition-colors ${
                filterStars === item.stars ? 'bg-[#8CB89C]/5' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                <span className="text-sm font-medium text-[#1B2A4A] w-3 tabular-nums">
                  {item.stars}
                </span>
                <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                  className={`h-3 rounded-full ${
                    filterStars === item.stars ? 'bg-[#8CB89C]' : 'bg-[#D4A843]'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-500 w-12 text-right tabular-nums">
                {item.count}
              </span>
              <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
                {item.percentage}%
              </span>
            </button>
          ))}
        </div>
        {filterStars && (
          <button
            onClick={() => setFilterStars(null)}
            className="mt-3 text-xs text-[#8CB89C] hover:text-[#729E82] font-medium transition-colors"
          >
            Clear filter
          </button>
        )}
      </motion.div>

      {/* =====================================================================
          4. SENTIMENT INDICATOR
      ====================================================================== */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <ThumbsUp className="w-4 h-4 text-[#8CB89C]" />
          Sentiment Analysis
        </h3>
        <div className="space-y-3">
          {sentimentData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {item.label === 'Positive' && (
                    <ThumbsUp className="w-3.5 h-3.5 text-[#8CB89C]" />
                  )}
                  {item.label === 'Neutral' && (
                    <Minus className="w-3.5 h-3.5 text-[#D4A843]" />
                  )}
                  {item.label === 'Negative' && (
                    <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-[#1B2A4A] tabular-nums">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  className={`h-2.5 rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* =====================================================================
          5. REVIEW LIST
      ====================================================================== */}
      <motion.div variants={containerVariants} className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#1B2A4A] text-sm">
            {filterStars
              ? `${filterStars}-Star Reviews (${filteredReviews.length})`
              : `All Reviews (${reviews.length})`}
          </h3>
        </div>

        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              variants={cardVariants}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ delay: index * 0.04 }}
              layout
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors"
            >
              {/* Review header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${review.buyerColor} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {review.buyerInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1B2A4A]">{review.buyerName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'text-[#D4A843] fill-[#D4A843]'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-gray-400">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review text */}
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.text}</p>

              {/* Product link */}
              <div className="flex items-center gap-1.5 mb-3">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-[#8CB89C] font-medium hover:text-[#729E82] cursor-pointer transition-colors">
                  {review.productName}
                </span>
              </div>

              {/* Existing response */}
              {review.response && (
                <div className="bg-[#8CB89C]/5 rounded-lg p-4 border-l-3 border-[#8CB89C] mt-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-[#8CB89C] flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">ZA</span>
                    </div>
                    <span className="text-xs font-semibold text-[#1B2A4A]">
                      Zambezi Agri-Supplies
                    </span>
                    <span className="text-[10px] text-gray-400">replied</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{review.response}</p>
                </div>
              )}

              {/* Respond button / form */}
              {!review.response && respondingTo !== review.id && (
                <button
                  onClick={() => setRespondingTo(review.id)}
                  className="inline-flex items-center gap-1.5 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors mt-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Respond
                </button>
              )}

              {/* Response input form */}
              {respondingTo === review.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-colors bg-gray-50 resize-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSubmitResponse(review.id)}
                      disabled={!responseText.trim()}
                      className="inline-flex items-center gap-1.5 bg-[#8CB89C] hover:bg-[#729E82] disabled:bg-gray-200 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Submit Response
                    </button>
                    <button
                      onClick={() => {
                        setRespondingTo(null);
                        setResponseText('');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Show more button */}
        {!showAllReviews && filteredReviews.length > 8 && (
          <motion.div variants={fadeUp} className="text-center pt-2">
            <button
              onClick={() => setShowAllReviews(true)}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1B2A4A] border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Show More Reviews
              <ChevronDown className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {showAllReviews && filteredReviews.length > 8 && (
          <motion.div variants={fadeUp} className="text-center pt-2">
            <button
              onClick={() => setShowAllReviews(false)}
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#1B2A4A] border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              Show Less
              <ChevronDown className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredReviews.length === 0 && (
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-xl border border-gray-100 p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No reviews found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
              {filterStars
                ? `No ${filterStars}-star reviews yet.`
                : 'You have not received any reviews yet.'}
            </p>
            {filterStars && (
              <button
                onClick={() => setFilterStars(null)}
                className="inline-flex items-center gap-2 bg-[#8CB89C]/10 text-[#8CB89C] hover:bg-[#8CB89C]/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Clear Filter
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
