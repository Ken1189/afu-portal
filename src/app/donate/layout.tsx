import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/donate');
}

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
