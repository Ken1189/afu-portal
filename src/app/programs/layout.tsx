import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata = createPageMetadata({
  title: 'Programs',
  description: 'AFU agricultural programs including blueberry exports, macadamia processing, livestock, and more across nine African countries.',
  path: '/programs',
});

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
