"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sprout, Building2 } from "lucide-react";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { label: "Farmer Portal", href: "/demo/farm", icon: Sprout },
    { label: "Commercial Dashboard", href: "/demo/commercial", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky demo navigation bar */}
      <div className="sticky top-0 z-50 bg-[#1B2A4A] border-b border-[#1B2A4A]/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left: back link */}
            <Link
              href="/investors"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Investors</span>
            </Link>

            {/* Center: branding + tabs */}
            <div className="flex items-center gap-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#5DB347]">
                Investor Demo
              </span>
              <div className="hidden sm:flex items-center gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = pathname === tab.href;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-[#5DB347]/20 text-[#5DB347]"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: CTA */}
            <Link
              href="/contact?subject=investor"
              className="bg-gradient-to-r from-[#D4A843] to-[#E8C547] text-[#1B2A4A] px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Request Investor Pack
            </Link>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-all ${
                  active
                    ? "text-[#5DB347] border-b-2 border-[#5DB347]"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
