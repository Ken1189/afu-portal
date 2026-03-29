import type { Metadata } from 'next';

// S4.7: Metadata for farmer profile pages
export const metadata: Metadata = {
  title: 'Farmer Profile | African Farming Union',
  description: 'Meet our farmers. Learn about their story, crops, and how your sponsorship makes a difference across Africa.',
  openGraph: {
    title: 'Farmer Profile | African Farming Union',
    description: 'Meet our farmers and sponsor their journey.',
    type: 'profile',
  },
};

export default function FarmerProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
