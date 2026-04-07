'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2, Minus, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  productId: string;
  productName: string;
  price: number;
  inStock: boolean;
}

export default function ProductDetailClient({ productId, productName, price, inStock }: Props) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?redirect=/marketplace/${productId}`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/marketplace/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Checkout failed');
      } else if (json.url) {
        window.location.href = json.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      {/* Quantity selector */}
      <label className="block text-xs font-medium text-gray-600 mb-2">Quantity</label>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setQty(Math.max(1, qty - 1))}
          disabled={qty <= 1}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center px-2 py-1.5 border border-gray-200 rounded-xl text-sm"
        />
        <button
          onClick={() => setQty(qty + 1)}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-500 ml-auto">
          Total: <strong className="text-[#1B2A4A]">${(price * qty).toFixed(2)}</strong>
        </span>
      </div>

      <button
        onClick={handleBuy}
        disabled={!inStock || submitting}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#5DB347] text-white rounded-xl text-sm font-bold hover:bg-[#449933] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
        {!inStock ? 'Out of Stock' : submitting ? 'Processing…' : 'Buy Now'}
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
