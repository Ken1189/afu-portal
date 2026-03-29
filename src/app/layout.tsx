import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNavbar, SiteFooter } from "@/components/SiteChrome";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import CookieConsent from "@/components/CookieConsent";
import SessionTimeout from "@/components/SessionTimeout";
import { JsonLd, AFU_ORGANIZATION, AFU_WEBSITE } from "@/components/JsonLd";
import { WebVitals } from "@/components/WebVitals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// S4.3: Canonical URL base
const SITE_URL = 'https://africanfarmingunion.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
  description:
    "By Farmers, For Farmers. Financing, insurance, legal assistance, veterinary services, training, and market access for farmers across 20 African countries.",
  manifest: "/manifest.json",
  themeColor: "#5DB347",
  // S4.3: Canonical URL
  alternates: {
    canonical: SITE_URL,
    // S4.4: Hreflang tags for multi-country/language targeting
    languages: {
      'en': SITE_URL,
      'fr': `${SITE_URL}/fr`,
      'pt': `${SITE_URL}/pt`,
      'sw': `${SITE_URL}/sw`,
      'ar': `${SITE_URL}/ar`,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
    description:
      "By Farmers, For Farmers. Financing, insurance, legal assistance, veterinary services, training, and market access for farmers across 20 African countries.",
    url: "https://africanfarmingunion.org",
    siteName: "African Farming Union",
    images: [
      {
        url: "https://africanfarmingunion.org/og-image.png",
        width: 1200,
        height: 630,
        alt: "African Farming Union - Pan-African Agriculture Development Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
    description:
      "By Farmers, For Farmers. Financing, insurance, legal assistance, veterinary services, training, and market access for farmers across 20 African countries.",
    images: ["https://africanfarmingunion.org/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AFU Portal",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* S4.8: JSON-LD structured data */}
        <JsonLd data={AFU_ORGANIZATION} />
        <JsonLd data={AFU_WEBSITE} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <WebVitals />
          <ServiceWorkerRegister />
          <AnnouncementBanner />
          <SiteNavbar />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <CookieConsent />
          <SessionTimeout />
        </AuthProvider>
      </body>
    </html>
  );
}
