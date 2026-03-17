'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  TrendingUp,
  Landmark,
  Banknote,
  ArrowDownToLine,
  Ship,
  Store,
  UserCheck,
  Award,
  CreditCard,
  ScrollText,
  Shield,
  Settings,
  UserCog,
  Bell,
  ChevronDown,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';

// ── Navigation structure with collapsible groups ──

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  links: NavLink[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    links: [
      { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Operations',
    defaultOpen: true,
    links: [
      { href: '/admin/members', label: 'Members', icon: <Users className="w-4 h-4" /> },
      { href: '/admin/applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
      { href: '/admin/training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
      { href: '/admin/exports', label: 'Exports', icon: <Ship className="w-4 h-4" /> },
      { href: '/admin/reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Financial',
    defaultOpen: true,
    links: [
      { href: '/admin/financial', label: 'Financial Mgmt', icon: <Landmark className="w-4 h-4" /> },
      { href: '/admin/financial/collections', label: 'Collections', icon: <Banknote className="w-4 h-4" /> },
      { href: '/admin/financial/disbursements', label: 'Disbursements', icon: <ArrowDownToLine className="w-4 h-4" /> },
      { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Marketplace',
    defaultOpen: false,
    links: [
      { href: '/admin/suppliers', label: 'Suppliers', icon: <Store className="w-4 h-4" /> },
      { href: '/admin/suppliers/sponsorships', label: 'Sponsorships', icon: <Award className="w-4 h-4" /> },
    ],
  },
  {
    label: 'System',
    defaultOpen: false,
    links: [
      { href: '/admin/audit', label: 'Audit Trail', icon: <ScrollText className="w-4 h-4" /> },
      { href: '/admin/compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
      { href: '/admin/users', label: 'Users', icon: <UserCog className="w-4 h-4" /> },
      { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
      { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

// ── Collapsible nav group component ──

function NavSection({
  group,
  pathname,
  collapsed,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const hasActiveLink = group.links.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + '/')
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
      >
        <span className={hasActiveLink && collapsed ? 'text-teal' : ''}>{group.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-2">
              {group.links.map((link) => {
                const isActive =
                  link.href === '/admin'
                    ? pathname === '/admin'
                    : pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-teal text-white shadow-sm shadow-teal/20'
                        : 'text-gray-300 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sidebar content (shared between desktop and mobile) ──

function SidebarContent({
  pathname,
  collapsedGroups,
  toggleGroup,
  onLinkClick,
}: {
  pathname: string;
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  onLinkClick?: () => void;
}) {
  return (
    <>
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onLinkClick}>
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <span className="font-bold text-sm">AFU Admin</span>
            <p className="text-[10px] text-gray-400 -mt-0.5">Control Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navGroups.map((group) => (
          <NavSection
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={collapsedGroups[group.label] ?? false}
            onToggle={() => toggleGroup(group.label)}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:bg-white/8 hover:text-white transition-colors"
          onClick={onLinkClick}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Site
        </Link>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN LAYOUT
// ═══════════════════════════════════════════════════════

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialize collapsed state — some groups start collapsed
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.label] = !g.defaultOpen;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-navy-dark flex-col text-white fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
        />
      </aside>

      {/* ── Mobile Drawer Overlay ───────────────────────────── */}
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
              className="fixed inset-y-0 left-0 w-[280px] bg-navy-dark text-white z-50 flex flex-col lg:hidden shadow-2xl"
            >
              <SidebarContent
                pathname={pathname}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                onLinkClick={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ───────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5 text-navy" />
            </button>
            <h2 className="text-lg font-semibold text-navy">Admin Panel</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">TC</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-navy leading-tight">Tendai C.</p>
                <p className="text-[10px] text-gray-400 leading-tight">Super Admin</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
