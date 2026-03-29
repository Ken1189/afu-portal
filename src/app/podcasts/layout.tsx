import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Podcasts',
  description: 'AFU farming podcasts covering agronomy, markets, technology, finance, and success stories from African agriculture.',
  path: '/podcasts',
});

export default function PodcastsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
