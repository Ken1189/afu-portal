'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

/**
 * Conditionally renders the site-wide Navbar, Footer, and ChatWidget.
 * Hidden on portal routes (/farm/*, /supplier/*) which have their own layout chrome.
 */

// Public pages that look like portal routes but should show the main navbar
const PUBLIC_PAGES = ['/ambassadors', '/investors'];

// Portal routes that have their own layout chrome (no main navbar)
const PORTAL_PREFIXES = ['/farm', '/supplier', '/admin', '/dashboard', '/investor-login', '/investor', '/ambassador', '/warehouse', '/login'];

function isPortalRoute(pathname: string) {
  // Public pages always show navbar
  if (PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
  // Portal routes hide navbar
  return PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'));
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
