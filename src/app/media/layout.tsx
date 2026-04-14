import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Media & Press — African Farming Union News',
  description: 'AFU media coverage, press releases, and news. Journalists and media professionals can find press kits and contact information for our communications team.',
  openGraph: {
    title: 'AFU Media & Press',
    description: 'Press releases, media coverage, and news from the African Farming Union.',
    url: 'https://africanfarmingunion.org/media',
  },
};

export default function MediaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
