import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/newsletter');
}

export default function NewsletterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
