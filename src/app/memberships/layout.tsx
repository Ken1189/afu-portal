import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Membership Tiers',
  description: 'AFU membership plans for smallholder, commercial, enterprise, and partner tiers. Access financing, insurance, training, and guaranteed markets.',
  path: '/memberships',
});

export default function MembershipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
