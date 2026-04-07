import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/jobs');
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
