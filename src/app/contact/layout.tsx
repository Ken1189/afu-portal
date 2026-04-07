import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/contact');
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
