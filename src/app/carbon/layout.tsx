import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Carbon Credits',
  description: 'Agricultural carbon credit marketplace. Buy verified carbon offsets from African farming projects supporting regenerative agriculture.',
  path: '/carbon',
});

export default function CarbonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
