import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/farm', '/supplier', '/api'],
      },
    ],
    sitemap: 'https://afu-portal.vercel.app/sitemap.xml',
  };
}
