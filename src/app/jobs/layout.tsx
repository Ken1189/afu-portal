import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Jobs & Careers',
  description: 'Join the AFU team. Browse open positions in agriculture, technology, finance, and operations across Africa.',
  path: '/jobs',
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
