'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function SupplierDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error in the server log so we can debug instead of
    // bouncing the user to the generic global error page.
    console.error('[admin/suppliers/[id]] route error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-bold text-navy mb-2">Something went wrong loading this supplier</h2>
      <p className="text-sm text-gray-500 mb-1 max-w-md">
        {error.message || 'An unexpected error occurred while rendering the supplier page.'}
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4">Error ID: {error.digest}</p>
      )}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-navy hover:bg-navy/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/admin/suppliers"
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>
      </div>
    </div>
  );
}
