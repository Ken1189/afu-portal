import type { Metadata } from 'next';
import { getDynamicMetadata } from '@/lib/seo/dynamic-metadata';

export async function generateMetadata(): Promise<Metadata> {
  return getDynamicMetadata('/login');
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
