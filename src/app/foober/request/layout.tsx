import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Request a Delivery — Foober by AFU',
  description: 'Request a delivery of farm inputs, produce, equipment, or any goods. Get matched with a verified Foober driver near you.',
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
