import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/carbon');
}

export default function CarbonLayout({ children }: { children: React.ReactNode }) {
  return children;
}
