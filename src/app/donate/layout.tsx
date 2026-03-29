import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Donate',
  description: 'Support African farmers with a one-time or monthly donation. Fund training, inputs, insurance, and infrastructure for smallholder communities.',
  path: '/donate',
});

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
