'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Megaphone,
  Coins,
  BadgePercent,
  Award,
  BarChart3,
  Star,
  Store,
  Building2,
  Settings,
  Bell,
  Menu,
  X,
  ChevronLeft,
  ArrowLeftRight,
  Home,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const supplierLinks = [
  { href: '/supplier', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/supplier/products', label: 'Products', icon: Package },
  { href: '/supplier/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/supplier/advertising', label: 'Advertising', icon: Megaphone },
  { href: '/supplier/commissions', label: 'Commissions', icon: Coins },
  { href: '/supplier/discounts', label: 'Discounts', icon: BadgePercent },
  { href: '/supplier/sponsorship', label: 'Sponsorship', icon: Award },
  { href: '/supplier/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/supplier/reviews', label: 'Reviews', icon: Star },
  { href: '/supplier/estimates', label: 'Estimates', icon: FileText },
  { href: '/supplier/trade', label: 'Trade Marketplace', icon: ArrowLeftRight },
  { href: '/supplier/marketplace', label: 'Marketplace', icon: Store },
  { href: '/supplier/profile', label: 'Profile', icon: Building2 },
  { href: '/supplier/settings', label: 'Settings', icon: Settings },
];

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut, user, isLoading: authLoading, isSupplier } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [denied, setDenied] = useState(false);

  // Public pages under /supplier that don't need auth
  const isPublicPage = pathname === '/supplier/apply';

  // ── Role guard: only supplier, admin, super_admin can access ──
  // DON'T redirect on errors — let middleware handle auth
  // ONLY deny on explicit role mismatch from a successful API response
  useEffect(() => {
    if (isPublicPage) {
      setAuthorized(true);
      setRoleChecked(true);
      return;
    }
    if (authLoading) return;

    if (!user) {
      router.replace('/login?redirect=/supplier');
      return;
    }

    let retried = false;

    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          setAuthorized(true);
          setRoleChecked(true);
          return;
        }
        const data = await res.json();
        const { role } = data;
        if (role === 'supplier' || role === 'admin' || role === 'super_admin') {
          setAuthorized(true);
        } else if (role) {
          setDenied(true);
        } else {
          setAuthorized(true);
        }
        setRoleChecked(true);
      } catch {
        if (!retried) {
          retried = true;
          setTimeout(checkRole, 2000);
          return;
        }
        setAuthorized(true);
        setRoleChecked(true);
      }
    };

    checkRole();
  }, [user, profile, authLoading, router, isPublicPage]);

  // Public pages render without the supplier layout chrome
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Show access denied state
  if (denied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm mb-6">
            You do not have permission to access the Supplier Portal. This area is restricted to supplier accounts.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-[#5DB347] hover:bg-[#449933] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Show loading while checking auth
  if (authLoading || !roleChecked || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-[#5DB347] mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Supplier';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/supplier' && pathname.startsWith(href));

  const getPageTitle = () => {
    if (pathname === '/supplier') return 'Supplier Portal';
    const link = supplierLinks.find((l) => pathname.startsWith(l.href) && l.href !== '/supplier');
    return link ? link.label : 'Supplier Portal';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
      <aside className="hidden lg:flex w-64 bg-[#729E82] flex-col text-white fixed top-0 left-0 bottom-0 z-30">
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-[#729E82] to-[#5DB347] p-5">
          <Link href="/supplier" className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div>
              <span className="font-bold text-lg leading-tight block">{displayName}</span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-bold">
            <span>★</span>
            <span>Platinum Sponsor</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {supplierLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            AFU Home
          </Link>
        </div>
      </aside>

      {/* ─── Main Column ─── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* ─── Mobile Top Header (hidden on desktop) ─── */}
        <header className="lg:hidden sticky top-0 z-40 bg-[#729E82] px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/15 active:bg-white/25 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold leading-tight truncate">{getPageTitle()}</h1>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/15 active:bg-white/25 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#729E82]">
              3
            </span>
          </button>
        </header>

        {/* ─── Desktop Top Bar (hidden on mobile) ─── */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 px-6 py-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">{getPageTitle()}</h2>
            <p className="text-xs text-gray-400">Supplier Portal — {displayName}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-navy transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#729E82] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <button onClick={handleSignOut} className="text-sm font-medium text-navy hover:text-red-600 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* ─── Mobile Drawer Overlay ─── */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={() => setDrawerOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 bg-[#729E82] shadow-2xl flex flex-col text-white"
              >
                {/* Drawer Header */}
                <div className="bg-gradient-to-br from-[#729E82] to-[#5DB347] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium opacity-80">Supplier Portal</span>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 active:bg-white/25"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-lg font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-xs opacity-80">Supplier Partner</p>
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-gold/20 text-gold px-3 py-1 rounded-full text-xs font-bold">
                    <span>★</span>
                    <span>Platinum Sponsor</span>
                  </div>
                </div>

                {/* Drawer Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                  {supplierLinks.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'text-white/70 active:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Drawer Footer */}
                <div className="p-3 border-t border-white/10 space-y-0.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 active:bg-white/10"
                  >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 active:bg-white/10"
                  >
                    <ExternalLink className="w-5 h-5" />
                    AFU Home
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Page Content ─── */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto" key={user?.id || 'anon'}><Breadcrumbs />{children}</div>
        </main>
      </div>
    </div>
  );
}
