'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Shield,
  Tractor,
  Store,
  Warehouse,
  Megaphone,
  BarChart3,
  LayoutDashboard,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

interface PortalCard {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  // Roles allowed to see this card. super_admin & admin always see all.
  allowedRoles: string[];
  accent: string;
}

const PORTALS: PortalCard[] = [
  {
    href: '/admin',
    title: 'Admin Portal',
    description: 'Platform administration, users, finance, content, and system settings.',
    icon: <Shield className="w-7 h-7" />,
    allowedRoles: ['admin', 'super_admin'],
    accent: 'from-rose-500 to-rose-600',
  },
  {
    href: '/farm',
    title: 'Farmer Portal',
    description: 'Manage your farm, crops, livestock, training, and farmer programs.',
    icon: <Tractor className="w-7 h-7" />,
    allowedRoles: ['farmer'],
    accent: 'from-green-500 to-green-600',
  },
  {
    href: '/supplier',
    title: 'Supplier Portal',
    description: 'Catalog, orders, inventory and supplier program management.',
    icon: <Store className="w-7 h-7" />,
    allowedRoles: ['supplier'],
    accent: 'from-amber-500 to-amber-600',
  },
  {
    href: '/warehouse',
    title: 'Warehouse Portal',
    description: 'Receiving, storage, dispatch and warehouse operations.',
    icon: <Warehouse className="w-7 h-7" />,
    allowedRoles: ['warehouse_operator'],
    accent: 'from-sky-500 to-sky-600',
  },
  {
    href: '/ambassador',
    title: 'Ambassador Portal',
    description: 'Promote AFU, track referrals and grow the community.',
    icon: <Megaphone className="w-7 h-7" />,
    allowedRoles: ['ambassador'],
    accent: 'from-purple-500 to-purple-600',
  },
  {
    href: '/investor',
    title: 'Investor Portal',
    description: 'Portfolio, fund updates, statements and investor relations.',
    icon: <BarChart3 className="w-7 h-7" />,
    allowedRoles: ['investor'],
    accent: 'from-indigo-500 to-indigo-600',
  },
  {
    href: '/dashboard',
    title: 'Member Dashboard',
    description: 'Your member home: profile, wallet, training and community.',
    icon: <LayoutDashboard className="w-7 h-7" />,
    allowedRoles: ['member'],
    accent: 'from-teal-500 to-teal-600',
  },
];

export default function PortalSelectPage() {
  const { user, profile, roles, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/portal-select');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-sm">Loading…</div>
      </div>
    );
  }

  const isAdmin = roles.includes('admin') || roles.includes('super_admin');

  const visiblePortals = PORTALS.filter((p) => {
    if (isAdmin) return true;
    return p.allowedRoles.some((r) => roles.includes(r));
  });

  // Always allow Member Dashboard fallback so a brand-new user has somewhere to go
  if (visiblePortals.length === 0) {
    visiblePortals.push(PORTALS.find((p) => p.href === '/dashboard')!);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1B2A4A] mb-3">
            Choose a portal
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            {profile?.full_name ? `Welcome, ${profile.full_name}. ` : ''}
            Select the workspace you want to enter. You can switch portals at any time
            from the sidebar.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePortals.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#5DB347] hover:shadow-lg transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.accent} text-white flex items-center justify-center mb-4 shadow-sm`}
              >
                {p.icon}
              </div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1.5 flex items-center justify-between">
                {p.title}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#5DB347] group-hover:translate-x-0.5 transition-all" />
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#5DB347] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Public website
          </Link>
        </div>
      </div>
    </div>
  );
}
