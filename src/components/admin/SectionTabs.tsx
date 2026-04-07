'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface Tab {
  href: string;
  label: string;
  Icon?: LucideIcon;
}

export function SectionTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex gap-1 -mb-px overflow-x-auto">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                active
                  ? 'border-[#5DB347] text-[#5DB347]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.Icon && <t.Icon className="w-4 h-4" />}
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
