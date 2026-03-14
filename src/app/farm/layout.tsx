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
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/farm', label: 'Farm Dashboard', shortLabel: 'Home', icon: Home },
  { href: '/farm/crops', label: 'My Crops', shortLabel: 'Crops', icon: Sprout },
  { href: '/farm/doctor', label: 'Crop Doctor', shortLabel: 'Doctor', icon: Camera },
  { href: '/farm/money', label: 'Money Tracker', shortLabel: 'Money', icon: DollarSign },
  { href: '/farm/journal', label: 'Farm Journal', shortLabel: 'Journal', icon: BookOpen },
  { href: '/farm/assistant', label: 'AI Assistant', shortLabel: 'AI Chat', icon: Bot },
];

const bottomNavLinks = navLinks.slice(0, 5); // First 5 for bottom nav

export default function FarmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === '/farm') return 'Mkulima Hub';
    const link = navLinks.find((l) => pathname.startsWith(l.href) && l.href !== '/farm');
    return link?.label || 'Mkulima Hub';
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
                {link.label}
                {link.label === 'AI Assistant' && !active && (
                  <span className="ml-auto text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to AFU Portal
          </Link>
        </div>
      </aside>

      {/* ─── Main Column ─── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* ─── Mobile Top Header (hidden on desktop) ─── */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-navy active:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-navy leading-tight">{getPageTitle()}</h1>
              <p className="text-[11px] text-gray-400 leading-tight">Kgosi Mosweu • 5.3 ha</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            <Link
              href="/farm/assistant"
              className="flex items-center gap-2 bg-teal/10 text-teal px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
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
                className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
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
                        {link.label}
                        {link.label === 'AI Assistant' && (
                          <span className="ml-auto text-[10px] font-bold bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                            AI
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-3 border-t border-gray-100">
                  <Link
                    href="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 active:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to AFU Portal
                  </Link>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ─── Page Content ─── */}
        <main className="flex-1 pb-20 lg:pb-6 overflow-y-auto">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      {/* ─── Mobile Bottom Navigation (hidden on desktop) ─── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex items-center justify-around py-1.5">
          {bottomNavLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[60px] transition-colors ${
                  active ? 'text-teal' : 'text-gray-400 active:text-gray-600'
                }`}
              >
                <div className="relative">
                  {active && (
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-teal rounded-full" />
                  )}
                  <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>
                  {link.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
