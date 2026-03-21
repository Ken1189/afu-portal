'use client';

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7f8fc] via-white to-[#eef0f7] px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
        {/* Neutral icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#1B2A4A]">Payment Cancelled</h1>

        <p className="text-gray-600 text-lg">
          No charge was made to your account. You can try again whenever you are ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/apply"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#5DB347] text-white font-semibold hover:bg-[#4a9a38] transition-colors"
          >
            Try Again
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-[#1B2A4A] text-[#1B2A4A] font-semibold hover:bg-[#1B2A4A] hover:text-white transition-colors"
          >
            Contact Support
          </Link>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          If you experienced an issue, please reach out to our support team and we will help you complete your payment.
        </p>
      </div>
    </div>
  );
}
