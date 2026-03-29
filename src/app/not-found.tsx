import Link from 'next/link';
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

// S7.7: Metadata for 404 page
export const metadata: Metadata = {
  title: 'Page Not Found | African Farming Union',
  description: 'The page you are looking for could not be found.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0f1a30] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-[#5DB347]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
        </div>

        {/* 404 */}
        <div className="text-[120px] font-bold leading-none text-white/10 mb-2">404</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-white/50 mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5DB347] text-white rounded-full font-semibold hover:bg-[#449933] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#5DB347]/25"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white rounded-full font-medium hover:bg-white/10 transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Services
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
          {[
            { href: '/about', label: 'About Us', icon: HelpCircle },
            { href: '/memberships', label: 'Memberships', icon: HelpCircle },
            { href: '/contact', label: 'Contact', icon: HelpCircle },
            { href: '/login', label: 'Sign In', icon: ArrowLeft },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="mt-10 text-white/20 text-xs">
          African Farming Union &middot; africanfarmingunion.org
        </p>
      </div>
    </div>
  );
}
