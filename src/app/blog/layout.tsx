import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/blog');
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
