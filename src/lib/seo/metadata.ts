/**
 * S4.5: Reusable metadata helper for all pages.
 * Generates consistent Metadata objects with OG, Twitter, and canonical URLs.
 */

import type { Metadata } from 'next';

const SITE_URL = 'https://africanfarmingunion.org';
const SITE_NAME = 'African Farming Union';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    ...(noIndex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}

/**
 * JSON-LD structured data helper.
 * Returns a script element string for embedding in pages.
 */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ '@context': 'https://schema.org', ...data });
}

/** Organization schema for AFU */
export const ORGANIZATION_JSONLD = {
  '@type': 'Organization',
  name: 'African Farming Union',
  url: SITE_URL,
  logo: `${SITE_URL}/afu-logo.svg`,
  description: "Africa's integrated agriculture development platform providing financing, insurance, training, and market access across 20 countries.",
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@africanfarmingunion.org',
    contactType: 'customer service',
  },
};
