import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Newsletter',
  description: 'Subscribe to the AFU newsletter for market prices, farming tips, investment opportunities, and agricultural news across Africa.',
  path: '/newsletter',
});

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
