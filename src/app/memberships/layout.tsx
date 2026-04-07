import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/memberships');
}

export default function MembershipsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
