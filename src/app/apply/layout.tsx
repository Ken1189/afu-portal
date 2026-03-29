import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Apply for Membership',
  description: 'Join the African Farming Union. Apply for smallholder, commercial, enterprise, or partner membership and access financing, markets, and training.',
  path: '/apply',
});

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
