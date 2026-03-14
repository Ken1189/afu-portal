'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

/**
 * Conditionally renders the site-wide Navbar, Footer, and ChatWidget.
 * Hidden on /farm/* routes which have their own layout chrome.
 */

export function SiteNavbar() {
  const pathname = usePathname();
  if (pathname.startsWith('/farm')) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/farm')) return null;
  return (
    <>
      <Footer />
      <ChatWidget />
    </>
  );
}
