import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Blog',
  description: 'AFU blog: agriculture insights, farmer stories, market updates, climate research, and policy news shaping African farming today.',
  path: '/blog',
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
