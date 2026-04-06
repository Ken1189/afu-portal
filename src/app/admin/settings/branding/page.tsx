'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BrandingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/content?tab=branding');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-2xl font-bold text-[#1B2A4A] mb-2">Branding has moved</h1>
      <p className="text-sm text-gray-500 mb-6">
        Branding settings are now managed from the Content section.
      </p>
      <Link
        href="/admin/content?tab=branding"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5DB347] text-white text-sm font-medium hover:bg-[#449933]"
      >
        Go to Content → Branding
      </Link>
    </div>
  );
}
