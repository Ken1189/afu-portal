import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/partners');
}

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
