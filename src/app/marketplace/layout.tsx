import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Marketplace',
  description: 'AFU marketplace connecting African farmers with buyers, suppliers, and equipment vendors. Browse crops, livestock, and farming inputs.',
  path: '/marketplace',
});

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
