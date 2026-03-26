'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0f1a30] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Something Went Wrong</h1>
        <p className="text-white/50 mb-8">
          An unexpected error occurred. Our team has been notified and is working on a fix.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5DB347] text-white rounded-full font-semibold hover:bg-[#449933] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#5DB347]/25"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-white/20">Error ID: {error.digest}</p>
        )}
        <p className="mt-6 text-white/15 text-xs">
          African Farming Union &middot; africanfarmingunion.org
        </p>
      </div>
    </div>
  );
}
