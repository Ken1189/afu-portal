import type { Metadata } from 'next';

// S4.7: Dynamic metadata for job detail pages
// Note: Ideally this would use generateMetadata with DB lookup,
// but the page component is 'use client'. This provides a template.
export const metadata: Metadata = {
  title: 'Job Opportunity | African Farming Union',
  description: 'View job details and apply to join the African Farming Union team. We are hiring across 20 African countries.',
  openGraph: {
    title: 'Job Opportunity | African Farming Union',
    description: 'View job details and apply to join the AFU team.',
    type: 'website',
  },
};

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
