import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sponsor a Farmer - AFU",
  description:
    "Directly support African farmers through AFU's sponsorship programme. See real farmer profiles, track your impact, and help transform agriculture across Africa.",
  openGraph: {
    title: "Sponsor a Farmer - AFU",
    description:
      "Directly support African farmers through AFU's sponsorship programme. See real farmer profiles, track your impact, and help transform agriculture across Africa.",
    url: "https://afu-portal.vercel.app/sponsor",
    images: [
      {
        url: "https://afu-portal.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sponsor a Farmer through AFU",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor a Farmer - AFU",
    description:
      "Directly support African farmers through AFU's sponsorship programme. See real farmer profiles, track your impact, and help transform agriculture across Africa.",
  },
};

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
