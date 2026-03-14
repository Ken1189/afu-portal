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
  Bell,
  ChevronLeft,
  Menu,
  X,
  Wallet,
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import { localeNames, localeFlags, type Locale } from '@/lib/i18n/translations';

const navLinks = [
  { href: '/farm', labelKey: 'home' as const, shortKey: 'home' as const, icon: Home },
  { href: '/farm/crops', labelKey: 'crops' as const, shortKey: 'crops' as const, icon: Sprout },
  { href: '/farm/doctor', labelKey: 'doctor' as const, shortKey: 'doctor' as const, icon: Camera },
  { href: '/farm/money', labelKey: 'money' as const, shortKey: 'money' as const, icon: DollarSign },
  { href: '/farm/financing', labelKey: 'financing' as const, shortKey: 'financing' as const, icon: Wallet },
  { href: '/farm/journal', labelKey: 'journal' as const, shortKey: 'journal' as const, icon: BookOpen },
  { href: '/farm/assistant', labelKey: 'assistant' as const, shortKey: 'assistant' as const, icon: Bot },
];

// Bottom nav: Home, Crops, Doctor, Money, Financing (5 tabs)
const bottomNavKeys = ['home', 'crops', 'doctor', 'money', 'financing'] as const;
const bottomNavLinks = navLinks.filter(l => (bottomNavKeys as readonly string[]).includes(l.labelKey));

export default function FarmLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <FarmLayoutInner>{children}</FarmLayoutInner>
    </LanguageProvider>
  );
}

function FarmLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale, t } = useLanguage();

  const getPageTitle = () => {
    if (pathname === '/farm') return 'Mkulima Hub';
    const link = navLinks.find((l) => pathname.startsWith(l.href) && l.href !== '/farm');
    return link ? t.common[link.labelKey] : 'Mkulima Hub';
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/farm' && pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Desktop Sidebar (hidden on mobile) ─── */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col fixed top-0 left-0 bottom-0 z-30">
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-navy to-teal p-5 text-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">Mkulima Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              KM
            </div>
            <div>
              <p className="font-semibold text-sm">Kgosi Mosweu</p>
              <p className="text-xs opacity-70">Smallholder • 5.3 ha</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal text-white shadow-sm'
                    : 'text-gray-600 hover:bg-teal-light hover:text-navy'
                }`}
              >
                <Icon className="w-5 h-5" />
                {t.common[link.labelKey]}
                {link.labelKey === 'assistant' && !active && (
                  <span className="ml-auto text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language Selector */}
        <div className="px-3 py-2 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 px-4 mb-1">{t.common.language}</p>
          <div className="flex gap-1 px-2">
            {(Object.keys(localeNames) as Locale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                  locale === loc
                    ? 'bg-teal text-white'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {localeFlags[loc]} {localeNames[loc]}
              </button>
            ))}
          </div>
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
        {/* ─── Mobile Top Header (hidden on desktop) ─── */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-navy active:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-navy leading-tight truncate">{getPageTitle()}</h1>
              <p className="text-[11px] text-gray-400 leading-tight">Kgosi Mosweu • 5.3 ha</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle (mobile) */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 active:bg-gray-100 transition-colors text-sm"
              >
                {localeFlags[locale]}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {(Object.keys(localeNames) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${
                        locale === loc ? 'bg-teal/10 text-teal font-medium' : 'text-gray-600 active:bg-gray-50'
                      }`}
                    >
                      <span>{localeFlags[loc]}</span>
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/farm/assistant"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-teal/10 text-teal active:bg-teal/20 transition-colors relative"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gold rounded-full border-2 border-white" />
            </Link>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 active:bg-gray-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                2
              </span>
            </button>
          </div>
        </header>

        {/* ─── Desktop Top Bar (hidden on mobile) ─── */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 px-6 py-4 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-navy">{getPageTitle()}</h2>
            <p className="text-xs text-gray-400">Farmer Portal — Mkulima Hub</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Desktop Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <Globe className="w-4 h-4" />
                <span>{localeFlags[locale]} {localeNames[locale]}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {(Object.keys(localeNames) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                        locale === loc ? 'bg-teal/10 text-teal font-medium' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{localeFlags[loc]}</span>
                      {localeNames[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/farm/assistant"
              className="flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              {t.common.assistant}
              <span className="w-2 h-2 bg-green-400 rounded-full" />
            </Link>
            <button className="relative text-gray-400 hover:text-navy transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">KM</span>
              </div>
              <span className="text-sm font-medium text-navy">Kgosi Mosweu</span>
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
                className="fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-72 bg-white shadow-2xl flex flex-col"
              >
                <div className="bg-gradient-to-br from-navy to-teal p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium opacity-80">Mkulima Hub</span>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 active:bg-white/25"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                      KM
                    </div>
                    <div>
                      <p className="font-semibold">Kgosi Mosweu</p>
                      <p className="text-xs opacity-80">Smallholder • Gaborone, Botswana</p>
                      <p className="text-xs opacity-60">Member since 2023</p>
                    </div>
                  </div>
                </div>

                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                  {navLinks.map((link) => {
                    const active = isActive(link.href);
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          active ? 'bg-teal/10 text-teal' : 'text-gray-600 active:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {t.common[link.labelKey]}
                        {link.labelKey === 'assistant' && (
                          <span className="ml-auto text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Language selector in drawer */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 px-4 mb-1.5">{t.common.language}</p>
                  <div className="flex gap-1 px-2">
                    {(Object.keys(localeNames) as Locale[]).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocale(loc)}
                        className={`flex-1 text-xs py-2 rounded-lg font-medium transition-colors ${
                          locale === loc
                            ? 'bg-teal text-white'
                            : 'text-gray-500 active:bg-gray-100'
                        }`}
                      >
                        {localeFlags[loc]} {localeNames[loc]}
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

      {/* ─── Mobile Bottom Navigation (hidden on desktop) ─── */}
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
                  active ? 'text-teal' : 'text-gray-400'
                }`}
              >
                <div className="relative">
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-teal rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-[11px] font-medium leading-tight ${active ? 'font-semibold' : ''}`}>
                  {t.common[link.shortKey]}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
