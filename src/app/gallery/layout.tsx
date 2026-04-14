import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery — Photos from African Farming Union Operations',
  description: 'See AFU in action across Africa. Photos from farms, cooperatives, training events, and agricultural operations in 20 African countries.',
  openGraph: {
    title: 'AFU Gallery — Africa\'s Farming Story in Pictures',
    description: 'Explore photos from AFU operations, farmer stories, and agricultural projects across Africa.',
    url: 'https://africanfarmingunion.org/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
