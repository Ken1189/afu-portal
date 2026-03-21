'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SessionDetails {
  type?: string;
  tier?: string;
  amount?: number;
  currency?: string;
  customerEmail?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // Fade out confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Optionally fetch session details (non-blocking — page works without it)
  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/payments/session?id=${sessionId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDetails(d))
      .catch(() => {
        /* silent — details are optional */
      });
  }, [sessionId]);

  const tierLabel = details?.tier
    ? details.tier.charAt(0).toUpperCase() + details.tier.slice(1)
    : null;

  const typeLabel = details?.type === 'sponsorship' ? 'Sponsorship' : 'Membership';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f9ed] via-white to-[#e8f5e3] px-4">
      {/* Confetti burst — pure CSS */}
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute block w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#5DB347', '#1B2A4A', '#FFD700', '#FF6B6B', '#4ECDC4'][
                  i % 5
                ],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
        {/* Animated checkmark */}
        <div className="mx-auto w-20 h-20 rounded-full bg-[#5DB347] flex items-center justify-center animate-scaleIn">
          <svg
            className="w-10 h-10 text-white animate-drawCheck"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 30,
                animation: 'drawCheck 0.5s ease forwards 0.3s',
              }}
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#1B2A4A]">Payment Successful!</h1>

        <p className="text-gray-600 text-lg">
          Thank you for supporting African agriculture.
          {tierLabel && (
            <>
              {' '}
              Your <span className="font-semibold text-[#5DB347]">{tierLabel}</span>{' '}
              {typeLabel.toLowerCase()} is now active.
            </>
          )}
        </p>

        {details?.amount != null && (
          <p className="text-sm text-gray-500">
            Amount charged:{' '}
            <span className="font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: details.currency || 'usd',
              }).format(details.amount / 100)}
              /month
            </span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#5DB347] text-white font-semibold hover:bg-[#4a9a38] transition-colors"
          >
            Go to Dashboard
          </Link>

          {sessionId && (
            <a
              href={`https://dashboard.stripe.com/payments`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold hover:bg-[#1B2A4A] hover:text-white transition-colors"
            >
              View Receipt
            </a>
          )}
        </div>

        <p className="text-xs text-gray-400 pt-4">
          A confirmation email has been sent to{' '}
          {details?.customerEmail || 'your email address'}.
        </p>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 2s ease-in forwards;
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0);
          }
          60% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease forwards;
        }
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-drawCheck path {
          animation: drawCheck 0.5s ease forwards 0.3s;
        }
      `}</style>
    </div>
  );
}
