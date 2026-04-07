import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/faq');
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
