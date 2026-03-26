/**
 * Ad Serving Logic
 *
 * Selects the best ad to show for a given page, slot, and country.
 * Simple priority + fairness algorithm — no real-time bidding.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface ServedAd {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_url: string | null;
  placement_type: string;
  supplier_name?: string;
  creative_type: string;
}

export class AdServer {
  constructor(private db: SupabaseClient) {}

  /**
   * Get the best ad for a given context.
   * Returns null if no qualifying ad exists (page renders nothing).
   */
  async getAd(context: {
    page: string;
    slot: string;
    country?: string;
    crop?: string;
    season?: string;
    userId?: string;
  }): Promise<ServedAd | null> {
    const { page, slot, country } = context;

    // Query active ads that match the placement and country
    let query = this.db
      .from('advertisements')
      .select('id, title, description, image_url, target_url, placement_type, creative_type, priority, impressions, budget, spent, supplier_id')
      .eq('status', 'active')
      .contains('placement_pages', [page]);

    // Filter by placement type matching the slot
    const slotToType: Record<string, string> = {
      'banner-top': 'banner',
      'banner-mid': 'banner',
      'sidebar': 'sidebar',
      'featured': 'featured-product',
      'sponsored': 'sponsored-content',
    };
    const placementType = slotToType[slot] || slot;
    query = query.eq('placement_type', placementType);

    // Country targeting: show ads targeting this country or with no country filter
    if (country) {
      query = query.or(`target_countries.cs.{${country}},target_countries.eq.{}`);
    }

    // Only ads with remaining budget
    // Budget > Spent (handled in application layer since Supabase can't do column comparison easily)

    // Order by priority (highest first), then by least impressions (fairness)
    query = query
      .order('priority', { ascending: false })
      .order('impressions', { ascending: true })
      .limit(5);

    const { data: ads, error } = await query;
    if (error || !ads || ads.length === 0) return null;

    // Filter by budget remaining (application layer)
    const qualifying = ads.filter((ad: { budget: number; spent: number }) =>
      Number(ad.budget) > Number(ad.spent)
    );

    if (qualifying.length === 0) return null;

    // Pick the first qualifying ad (already sorted by priority + fairness)
    const ad = qualifying[0];

    return {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      target_url: ad.target_url,
      placement_type: ad.placement_type || placementType,
      creative_type: ad.creative_type || 'image',
    };
  }

  /**
   * Get multiple ads for a page (e.g., featured product grid)
   */
  async getAds(context: {
    page: string;
    slot: string;
    country?: string;
    limit?: number;
  }): Promise<ServedAd[]> {
    const { page, slot, country, limit = 3 } = context;

    const slotToType: Record<string, string> = {
      'banner-top': 'banner',
      'sidebar': 'sidebar',
      'featured': 'featured-product',
      'sponsored': 'sponsored-content',
    };
    const placementType = slotToType[slot] || slot;

    let query = this.db
      .from('advertisements')
      .select('id, title, description, image_url, target_url, placement_type, creative_type, priority, impressions, budget, spent')
      .eq('status', 'active')
      .eq('placement_type', placementType)
      .contains('placement_pages', [page])
      .order('priority', { ascending: false })
      .order('impressions', { ascending: true })
      .limit(limit * 2); // fetch extra in case some are over budget

    if (country) {
      query = query.or(`target_countries.cs.{${country}},target_countries.eq.{}`);
    }

    const { data: ads } = await query;
    if (!ads) return [];

    return ads
      .filter((ad: { budget: number; spent: number }) => Number(ad.budget) > Number(ad.spent))
      .slice(0, limit)
      .map((ad: Record<string, unknown>) => ({
        id: ad.id as string,
        title: ad.title as string,
        description: ad.description as string | null,
        image_url: ad.image_url as string | null,
        target_url: ad.target_url as string | null,
        placement_type: (ad.placement_type as string) || placementType,
        creative_type: (ad.creative_type as string) || 'image',
      }));
  }
}
