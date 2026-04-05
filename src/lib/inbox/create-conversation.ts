import { createClient } from '@supabase/supabase-js';

const svc = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

/**
 * Create a conversation in the unified inbox from any form submission.
 * Call this from every API route that receives user input.
 *
 * Usage:
 *   await createInboxConversation({
 *     name: 'Grace Moyo',
 *     email: 'grace@farm.co',
 *     phone: '+263 77 123 4567',
 *     type: 'member',
 *     subject: 'Membership Application — Smallholder',
 *     message: 'Applied for smallholder tier. Country: Zimbabwe.',
 *     channel: 'form',
 *     tags: ['application', 'smallholder'],
 *   });
 */
export async function createInboxConversation(input: {
  name: string;
  email?: string;
  phone?: string;
  type?: string; // lead, member, supplier, ambassador, investor
  subject: string;
  message: string;
  channel?: string; // form, email, sms, whatsapp
  tags?: string[];
  businessName?: string;
  country?: string;
}) {
  try {
    const db = svc();
    const {
      name, email, phone, type = 'lead', subject, message,
      channel = 'form', tags = [], businessName, country,
    } = input;

    // Check if conversation already exists for this email to avoid duplicates
    if (email) {
      const { data: existing } = await db
        .from('conversations')
        .select('id')
        .eq('contact_email', email)
        .eq('subject', subject)
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Add message to existing conversation instead
        await db.from('conversation_messages').insert({
          conversation_id: existing.id,
          direction: 'inbound',
          channel,
          sender_name: name,
          sender_email: email,
          sender_phone: phone || null,
          body: message,
          status: 'delivered',
        });
        await db.from('conversations').update({
          last_message_at: new Date().toISOString(),
          unread_count: 1,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
        return { id: existing.id, isNew: false };
      }
    }

    // Create new conversation
    const { data: conv } = await db.from('conversations').insert({
      contact_name: name,
      contact_email: email || null,
      contact_phone: phone || null,
      contact_type: type,
      business_name: businessName || null,
      country: country || null,
      subject,
      status: 'open',
      priority: 'normal',
      unread_count: 1,
      last_message_at: new Date().toISOString(),
      tags,
      source: 'form',
    }).select('id').single();

    if (conv) {
      await db.from('conversation_messages').insert({
        conversation_id: conv.id,
        direction: 'inbound',
        channel,
        sender_name: name,
        sender_email: email || null,
        sender_phone: phone || null,
        subject,
        body: message,
        status: 'delivered',
      });
    }

    return { id: conv?.id, isNew: true };
  } catch (err) {
    console.error('createInboxConversation error:', err);
    return { id: null, isNew: false };
  }
}
