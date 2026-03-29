import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Partners',
  description: 'AFU strategic partners powering African agriculture. Explore partnerships in financing, technology, logistics, and market access.',
  path: '/partners',
});

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
