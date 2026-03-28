/**
 * USSD Menu Service — Africa's Talking USSD callback handler.
 *
 * State machine for interactive USSD menus allowing farmers to:
 *   - Check commodity prices
 *   - Check AFU wallet balance
 *   - Apply for loans
 *   - Report harvests
 *   - Get weather info
 *
 * Prefixes:
 *   "CON " — continuation menu (session stays open)
 *   "END " — final response (session closes)
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ── Types ──

interface UssdRequest {
  sessionId: string;
  phoneNumber: string;
  text: string;        // e.g. "" | "1" | "1*2" — cumulative user input separated by *
  serviceCode: string; // e.g. *384*123#
}

interface CommodityPrice {
  commodity: string;
  buy_price: number;
  sell_price: number;
  currency: string;
  country: string;
}

// ── Demo / fallback data ──

const DEMO_PRICES: Record<string, CommodityPrice> = {
  maize:   { commodity: 'Maize',   buy_price: 180, sell_price: 220, currency: 'USD', country: 'Zimbabwe' },
  soya:    { commodity: 'Soya',    buy_price: 350, sell_price: 420, currency: 'USD', country: 'Zimbabwe' },
  sesame:  { commodity: 'Sesame',  buy_price: 900, sell_price: 1100, currency: 'USD', country: 'Zimbabwe' },
  cashews: { commodity: 'Cashews', buy_price: 700, sell_price: 850, currency: 'USD', country: 'Mozambique' },
  coffee:  { commodity: 'Coffee',  buy_price: 2200, sell_price: 2600, currency: 'USD', country: 'Ethiopia' },
};

const DEMO_WEATHER: Record<string, string> = {
  default: 'Harare: 28\u00B0C, Partly Cloudy. Rain expected Thursday.',
};

// ── USSD Service ──

export class UssdService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Main entry point for USSD callback.
   * Processes the cumulative text input and returns a USSD response.
   */
  async handleSession(
    sessionId: string,
    phoneNumber: string,
    text: string,
    serviceCode: string,
  ): Promise<string> {
    const req: UssdRequest = { sessionId, phoneNumber, text, serviceCode };

    // Log the session
    await this.logSession(req, 'processing');

    let response: string;

    try {
      const parts = text === '' ? [] : text.split('*');
      response = await this.routeMenu(req, parts);
    } catch (err) {
      console.error('[ussd] Error handling session:', err);
      response = 'END An error occurred. Please try again later.';
    }

    // Update session log with response
    await this.logSession(req, 'completed', response);

    return response;
  }

  // ── Menu Router ──

  private async routeMenu(req: UssdRequest, parts: string[]): Promise<string> {
    if (parts.length === 0) {
      return this.mainMenu();
    }

    const level1 = parts[0];

    switch (level1) {
      case '1': return this.handleCheckPrices(req, parts.slice(1));
      case '2': return this.handleCheckBalance(req);
      case '3': return this.handleApplyLoan(req, parts.slice(1));
      case '4': return this.handleReportHarvest(req, parts.slice(1));
      case '5': return this.handleGetWeather(req);
      case '0': return 'END Thank you for using AFU. Goodbye!';
      default:  return 'CON Invalid option.\n' + this.mainMenuBody();
    }
  }

  // ── Main Menu ──

  private mainMenu(): string {
    return 'CON Welcome to AFU\n' + this.mainMenuBody();
  }

  private mainMenuBody(): string {
    return [
      '1. Check Prices',
      '2. Check Balance',
      '3. Apply for Loan',
      '4. Report Harvest',
      '5. Get Weather',
      '0. Exit',
    ].join('\n');
  }

  // ── 1. Check Prices ──

  private async handleCheckPrices(req: UssdRequest, parts: string[]): Promise<string> {
    if (parts.length === 0) {
      return [
        'CON Select commodity:',
        '1. Maize',
        '2. Soya',
        '3. Sesame',
        '4. Cashews',
        '5. Coffee',
        '0. Back',
      ].join('\n');
    }

    const commodityMap: Record<string, string> = {
      '1': 'maize',
      '2': 'soya',
      '3': 'sesame',
      '4': 'cashews',
      '5': 'coffee',
    };

    if (parts[0] === '0') return this.mainMenu();

    const commodityKey = commodityMap[parts[0]];
    if (!commodityKey) {
      return 'CON Invalid selection.\n1. Maize\n2. Soya\n3. Sesame\n4. Cashews\n5. Coffee\n0. Back';
    }

    const price = await this.fetchPrice(commodityKey);
    return `END ${price.commodity}: Buy $${price.buy_price}/t, Sell $${price.sell_price}/t (${price.country})`;
  }

  private async fetchPrice(commodity: string): Promise<CommodityPrice> {
    try {
      const { data, error } = await this.supabase
        .from('commodity_prices')
        .select('commodity, buy_price, sell_price, currency, country')
        .ilike('commodity', commodity)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return data as CommodityPrice;
      }
    } catch {
      // fallback to demo data
    }

    return DEMO_PRICES[commodity] || DEMO_PRICES['maize'];
  }

  // ── 2. Check Balance ──

  private async handleCheckBalance(req: UssdRequest): Promise<string> {
    const balance = await this.fetchBalance(req.phoneNumber);
    return `END Your balance: $${balance.toFixed(2)} AFU Credits`;
  }

  private async fetchBalance(phoneNumber: string): Promise<number> {
    try {
      // Look up user by phone number
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('phone', phoneNumber)
        .single();

      if (profile) {
        const { data: wallet } = await this.supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', profile.id)
          .single();

        if (wallet) return Number(wallet.balance) || 0;
      }
    } catch {
      // fallback
    }

    // Demo fallback
    return 1250.00;
  }

  // ── 3. Apply for Loan ──

  private async handleApplyLoan(req: UssdRequest, parts: string[]): Promise<string> {
    if (parts.length === 0) {
      return [
        'CON Select loan type:',
        '1. Input Finance',
        '2. Crop Finance',
        '3. Equipment',
        '0. Back',
      ].join('\n');
    }

    if (parts[0] === '0') return this.mainMenu();

    const loanTypes: Record<string, string> = {
      '1': 'Input Finance',
      '2': 'Crop Finance',
      '3': 'Equipment',
    };

    const loanType = loanTypes[parts[0]];
    if (!loanType) {
      return 'CON Invalid selection.\n1. Input Finance\n2. Crop Finance\n3. Equipment\n0. Back';
    }

    const ref = `LON-${Math.floor(1000 + Math.random() * 9000)}`;

    // Log the loan application
    await this.logLoanApplication(req.phoneNumber, loanType, ref);

    return `END Your loan application has been received. Reference: ${ref}. We will SMS you within 24 hours.`;
  }

  private async logLoanApplication(phoneNumber: string, loanType: string, ref: string): Promise<void> {
    try {
      await this.supabase.from('ussd_sessions').update({
        metadata: { loan_type: loanType, reference: ref },
      }).eq('phone_number', phoneNumber).order('created_at', { ascending: false }).limit(1);
    } catch {
      // non-critical
    }
  }

  // ── 4. Report Harvest ──

  private async handleReportHarvest(req: UssdRequest, parts: string[]): Promise<string> {
    if (parts.length === 0) {
      return 'CON Enter commodity (e.g. Maize):';
    }

    if (parts.length === 1) {
      return 'CON Enter quantity in kg:';
    }

    const commodity = parts[0];
    const quantity = parts[1];
    const ref = `HRV-${Math.floor(1000 + Math.random() * 9000)}`;

    // Log the harvest report
    try {
      await this.supabase.from('ussd_sessions').update({
        metadata: { commodity, quantity_kg: quantity, reference: ref },
      }).eq('phone_number', req.phoneNumber).order('created_at', { ascending: false }).limit(1);
    } catch {
      // non-critical
    }

    return `END Harvest recorded! Reference: ${ref}`;
  }

  // ── 5. Get Weather ──

  private async handleGetWeather(req: UssdRequest): Promise<string> {
    const weather = await this.fetchWeather(req.phoneNumber);
    return `END ${weather}`;
  }

  private async fetchWeather(_phoneNumber: string): Promise<string> {
    // In production, this would call a weather API based on the farmer's location
    // For now, return demo data
    return DEMO_WEATHER.default;
  }

  // ── Session Logging ──

  private async logSession(req: UssdRequest, status: string, response?: string): Promise<void> {
    try {
      // Look up user by phone number
      let userId: string | null = null;
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('phone', req.phoneNumber)
        .single();

      if (profile) userId = profile.id;

      if (status === 'processing') {
        await this.supabase.from('ussd_sessions').insert({
          session_id: req.sessionId,
          phone_number: req.phoneNumber,
          service_code: req.serviceCode,
          user_input: req.text,
          user_id: userId,
          status: 'active',
        });
      } else {
        await this.supabase.from('ussd_sessions').update({
          response_text: response,
          status: status,
          user_input: req.text,
          updated_at: new Date().toISOString(),
        }).eq('session_id', req.sessionId);
      }
    } catch (err) {
      console.error('[ussd] Failed to log session:', err);
    }
  }
}
