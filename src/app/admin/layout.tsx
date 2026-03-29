'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  TrendingUp,
  Landmark,
  Ship,
  Store,
  CreditCard,
  ScrollText,
  Shield,
  Settings,
  UserCog,
  Bell,
  Globe,
  ScanEye,
  HandCoins,
  Gauge,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
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
  Send,
  Zap,
  Warehouse,
  Search,
  Star,
  LogOut,
  X,
  Activity,
} from 'lucide-react';

// ── Navigation structure with collapsible groups ──

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  superAdminOnly?: boolean;
  badge?: number;
}

interface NavGroup {
  label: string;
  links: NavLink[];
  defaultOpen?: boolean;
  superAdminOnly?: boolean;
}

const ICON_CLS = 'w-[18px] h-[18px] flex-shrink-0';

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    links: [
      { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className={ICON_CLS} /> },
      { href: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Members & Applications',
    defaultOpen: true,
    links: [
      { href: '/admin/members', label: 'Members', icon: <Users className={ICON_CLS} /> },
      { href: '/admin/applications', label: 'Applications', icon: <FileText className={ICON_CLS} /> },
      { href: '/admin/farmers', label: 'Bulk Import', icon: <Upload className={ICON_CLS} /> },
      { href: '/admin/kyc', label: 'KYC / References', icon: <ScanEye className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Finance & Loans',
    defaultOpen: true,
    links: [
      { href: '/admin/loans', label: 'Loan Management', icon: <HandCoins className={ICON_CLS} /> },
      { href: '/admin/payments', label: 'Payments', icon: <CreditCard className={ICON_CLS} /> },
      { href: '/admin/financial', label: 'Financial Overview', icon: <Landmark className={ICON_CLS} /> },
      { href: '/admin/credit-scores', label: 'Credit Scoring', icon: <Gauge className={ICON_CLS} /> },
      { href: '/admin/trade-finance', label: 'Trade Finance', icon: <Ship className={ICON_CLS} /> },
      { href: '/admin/banking', label: 'Banking Operations', icon: <Landmark className={ICON_CLS} /> },
      { href: '/admin/wallet', label: 'Wallet Management', icon: <Wallet className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Investor Management',
    defaultOpen: true,
    superAdminOnly: true,
    links: [
      { href: '/admin/investor-relations', label: 'Investor Pipeline', icon: <Landmark className={ICON_CLS} /> },
      { href: '/admin/investors', label: 'All Investors', icon: <Users className={ICON_CLS} /> },
      { href: '/admin/investments', label: 'Total Investments', icon: <BarChart3 className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Trading',
    defaultOpen: false,
    links: [
      { href: '/admin/trading', label: 'Trade Desk', icon: <ArrowLeftRight className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Farm Operations',
    defaultOpen: false,
    links: [
      { href: '/admin/map', label: 'Farm Map', icon: <MapPin className={ICON_CLS} /> },
      { href: '/admin/farm-overview', label: 'Farm Overview', icon: <Gauge className={ICON_CLS} /> },
      { href: '/admin/equipment', label: 'Equipment', icon: <Wrench className={ICON_CLS} /> },
      { href: '/admin/insurance', label: 'Insurance', icon: <Shield className={ICON_CLS} /> },
      { href: '/admin/insurance/parametric', label: 'Parametric Insurance', icon: <Zap className={ICON_CLS} /> },
      { href: '/admin/crops', label: 'Crops', icon: <Sprout className={ICON_CLS} /> },
      { href: '/admin/livestock', label: 'Livestock', icon: <Beef className={ICON_CLS} /> },
      { href: '/admin/legal-services', label: 'Legal Services', icon: <ScaleIcon className={ICON_CLS} /> },
      { href: '/admin/veterinary', label: 'Veterinary', icon: <Stethoscope className={ICON_CLS} /> },
      { href: '/admin/warehouse', label: 'Warehouse', icon: <Warehouse className={ICON_CLS} /> },
      { href: '/admin/cooperatives', label: 'Cooperatives', icon: <Users className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Programs & Training',
    defaultOpen: false,
    links: [
      { href: '/admin/training', label: 'Training', icon: <GraduationCap className={ICON_CLS} /> },
      { href: '/admin/programs', label: 'Programs', icon: <Sprout className={ICON_CLS} /> },
      { href: '/admin/sponsor', label: 'Sponsor a Farmer', icon: <Heart className={ICON_CLS} /> },
      { href: '/admin/sponsor-tiers', label: 'Sponsor Tiers', icon: <Gift className={ICON_CLS} /> },
      { href: '/admin/jobs', label: 'Jobs Board', icon: <Briefcase className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Marketplace & Partners',
    defaultOpen: false,
    links: [
      { href: '/admin/exchange', label: 'Exchange', icon: <HandCoins className={ICON_CLS} /> },
      { href: '/admin/suppliers', label: 'Suppliers', icon: <Store className={ICON_CLS} /> },
      { href: '/admin/partnerships', label: 'Partners', icon: <Handshake className={ICON_CLS} /> },
      { href: '/admin/advertising', label: 'Advertising', icon: <Megaphone className={ICON_CLS} /> },
      { href: '/admin/testimonials', label: 'Testimonials', icon: <MessageSquare className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Content & CMS',
    defaultOpen: false,
    links: [
      { href: '/admin/content', label: 'Site Content', icon: <FileEdit className={ICON_CLS} /> },
      { href: '/admin/research', label: 'Research Centres', icon: <FlaskConical className={ICON_CLS} /> },
      { href: '/admin/ambassadors', label: 'Ambassadors', icon: <Megaphone className={ICON_CLS} /> },
      { href: '/admin/faq', label: 'FAQ Manager', icon: <HelpCircle className={ICON_CLS} /> },
      { href: '/admin/legal', label: 'Legal Pages', icon: <Scale className={ICON_CLS} /> },
      { href: '/admin/countries', label: 'Countries', icon: <Globe className={ICON_CLS} /> },
    ],
  },
  {
    label: 'System & Security',
    defaultOpen: false,
    links: [
      { href: '/admin/users', label: 'Users & Roles', icon: <UserCog className={ICON_CLS} /> },
      { href: '/admin/users/permissions', label: 'Permissions', icon: <ShieldCheck className={ICON_CLS} />, superAdminOnly: true },
      { href: '/admin/audit', label: 'Audit Trail', icon: <ScrollText className={ICON_CLS} /> },
      { href: '/admin/compliance', label: 'Compliance', icon: <Shield className={ICON_CLS} /> },
      { href: '/admin/events', label: 'Event Monitor', icon: <Activity className={ICON_CLS} /> },
      { href: '/admin/notifications', label: 'Notifications', icon: <Bell className={ICON_CLS} /> },
      { href: '/admin/settings', label: 'Settings', icon: <Settings className={ICON_CLS} /> },
      { href: '/admin/run-migration', label: 'Run Migrations', icon: <Database className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Messaging',
    defaultOpen: false,
    links: [
      { href: '/admin/messaging', label: 'Dashboard', icon: <MessageSquare className={ICON_CLS} /> },
      { href: '/admin/messaging/templates', label: 'Templates', icon: <FileText className={ICON_CLS} /> },
      { href: '/admin/messaging/campaigns', label: 'Campaigns', icon: <Send className={ICON_CLS} /> },
    ],
  },
  {
    label: 'Switch Portal',
    defaultOpen: false,
    superAdminOnly: true,
    links: [
      { href: '/investor', label: 'Investor Portal', icon: <BarChart3 className={ICON_CLS} /> },
      { href: '/investor/opportunities', label: 'Investment Opps', icon: <Rocket className={ICON_CLS} /> },
      { href: '/farm', label: 'Farmer Portal', icon: <Tractor className={ICON_CLS} /> },
      { href: '/dashboard', label: 'Member Dashboard', icon: <LayoutDashboard className={ICON_CLS} /> },
      { href: '/', label: 'Public Website', icon: <ExternalLink className={ICON_CLS} /> },
    ],
  },
];

// ── Helper: flatten all links for search ──
function getAllLinks(groups: NavGroup[], isSuperAdmin: boolean): (NavLink & { groupLabel: string })[] {
  const result: (NavLink & { groupLabel: string })[] = [];
  for (const g of groups) {
    if (g.superAdminOnly && !isSuperAdmin) continue;
    for (const l of g.links) {
      if (l.superAdminOnly && !isSuperAdmin) continue;
      result.push({ ...l, groupLabel: g.label });
    }
  }
  return result;
}

// ── Helper: check if link is active ──
function isLinkActive(href: string, pathname: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(href + '/');
}

// ── Tooltip component (CSS-only, no portal) ──
function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-150 z-[100]">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
      </div>
    </div>
  );
}

// ── Collapsible nav group component (enterprise version) ──

function NavSection({
  group,
  pathname,
  groupCollapsed,
  onToggleGroup,
  isSuperAdmin,
  sidebarCollapsed,
  showLabels,
  favorites,
  onToggleFavorite,
  searchQuery,
}: {
  group: NavGroup;
  pathname: string;
  groupCollapsed: boolean;
  onToggleGroup: () => void;
  isSuperAdmin: boolean;
  sidebarCollapsed: boolean;
  showLabels: boolean;
  favorites: string[];
  onToggleFavorite: (href: string) => void;
  searchQuery: string;
}) {
  const filteredLinks = group.links.filter((l) => {
    if (l.superAdminOnly && !isSuperAdmin) return false;
    if (searchQuery) {
      return l.label.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (filteredLinks.length === 0) return null;

  const hasActiveLink = filteredLinks.some((l) => isLinkActive(l.href, pathname));

  // In collapsed mode without hover, show only icons stacked
  if (sidebarCollapsed && !showLabels) {
    return (
      <div className="py-1">
        {/* Thin divider instead of group header */}
        <div className="mx-3 border-t border-white/5 mb-1" />
        {filteredLinks.map((link) => {
          const isActive = isLinkActive(link.href, pathname);
          return (
            <Tooltip key={link.href} label={link.label}>
              <Link
                href={link.href}
                className={`relative flex items-center justify-center w-full h-10 transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[#5DB347]" />
                )}
                <span className="flex items-center justify-center">{link.icon}</span>
                {link.badge != null && link.badge > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-1">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  // Expanded mode (or hover-expanded)
  return (
    <div>
      <button
        onClick={onToggleGroup}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-200 transition-colors duration-150"
      >
        <span
          className={`truncate transition-opacity duration-150 ${
            hasActiveLink && groupCollapsed ? 'text-green-400' : ''
          }`}
        >
          {group.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${
            groupCollapsed ? '-rotate-90' : ''
          }`}
        />
      </button>
      {!groupCollapsed && (
        <div className="space-y-0.5 pb-2">
          {filteredLinks.map((link) => {
            const isActive = isLinkActive(link.href, pathname);
            const isFav = favorites.includes(link.href);
            return (
              <div key={link.href} className="group/link relative">
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[#5DB347]" />
                  )}
                  {link.icon}
                  <span className="truncate flex-1">{link.label}</span>
                  {link.badge != null && link.badge > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </Link>
                {/* Favorite star — visible on hover */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(link.href);
                  }}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity duration-150 ${
                    isFav
                      ? 'opacity-100 text-yellow-400 hover:text-yellow-300'
                      : 'opacity-0 group-hover/link:opacity-100 text-gray-500 hover:text-yellow-400'
                  }`}
                  title={isFav ? 'Unpin from favorites' : 'Pin to favorites'}
                >
                  <Star className="w-3 h-3" fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Favorites section ──
function FavoritesSection({
  favorites,
  allLinks,
  pathname,
  sidebarCollapsed,
  showLabels,
  onToggleFavorite,
}: {
  favorites: string[];
  allLinks: (NavLink & { groupLabel: string })[];
  pathname: string;
  sidebarCollapsed: boolean;
  showLabels: boolean;
  onToggleFavorite: (href: string) => void;
}) {
  const favLinks = favorites
    .map((href) => allLinks.find((l) => l.href === href))
    .filter(Boolean) as (NavLink & { groupLabel: string })[];

  if (favLinks.length === 0) return null;

  if (sidebarCollapsed && !showLabels) {
    return (
      <div className="py-1">
        <div className="mx-3 border-t border-yellow-400/20 mb-1" />
        {favLinks.map((link) => {
          const isActive = isLinkActive(link.href, pathname);
          return (
            <Tooltip key={link.href} label={link.label}>
              <Link
                href={link.href}
                className={`relative flex items-center justify-center w-full h-10 transition-colors duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-yellow-400/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[#5DB347]" />
                )}
                {link.icon}
              </Link>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pb-1">
      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-yellow-400/70 flex items-center gap-1">
        <Star className="w-3 h-3" fill="currentColor" />
        <span>Favorites</span>
      </div>
      <div className="space-y-0.5">
        {favLinks.map((link) => {
          const isActive = isLinkActive(link.href, pathname);
          return (
            <div key={link.href} className="group/link relative">
              <Link
                href={link.href}
                className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-[#5DB347]" />
                )}
                {link.icon}
                <span className="truncate flex-1">{link.label}</span>
              </Link>
              <button
                onClick={() => onToggleFavorite(link.href)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-100 text-yellow-400 hover:text-yellow-300 transition-opacity duration-150"
                title="Unpin from favorites"
              >
                <Star className="w-3 h-3" fill="currentColor" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  MAIN LAYOUT
// ═══════════════════════════════════════════════════════

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut, isLoading: authLoading, isSuperAdmin } = useAuth();
  const { hasAnyPermission, loading: permissionsLoading } = usePermissions(user?.id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [serverRole, setServerRole] = useState<string | null>(null);

  // ── Sidebar collapse state ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Favorites state ──
  const [favorites, setFavorites] = useState<string[]>([]);

  // ── Group collapse state ──
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.label] = !g.defaultOpen;
    });
    return initial;
  });

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // ── Load persisted preferences from localStorage ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin-sidebar-collapsed');
      if (stored === 'true') setSidebarCollapsed(true);

      const storedFavs = localStorage.getItem('admin-sidebar-favorites');
      if (storedFavs) {
        const parsed = JSON.parse(storedFavs);
        if (Array.isArray(parsed)) setFavorites(parsed.slice(0, 6));
      }

      const storedGroups = localStorage.getItem('admin-sidebar-groups');
      if (storedGroups) {
        const parsed = JSON.parse(storedGroups);
        if (typeof parsed === 'object' && parsed !== null) {
          setCollapsedGroups(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // ── Persist sidebar collapsed state ──
  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('admin-sidebar-collapsed', String(next));
      } catch {}
      if (next) setHoverExpanded(false);
      return next;
    });
  }, []);

  // ── Persist favorites ──
  const toggleFavorite = useCallback((href: string) => {
    setFavorites((prev) => {
      let next: string[];
      if (prev.includes(href)) {
        next = prev.filter((h) => h !== href);
      } else {
        if (prev.length >= 6) return prev; // max 6
        next = [...prev, href];
      }
      try {
        localStorage.setItem('admin-sidebar-favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // ── Persist group collapse state ──
  const toggleGroup = useCallback((label: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem('admin-sidebar-groups', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // ── Hover expand/collapse ──
  const handleMouseEnter = useCallback(() => {
    if (!sidebarCollapsed) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverExpanded(true);
  }, [sidebarCollapsed]);

  const handleMouseLeave = useCallback(() => {
    if (!sidebarCollapsed) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverExpanded(false);
    }, 200);
  }, [sidebarCollapsed]);

  // ── Keyboard shortcut: Cmd+K / Ctrl+K ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (sidebarCollapsed && !hoverExpanded) {
          setHoverExpanded(true);
        }
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarCollapsed, hoverExpanded]);

  // ── Role guard: redirect non-admins ──
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login?redirect=/admin');
      return;
    }

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

  // Show loading while checking auth
  if (authLoading || !roleChecked || !authorized) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-teal mx-auto mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  const effectiveSuperAdmin = isSuperAdmin || serverRole === 'super_admin';

  // Determine effective visual state
  const showLabels = !sidebarCollapsed || hoverExpanded;
  const effectiveWidth = showLabels ? 256 : 64;

  // All links for search/favorites
  const allLinks = getAllLinks(navGroups, effectiveSuperAdmin);

  // Visible groups (permission filtered)
  const visibleGroups = navGroups.filter((g) => {
    if (g.superAdminOnly && !effectiveSuperAdmin) return false;
    if (effectiveSuperAdmin) return true;
    if (permissionsLoading || !hasAnyPermission) return true;
    const requiredPerms = SIDEBAR_PERMISSION_MAP[g.label];
    if (!requiredPerms || requiredPerms.length === 0) return true;
    return hasAnyPermission(requiredPerms);
  });

  // Margin class for main content
  const mainMarginClass = sidebarCollapsed && !hoverExpanded ? 'lg:ml-16' : 'lg:ml-64';

  return (
    <div className="min-h-screen bg-cream flex">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex flex-col text-white fixed inset-y-0 left-0 z-30 overflow-hidden"
        style={{
          width: effectiveWidth,
          backgroundColor: '#1B2A4A',
          transition: 'width 200ms ease',
        }}
      >
        {/* Logo */}
        <div
          className="border-b border-white/10 flex items-center"
          style={{
            padding: showLabels ? '16px 20px' : '16px 0',
            justifyContent: showLabels ? 'flex-start' : 'center',
            transition: 'padding 200ms ease',
          }}
        >
          <Link href="/admin" className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="/afu-logo.svg"
              alt="African Farming Union"
              className="h-8 w-8 object-contain rounded-md bg-white p-0.5 flex-shrink-0"
            />
            <span
              className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
              style={{
                opacity: showLabels ? 1 : 0,
                width: showLabels ? 'auto' : 0,
                transition: 'opacity 150ms ease, width 200ms ease',
              }}
            >
              AFU Admin
            </span>
          </Link>
        </div>

        {/* Search */}
        <div
          className="border-b border-white/10"
          style={{
            padding: showLabels ? '8px 12px' : '8px',
            transition: 'padding 200ms ease',
          }}
        >
          {showLabels ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search... (Ctrl+K)"
                className="w-full pl-8 pr-8 py-1.5 bg-white/10 border border-white/10 rounded-lg text-[13px] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5DB347]/50 focus:border-[#5DB347]/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <Tooltip label="Search (Ctrl+K)">
              <button
                onClick={() => {
                  if (sidebarCollapsed) {
                    setHoverExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 220);
                  }
                }}
                className="w-full flex items-center justify-center h-8 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>
            </Tooltip>
          )}
        </div>

        {/* Nav content */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide" style={{ padding: showLabels ? '8px 12px' : '4px 0' }}>
          {/* Favorites section */}
          {!searchQuery && (
            <FavoritesSection
              favorites={favorites}
              allLinks={allLinks}
              pathname={pathname}
              sidebarCollapsed={sidebarCollapsed}
              showLabels={showLabels}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {/* Nav groups */}
          {visibleGroups.map((group) => (
            <NavSection
              key={group.label}
              group={group}
              pathname={pathname}
              groupCollapsed={collapsedGroups[group.label] ?? false}
              onToggleGroup={() => toggleGroup(group.label)}
              isSuperAdmin={effectiveSuperAdmin}
              sidebarCollapsed={sidebarCollapsed}
              showLabels={showLabels}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              searchQuery={searchQuery}
            />
          ))}
        </nav>

        {/* User section + toggle at bottom */}
        <div className="border-t border-white/10">
          {/* User info */}
          <div
            className="flex items-center"
            style={{
              padding: showLabels ? '10px 12px' : '10px 0',
              justifyContent: showLabels ? 'flex-start' : 'center',
              transition: 'padding 200ms ease',
            }}
          >
            <div className="w-8 h-8 bg-[#5DB347] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
            <div
              className="overflow-hidden whitespace-nowrap"
              style={{
                opacity: showLabels ? 1 : 0,
                width: showLabels ? 'auto' : 0,
                marginLeft: showLabels ? '10px' : 0,
                transition: 'opacity 150ms ease, width 200ms ease, margin 200ms ease',
              }}
            >
              <p className="text-[13px] font-medium text-white leading-tight truncate max-w-[140px]">{displayName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">
                {effectiveSuperAdmin ? 'Super Admin' : 'Admin'}
              </p>
            </div>
            {showLabels && (
              <div className="ml-auto flex items-center gap-1 flex-shrink-0">
                <Link
                  href="/admin/settings"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebarCollapsed}
            className="w-full flex items-center justify-center h-10 border-t border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors duration-150"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
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
              className="fixed inset-y-0 left-0 w-[280px] text-white z-50 flex flex-col lg:hidden shadow-2xl"
              style={{ backgroundColor: '#1B2A4A' }}
            >
              {/* Mobile logo */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <img
                    src="/afu-logo.svg"
                    alt="African Farming Union"
                    className="h-8 w-8 object-contain rounded-md bg-white p-0.5"
                  />
                  <span className="text-sm font-semibold text-white">AFU Admin</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-3 py-2 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full pl-8 pr-8 py-1.5 bg-white/10 border border-white/10 rounded-lg text-[13px] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5DB347]/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide space-y-1">
                {!searchQuery && (
                  <FavoritesSection
                    favorites={favorites}
                    allLinks={allLinks}
                    pathname={pathname}
                    sidebarCollapsed={false}
                    showLabels={true}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
                {visibleGroups.map((group) => (
                  <NavSection
                    key={group.label}
                    group={group}
                    pathname={pathname}
                    groupCollapsed={collapsedGroups[group.label] ?? false}
                    onToggleGroup={() => toggleGroup(group.label)}
                    isSuperAdmin={effectiveSuperAdmin}
                    sidebarCollapsed={false}
                    showLabels={true}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    searchQuery={searchQuery}
                  />
                ))}
              </nav>

              {/* Mobile user section */}
              <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#5DB347] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white leading-tight truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {effectiveSuperAdmin ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content Area ───────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${mainMarginClass}`}
        style={{ transition: 'margin-left 200ms ease' }}
      >
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
