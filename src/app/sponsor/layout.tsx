import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/sponsor');
}

export default function SponsorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
