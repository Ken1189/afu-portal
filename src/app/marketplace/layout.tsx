import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/marketplace');
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
