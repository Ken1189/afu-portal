import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNavbar, SiteFooter } from "@/components/SiteChrome";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "African Farming Union (AFU) - Africa's Agriculture Development Platform",
  description:
    "AFU is a vertically integrated agriculture development platform providing financing, inputs, processing, offtake, trade finance, and training across Africa.",
  keywords: ["agriculture", "Africa", "farming", "financing", "trade finance", "agri-bank"],
  manifest: "/manifest.json",
  themeColor: "#2AA198",
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
          <SiteNavbar />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
