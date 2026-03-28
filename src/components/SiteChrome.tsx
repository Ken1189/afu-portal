'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

/**
 * Conditionally renders the site-wide Navbar, Footer, and ChatWidget.
 * Hidden on portal routes (/farm/*, /supplier/*) which have their own layout chrome.
 */

const PORTAL_PREFIXES = ['/farm', '/supplier', '/admin', '/dashboard', '/investor-login', '/investor', '/ambassador', '/warehouse', '/login'];

function isPortalRoute(pathname: string) {
  return PORTAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function SiteNavbar() {
  const pathname = usePathname();
  if (isPortalRoute(pathname)) return null;
  return <Navbar />;
}

export function SiteFooter() {
  const pathname = usePathname();
  if (isPortalRoute(pathname)) return null;
  return (
    <>
      <Footer />
      <ChatWidget />
    </>
  );
}
