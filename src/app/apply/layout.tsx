import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/apply');
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
