'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  type: 'membership' | 'sponsorship';
  tier: string;
  farmerId?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CheckoutButton({
  type,
  tier,
  farmerId,
  children,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          tier,
          farmerId,
          successUrl: `${window.location.origin}/payments/success`,
          cancelUrl: `${window.location.origin}/payments/cancel`,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Processing...' : children}
    </button>
  );
}
