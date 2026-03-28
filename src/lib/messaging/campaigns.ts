/**
 * Campaign Service — Manages message campaigns across SMS, WhatsApp, and USSD.
 *
 * Supports:
 *   - Creating draft campaigns
 *   - Executing campaigns (send to target audience)
 *   - Tracking campaign statistics
 *   - Audience filtering by country, tier, cooperative, role
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { SmsService } from './sms';
import { WhatsAppService } from './whatsapp';

// ── Types ──

export interface TargetAudience {
  country_code?: string[];
  membership_tier?: string[];
  cooperative_id?: string[];
  role?: string[];
}

export interface CampaignInput {
  name: string;
  channel: 'sms' | 'whatsapp' | 'ussd';
  template_id?: string;
  target_audience: TargetAudience;
  scheduled_at?: string;
  body?: string;
}

export interface CampaignStats {
  id: string;
  name: string;
  channel: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

// ── Campaign Service ──

export class CampaignService {
  private supabase: SupabaseClient;
  private smsService: SmsService;
  private whatsAppService: WhatsAppService;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.smsService = new SmsService(supabase);
    this.whatsAppService = new WhatsAppService(supabase);
  }

  /**
   * Create a draft campaign.
   */
  async createCampaign(input: CampaignInput): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('message_campaigns')
        .insert({
          name: input.name,
          channel: input.channel,
          template_id: input.template_id || null,
          target_audience: input.target_audience,
          scheduled_at: input.scheduled_at || null,
          body: input.body || null,
          status: input.scheduled_at ? 'scheduled' : 'draft',
          total_recipients: 0,
          sent_count: 0,
          delivered_count: 0,
          failed_count: 0,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { id: data.id, success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { id: '', success: false, error: errorMsg };
    }
  }

  /**
   * Execute a campaign — fetch audience, render templates, and send messages.
   */
  async sendCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Fetch the campaign
      const { data: campaign, error: fetchErr } = await this.supabase
        .from('message_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (fetchErr || !campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      if (campaign.status === 'sending' || campaign.status === 'completed') {
        return { success: false, error: `Campaign already ${campaign.status}` };
      }

      // Update status to sending
      await this.supabase
        .from('message_campaigns')
        .update({ status: 'sending', started_at: new Date().toISOString() })
        .eq('id', campaignId);

      // Fetch target audience
      const recipients = await this.fetchAudience(campaign.target_audience as TargetAudience);

      // Update total recipients
      await this.supabase
        .from('message_campaigns')
        .update({ total_recipients: recipients.length })
        .eq('id', campaignId);

      if (recipients.length === 0) {
        await this.supabase
          .from('message_campaigns')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', campaignId);
        return { success: true };
      }

      // Fetch template if specified
      let templateBody = campaign.body || '';
      let templateVariables: string[] = [];

      if (campaign.template_id) {
        const { data: template } = await this.supabase
          .from('message_templates')
          .select('body, variables')
          .eq('id', campaign.template_id)
          .single();

        if (template) {
          templateBody = template.body;
          templateVariables = template.variables || [];
        }
      }

      // Send to each recipient
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipients) {
        // Render per-recipient variables
        const variables: Record<string, string> = {};
        for (const v of templateVariables) {
          if (v === 'name' || v === 'full_name') variables[v] = recipient.full_name || 'Member';
          else if (v === 'phone') variables[v] = recipient.phone || '';
          else if (v === 'email') variables[v] = recipient.email || '';
          else if (v === 'member_id') variables[v] = recipient.membership_number || '';
          else if (v === 'tier') variables[v] = recipient.membership_tier || '';
          else variables[v] = '';
        }

        const renderedBody = this.renderTemplate(templateBody, variables);

        try {
          let result;
          if (campaign.channel === 'sms') {
            result = await this.smsService.sendSMS(recipient.phone, renderedBody);
          } else if (campaign.channel === 'whatsapp') {
            result = await this.whatsAppService.sendMessage(recipient.phone, renderedBody);
          } else {
            // USSD campaigns don't send outbound — skip
            sentCount++;
            continue;
          }

          if (result.success) sentCount++;
          else failedCount++;
        } catch {
          failedCount++;
        }

        // Rate limiting: small delay between messages
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Update campaign stats
      await this.supabase
        .from('message_campaigns')
        .update({
          status: 'completed',
          sent_count: sentCount,
          delivered_count: sentCount, // We'll update this as delivery receipts come in
          failed_count: failedCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', campaignId);

      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      // Mark campaign as failed
      await this.supabase
        .from('message_campaigns')
        .update({ status: 'failed' })
        .eq('id', campaignId);

      return { success: false, error: errorMsg };
    }
  }

  /**
   * Get campaign statistics.
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats | null> {
    try {
      const { data } = await this.supabase
        .from('message_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        channel: data.channel,
        status: data.status,
        total_recipients: data.total_recipients || 0,
        sent_count: data.sent_count || 0,
        delivered_count: data.delivered_count || 0,
        failed_count: data.failed_count || 0,
        scheduled_at: data.scheduled_at,
        started_at: data.started_at,
        completed_at: data.completed_at,
      };
    } catch {
      return null;
    }
  }

  /**
   * List all campaigns.
   */
  async listCampaigns(): Promise<CampaignStats[]> {
    try {
      const { data } = await this.supabase
        .from('message_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      return (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        channel: c.channel,
        status: c.status,
        total_recipients: c.total_recipients || 0,
        sent_count: c.sent_count || 0,
        delivered_count: c.delivered_count || 0,
        failed_count: c.failed_count || 0,
        scheduled_at: c.scheduled_at,
        started_at: c.started_at,
        completed_at: c.completed_at,
      }));
    } catch {
      return [];
    }
  }

  // ── Private helpers ──

  private async fetchAudience(
    audience: TargetAudience,
  ): Promise<Array<{ phone: string; full_name: string; email: string; membership_number: string; membership_tier: string }>> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('phone, full_name, email, membership_number, membership_tier')
        .not('phone', 'is', null);

      if (audience.country_code && audience.country_code.length > 0) {
        query = query.in('country_code', audience.country_code);
      }

      if (audience.membership_tier && audience.membership_tier.length > 0) {
        query = query.in('membership_tier', audience.membership_tier);
      }

      if (audience.cooperative_id && audience.cooperative_id.length > 0) {
        query = query.in('cooperative_id', audience.cooperative_id);
      }

      if (audience.role && audience.role.length > 0) {
        query = query.in('role', audience.role);
      }

      const { data } = await query.limit(10000);
      return (data || []).filter((r) => r.phone);
    } catch {
      return [];
    }
  }

  private renderTemplate(body: string, variables: Record<string, string>): string {
    let rendered = body;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return rendered;
  }
}
