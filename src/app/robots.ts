import type { MetadataRoute } from 'next';

// S4.1 + S4.11: Fixed sitemap URL and refined disallow rules
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/dashboard',
          '/farm',
          '/supplier/orders',
          '/supplier/settings',
          '/supplier/analytics',
          '/supplier/commissions',
          '/api',
          '/investor',
          '/ambassador',
          '/warehouse',
          '/demo',
          '/onboarding',
        ],
      },
    ],
    sitemap: 'https://africanfarmingunion.org/sitemap.xml',
  };
}
