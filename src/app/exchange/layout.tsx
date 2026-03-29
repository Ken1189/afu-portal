import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'AFU Exchange',
  description: 'Agricultural commodity exchange connecting African farmers to buyers. Trade crops, livestock, equipment, and farm inputs.',
  path: '/exchange',
});

export default function ExchangeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
