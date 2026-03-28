'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Sprout,
  Camera,
  DollarSign,
  BookOpen,
  Bot,
  // Bell replaced by NotificationBell component
  ChevronLeft,
  Menu,
  X,
  Wallet,
  Globe,
  Shield,
  ShoppingBag,
  Truck,
  UsersRound,
  Wrench,
  Beef,
  Leaf,
  Ship,
  CloudSun,
  Brain,
  BarChart3,
  CreditCard,
  Lock,
  GraduationCap,
  Coins,
  HelpCircle,
  Scale,
  Stethoscope,
  ArrowLeftRight,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import { localeNames, type Locale } from '@/lib/i18n/translations';
import { FlagIcon } from '@/components/FlagIcon';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import NotificationBell from '@/components/farm/NotificationBell';
import { TierProgress } from '@/components/farm/TierProgress';
import { GuidedTour } from '@/components/farm/GuidedTour';
import {
  FARMER_TIERS,
  TIER_ORDER,
  FARM_SIDEBAR_ITEMS,
  isTierUnlocked,
  getSidebarItemsByTier,
  type FarmerTier,
} from '@/lib/farmer-tiers';

// ── Icon Lookup ──────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Sprout,
  Camera,
  DollarSign,
  BookOpen,
  Bot,
  Wallet,
  Shield,
  ShoppingBag,
  Truck,
  UsersRound,
  Wrench,
  Beef,
  Leaf,
  Ship,
  CloudSun,
  Brain,
  BarChart3,
  CreditCard,
  GraduationCap,
  Coins,
  Lock,
  Scale,
  Stethoscope,
  ArrowLeftRight,
};

// Bottom nav keys — always show core items regardless of tier
const bottomNavKeys = ['home', 'crops', 'doctor', 'money', 'financing'] as const;
const bottomNavLinks = [
  { href: '/farm', labelKey: 'home' as const, shortKey: 'home' as const, icon: Home },
  { href: '/farm/crops', labelKey: 'crops' as const, shortKey: 'crops' as const, icon: Sprout },
  { href: '/farm/doctor', labelKey: 'doctor' as const, shortKey: 'doctor' as const, icon: Camera },
  { href: '/farm/money', labelKey: 'money' as const, shortKey: 'money' as const, icon: DollarSign },
  { href: '/farm/financing', labelKey: 'financing' as const, shortKey: 'financing' as const, icon: Wallet },
];

// ── Layout wrapper ───────────────────────────────────────────────────────
export default function FarmLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <FarmLayoutInner>{children}</FarmLayoutInner>
    </LanguageProvider>
  );
}

// ── Inner layout with tier logic ─────────────────────────────────────────
function FarmLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [sidebarLangOpen, setSidebarLangOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  // Tier state
  const [currentTier, setCurrentTier] = useState<FarmerTier>('seedling');
  const [totalXp, setTotalXp] = useState(0);
  const [totalCoursesCompleted, setTotalCoursesCompleted] = useState(0);
  const [tierLoading, setTierLoading] = useState(true);

  // Guided tour state
  const [showTour, setShowTour] = useState(false);

  // Check if tour should show on mount
  useEffect(() => {
    const tourCompleted = localStorage.getItem('afu_farm_tour_completed');
    if (!tourCompleted) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
  }, []);

  const supabase = createClient();

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Farmer';
  const firstName = displayName.split(' ')[0];
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Fetch or auto-create farmer tier record
  const fetchTier = useCallback(async () => {
    if (!user) return;
    setTierLoading(true);

    try {
      const { data, error } = await supabase
        .from('farmer_tiers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No record found — auto-create seedling tier
        const { data: newTier } = await supabase
          .from('farmer_tiers')
          .insert({ user_id: user.id, current_tier: 'seedling', total_xp: 0, total_courses_completed: 0 })
          .select()
          .single();

        if (newTier) {
          setCurrentTier(newTier.current_tier as FarmerTier);
          setTotalXp(newTier.total_xp);
          setTotalCoursesCompleted(newTier.total_courses_completed);
        }
      } else if (data) {
        setCurrentTier(data.current_tier as FarmerTier);
        setTotalXp(data.total_xp);
        setTotalCoursesCompleted(data.total_courses_completed);
      }
    } catch {
      // Table may not exist yet — default to seedling
      console.warn('farmer_tiers table not available, defaulting to seedling');
    }

    setTierLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  const getPageTitle = () => {
    if (pathname === '/farm') return 'Mkulima Hub';
    const item = FARM_SIDEBAR_ITEMS.find(
      (l) => pathname.startsWith(l.href) && l.href !== '/farm'
    );
    if (item) return item.label;
    // Fallback to old navLinks style
    const keyMap: Record<string, string> = {
      '/farm/money': 'money',
      '/farm/assistant': 'assistant',
      '/farm/equipment': 'equipment',
      '/farm/livestock': 'livestock',
    };
    for (const [href, key] of Object.entries(keyMap)) {
      if (pathname.startsWith(href)) return t.common[key as keyof typeof t.common] || key;
    }
    return 'Mkulima Hub';
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/farm' && pathname.startsWith(href));

  const itemsByTier = getSidebarItemsByTier();

  // ── Render a sidebar section for a tier ────────────────────────────────
  const renderTierSection = (tier: FarmerTier, closeFn?: () => void) => {
    const items = itemsByTier[tier];
    if (!items || items.length === 0) return null;

    const config = FARMER_TIERS[tier];
    const unlocked = isTierUnlocked(currentTier, tier);

    return (
      <div key={tier} className="mb-1">
        {/* Tier section header (skip for seedling — those are always visible) */}
        {tier !== 'seedling' && (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <span className="text-xs">{config.emoji}</span>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${unlocked ? 'text-gray-400' : 'text-gray-300'}`}>
              {config.name}
            </span>
            {!unlocked && <Lock className="w-3 h-3 text-gray-300 ml-auto" />}
          </div>
        )}

        {items.map((item) => {
          const IconComp = ICON_MAP[item.icon] || Home;
          const active = isActive(item.href);

          if (!unlocked) {
            // Locked item — visible but grayed out
            return (
              <div
                key={item.href}
                className="group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 cursor-not-allowed"
                title={`Complete "${config.requiredCourse?.replace(/-/g, ' ')}" to unlock`}
              >
                <IconComp className="w-5 h-5 opacity-40" />
                <span className="opacity-40">{item.label}</span>
                <Lock className="w-3.5 h-3.5 ml-auto opacity-30" />
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pointer-events-none">
                  <div className="bg-gray-800 text-white text-[11px] px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                    Complete &quot;{config.requiredCourse?.replace(/-/g, ' ')}&quot; to unlock
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeFn}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[#5DB347] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-[#EBF7E5] hover:text-navy'
              }`}
            >
              <IconComp className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    );
  };

  // Always show the assistant link
  const renderAssistantLink = (closeFn?: () => void) => (
    <Link
      href="/farm/assistant"
      onClick={closeFn}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive('/farm/assistant')
          ? 'bg-[#5DB347] text-white shadow-sm'
          : 'text-gray-600 hover:bg-[#EBF7E5] hover:text-navy'
      }`}
    >
      <Bot className="w-5 h-5" />
      {t.common.assistant}
      {!isActive('/farm/assistant') && (
        <span className="ml-auto text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
          AI
        </span>
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col fixed top-0 left-0 bottom-0 z-30">
        {/* Sidebar Header with Tier Progress */}
        <div className="bg-gradient-to-br from-navy to-[#5DB347] p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Mkulima Hub</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <p className="text-xs opacity-70">
                {FARMER_TIERS[currentTier].emoji} {FARMER_TIERS[currentTier].name} &bull;{' '}
                {profile?.country || 'AFU'}
              </p>
            </div>
          </div>
          {/* Compact tier progress */}
          {!tierLoading && (
            <TierProgress
              currentTier={currentTier}
              totalXp={totalXp}
              totalCoursesCompleted={totalCoursesCompleted}
              compact
            />
          )}
        </div>

        {/* Sidebar Nav — grouped by tier */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {TIER_ORDER.map((tier) => renderTierSection(tier))}

          {/* Divider + assistant */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            {renderAssistantLink()}
          </div>
        </nav>

        {/* Language Selector */}
        <div className="px-3 py-2 border-t border-gray-100 relative">
          <button
            onClick={() => setSidebarLangOpen(!sidebarLangOpen)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-gray-400" />
            <FlagIcon locale={locale} size={20} />
            <span className="font-medium">{localeNames[locale]}</span>
            <ChevronLeft
              className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${
                sidebarLangOpen ? 'rotate-90' : '-rotate-90'
              }`}
            />
          </button>
          {sidebarLangOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-72 overflow-y-auto">
              {(Object.keys(localeNames) as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setSidebarLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 transition-colors ${
                    locale === loc
                      ? 'bg-[#5DB347]/10 text-[#5DB347] font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FlagIcon locale={loc} size={20} />
                  {localeNames[loc]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {t.common.backToPortal}
          </Link>
        </div>
      </aside>

      {/* ─── Main Column ─── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* ─── Mobile Top Header ─── */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-navy active:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-navy leading-tight truncate">
                {getPageTitle()}
              </h1>
              <p className="text-[11px] text-gray-400 leading-tight">
                {FARMER_TIERS[currentTier].emoji} {firstName} &bull; {profile?.country || 'AFU'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 active:bg-gray-100 transition-colors"
              >
                <FlagIcon locale={locale} size={20} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-80 overflow-y-auto">
                  {(Object.keys(localeNames) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocale(loc);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 ${
                        locale === loc
                          ? 'bg-[#5DB347]/10 text-[#5DB347] font-medium'
                          : 'text-gray-600 active:bg-gray-50'
                      }`}
                    >
                      <FlagIcon locale={loc} size={20} />
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/farm/assistant"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#5DB347]/10 text-[#5DB347] active:bg-[#5DB347]/20 transition-colors relative"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full border-2 border-white" />
            </Link>
            <NotificationBell />
            <button
              onClick={() => setShowTour(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#EBF7E5] text-[#5DB347] active:bg-[#5DB347]/20 transition-colors"
              title="Replay onboarding tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ─── Desktop Top Bar ─── */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 px-6 py-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">{getPageTitle()}</h2>
            <p className="text-xs text-gray-400">Farmer Portal — Mkulima Hub</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                <FlagIcon locale={locale} size={20} />
                <span>{localeNames[locale]}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-80 overflow-y-auto">
                  {(Object.keys(localeNames) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocale(loc);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                        locale === loc
                          ? 'bg-[#5DB347]/10 text-[#5DB347] font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FlagIcon locale={loc} size={20} />
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/farm/assistant"
              className="flex items-center gap-2 bg-[#5DB347]/10 text-[#5DB347] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#5DB347]/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              {t.common.assistant}
              <span className="w-2 h-2 bg-green-400 rounded-full" />
            </Link>
            <NotificationBell />
            <button
              onClick={() => setShowTour(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5DB347] hover:bg-[#EBF7E5] transition-colors border border-[#5DB347]/20"
              title="Replay onboarding tour"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden xl:inline">Tour</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#5DB347] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
              <span className="text-sm font-medium text-navy">{displayName}</span>
            </div>
          </div>
        </header>

        {/* ─── Mobile Drawer ─── */}
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
                className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 bg-white shadow-2xl flex flex-col"
              >
                {/* Drawer Header with Tier Progress */}
                <div className="bg-gradient-to-br from-navy to-[#5DB347] p-5 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium opacity-80">Mkulima Hub</span>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 active:bg-white/25"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-xs opacity-80">
                        {FARMER_TIERS[currentTier].emoji} {FARMER_TIERS[currentTier].name} &bull;{' '}
                        {profile?.region || profile?.country || 'AFU'}
                      </p>
                      <p className="text-xs opacity-60">{profile?.email}</p>
                    </div>
                  </div>
                  {/* Full tier progress in drawer */}
                  {!tierLoading && (
                    <TierProgress
                      currentTier={currentTier}
                      totalXp={totalXp}
                      totalCoursesCompleted={totalCoursesCompleted}
                    />
                  )}
                </div>

                {/* Drawer Nav — grouped by tier */}
                <nav className="flex-1 p-3 overflow-y-auto">
                  {TIER_ORDER.map((tier) =>
                    renderTierSection(tier, () => setDrawerOpen(false))
                  )}

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    {renderAssistantLink(() => setDrawerOpen(false))}
                  </div>
                </nav>

                {/* Language selector in drawer */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 px-4 mb-1.5">
                    {t.common.language}
                  </p>
                  <div className="grid grid-cols-2 gap-1 px-2 max-h-48 overflow-y-auto">
                    {(Object.keys(localeNames) as Locale[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocale(loc)}
                        className={`flex items-center gap-2 text-xs py-2 px-2.5 rounded-lg font-medium transition-colors ${
                          locale === loc
                            ? 'bg-[#5DB347] text-white'
                            : 'text-gray-500 active:bg-gray-100'
                        }`}
                      >
                        <FlagIcon locale={loc} size={16} />
                        {localeNames[loc]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 active:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    {t.common.backToPortal}
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Page Content ─── */}
        <main className="flex-1 pb-24 lg:pb-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-evenly py-1">
          {bottomNavLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] min-h-[48px] transition-colors active:bg-gray-50 ${
                  active ? 'text-[#5DB347]' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#5DB347] rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span
                  className={`text-[11px] font-medium leading-tight ${active ? 'font-semibold' : ''}`}
                >
                  {t.common[link.shortKey]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── Guided Onboarding Tour ─── */}
      {showTour && (
        <GuidedTour
          onComplete={handleTourComplete}
          userId={user?.id}
        />
      )}
    </div>
  );
}
