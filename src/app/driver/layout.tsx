'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  LayoutDashboard, Package, DollarSign, UserCircle, Settings,
  Menu, X, Home, ExternalLink, LogOut, Truck,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import NotificationBell from '@/components/NotificationBell';
import PortalSwitcherDropdown from '@/components/PortalSwitcherDropdown';

const navLinks = [
  { href: '/driver', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/driver/deliveries', label: 'My Deliveries', icon: Package },
  { href: '/driver/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/driver/profile', label: 'Profile', icon: UserCircle },
  { href: '/driver/settings', label: 'Settings', icon: Settings },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  const isPublicPage = pathname === '/driver/apply';

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Driver';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    if (isPublicPage) {
      setAuthorized(true);
      setRoleChecked(true);
      return;
    }
    if (authLoading) return;
    if (!user) {
      router.replace('/login?redirect=/driver');
      return;
    }

    const allowedRoles = ['driver', 'admin', 'super_admin'];
    let checkCompleted = false;
    const safetyTimer = setTimeout(() => {
      if (checkCompleted) return;
      setRoleChecked(true);
      router.replace('/login?redirect=/driver');
    }, 10000);

    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { checkCompleted = true; clearTimeout(safetyTimer); setRoleChecked(true); router.replace('/login?redirect=/driver'); return; }
        const data = await res.json();
        if (data.role && allowedRoles.includes(data.role)) {
          checkCompleted = true;
          clearTimeout(safetyTimer);
          setAuthorized(true);
          setRoleChecked(true);
        } else if (data.roles?.some((r: string) => allowedRoles.includes(r))) {
          checkCompleted = true;
          clearTimeout(safetyTimer);
          setAuthorized(true);
          setRoleChecked(true);
        } else {
          checkCompleted = true;
          clearTimeout(safetyTimer);
          setRoleChecked(true);
          router.replace('/farm');
        }
      } catch {
        checkCompleted = true;
        clearTimeout(safetyTimer);
        setRoleChecked(true);
        router.replace('/login?redirect=/driver');
      }
    };
    checkRole();
    return () => clearTimeout(safetyTimer);
  }, [user, authLoading, pathname, router, isPublicPage]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (isPublicPage) return <>{children}</>;

  if (authLoading || !roleChecked || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5DB347]" />
      </div>
    );
  }

  const isActive = (href: string) => href === '/driver' ? pathname === '/driver' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#1B2A4A] text-white fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/10">
          <Link href="/driver" className="flex items-center gap-2">
            <Truck className="w-7 h-7 text-[#5DB347]" />
            <div>
              <span className="font-bold text-base">Foober</span>
              <span className="block text-[10px] text-white/50">Driver Portal</span>
            </div>
          </Link>
        </div>

        {/* User */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#5DB347]/20 text-[#5DB347] font-bold text-xs flex items-center justify-center">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-[10px] text-white/50">{profile?.country || 'Foober Driver'}</p>
          </div>
        </div>

        {/* Portal Switcher */}
        <div className="px-3 pt-3">
          <PortalSwitcherDropdown variant="dark" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#5DB347]/20 text-[#5DB347]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-2 border-t border-white/10 pt-3">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
            <Home className="w-4 h-4" /> Public Site <ExternalLink className="w-3 h-3 ml-auto" />
          </Link>
          <button onClick={async () => { await signOut(); router.push('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1B2A4A] text-white">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#5DB347]" />
            <span className="font-bold text-sm">Foober</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-7 h-7 rounded-full bg-[#5DB347]/20 text-[#5DB347] text-xs font-bold flex items-center justify-center">{initials}</div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 z-50 w-[75vw] max-w-xs bg-[#1B2A4A] text-white flex flex-col lg:hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#5DB347]" />
                <span className="font-bold">Foober</span>
              </div>
              <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="px-3 py-3">
              <PortalSwitcherDropdown variant="dark" />
            </div>
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-[#5DB347]/20 text-[#5DB347]' : 'text-white/70 hover:text-white'}`}>
                    <link.icon className="w-5 h-5" /> {link.label}
                  </Link>
                );
              })}
            </nav>
            <button onClick={async () => { await signOut(); router.push('/login'); }} className="mx-3 mb-4 flex items-center gap-2 px-3 py-2 text-xs text-red-400">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumbs />
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
