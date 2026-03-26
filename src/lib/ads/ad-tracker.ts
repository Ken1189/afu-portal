/**
 * Ad Impression & Click Tracker
 *
 * Records ad events with deduplication (1 impression per user per ad per page per hour).
 * Increments counters on the advertisements table.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export class AdTracker {
  constructor(private db: SupabaseClient) {}

  /**
   * Record an impression event
   */
  async trackImpression(input: {
    ad_id: string;
    user_id?: string;
    page: string;
    placement_slot: string;
    country_code?: string;
    device_type?: string;
    ip_hash?: string;
  }): Promise<boolean> {
    // Dedup: check if already tracked in the last hour
    if (input.user_id) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: existing } = await this.db
        .from('ad_impressions')
        .select('id')
        .eq('ad_id', input.ad_id)
        .eq('user_id', input.user_id)
        .eq('page', input.page)
        .eq('placement_slot', input.placement_slot)
        .eq('event_type', 'impression')
        .gte('created_at', oneHourAgo)
        .limit(1);

      if (existing && existing.length > 0) return false; // Already tracked
    }

    // Insert impression record
    await this.db.from('ad_impressions').insert({
      ad_id: input.ad_id,
      user_id: input.user_id || null,
      page: input.page,
      placement_slot: input.placement_slot,
      country_code: input.country_code || null,
      event_type: 'impression',
      device_type: input.device_type || null,
      ip_hash: input.ip_hash || null,
    });

    // Increment impressions counter on the ad
    const { data: ad } = await this.db
      .from('advertisements')
      .select('impressions')
      .eq('id', input.ad_id)
      .single();

    if (ad) {
      await this.db
        .from('advertisements')
        .update({ impressions: (ad.impressions || 0) + 1 })
        .eq('id', input.ad_id);
    }

    return true;
  }

  /**
   * Record a click event
   */
  async trackClick(input: {
    ad_id: string;
    user_id?: string;
    page: string;
    placement_slot: string;
    country_code?: string;
    device_type?: string;
  }): Promise<boolean> {
    // Insert click record
    await this.db.from('ad_impressions').insert({
      ad_id: input.ad_id,
      user_id: input.user_id || null,
      page: input.page,
      placement_slot: input.placement_slot,
      country_code: input.country_code || null,
      event_type: 'click',
      device_type: input.device_type || null,
    });

    // Increment clicks counter
    const { data: ad } = await this.db
      .from('advertisements')
      .select('clicks')
      .eq('id', input.ad_id)
      .single();

    if (ad) {
      await this.db
        .from('advertisements')
        .update({ clicks: (ad.clicks || 0) + 1 })
        .eq('id', input.ad_id);
    }

    return true;
  }

  /**
   * Record a conversion event (farmer clicked ad then took action)
   */
  async trackConversion(input: {
    ad_id: string;
    user_id: string;
    page: string;
    placement_slot: string;
    country_code?: string;
  }): Promise<boolean> {
    await this.db.from('ad_impressions').insert({
      ad_id: input.ad_id,
      user_id: input.user_id,
      page: input.page,
      placement_slot: input.placement_slot,
      country_code: input.country_code || null,
      event_type: 'conversion',
    });

    return true;
  }

  /**
   * Get ad performance stats
   */
  async getAdStats(adId: string): Promise<{
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    by_country: Record<string, { impressions: number; clicks: number }>;
    by_page: Record<string, { impressions: number; clicks: number }>;
  }> {
    const { data: events } = await this.db
      .from('ad_impressions')
      .select('event_type, country_code, page')
      .eq('ad_id', adId);

    const stats = {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0,
      by_country: {} as Record<string, { impressions: number; clicks: number }>,
      by_page: {} as Record<string, { impressions: number; clicks: number }>,
    };

    (events || []).forEach((e: { event_type: string; country_code: string | null; page: string }) => {
      if (e.event_type === 'impression') stats.impressions++;
      if (e.event_type === 'click') stats.clicks++;
      if (e.event_type === 'conversion') stats.conversions++;

      const country = e.country_code || 'unknown';
      if (!stats.by_country[country]) stats.by_country[country] = { impressions: 0, clicks: 0 };
      if (e.event_type === 'impression') stats.by_country[country].impressions++;
      if (e.event_type === 'click') stats.by_country[country].clicks++;

      if (!stats.by_page[e.page]) stats.by_page[e.page] = { impressions: 0, clicks: 0 };
      if (e.event_type === 'impression') stats.by_page[e.page].impressions++;
      if (e.event_type === 'click') stats.by_page[e.page].clicks++;
    });

    stats.ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;

    return stats;
  }
}
