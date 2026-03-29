import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Machinery & Equipment',
  description: 'Buy, lease, or hire agricultural machinery and equipment. Tractors, harvesters, irrigation systems, and more for African farms.',
  path: '/services/machinery',
});

export default function MachineryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
