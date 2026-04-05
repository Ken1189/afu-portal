'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bell,
  Leaf,
  Settings,
  ChevronLeft,
  Menu,
  X,
  TrendingUp,
  Rocket,
  Home,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

const navLinks = [
  { href: '/investor', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investor/opportunities', label: 'Invest Now', icon: Rocket },
  { href: '/investor/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/investor/documents', label: 'Documents', icon: FileText },
  { href: '/investor/updates', label: 'Updates', icon: Bell },
  { href: '/investor/impact', label: 'Impact', icon: Leaf },
  { href: '/investor/settings', label: 'Settings', icon: Settings },
];

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Investor';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Role guard
  // DON'T redirect on errors — let middleware handle auth
  // ONLY redirect on explicit role mismatch from a successful API response
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/investor-login');
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
        if (role === 'investor' || role === 'admin' || role === 'super_admin') {
          setAuthorized(true);
        } else if (role) {
          router.replace('/dashboard');
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
  }, [user, authLoading, router]);

  const isActive = (href: string) =>
    href === '/investor' ? pathname === '/investor' : pathname.startsWith(href);

  if (authLoading || !roleChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-[#5DB347] mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You do not have permission to access the Investor Portal.</p>
          <Link href="/dashboard" className="inline-block bg-[#5DB347] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#4ea03c] transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderNavLinks = (onLinkClick?: () => void) => navLinks.map((link) => {
    const Icon = link.icon;
    const active = isActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onLinkClick}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          active
            ? 'bg-[#5DB347] text-white shadow-sm'
            : 'text-gray-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="w-4.5 h-4.5" />
        {link.label}
      </Link>
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1B2A4A] flex-col text-white fixed inset-y-0 left-0 z-30">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#5DB347] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Investor Portal</h2>
              <p className="text-xs text-gray-400">AFU Capital</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 bg-[#5DB347] rounded-full flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {renderNavLinks()}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            AFU Home
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Admin Portal
          </Link>
          <button
            onClick={async () => {
              const { createBrowserClient } = await import('@supabase/ssr');
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              router.push('/investor-login');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#1B2A4A] text-white z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#5DB347]" />
                  <span className="font-bold">Investor Portal</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg bg-white/10">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {renderNavLinks(() => setMobileOpen(false))}
              </nav>
              <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Home className="w-4 h-4" />
                  AFU Home
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Admin Portal
                </Link>
                <button
                  onClick={async () => {
                    const { createBrowserClient } = await import('@supabase/ssr');
                    const supabase = createBrowserClient(
                      process.env.NEXT_PUBLIC_SUPABASE_URL!,
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    );
                    await supabase.auth.signOut();
                    router.push('/investor-login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-[#1B2A4A]" />
            </button>
            <Link href="/" className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Back to AFU Home">
              <Home className="w-5 h-5 text-[#1B2A4A]" />
            </Link>
            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Investor Portal</h2>
              <p className="text-xs text-gray-400">AFU Capital</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <ExternalLink className="w-3.5 h-3.5" />
              Admin
            </Link>
            <div className="w-8 h-8 bg-[#5DB347] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-[#1B2A4A]">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto" key={user?.id || 'anon'}><Breadcrumbs />{children}</div>
        </main>
      </div>
    </div>
  );
}
