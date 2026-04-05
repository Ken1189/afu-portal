'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  admin: 'Admin', farm: 'Farm', supplier: 'Supplier', ambassador: 'Ambassador',
  investor: 'Investor', warehouse: 'Warehouse', dashboard: 'Dashboard',
  inbox: 'Inbox', contacts: 'Contacts', pipeline: 'Pipeline', analytics: 'Analytics',
  automations: 'Automations', members: 'Members', applications: 'Applications',
  farmers: 'Farmers', kyc: 'KYC', loans: 'Loans', payments: 'Payments',
  financial: 'Financial', banking: 'Banking', wallet: 'Wallet', trading: 'Trading',
  carbon: 'Carbon', insurance: 'Insurance', crops: 'Crops', livestock: 'Livestock',
  equipment: 'Equipment', cooperatives: 'Cooperatives', training: 'Training',
  programs: 'Programs', jobs: 'Jobs', suppliers: 'Suppliers', contracts: 'Contracts',
  exchange: 'Exchange', advertising: 'Advertising', blog: 'Blog', content: 'Content',
  media: 'Media', faq: 'FAQ', legal: 'Legal', countries: 'Countries',
  users: 'Users', settings: 'Settings', reports: 'Reports', messaging: 'Messaging',
  templates: 'Templates', campaigns: 'Campaigns', products: 'Products',
  orders: 'Orders', profile: 'Profile', commissions: 'Commissions',
  referrals: 'Referrals', estimates: 'Estimates', notifications: 'Notifications',
  marketplace: 'Marketplace', weather: 'Weather', collections: 'Collections',
  opportunities: 'Opportunities', parametric: 'Parametric', announcements: 'Announcements',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = LABELS[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400 mb-4 flex-wrap">
      <Link href="/" className="hover:text-[#5DB347] transition-colors"><Home className="w-3.5 h-3.5" /></Link>
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3" />
          {c.isLast ? (
            <span className="text-[#1B2A4A] font-medium">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-[#5DB347] transition-colors">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
