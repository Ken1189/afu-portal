/**
 * Dynamic metadata helper: reads admin-edited page metadata from
 * site_config.page_metadata and merges with createPageMetadata defaults.
 *
 * Pete edits in /admin/content (SEO tab) → next page load reflects the edit.
 */

import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { createPageMetadata } from './metadata';

interface MetaConfig {
  title?: string;
  description?: string;
  og_image?: string;
}

interface FallbackConfig {
  title: string;
  description: string;
  noIndex?: boolean;
}

const FALLBACK_METADATA: Record<string, FallbackConfig> = {
  '/': {
    title: "Africa's Integrated Agriculture Platform",
    description:
      'Financing, insurance, inputs, training, and market access for farmers across Africa. Join AFU and grow your farming business.',
  },
  '/about': {
    title: 'About AFU',
    description:
      "Learn about African Farming Union's mission to transform African agriculture through integrated services and technology.",
  },
  '/services': {
    title: 'Services',
    description:
      'Comprehensive agricultural services: financing, insurance, training, market access, and more.',
  },
  '/login': {
    title: 'Login',
    description: 'Sign in to your African Farming Union member portal.',
    noIndex: true,
  },
  '/apply': {
    title: 'Apply for Membership',
    description:
      'Join the African Farming Union. Apply for membership to access financing, insurance, inputs, training, and markets.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Get in touch with the African Farming Union team. We respond to inquiries from farmers, partners, and supporters across Africa.',
  },
  '/blog': {
    title: 'Blog',
    description:
      'News, insights, and stories from the African Farming Union and farmers across the continent.',
  },
  '/faq': {
    title: 'Frequently Asked Questions',
    description:
      'Answers to common questions about AFU membership, services, and how we support African farmers.',
  },
  '/sponsor': {
    title: 'Sponsor a Farmer',
    description:
      'Directly sponsor an African farmer. Your contribution funds inputs, training, and market access.',
  },
  '/donate': {
    title: 'Donate',
    description:
      'Support African Farming Union and help transform agriculture across Africa. Every donation makes a difference.',
  },
  '/partners': {
    title: 'Partners',
    description:
      'Meet the organizations partnering with the African Farming Union to support farmers across Africa.',
  },
  '/jobs': {
    title: 'Jobs',
    description:
      'Career opportunities at the African Farming Union and across our partner network.',
  },
  '/marketplace': {
    title: 'Marketplace',
    description:
      'Buy and sell agricultural inputs, produce, and services on the AFU marketplace.',
  },
  '/carbon': {
    title: 'Carbon Credits',
    description:
      'Earn carbon credits through sustainable farming practices with the African Farming Union.',
  },
  '/exchange': {
    title: 'Commodity Exchange',
    description:
      'Trade agricultural commodities on the AFU exchange — fair prices, transparent markets.',
  },
  '/newsletter': {
    title: 'Newsletter',
    description:
      'Subscribe to the African Farming Union newsletter for updates, insights, and farmer stories.',
  },
  '/memberships': {
    title: 'Memberships',
    description:
      'Explore AFU membership tiers and benefits for farmers, cooperatives, and partners.',
  },
  '/ambassadors': {
    title: 'Ambassadors',
    description:
      'Become an AFU Ambassador and help spread the mission of transforming African agriculture.',
  },
};

export async function getDynamicMetadata(route: string): Promise<Metadata> {
  const fallback =
    FALLBACK_METADATA[route] || FALLBACK_METADATA['/'];

  let title = fallback.title;
  let description = fallback.description;
  let ogImage: string | undefined;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', 'page_metadata')
        .maybeSingle();

      if (data?.value) {
        const allMeta = data.value as Record<string, MetaConfig>;
        const routeMeta = allMeta[route];
        if (routeMeta) {
          if (routeMeta.title) title = routeMeta.title;
          if (routeMeta.description) description = routeMeta.description;
          if (routeMeta.og_image) ogImage = routeMeta.og_image;
        }
      }
    }
  } catch (err) {
    console.error('[getDynamicMetadata] Error:', err);
  }

  return createPageMetadata({
    title,
    description,
    path: route,
    ogImage,
    noIndex: fallback.noIndex,
  });
}
