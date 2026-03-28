/**
 * Parametric Insurance Engine
 *
 * Core trigger-checking logic for AFU's parametric insurance products.
 * Fetches weather data, evaluates trigger conditions, creates trigger
 * records, and initiates payouts via the wallet/ledger banking services.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { WeatherService, type DailyWeatherData } from './weather';
import { WalletService } from '@/lib/banking/wallet';

// ── Types ────────────────────────────────────────────────────────────────

export interface ParametricProduct {
  id: string;
  name: string;
  type: string; // 'drought' | 'flood' | 'heat' | 'frost' | 'excess_rain' | 'low_rainfall'
  description: string | null;
  country: string | null;
  region: string | null;
  trigger_conditions: {
    measurement: string;
    comparison: string;
    threshold: number;
    period_days?: number;
  };
  payout_structure: {
    type: string; // 'fixed' | 'linear' | 'tiered'
    base_payout_percent?: number;
    max_payout_percent?: number;
    tiers?: { deviation: number; payout_percent: number }[];
  };
  premium_rate: number;
  min_coverage: number;
  max_coverage: number;
  season_start: string | null;
  season_end: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParametricPolicy {
  id: string;
  user_id: string;
  product_id: string;
  policy_number: string;
  status: string; // 'active' | 'expired' | 'triggered' | 'cancelled'
  coverage_amount: number;
  premium_paid: number;
  latitude: number;
  longitude: number;
  farm_plot_id: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  product?: ParametricProduct;
}

export interface ParametricTrigger {
  id: string;
  policy_id: string;
  trigger_date: string;
  measured_value: number;
  threshold_value: number;
  payout_amount: number;
  payout_status: string; // 'pending' | 'paid' | 'failed'
  weather_data: Record<string, unknown> | null;
  transaction_id: string | null;
  created_at: string;
}

export interface CheckResult {
  checked: number;
  triggered: number;
  payouts_initiated: number;
  details: {
    policyId: string;
    policyNumber: string;
    triggered: boolean;
    measuredValue: number;
    thresholdValue: number;
    payoutAmount?: number;
  }[];
}

// ── Engine ────────────────────────────────────────────────────────────────

export class ParametricEngine {
  private weather: WeatherService;
  private wallet: WalletService;

  constructor(private db: SupabaseClient) {
    this.weather = new WeatherService(db);
    this.wallet = new WalletService(db);
  }

  /**
   * Generate a unique policy number: PAR-YYYYMMDD-XXXX
   */
  generatePolicyNumber(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PAR-${date}-${rand}`;
  }

  /**
   * Check ALL active parametric policies for trigger conditions.
   */
  async checkAllPolicies(): Promise<CheckResult> {
    // Fetch all active policies with their product details
    const { data: policies, error } = await this.db
      .from('parametric_policies')
      .select('*, product:parametric_products(*)')
      .eq('status', 'active');

    if (error || !policies) {
      console.error('Failed to fetch policies:', error);
      return { checked: 0, triggered: 0, payouts_initiated: 0, details: [] };
    }

    const result: CheckResult = {
      checked: policies.length,
      triggered: 0,
      payouts_initiated: 0,
      details: [],
    };

    // Group policies by location to avoid duplicate weather fetches
    const locationMap = new Map<string, typeof policies>();
    for (const policy of policies) {
      const key = `${Math.round(policy.latitude * 100) / 100},${Math.round(policy.longitude * 100) / 100}`;
      if (!locationMap.has(key)) locationMap.set(key, []);
      locationMap.get(key)!.push(policy);
    }

    // Fetch weather for each unique location and check policies
    const weatherCache = new Map<string, DailyWeatherData[]>();

    for (const [key, locationPolicies] of locationMap) {
      const [lat, lng] = key.split(',').map(Number);

      for (const policy of locationPolicies) {
        try {
          const detail = await this.checkSinglePolicyInternal(
            policy,
            lat,
            lng,
            weatherCache
          );
          result.details.push(detail);
          if (detail.triggered) {
            result.triggered++;
            if (detail.payoutAmount && detail.payoutAmount > 0) {
              result.payouts_initiated++;
            }
          }
        } catch (err) {
          console.error(`Error checking policy ${policy.id}:`, err);
          result.details.push({
            policyId: policy.id,
            policyNumber: policy.policy_number,
            triggered: false,
            measuredValue: 0,
            thresholdValue: 0,
          });
        }
      }
    }

    return result;
  }

  /**
   * Check a single policy by ID.
   */
  async checkSinglePolicy(policyId: string): Promise<CheckResult['details'][0]> {
    const { data: policy, error } = await this.db
      .from('parametric_policies')
      .select('*, product:parametric_products(*)')
      .eq('id', policyId)
      .single();

    if (error || !policy) throw new Error('Policy not found');

    return this.checkSinglePolicyInternal(
      policy,
      policy.latitude,
      policy.longitude,
      new Map()
    );
  }

  /**
   * Internal: check a single policy with weather cache sharing.
   */
  private async checkSinglePolicyInternal(
    policy: ParametricPolicy & { product: ParametricProduct },
    lat: number,
    lng: number,
    weatherCache: Map<string, DailyWeatherData[]>
  ): Promise<CheckResult['details'][0]> {
    const product = policy.product;
    if (!product || !product.trigger_conditions) {
      return {
        policyId: policy.id,
        policyNumber: policy.policy_number,
        triggered: false,
        measuredValue: 0,
        thresholdValue: 0,
      };
    }

    const trigger = product.trigger_conditions;
    const periodDays = trigger.period_days || 7;

    // Get weather data for the check period
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - periodDays * 86400000)
      .toISOString()
      .split('T')[0];
    const cacheKey = `${lat},${lng},${startDate},${endDate}`;

    let weatherData = weatherCache.get(cacheKey);
    if (!weatherData) {
      weatherData = await this.weather.getHistoricalWeather(lat, lng, startDate, endDate);
      weatherCache.set(cacheKey, weatherData);

      // Cache each day's data in DB
      for (const day of weatherData) {
        await this.weather.cacheWeatherData(lat, lng, day.date, day);
      }
    }

    // Check trigger condition
    const check = this.weather.checkThreshold(weatherData, trigger);

    if (check.triggered) {
      // Calculate and process payout
      const payoutAmount = this.calculatePayout(product, policy, check.measuredValue);

      // Check for existing trigger on this date to avoid duplicates
      const today = new Date().toISOString().split('T')[0];
      const { data: existingTrigger } = await this.db
        .from('parametric_triggers')
        .select('id')
        .eq('policy_id', policy.id)
        .eq('trigger_date', today)
        .single();

      if (!existingTrigger) {
        // Create trigger record
        const { data: triggerRecord, error: trigError } = await this.db
          .from('parametric_triggers')
          .insert({
            policy_id: policy.id,
            trigger_date: today,
            measured_value: check.measuredValue,
            threshold_value: check.thresholdValue,
            payout_amount: payoutAmount,
            payout_status: 'pending',
            weather_data: {
              period_start: startDate,
              period_end: endDate,
              description: check.description,
              data_points: weatherData.length,
            },
          })
          .select()
          .single();

        if (triggerRecord && !trigError) {
          // Attempt payout
          try {
            await this.processPayout(triggerRecord.id);
          } catch (err) {
            console.error(`Payout failed for trigger ${triggerRecord.id}:`, err);
          }
        }
      }

      return {
        policyId: policy.id,
        policyNumber: policy.policy_number,
        triggered: true,
        measuredValue: check.measuredValue,
        thresholdValue: check.thresholdValue,
        payoutAmount,
      };
    }

    return {
      policyId: policy.id,
      policyNumber: policy.policy_number,
      triggered: false,
      measuredValue: check.measuredValue,
      thresholdValue: check.thresholdValue,
    };
  }

  /**
   * Calculate payout amount based on product payout_structure.
   */
  calculatePayout(
    product: ParametricProduct,
    policy: ParametricPolicy,
    measuredValue: number
  ): number {
    const structure = product.payout_structure || { type: 'fixed', base_payout_percent: 100 };
    const coverage = policy.coverage_amount;
    const threshold = product.trigger_conditions.threshold;

    switch (structure.type) {
      case 'fixed': {
        // Fixed percentage of coverage
        const percent = (structure.base_payout_percent ?? 100) / 100;
        return Math.round(coverage * percent * 100) / 100;
      }

      case 'linear': {
        // Linear scaling based on deviation from threshold
        const basePercent = (structure.base_payout_percent ?? 50) / 100;
        const maxPercent = (structure.max_payout_percent ?? 100) / 100;
        const deviation = Math.abs(measuredValue - threshold) / threshold;
        const scale = Math.min(1, deviation);
        const percent = basePercent + scale * (maxPercent - basePercent);
        return Math.round(coverage * percent * 100) / 100;
      }

      case 'tiered': {
        // Tiered payout based on deviation brackets
        if (!structure.tiers || structure.tiers.length === 0) {
          return Math.round(coverage * 0.5 * 100) / 100;
        }
        const deviation = Math.abs(measuredValue - threshold) / threshold;
        let matchedTier = structure.tiers[0];
        for (const tier of structure.tiers) {
          if (deviation >= tier.deviation) matchedTier = tier;
        }
        return Math.round(coverage * (matchedTier.payout_percent / 100) * 100) / 100;
      }

      default:
        return Math.round(coverage * 0.5 * 100) / 100;
    }
  }

  /**
   * Process a payout for a trigger record.
   * Creates a wallet deposit for the policy holder.
   */
  async processPayout(triggerId: string): Promise<void> {
    // Get trigger with policy and user details
    const { data: trigger, error } = await this.db
      .from('parametric_triggers')
      .select('*, policy:parametric_policies(*, product:parametric_products(name))')
      .eq('id', triggerId)
      .single();

    if (error || !trigger) throw new Error('Trigger not found');
    if (trigger.payout_status === 'paid') throw new Error('Already paid');

    const policy = trigger.policy;
    if (!policy) throw new Error('Policy not found for trigger');

    try {
      // Find user's wallet
      const wallets = await this.wallet.getUserWallets(policy.user_id);
      const wallet = wallets.find((w) => w.status === 'active');

      if (wallet) {
        // Deposit payout into user's wallet
        await this.wallet.deposit({
          wallet_id: wallet.id,
          amount: trigger.payout_amount,
          description: `Parametric insurance payout - ${policy.product?.name || 'Policy'} (${policy.policy_number})`,
          reference: `PAR-PAYOUT-${triggerId}`,
        });

        // Update trigger status
        await this.db
          .from('parametric_triggers')
          .update({
            payout_status: 'paid',
            transaction_id: `PAR-PAYOUT-${triggerId}`,
          })
          .eq('id', triggerId);
      } else {
        // No wallet found — mark as failed
        await this.db
          .from('parametric_triggers')
          .update({ payout_status: 'failed' })
          .eq('id', triggerId);
        throw new Error('No active wallet found for user');
      }
    } catch (err) {
      // Mark as failed
      await this.db
        .from('parametric_triggers')
        .update({ payout_status: 'failed' })
        .eq('id', triggerId);
      throw err;
    }
  }
}
