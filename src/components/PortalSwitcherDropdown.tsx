'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Shield,
  Tractor,
  Store,
  Megaphone,
  TrendingUp,
  Warehouse as WarehouseIcon,
  Globe,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { usePathname } from 'next/navigation';

type Portal = {
  key: string;
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  show: (roles: string[], caps: string[]) => boolean;
};

const isAdminRole = (r: string[]) =>
  r.includes('admin') || r.includes('super_admin');

const ALL_PORTALS: Portal[] = [
  {
    key: 'admin',
    href: '/admin',
    label: 'Admin Portal',
    Icon: Shield,
    show: (r) => isAdminRole(r),
  },
  {
    key: 'farm',
    href: '/farm',
    label: 'Farmer Portal',
    Icon: Tractor,
    show: () => true, // farm is the default member portal — always visible
  },
  {
    key: 'supplier',
    href: '/supplier',
    label: 'Supplier Portal',
    Icon: Store,
    show: (r, c) =>
      r.includes('supplier') || c.includes('supplier') || isAdminRole(r),
  },
  {
    key: 'ambassador',
    href: '/ambassador',
    label: 'Ambassador Portal',
    Icon: Megaphone,
    show: (r, c) =>
      r.includes('ambassador') || c.includes('ambassador') || isAdminRole(r),
  },
  {
    key: 'investor',
    href: '/investor',
    label: 'Investor Portal',
    Icon: TrendingUp,
    show: (r, c) =>
      r.includes('investor') || c.includes('investor') || isAdminRole(r),
  },
  {
    key: 'warehouse',
    href: '/warehouse',
    label: 'Warehouse Portal',
    Icon: WarehouseIcon,
    show: (r, c) =>
      r.includes('warehouse_operator') ||
      c.includes('warehouse_op') ||
      isAdminRole(r),
  },
  {
    key: 'public',
    href: '/',
    label: 'Public Site',
    Icon: Globe,
    show: () => true,
  },
];

interface Props {
  /** Visual variant: 'dark' for sidebars on dark bg, 'light' for white headers */
  variant?: 'dark' | 'light';
  /** Where the dropdown menu opens: 'down' (default) or 'up' */
  position?: 'down' | 'up';
  /** Optional className override for the trigger button */
  className?: string;
}

export default function PortalSwitcherDropdown({
  variant = 'dark',
  position = 'down',
  className = '',
}: Props) {
  const { roles, capabilities, user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // ── Compute available portals ────────────────────────────────────────
  // Fallback rule: if the user is admin/super_admin OR has no roles at all,
  // show ALL portals. Otherwise filter by show().
  const r = roles || [];
  const c = capabilities || [];
  const isAdmin = isAdminRole(r);
  const hasNoRoles = r.length === 0;

  const available =
    isAdmin || hasNoRoles
      ? ALL_PORTALS
      : ALL_PORTALS.filter((p) => p.show(r, c));

  // Determine the current portal from pathname
  const currentPortal =
    available.find((p) => p.key !== 'public' && pathname?.startsWith(p.href)) ||
    available.find((p) => p.key === 'public') ||
    available[0];

  // ── Debug log so Devon can verify in DevTools ────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
       
      console.log('[PortalSwitcher]', {
        userId: user?.id ?? null,
        roles: r,
        capabilities: c,
        isAdmin,
        hasNoRoles,
        availableKeys: available.map((p) => p.key),
        currentPortalKey: currentPortal?.key,
        pathname,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles, capabilities, pathname, user]);

  const triggerColors =
    variant === 'dark'
      ? 'bg-white/10 hover:bg-white/20 text-white border-[#5DB347]/60 hover:border-[#5DB347] ring-1 ring-[#5DB347]/30'
      : 'bg-white hover:bg-gray-50 text-[#1B2A4A] border-[#5DB347]/60 hover:border-[#5DB347] ring-1 ring-[#5DB347]/30';

  // Label shows the CURRENT portal name (e.g. "Admin Portal") so users
  // see where they are and click to switch.
  const triggerLabel = currentPortal?.label ?? 'Switch Portal';

  const menuPositionClasses =
    position === 'up'
      ? 'bottom-full mb-2'
      : 'top-full mt-2';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${triggerColors}`}
        data-portal-switcher-trigger
      >
        <span className="flex items-center gap-2 min-w-0">
          {currentPortal && (
            <currentPortal.Icon className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{triggerLabel}</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute ${menuPositionClasses} left-0 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-[100]`}
        >
          <div className="py-1 max-h-[60vh] overflow-y-auto">
            {available.map((p) => {
              const isCurrent = currentPortal?.key === p.key;
              return (
                <Link
                  key={p.key}
                  href={p.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isCurrent
                      ? 'bg-[#5DB347]/10 text-[#449933] font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p.Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{p.label}</span>
                  {isCurrent && (
                    <Check className="w-4 h-4 text-[#5DB347]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
