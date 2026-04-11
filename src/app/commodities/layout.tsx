'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, ArrowLeftRight, Lightbulb, Bell } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/commodities', label: 'Markets', icon: BarChart3, exact: true },
  { href: '/commodities/trade', label: 'Trade', icon: ArrowLeftRight, exact: false },
  { href: '/commodities/insights', label: 'Insights', icon: Lightbulb, exact: false },
  { href: '/commodities/alerts', label: 'Alerts', icon: Bell, exact: false },
];

export default function CommoditiesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (item: typeof NAV_ITEMS[number]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sub-navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-[#5DB347] text-[#5DB347]'
                      : 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-300'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  );
}
