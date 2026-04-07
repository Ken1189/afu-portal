import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'FAQ',
  description: 'Frequently asked questions about AFU membership, services, financing, insurance, training programs, and how to join the union.',
  path: '/faq',
});

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
