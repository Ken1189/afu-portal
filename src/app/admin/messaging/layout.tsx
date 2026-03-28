'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Send } from 'lucide-react';

const tabs = [
  { href: '/admin/messaging', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/messaging/templates', label: 'Templates', icon: FileText },
  { href: '/admin/messaging/campaigns', label: 'Campaigns', icon: Send },
];

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Messaging tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(tab.href + '/');

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#5DB347] text-[#5DB347]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
