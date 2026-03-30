/**
 * AFU Cross-System Event Flow Engine — Central Event Bus
 *
 * Event-driven architecture that connects all portals (warehouse, trading,
 * finance, membership, cooperative) so actions in one system trigger
 * notifications, updates, and workflows across the entire platform.
 *
 * ─── DATABASE MIGRATION ───────────────────────────────────────────────────
 * Run the following SQL in your Supabase SQL Editor to create required tables:
 *
 * CREATE TABLE IF NOT EXISTS event_log (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   event_type TEXT NOT NULL,
 *   actor_id UUID,
 *   target_id UUID,
 *   payload JSONB NOT NULL DEFAULT '{}',
 *   handlers_run TEXT[] DEFAULT '{}',
 *   status TEXT NOT NULL DEFAULT 'processed',
 *   error TEXT,
 *   processing_time_ms INTEGER,
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS idx_event_log_type ON event_log(event_type);
 * CREATE INDEX IF NOT EXISTS idx_event_log_created ON event_log(created_at);
 * CREATE INDEX IF NOT EXISTS idx_event_log_actor ON event_log(actor_id);
 *
 * CREATE TABLE IF NOT EXISTS notifications (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES auth.users(id),
 *   title TEXT NOT NULL,
 *   body TEXT,
 *   type TEXT DEFAULT 'info',
 *   channel TEXT DEFAULT 'in_app',
 *   is_read BOOLEAN DEFAULT FALSE,
 *   action_url TEXT,
 *   metadata JSONB DEFAULT '{}',
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT now()
 * );
 * CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
 * CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
 * ──────────────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

// ── Event Type Definitions ──

export type AFUEvent =
  // Warehouse events
  | { type: 'COMMODITY_RECEIVED'; data: { receiptId: string; farmerId: string | null; commodity: string; quantity: number; grade: string; warehouseId?: string; value: number; farmerName?: string; receiptNumber?: string } }
  | { type: 'COMMODITY_RELEASED'; data: { receiptId: string; farmerId: string; commodity: string; quantity: number } }
  | { type: 'QUALITY_INSPECTION_COMPLETE'; data: { receiptId: string; grade: string; inspectorId: string } }
  // Trade events
  | { type: 'TRADE_ORDER_CREATED'; data: { orderId: string; userId: string; type: string; commodity: string; quantity: number; country?: string; orderNumber?: string } }
  | { type: 'TRADE_ORDER_MATCHED'; data: { orderId: string; buyerId: string; sellerId: string; commodity: string; quantity: number; price: number; quoteId?: string } }
  | { type: 'TRADE_EXECUTED'; data: { executionId: string; buyerId: string; sellerId: string; amount: number; commission: number } }
  | { type: 'QUOTE_RECEIVED'; data: { quoteId: string; orderId: string; supplierId: string; price: number } }
  // Financial events
  | { type: 'PAYMENT_RECEIVED'; data: { paymentId: string; userId: string; amount: number; currency: string; method: string } }
  | { type: 'LOAN_APPROVED'; data: { loanId: string; userId: string; amount: number; loanNumber?: string } }
  | { type: 'LOAN_DISBURSED'; data: { loanId: string; userId: string; amount: number; walletId?: string } }
  | { type: 'LOAN_REPAYMENT'; data: { loanId: string; userId: string; amount: number } }
  | { type: 'INSURANCE_PAYOUT'; data: { policyId: string; userId: string; amount: number; triggerType: string } }
  // Membership events
  | { type: 'MEMBER_JOINED'; data: { userId: string; referralCode?: string } }
  | { type: 'APPLICATION_APPROVED'; data: { applicationId: string; userId: string; tempPassword?: string; email?: string; fullName?: string } }
  | { type: 'KYC_APPROVED'; data: { userId: string } }
  | { type: 'MEMBERSHIP_PAYMENT'; data: { userId: string; tier: string; amount: number } }
  // Cooperative events
  | { type: 'COOPERATIVE_ORDER_CREATED'; data: { orderId: string; cooperativeId: string; commodity: string; quantity: number } }
  | { type: 'COOPERATIVE_MEMBER_JOINED'; data: { cooperativeId: string; userId: string } }
  // S5.8: Onboarding lifecycle events
  | { type: 'ONBOARDING_ABANDONED'; data: { userId: string; step: number; email?: string; fullName?: string } };

export type AFUEventType = AFUEvent['type'];

// ── Handler type ──

export type EventHandler = (event: AFUEvent) => Promise<void>;

// ── Internal registry ──

const handlerRegistry: Map<AFUEventType, EventHandler[]> = new Map();

// ── Supabase admin client for logging ──

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Register a handler for a specific event type ──

export function registerHandler(eventType: AFUEventType, handler: EventHandler): void {
  const existing = handlerRegistry.get(eventType) || [];
  existing.push(handler);
  handlerRegistry.set(eventType, existing);
}

// ── Extract actor and target IDs from event data ──

function extractIds(event: AFUEvent): { actorId?: string; targetId?: string } {
  const data = event.data as Record<string, unknown>;
  const actorId = (data.userId ?? data.inspectorId ?? data.buyerId ?? data.sellerId ?? data.supplierId) as string | undefined;
  const targetId = (data.farmerId ?? data.userId ?? data.receiptId ?? data.orderId ?? data.loanId ?? data.policyId ?? data.applicationId) as string | undefined;
  return { actorId, targetId };
}

// ── Core event emission ──

export async function emitEvent(event: AFUEvent): Promise<{ eventId?: string; error?: string }> {
  const startTime = Date.now();
  const { actorId, targetId } = extractIds(event);
  const handlersRun: string[] = [];
  let status = 'processed';
  let errorMessage: string | undefined;

  try {
    // Get registered handlers for this event type
    const handlers = handlerRegistry.get(event.type) || [];

    // Run handlers in sequence to maintain order
    for (const handler of handlers) {
      const handlerName = handler.name || 'anonymous';
      try {
        await handler(event);
        handlersRun.push(handlerName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[EventBus] Handler "${handlerName}" failed for ${event.type}:`, msg);
        handlersRun.push(`${handlerName}:FAILED`);
        // Don't crash — continue to next handler
      }
    }

    // Check if any handler failed
    if (handlersRun.some((h) => h.endsWith(':FAILED'))) {
      status = 'partial_failure';
    }
  } catch (err) {
    status = 'failed';
    errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[EventBus] Event ${event.type} processing failed:`, errorMessage);
  }

  const processingTimeMs = Date.now() - startTime;

  // Log to event_log table (best-effort, non-blocking)
  let eventId: string | undefined;
  try {
    const supabase = getAdminSupabase();
    const { data: logEntry } = await supabase
      .from('event_log')
      .insert({
        event_type: event.type,
        actor_id: actorId || null,
        target_id: targetId || null,
        payload: event.data,
        handlers_run: handlersRun,
        status,
        error: errorMessage || null,
        processing_time_ms: processingTimeMs,
      })
      .select('id')
      .single();

    eventId = logEntry?.id;
  } catch (logErr) {
    console.error('[EventBus] Failed to log event:', logErr);
  }

  return { eventId, error: errorMessage };
}

// ── Fire-and-forget helper (does not block the caller) ──

export function emitEventAsync(event: AFUEvent): void {
  emitEvent(event).catch((err) => {
    console.error(`[EventBus] Async emit failed for ${event.type}:`, err);
  });
}
