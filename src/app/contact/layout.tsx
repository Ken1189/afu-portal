import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Contact Us',
  description: 'Get in touch with the African Farming Union team. Reach out for membership inquiries, partnerships, support, and general questions.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
