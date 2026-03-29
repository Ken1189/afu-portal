import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Sponsor a Farmer',
  description: 'Directly support African farmers through AFU sponsorship. See real farmer profiles, track your impact, and help transform agriculture across Africa.',
  path: '/sponsor',
});

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
