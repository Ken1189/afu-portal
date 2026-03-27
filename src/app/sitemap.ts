import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://africanfarmingunion.org';

  const pages: { path: string; priority: number; freq: 'daily' | 'weekly' | 'monthly' }[] = [
    // Core pages
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/about', priority: 0.9, freq: 'monthly' },
    { path: '/contact', priority: 0.8, freq: 'monthly' },
    { path: '/memberships', priority: 0.9, freq: 'weekly' },
    { path: '/apply', priority: 0.9, freq: 'monthly' },
    { path: '/donate', priority: 0.8, freq: 'monthly' },
    { path: '/sponsor', priority: 0.8, freq: 'monthly' },

    // Services
    { path: '/services', priority: 0.8, freq: 'weekly' },
    { path: '/services/finance', priority: 0.7, freq: 'monthly' },
    { path: '/services/finance/afu-bank', priority: 0.7, freq: 'monthly' },
    { path: '/services/finance/asset-finance', priority: 0.6, freq: 'monthly' },
    { path: '/services/finance/crop-dev-loan', priority: 0.6, freq: 'monthly' },
    { path: '/services/finance/harvest-finance', priority: 0.6, freq: 'monthly' },
    { path: '/services/finance/input-finance', priority: 0.6, freq: 'monthly' },
    { path: '/services/finance/mortgages', priority: 0.6, freq: 'monthly' },
    { path: '/services/finance/trade-finance', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance', priority: 0.7, freq: 'monthly' },
    { path: '/services/insurance/asset', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/crop', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/farm', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/livestock', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/medical', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/life', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/equipment', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/pension', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/trade', priority: 0.6, freq: 'monthly' },
    { path: '/services/insurance/vehicle', priority: 0.6, freq: 'monthly' },
    { path: '/services/inputs', priority: 0.7, freq: 'monthly' },
    { path: '/services/machinery', priority: 0.7, freq: 'monthly' },
    { path: '/services/energy', priority: 0.7, freq: 'monthly' },
    { path: '/services/technology', priority: 0.7, freq: 'monthly' },
    { path: '/services/training', priority: 0.7, freq: 'monthly' },
    { path: '/services/offtake', priority: 0.7, freq: 'monthly' },
    { path: '/services/processing', priority: 0.7, freq: 'monthly' },
    { path: '/services/trade-finance', priority: 0.7, freq: 'monthly' },
    { path: '/services/legal-assistance', priority: 0.7, freq: 'monthly' },
    { path: '/services/veterinary', priority: 0.7, freq: 'monthly' },
    { path: '/services/security', priority: 0.6, freq: 'monthly' },
    { path: '/services/advertising', priority: 0.7, freq: 'monthly' },

    // Countries
    { path: '/countries', priority: 0.8, freq: 'weekly' },

    // Community
    { path: '/jobs', priority: 0.8, freq: 'weekly' },
    { path: '/ambassadors', priority: 0.7, freq: 'monthly' },
    { path: '/farms', priority: 0.7, freq: 'monthly' },
    { path: '/partners', priority: 0.7, freq: 'monthly' },
    { path: '/programs', priority: 0.7, freq: 'monthly' },
    { path: '/projects', priority: 0.7, freq: 'monthly' },
    { path: '/young-farmers', priority: 0.7, freq: 'monthly' },

    // Education
    { path: '/education', priority: 0.7, freq: 'weekly' },
    { path: '/education/knowledgebase', priority: 0.7, freq: 'weekly' },
    { path: '/education/knowledgebase/agronomy', priority: 0.6, freq: 'monthly' },
    { path: '/education/knowledgebase/animal', priority: 0.6, freq: 'monthly' },
    { path: '/education/knowledgebase/business', priority: 0.6, freq: 'monthly' },
    { path: '/education/knowledgebase/climate', priority: 0.6, freq: 'monthly' },
    { path: '/education/knowledgebase/finance', priority: 0.6, freq: 'monthly' },
    { path: '/education/knowledgebase/technology', priority: 0.6, freq: 'monthly' },
    { path: '/education/research', priority: 0.6, freq: 'monthly' },
    { path: '/education/projects', priority: 0.6, freq: 'monthly' },

    // Explore
    { path: '/blockchain', priority: 0.5, freq: 'monthly' },
    { path: '/exchange', priority: 0.6, freq: 'monthly' },
    { path: '/fresh', priority: 0.6, freq: 'monthly' },
    { path: '/podcasts', priority: 0.6, freq: 'weekly' },
    { path: '/newsletter', priority: 0.6, freq: 'monthly' },
    { path: '/investors', priority: 0.7, freq: 'monthly' },

    // Legal
    { path: '/legal/terms', priority: 0.4, freq: 'monthly' },
    { path: '/legal/privacy', priority: 0.4, freq: 'monthly' },
  ];

  return pages.map((p) => ({
    url: `${baseUrl}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
