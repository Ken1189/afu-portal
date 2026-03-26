import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNavbar, SiteFooter } from "@/components/SiteChrome";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
  description:
    "Pan-African agriculture development bank and operating platform. Financing, insurance, training, and market access for farmers across 20 countries.",
  keywords: ["agriculture", "Africa", "farming", "financing", "trade finance", "agri-bank", "insurance", "training", "market access"],
  manifest: "/manifest.json",
  themeColor: "#5DB347",
  openGraph: {
    title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
    description:
      "Pan-African agriculture development bank and operating platform. Financing, insurance, training, and market access for farmers across 20 countries.",
    url: "https://afu-portal.vercel.app",
    siteName: "African Farming Union",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
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
      "Pan-African agriculture development bank and operating platform. Financing, insurance, training, and market access for farmers across 20 countries.",
    images: ["https://afu-portal.vercel.app/og-image.png"],
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ServiceWorkerRegister />
          <AnnouncementBanner />
          <SiteNavbar />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
