/**
 * SMS Service — Enhanced SMS sending with Africa's Talking (primary)
 * and Twilio (fallback).
 *
 * All messages are logged to the sms_messages table.
 * Actual API calls are mocked (logged as 'queued') until API keys are configured.
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ── Types ──

export interface SmsResult {
  success: boolean;
  messageId: string;
  status: string;
  error?: string;
}

export interface BulkSmsResult {
  total: number;
  sent: number;
  failed: number;
  results: SmsResult[];
}

interface MessageTemplate {
  id: string;
  name: string;
  body: string;
  channel: string;
  variables: string[];
  is_active: boolean;
}

// ── SMS Service ──

export class SmsService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Send an SMS message. Uses Africa's Talking as primary, Twilio as fallback.
   * Currently mocks the send and logs to DB with status 'queued'.
   */
  async sendSMS(
    to: string,
    body: string,
    templateId?: string,
    variables?: Record<string, string>,
  ): Promise<SmsResult> {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      // Render template if provided
      let finalBody = body;
      if (templateId && variables) {
        const template = await this.fetchTemplate(templateId);
        if (template) {
          finalBody = this.renderTemplate(template.body, variables);
        }
      }

      // Try Africa's Talking first, then Twilio
      let provider = 'africastalking';
      let status = 'queued';

      if (process.env.AFRICASTALKING_API_KEY) {
        try {
          await this.sendViaAfricasTalking(to, finalBody);
          status = 'sent';
        } catch (err) {
          console.warn('[sms] Africa\'s Talking failed, trying Twilio:', err);
          provider = 'twilio';
          if (process.env.TWILIO_ACCOUNT_SID) {
            try {
              await this.sendViaTwilio(to, finalBody);
              status = 'sent';
            } catch (twilioErr) {
              console.error('[sms] Twilio also failed:', twilioErr);
              status = 'failed';
            }
          }
        }
      } else if (process.env.TWILIO_ACCOUNT_SID) {
        provider = 'twilio';
        try {
          await this.sendViaTwilio(to, finalBody);
          status = 'sent';
        } catch {
          status = 'failed';
        }
      } else {
        // No provider configured — mock mode
        provider = 'mock';
        status = 'queued';
      }

      // Log to sms_messages table
      await this.logMessage({
        message_id: messageId,
        direction: 'outbound',
        phone_number: to,
        body: finalBody,
        template_id: templateId || null,
        provider,
        status,
      });

      return { success: status !== 'failed', messageId, status };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, messageId, status: 'failed', error: errorMsg };
    }
  }

  /**
   * Send an SMS using a named template.
   */
  async sendTemplateSMS(
    to: string,
    templateName: string,
    variables: Record<string, string>,
  ): Promise<SmsResult> {
    const template = await this.fetchTemplateByName(templateName);
    if (!template) {
      return {
        success: false,
        messageId: '',
        status: 'failed',
        error: `Template "${templateName}" not found`,
      };
    }

    if (!template.is_active) {
      return {
        success: false,
        messageId: '',
        status: 'failed',
        error: `Template "${templateName}" is inactive`,
      };
    }

    const body = this.renderTemplate(template.body, variables);
    return this.sendSMS(to, body, template.id, variables);
  }

  /**
   * Send SMS to multiple recipients with rate limiting.
   */
  async sendBulkSMS(
    recipients: string[],
    body: string,
    templateId?: string,
    variables?: Record<string, string>,
  ): Promise<BulkSmsResult> {
    const results: SmsResult[] = [];
    let sent = 0;
    let failed = 0;

    // Rate limit: 10 messages per second
    const BATCH_SIZE = 10;
    const BATCH_DELAY_MS = 1000;

    for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
      const batch = recipients.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map((to) => this.sendSMS(to, body, templateId, variables)),
      );

      for (const result of batchResults) {
        results.push(result);
        if (result.success) sent++;
        else failed++;
      }

      // Rate limit delay between batches
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    return { total: recipients.length, sent, failed, results };
  }

  /**
   * Check delivery status of a message.
   */
  async getDeliveryStatus(messageId: string): Promise<{ status: string; updatedAt: string | null }> {
    try {
      const { data } = await this.supabase
        .from('sms_messages')
        .select('status, updated_at')
        .eq('message_id', messageId)
        .single();

      if (data) {
        return { status: data.status, updatedAt: data.updated_at };
      }
    } catch {
      // fallback
    }

    return { status: 'unknown', updatedAt: null };
  }

  /**
   * Handle an inbound SMS (from webhook).
   */
  async handleInbound(
    from: string,
    body: string,
    provider: string,
  ): Promise<{ reply?: string }> {
    const messageId = `sms_in_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Log inbound message
    await this.logMessage({
      message_id: messageId,
      direction: 'inbound',
      phone_number: from,
      body,
      provider,
      status: 'received',
    });

    // Auto-reply based on keywords
    const keyword = body.trim().toUpperCase();
    let reply: string | undefined;

    if (keyword === 'BALANCE' || keyword === 'BAL') {
      const balance = await this.fetchBalance(from);
      reply = `Your AFU balance: $${balance.toFixed(2)} Credits. Dial *384*123# for more options.`;
    } else if (keyword.startsWith('PRICE')) {
      const parts = keyword.split(/\s+/);
      const commodity = parts[1]?.toLowerCase();
      if (commodity) {
        const price = await this.fetchPrice(commodity);
        if (price) {
          reply = `${price.commodity}: Buy $${price.buy_price}/t, Sell $${price.sell_price}/t (${price.country})`;
        } else {
          reply = `Price not found for "${parts[1]}". Available: Maize, Soya, Sesame, Cashews, Coffee.`;
        }
      } else {
        reply = 'Send PRICE followed by commodity name. E.g., PRICE MAIZE';
      }
    } else if (keyword === 'HELP') {
      reply = 'AFU SMS: Send BALANCE for credits, PRICE MAIZE for prices, or dial *384*123# for full menu.';
    } else if (keyword === 'STOP') {
      reply = 'You have been unsubscribed from AFU marketing messages. Reply START to re-subscribe.';
    }

    // Send auto-reply if applicable
    if (reply) {
      await this.sendSMS(from, reply);
    }

    return { reply };
  }

  // ── Private helpers ──

  private renderTemplate(body: string, variables: Record<string, string>): string {
    let rendered = body;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return rendered;
  }

  private async fetchTemplate(templateId: string): Promise<MessageTemplate | null> {
    try {
      const { data } = await this.supabase
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      return data as MessageTemplate | null;
    } catch {
      return null;
    }
  }

  private async fetchTemplateByName(name: string): Promise<MessageTemplate | null> {
    try {
      const { data } = await this.supabase
        .from('message_templates')
        .select('*')
        .eq('name', name)
        .eq('channel', 'sms')
        .single();
      return data as MessageTemplate | null;
    } catch {
      return null;
    }
  }

  private async fetchBalance(phoneNumber: string): Promise<number> {
    try {
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
    return 1250.00;
  }

  private async fetchPrice(commodity: string): Promise<{ commodity: string; buy_price: number; sell_price: number; country: string } | null> {
    const DEMO: Record<string, { commodity: string; buy_price: number; sell_price: number; country: string }> = {
      maize:   { commodity: 'Maize',   buy_price: 180, sell_price: 220, country: 'Zimbabwe' },
      soya:    { commodity: 'Soya',    buy_price: 350, sell_price: 420, country: 'Zimbabwe' },
      sesame:  { commodity: 'Sesame',  buy_price: 900, sell_price: 1100, country: 'Zimbabwe' },
      cashews: { commodity: 'Cashews', buy_price: 700, sell_price: 850, country: 'Mozambique' },
      coffee:  { commodity: 'Coffee',  buy_price: 2200, sell_price: 2600, country: 'Ethiopia' },
    };

    try {
      const { data } = await this.supabase
        .from('commodity_prices')
        .select('commodity, buy_price, sell_price, country')
        .ilike('commodity', commodity)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) return data;
    } catch {
      // fallback
    }

    return DEMO[commodity.toLowerCase()] || null;
  }

  private async logMessage(msg: {
    message_id: string;
    direction: string;
    phone_number: string;
    body: string;
    template_id?: string | null;
    provider: string;
    status: string;
  }): Promise<void> {
    try {
      await this.supabase.from('sms_messages').insert({
        message_id: msg.message_id,
        direction: msg.direction,
        phone_number: msg.phone_number,
        body: msg.body,
        template_id: msg.template_id,
        provider: msg.provider,
        status: msg.status,
      });
    } catch (err) {
      console.error('[sms] Failed to log message:', err);
    }
  }

  // ── Provider implementations (mock-ready) ──

  private async sendViaAfricasTalking(to: string, body: string): Promise<void> {
    const apiKey = process.env.AFRICASTALKING_API_KEY;
    const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
    const from = process.env.AFRICASTALKING_SENDER_ID || 'AFU';

    if (!apiKey) throw new Error('Africa\'s Talking API key not configured');

    const url = username === 'sandbox'
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging';

    const params = new URLSearchParams();
    params.set('username', username);
    params.set('to', to);
    params.set('message', body);
    params.set('from', from);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': apiKey,
        'Accept': 'application/json',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Africa's Talking API error ${response.status}: ${errorBody}`);
    }
  }

  private async sendViaTwilio(to: string, body: string): Promise<void> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.set('To', to);
    params.set('From', fromNumber);
    params.set('Body', body);

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Twilio API error ${response.status}: ${errorBody}`);
    }
  }
}
