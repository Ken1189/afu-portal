'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { usePermissions, SIDEBAR_PERMISSION_MAP } from '@/lib/permissions';
import {
  LayoutDashboard,
  Users,
  FileText,
  GraduationCap,
  // BarChart3,
  TrendingUp,
  Landmark,
  // Banknote,
  // ArrowDownToLine,
  Ship,
  Store,
  UserCheck,
  // Award,
  CreditCard,
  ScrollText,
  Shield,
  Settings,
  UserCog,
  Bell,
  // Coins,
  Globe,
  // Server,
  ScanEye,
  HandCoins,
  Gauge,
  ChevronDown,
  ArrowLeft,
  Menu,
  // X,
  Sprout,
  Beef,
  Wrench,
  Heart,
  MapPin,
  FileEdit,
  MessageSquare,
  Handshake,
  Gift,
  HelpCircle,
  Scale,
  Upload,
  Database,
  Briefcase,
  Megaphone,
  FlaskConical,
  ExternalLink,
  Rocket,
  Tractor,
  BarChart3,
  Scale as ScaleIcon,
  Stethoscope,
  ArrowLeftRight,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

// ── Navigation structure with collapsible groups ──

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
}

interface NavGroup {
  label: string;
  links: NavLink[];
  defaultOpen?: boolean;
  superAdminOnly?: boolean;
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
    label: 'Members & Applications',
    defaultOpen: true,
    links: [
      { href: '/admin/members', label: 'Members', icon: <Users className="w-4 h-4" /> },
      { href: '/admin/applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
      { href: '/admin/farmers', label: 'Bulk Import', icon: <Upload className="w-4 h-4" /> },
      { href: '/admin/kyc', label: 'KYC / References', icon: <ScanEye className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Finance & Loans',
    defaultOpen: true,
    links: [
      { href: '/admin/loans', label: 'Loan Management', icon: <HandCoins className="w-4 h-4" /> },
      { href: '/admin/payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
      { href: '/admin/financial', label: 'Financial Overview', icon: <Landmark className="w-4 h-4" /> },
      { href: '/admin/credit-scores', label: 'Credit Scoring', icon: <Gauge className="w-4 h-4" /> },
      { href: '/admin/trade-finance', label: 'Trade Finance', icon: <Ship className="w-4 h-4" /> },
      { href: '/admin/banking', label: 'Banking Operations', icon: <Landmark className="w-4 h-4" /> },
      { href: '/admin/wallet', label: 'Wallet Management', icon: <Wallet className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Investor Management',
    defaultOpen: true,
    superAdminOnly: true,
    links: [
      { href: '/admin/investor-relations', label: 'Investor Pipeline', icon: <Landmark className="w-4 h-4" /> },
      { href: '/admin/investors', label: 'All Investors', icon: <Users className="w-4 h-4" /> },
      { href: '/admin/investments', label: 'Total Investments', icon: <BarChart3 className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Trading',
    defaultOpen: false,
    links: [
      { href: '/admin/trading', label: 'Trade Desk', icon: <ArrowLeftRight className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Farm Operations',
    defaultOpen: false,
    links: [
      { href: '/admin/map', label: 'Farm Map', icon: <MapPin className="w-4 h-4" /> },
      { href: '/admin/farm-overview', label: 'Farm Overview', icon: <Gauge className="w-4 h-4" /> },
      { href: '/admin/equipment', label: 'Equipment', icon: <Wrench className="w-4 h-4" /> },
      { href: '/admin/insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" /> },
      { href: '/admin/crops', label: 'Crops', icon: <Sprout className="w-4 h-4" /> },
      { href: '/admin/livestock', label: 'Livestock', icon: <Beef className="w-4 h-4" /> },
      { href: '/admin/legal-services', label: 'Legal Services', icon: <ScaleIcon className="w-4 h-4" /> },
      { href: '/admin/veterinary', label: 'Veterinary', icon: <Stethoscope className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Programs & Training',
    defaultOpen: false,
    links: [
      { href: '/admin/training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
      { href: '/admin/programs', label: 'Programs', icon: <Sprout className="w-4 h-4" /> },
      { href: '/admin/sponsor', label: 'Sponsor a Farmer', icon: <Heart className="w-4 h-4" /> },
      { href: '/admin/sponsor-tiers', label: 'Sponsor Tiers', icon: <Gift className="w-4 h-4" /> },
      { href: '/admin/jobs', label: 'Jobs Board', icon: <Briefcase className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Marketplace & Partners',
    defaultOpen: false,
    links: [
      { href: '/admin/exchange', label: 'Exchange', icon: <HandCoins className="w-4 h-4" /> },
      { href: '/admin/suppliers', label: 'Suppliers', icon: <Store className="w-4 h-4" /> },
      { href: '/admin/partnerships', label: 'Partners', icon: <Handshake className="w-4 h-4" /> },
      { href: '/admin/advertising', label: 'Advertising', icon: <Megaphone className="w-4 h-4" /> },
      { href: '/admin/testimonials', label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Content & CMS',
    defaultOpen: false,
    links: [
      { href: '/admin/content', label: 'Site Content', icon: <FileEdit className="w-4 h-4" /> },
      { href: '/admin/research', label: 'Research Centres', icon: <FlaskConical className="w-4 h-4" /> },
      { href: '/admin/ambassadors', label: 'Ambassadors', icon: <Megaphone className="w-4 h-4" /> },
      { href: '/admin/faq', label: 'FAQ Manager', icon: <HelpCircle className="w-4 h-4" /> },
      { href: '/admin/legal', label: 'Legal Pages', icon: <Scale className="w-4 h-4" /> },
      { href: '/admin/countries', label: 'Countries', icon: <Globe className="w-4 h-4" /> },
    ],
  },
  {
    label: 'System & Security',
    defaultOpen: false,
    links: [
      { href: '/admin/users', label: 'Users & Roles', icon: <UserCog className="w-4 h-4" /> },
      { href: '/admin/users/permissions', label: 'Permissions', icon: <ShieldCheck className="w-4 h-4" />, superAdminOnly: true },
      { href: '/admin/audit', label: 'Audit Trail', icon: <ScrollText className="w-4 h-4" /> },
      { href: '/admin/compliance', label: 'Compliance', icon: <Shield className="w-4 h-4" /> },
      { href: '/admin/notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
      { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      { href: '/admin/run-migration', label: 'Run Migrations', icon: <Database className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Switch Portal',
    defaultOpen: false,
    superAdminOnly: true,
    links: [
      { href: '/investor', label: 'Investor Portal', icon: <BarChart3 className="w-4 h-4" /> },
      { href: '/investor/opportunities', label: 'Investment Opps', icon: <Rocket className="w-4 h-4" /> },
      { href: '/farm', label: 'Farmer Portal', icon: <Tractor className="w-4 h-4" /> },
      { href: '/dashboard', label: 'Member Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { href: '/', label: 'Public Website', icon: <ExternalLink className="w-4 h-4" /> },
    ],
  },
];

// ── Collapsible nav group component ──

function NavSection({
  group,
  pathname,
  collapsed,
  onToggle,
  isSuperAdmin = false,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  isSuperAdmin?: boolean;
}) {
  // Filter out superAdminOnly links for non-super admins
  const filteredLinks = group.links.filter((l) => !l.superAdminOnly || isSuperAdmin);
  const hasActiveLink = filteredLinks.some(
    (l) => pathname === l.href || pathname.startsWith(l.href + '/')
  );

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
      >
        <span className={hasActiveLink && collapsed ? 'text-green-400' : ''}>{group.label}</span>
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
              {filteredLinks.map((link) => {
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
                        ? 'text-white shadow-sm'
                        : 'text-gray-300 hover:bg-green-50/10 hover:text-white'
                    }`}
                    style={isActive ? { background: '#5DB347' } : {}}
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
  isSuperAdmin = false,
  hasAnyPermission,
  permissionsLoading = false,
}: {
  pathname: string;
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  onLinkClick?: () => void;
  isSuperAdmin?: boolean;
  hasAnyPermission?: (perms: string[]) => boolean;
  permissionsLoading?: boolean;
}) {
  // super_admin sees everything; regular admins filtered by permissions
  const visibleGroups = navGroups.filter((g) => {
    // super_admin-only groups (Switch Portal)
    if (g.superAdminOnly && !isSuperAdmin) return false;
    // super_admin always sees all groups
    if (isSuperAdmin) return true;
    // While permissions load, show all non-superAdminOnly groups (brief flash)
    if (permissionsLoading || !hasAnyPermission) return true;
    // Check sidebar permission map
    const requiredPerms = SIDEBAR_PERMISSION_MAP[g.label];
    if (!requiredPerms || requiredPerms.length === 0) return true; // everyone
    return hasAnyPermission(requiredPerms);
  });

  return (
    <>
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onLinkClick}>
          <img src="/afu-logo.svg" alt="African Farming Union" className="h-10 w-auto object-contain rounded-md bg-white p-1" />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-hide">
        {visibleGroups.map((group) => (
          <NavSection
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={collapsedGroups[group.label] ?? false}
            onToggle={() => toggleGroup(group.label)}
            isSuperAdmin={isSuperAdmin}
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
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading, isAdmin, isSuperAdmin } = useAuth();
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions(user?.id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [serverRole, setServerRole] = useState<string | null>(null);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // ── Role guard: redirect non-admins ──────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

    // Use server API to check role (bypasses RLS)
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then(({ role }) => {
        if (role === 'admin' || role === 'super_admin') {
          setAuthorized(true);
          setServerRole(role);
        } else {
          router.replace('/dashboard');
        }
        setRoleChecked(true);
      })
      .catch(() => {
        router.replace('/dashboard');
      });
  }, [user, authLoading, router]);

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

  // Show loading while checking auth
  if (authLoading || !roleChecked || !authorized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-teal mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Use server role as fallback — profile.role may not be loaded yet
  const effectiveSuperAdmin = isSuperAdmin || serverRole === 'super_admin';

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-navy-dark flex-col text-white fixed inset-y-0 left-0 z-30">
        <SidebarContent
          pathname={pathname}
          collapsedGroups={collapsedGroups}
          toggleGroup={toggleGroup}
          isSuperAdmin={effectiveSuperAdmin}
          hasAnyPermission={hasAnyPermission}
          permissionsLoading={permissionsLoading}
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
                isSuperAdmin={effectiveSuperAdmin}
                hasAnyPermission={hasAnyPermission}
                permissionsLoading={permissionsLoading}
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
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-navy leading-tight">{displayName}</p>
                <p className="text-[10px] text-gray-400 leading-tight">
                  {effectiveSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-2 text-xs text-gray-400 hover:text-red-600 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
