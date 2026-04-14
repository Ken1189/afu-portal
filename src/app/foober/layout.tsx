import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Foober Logistics — Deliver Anything Across Africa | AFU',
  description: 'Foober by AFU connects farmers, suppliers, and buyers with verified local drivers for fast agricultural delivery across 20 African countries. Request a delivery or become a driver.',
  openGraph: {
    title: 'Foober Logistics — Africa\'s Agricultural Delivery Network',
    description: 'Fast, reliable delivery of farm inputs, produce, equipment, and any goods across 20 African countries.',
    url: 'https://africanfarmingunion.org/foober',
  },
};

export default function FooberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
