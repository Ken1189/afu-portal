import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://afu-portal.vercel.app';

  const staticPages = [
    '',
    '/about',
    '/services',
    '/memberships',
    '/countries',
    '/contact',
    '/apply',
    '/sponsor',
    '/partners',
    '/projects',
    '/podcasts',
    '/education',
    '/education/knowledgebase',
    '/education/research',
    '/education/projects',
    '/login',
    // Service sub-pages
    '/services/finance',
    '/services/insurance',
    '/services/technology',
    '/services/energy',
    '/services/machinery',
    '/services/training',
    '/services/inputs',
    '/services/offtake',
    '/services/processing',
    '/services/trade-finance',
    '/services/financing',
  ];

  return staticPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1 : 0.8,
  }));
}
