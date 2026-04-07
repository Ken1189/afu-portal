import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Ambassadors',
  description: 'Become an AFU ambassador. Champion African farming, grow your community, earn rewards, and help connect farmers across the continent.',
  path: '/ambassadors',
});

export default function AmbassadorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
