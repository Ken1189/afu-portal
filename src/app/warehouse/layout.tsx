'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  FileText,
  Search,
  Warehouse,
  Truck,
  Menu,
  X,
  Home,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

const navLinks = [
  { href: '/warehouse', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/warehouse/receive', label: 'Receive', icon: Package },
  { href: '/warehouse/receipts', label: 'Receipts', icon: FileText },
  { href: '/warehouse/inspections', label: 'Inspections', icon: ClipboardCheck },
  { href: '/warehouse/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/warehouse/dispatch', label: 'Dispatch', icon: Truck },
];

export default function WarehouseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Operator';
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
      router.replace('/login?redirect=/warehouse');
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
        if (role === 'warehouse_operator' || role === 'admin' || role === 'super_admin') {
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
    href === '/warehouse' ? pathname === '/warehouse' : pathname.startsWith(href);

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
          <p className="text-gray-500 mb-6">You do not have permission to access the Warehouse Portal.</p>
          <Link href="/dashboard" className="inline-block bg-[#5DB347] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#4ea03c] transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderNavLinks = (onLinkClick?: () => void) =>
    navLinks.map((link) => {
      const Icon = link.icon;
      const active = isActive(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
            active
              ? 'bg-[#5DB347] text-white shadow-sm'
              : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="text-base">{link.label}</span>
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
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">AFU Warehouse</h2>
              <p className="text-xs text-gray-400">Receiving Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
            <div className="w-9 h-9 bg-[#5DB347] rounded-full flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[11px] text-gray-400 truncate">Warehouse Operator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {renderNavLinks()}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
          >
            <ExternalLink className="w-4 h-4" />
            AFU Home
          </Link>
          <button
            onClick={async () => {
              const { createBrowserClient } = await import('@supabase/ssr');
              const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
              );
              await supabase.auth.signOut();
              router.push('/login');
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors min-h-[44px]"
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
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-[85vw] max-w-[300px] bg-[#1B2A4A] text-white z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#5DB347]" />
                  <span className="font-bold">AFU Warehouse</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {renderNavLinks(() => setMobileOpen(false))}
              </nav>
              <div className="p-3 border-t border-white/10 space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
                >
                  <Home className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors min-h-[44px]"
                >
                  <ExternalLink className="w-4 h-4" />
                  AFU Home
                </Link>
                <button
                  onClick={async () => {
                    const { createBrowserClient } = await import('@supabase/ssr');
                    const supabase = createBrowserClient(
                      process.env.NEXT_PUBLIC_SUPABASE_URL!,
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                    );
                    await supabase.auth.signOut();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors min-h-[44px]"
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
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6 text-[#1B2A4A]" />
            </button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#5DB347] lg:hidden" />
              <div>
                <h2 className="text-lg font-semibold text-[#1B2A4A]">Warehouse Portal</h2>
                <p className="text-xs text-gray-400">Receiving &amp; Inventory</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B2A4A] transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
              <ExternalLink className="w-3.5 h-3.5" />
              Admin
            </Link>
            <div className="w-9 h-9 bg-[#5DB347] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-[#1B2A4A]">{displayName}</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
