import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/ambassadors');
}

export default function AmbassadorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
