/**
 * AFU Event Handlers
 *
 * Registers handlers for every event type in the system. Each handler
 * dispatches notifications, updates wallets/ledgers, and triggers
 * cross-system workflows.
 *
 * Handlers are registered at module load time so they are available
 * as soon as the event bus is imported.
 */

import { createClient } from '@supabase/supabase-js';
import { registerHandler, type AFUEvent } from './event-bus';
import { notifyUser, notifyAdmins } from './notifications';

// ── Admin supabase ──

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Helper: safe profile lookup ──

async function getProfile(userId: string) {
  const supabase = getAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, role, preferences')
    .eq('id', userId)
    .single();
  return data;
}

// ── Helper: log ambassador commission (best-effort) ──

async function logAmbassadorCommission(
  referredUserId: string,
  amount: number,
  reason: string,
): Promise<void> {
  const supabase = getAdmin();
  try {
    // Look up if user was referred
    const { data: referral } = await supabase
      .from('referrals')
      .select('ambassador_id, referral_code')
      .eq('referred_user_id', referredUserId)
      .single();

    if (!referral) return;

    const commission = amount * 0.1; // 10% commission
    await supabase.from('ambassador_commissions').insert({
      ambassador_id: referral.ambassador_id,
      referred_user_id: referredUserId,
      amount: commission,
      reason,
      status: 'pending',
    });
  } catch {
    // Commission logging is non-critical
  }
}

// ── Helper: create ledger entry (double-entry) ──

async function createLedgerEntry(
  debitAccount: string,
  creditAccount: string,
  amount: number,
  description: string,
  referenceId?: string,
): Promise<void> {
  const supabase = getAdmin();
  try {
    await supabase.from('ledger_entries').insert([
      {
        account: debitAccount,
        entry_type: 'debit',
        amount,
        description,
        reference_id: referenceId || null,
      },
      {
        account: creditAccount,
        entry_type: 'credit',
        amount,
        description,
        reference_id: referenceId || null,
      },
    ]);
  } catch {
    // Ledger table may not exist — non-critical
  }
}

// ══════════════════════════════════════════════════════════════════════════
// WAREHOUSE EVENTS
// ══════════════════════════════════════════════════════════════════════════

registerHandler('COMMODITY_RECEIVED', async (event: AFUEvent) => {
  if (event.type !== 'COMMODITY_RECEIVED') return;
  const { receiptId, farmerId, commodity, quantity, grade, value, farmerName, receiptNumber } = event.data;

  // 1. Send SMS to farmer
  if (farmerId) {
    await notifyUser(
      farmerId,
      'Commodity Received',
      `Your ${commodity} (${quantity}kg, Grade ${grade}) received at warehouse. Receipt: ${receiptNumber || receiptId}`,
      'all',
      { type: 'warehouse', actionUrl: '/dashboard/warehouse' },
    );
  }

  // 2. Notify admin
  await notifyAdmins(
    'New Commodity Received',
    `${quantity}kg ${commodity} from ${farmerName || 'Unknown farmer'} — Grade ${grade}, Value: $${value.toFixed(2)}`,
    { type: 'warehouse', actionUrl: '/admin/warehouse' },
  );

  // 3. Check if farmer has active trade order for this commodity
  if (farmerId) {
    const supabase = getAdmin();
    const { data: orders } = await supabase
      .from('trade_orders')
      .select('id, order_number, commodity')
      .eq('user_id', farmerId)
      .eq('commodity', commodity)
      .in('status', ['open', 'marketplace'])
      .limit(1);

    if (orders && orders.length > 0) {
      await notifyUser(
        farmerId,
        'Trade Order Match',
        `Your deposited ${commodity} can fulfil your trade order #${orders[0].order_number || orders[0].id}`,
        'in_app',
        { type: 'trade', actionUrl: '/dashboard/trading' },
      );
    }
  }

  // 4. Log ambassador commission if farmer was referred
  if (farmerId) {
    await logAmbassadorCommission(farmerId, value, `Commodity received: ${commodity}`);
  }
});

registerHandler('COMMODITY_RELEASED', async (event: AFUEvent) => {
  if (event.type !== 'COMMODITY_RELEASED') return;
  const { farmerId, commodity, quantity } = event.data;

  if (farmerId) {
    await notifyUser(
      farmerId,
      'Commodity Released',
      `Your ${commodity} (${quantity}kg) has been released from the warehouse.`,
      'all',
      { type: 'warehouse', actionUrl: '/dashboard/warehouse' },
    );
  }

  await notifyAdmins(
    'Commodity Released',
    `${quantity}kg ${commodity} released from warehouse`,
    { type: 'warehouse', actionUrl: '/admin/warehouse' },
  );
});

registerHandler('QUALITY_INSPECTION_COMPLETE', async (event: AFUEvent) => {
  if (event.type !== 'QUALITY_INSPECTION_COMPLETE') return;
  const { receiptId, grade } = event.data;

  await notifyAdmins(
    'Quality Inspection Complete',
    `Inspection for receipt ${receiptId}: Grade ${grade}`,
    { type: 'warehouse', actionUrl: '/admin/warehouse' },
  );
});

// ══════════════════════════════════════════════════════════════════════════
// TRADE EVENTS
// ══════════════════════════════════════════════════════════════════════════

registerHandler('TRADE_ORDER_CREATED', async (event: AFUEvent) => {
  if (event.type !== 'TRADE_ORDER_CREATED') return;
  const { userId, type, commodity, quantity, country, orderNumber } = event.data;

  await notifyUser(
    userId,
    'Trade Order Created',
    `Your ${type} order for ${quantity}kg ${commodity}${country ? ` (${country})` : ''} has been created. Order: ${orderNumber || 'Pending'}`,
    'in_app',
    { type: 'trade', actionUrl: '/dashboard/trading' },
  );

  await notifyAdmins(
    'New Trade Order',
    `${type.toUpperCase()} order: ${quantity}kg ${commodity}${country ? ` — ${country}` : ''}`,
    { type: 'trade', actionUrl: '/admin/trading' },
  );
});

registerHandler('TRADE_ORDER_MATCHED', async (event: AFUEvent) => {
  if (event.type !== 'TRADE_ORDER_MATCHED') return;
  const { buyerId, sellerId, commodity, quantity, price } = event.data;

  // Notify buyer
  await notifyUser(
    buyerId,
    'Trade Order Matched',
    `Your order for ${commodity} has been matched! Price: $${price}/unit`,
    'all',
    { type: 'trade', actionUrl: '/dashboard/trading' },
  );

  // Notify seller
  await notifyUser(
    sellerId,
    'Buyer Found',
    `A buyer has been found for your ${commodity}! ${quantity}kg at $${price}/unit`,
    'all',
    { type: 'trade', actionUrl: '/dashboard/trading' },
  );

  // Notify admin
  await notifyAdmins(
    'Trade Match',
    `${commodity} ${quantity}kg matched between buyer and seller at $${price}/unit`,
    { type: 'trade', actionUrl: '/admin/trading' },
  );
});

registerHandler('TRADE_EXECUTED', async (event: AFUEvent) => {
  if (event.type !== 'TRADE_EXECUTED') return;
  const { executionId, buyerId, sellerId, amount, commission } = event.data;

  // Notify both parties via SMS + in-app
  await notifyUser(
    buyerId,
    'Trade Executed',
    `Your trade has been executed. Amount: $${amount.toFixed(2)}. Transaction ID: ${executionId}`,
    'all',
    { type: 'trade', actionUrl: '/dashboard/trading' },
  );

  await notifyUser(
    sellerId,
    'Trade Executed — Payment Incoming',
    `Your trade has been executed. Amount: $${(amount - commission).toFixed(2)} credited to your wallet.`,
    'all',
    { type: 'trade', actionUrl: '/dashboard/wallet' },
  );

  // Create ledger entries (double-entry)
  await createLedgerEntry(
    `buyer:${buyerId}`,
    `seller:${sellerId}`,
    amount - commission,
    `Trade execution ${executionId}`,
    executionId,
  );
  await createLedgerEntry(
    `buyer:${buyerId}`,
    'afu:commission_revenue',
    commission,
    `Trade commission for ${executionId}`,
    executionId,
  );

  // Log ambassador commission for both parties
  await logAmbassadorCommission(buyerId, amount, `Trade executed: ${executionId}`);
  await logAmbassadorCommission(sellerId, amount, `Trade executed: ${executionId}`);
});

registerHandler('QUOTE_RECEIVED', async (event: AFUEvent) => {
  if (event.type !== 'QUOTE_RECEIVED') return;
  const { orderId, supplierId, price } = event.data;

  // Look up order owner to notify them
  const supabase = getAdmin();
  const { data: order } = await supabase
    .from('trade_orders')
    .select('user_id, order_number, commodity')
    .eq('id', orderId)
    .single();

  if (order) {
    await notifyUser(
      order.user_id,
      'New Quote Received',
      `A supplier has quoted $${price}/unit for your ${order.commodity} order #${order.order_number || orderId}`,
      'in_app',
      { type: 'trade', actionUrl: `/dashboard/trading/${orderId}` },
    );
  }

  const supplier = await getProfile(supplierId);
  await notifyAdmins(
    'Trade Quote Submitted',
    `${supplier?.full_name || 'Supplier'} quoted $${price}/unit for order ${order?.order_number || orderId}`,
    { type: 'trade', actionUrl: '/admin/trading' },
  );
});

// ══════════════════════════════════════════════════════════════════════════
// FINANCIAL EVENTS
// ══════════════════════════════════════════════════════════════════════════

registerHandler('PAYMENT_RECEIVED', async (event: AFUEvent) => {
  if (event.type !== 'PAYMENT_RECEIVED') return;
  const { paymentId, userId, amount, currency, method } = event.data;

  // Send receipt
  await notifyUser(
    userId,
    'Payment Received',
    `Your payment of ${currency} ${amount.toFixed(2)} via ${method} has been received. Ref: ${paymentId}`,
    'all',
    { type: 'payment', actionUrl: '/dashboard/payments' },
  );

  // Ledger entry
  await createLedgerEntry(
    `member:${userId}`,
    'afu:revenue',
    amount,
    `Payment received: ${paymentId}`,
    paymentId,
  );
});

registerHandler('LOAN_APPROVED', async (event: AFUEvent) => {
  if (event.type !== 'LOAN_APPROVED') return;
  const { loanId, userId, amount, loanNumber } = event.data;

  await notifyUser(
    userId,
    'Loan Approved!',
    `Your loan of $${amount.toFixed(2)} has been approved! Ref: ${loanNumber || loanId}`,
    'all',
    { type: 'loan', actionUrl: '/dashboard/financing' },
  );

  await notifyAdmins(
    'Loan Approved',
    `Loan ${loanNumber || loanId} for $${amount.toFixed(2)} has been approved`,
    { type: 'loan', actionUrl: '/admin/loans' },
  );
});

registerHandler('LOAN_DISBURSED', async (event: AFUEvent) => {
  if (event.type !== 'LOAN_DISBURSED') return;
  const { loanId, userId, amount } = event.data;

  await notifyUser(
    userId,
    'Loan Disbursed',
    `Loan of $${amount.toFixed(2)} has been deposited to your AFU wallet.`,
    'all',
    { type: 'loan', actionUrl: '/dashboard/wallet' },
  );

  // Credit farmer's wallet (best-effort)
  const supabase = getAdmin();
  try {
    await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_description: `Loan disbursement: ${loanId}`,
    });
  } catch {
    // Wallet RPC may not exist — non-critical
  }

  // Ledger entry
  await createLedgerEntry(
    'afu:loans_receivable',
    `member_wallet:${userId}`,
    amount,
    `Loan disbursement: ${loanId}`,
    loanId,
  );
});

registerHandler('LOAN_REPAYMENT', async (event: AFUEvent) => {
  if (event.type !== 'LOAN_REPAYMENT') return;
  const { loanId, userId, amount } = event.data;

  await notifyUser(
    userId,
    'Loan Repayment Received',
    `Your repayment of $${amount.toFixed(2)} has been recorded for loan ${loanId}.`,
    'in_app',
    { type: 'loan', actionUrl: '/dashboard/financing' },
  );

  await createLedgerEntry(
    `member:${userId}`,
    'afu:loans_receivable',
    amount,
    `Loan repayment: ${loanId}`,
    loanId,
  );
});

registerHandler('INSURANCE_PAYOUT', async (event: AFUEvent) => {
  if (event.type !== 'INSURANCE_PAYOUT') return;
  const { policyId, userId, amount, triggerType } = event.data;

  // Credit farmer's wallet (best-effort)
  const supabase = getAdmin();
  try {
    await supabase.rpc('credit_wallet', {
      p_user_id: userId,
      p_amount: amount,
      p_description: `Insurance payout: ${triggerType} (Policy: ${policyId})`,
    });
  } catch {
    // Wallet RPC may not exist
  }

  await notifyUser(
    userId,
    'Insurance Payout',
    `Insurance payout of $${amount.toFixed(2)} for ${triggerType}. Funds are in your wallet.`,
    'all',
    { type: 'insurance', actionUrl: '/dashboard/wallet' },
  );

  await notifyAdmins(
    'Insurance Payout Triggered',
    `Payout of $${amount.toFixed(2)} for ${triggerType} — Policy: ${policyId}`,
    { type: 'insurance', actionUrl: '/admin/insurance/parametric' },
  );

  await createLedgerEntry(
    'afu:insurance_reserves',
    `member_wallet:${userId}`,
    amount,
    `Insurance payout: ${triggerType} (${policyId})`,
    policyId,
  );
});

// ══════════════════════════════════════════════════════════════════════════
// MEMBERSHIP EVENTS
// ══════════════════════════════════════════════════════════════════════════

registerHandler('APPLICATION_APPROVED', async (event: AFUEvent) => {
  if (event.type !== 'APPLICATION_APPROVED') return;
  const { userId, tempPassword, email, fullName } = event.data;

  // Send welcome email with temp password
  if (email) {
    await notifyUser(
      userId,
      'Welcome to African Farming Union!',
      `Welcome${fullName ? `, ${fullName}` : ''}! Your account is ready. Login at africanfarmingunion.org/login with your email and temporary password: ${tempPassword}`,
      'email',
    );
  }

  // SMS welcome
  await notifyUser(
    userId,
    'Welcome to AFU',
    `Welcome to AFU! Your account is ready. Login at africanfarmingunion.org/login`,
    'sms',
  );

  // In-app welcome notification
  await notifyUser(
    userId,
    'Welcome to African Farming Union!',
    'Your membership application has been approved. Explore your dashboard to get started.',
    'in_app',
    { type: 'system', actionUrl: '/dashboard' },
  );

  // If referral code — credit ambassador
  const supabase = getAdmin();
  try {
    const { data: app } = await supabase
      .from('membership_applications')
      .select('referral_code')
      .eq('profile_id', userId)
      .single();

    if (app?.referral_code) {
      const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('user_id')
        .eq('referral_code', app.referral_code)
        .single();

      if (ambassador) {
        await supabase.from('ambassador_commissions').insert({
          ambassador_id: ambassador.user_id,
          referred_user_id: userId,
          amount: 0, // Commission calculated on first payment
          reason: 'New member referral',
          status: 'pending',
        });
      }
    }
  } catch {
    // Referral processing is non-critical
  }
});

registerHandler('MEMBER_JOINED', async (event: AFUEvent) => {
  if (event.type !== 'MEMBER_JOINED') return;
  const { userId } = event.data;

  await notifyAdmins(
    'New Member Joined',
    `A new member has joined the platform.`,
    { type: 'system', actionUrl: '/admin/members' },
  );

  await notifyUser(
    userId,
    'Welcome to AFU!',
    'Thank you for joining the African Farming Union. Your journey to empowered agriculture starts now!',
    'in_app',
    { type: 'system', actionUrl: '/dashboard' },
  );
});

registerHandler('KYC_APPROVED', async (event: AFUEvent) => {
  if (event.type !== 'KYC_APPROVED') return;
  const { userId } = event.data;

  await notifyUser(
    userId,
    'KYC Verification Approved',
    'Your identity verification is complete. You now have full access to all AFU services.',
    'all',
    { type: 'system', actionUrl: '/dashboard' },
  );
});

registerHandler('MEMBERSHIP_PAYMENT', async (event: AFUEvent) => {
  if (event.type !== 'MEMBERSHIP_PAYMENT') return;
  const { userId, tier, amount } = event.data;

  // Credit AFU revenue
  await createLedgerEntry(
    `member:${userId}`,
    'afu:membership_revenue',
    amount,
    `Membership payment: ${tier}`,
  );

  // If referred, calculate 10% commission
  await logAmbassadorCommission(userId, amount, `Membership payment: ${tier}`);

  // Send receipt
  await notifyUser(
    userId,
    'Membership Payment Received',
    `Thank you! Your ${tier} membership payment of $${amount.toFixed(2)} has been received.`,
    'all',
    { type: 'payment', actionUrl: '/dashboard/membership' },
  );
});

// ══════════════════════════════════════════════════════════════════════════
// COOPERATIVE EVENTS
// ══════════════════════════════════════════════════════════════════════════

registerHandler('COOPERATIVE_ORDER_CREATED', async (event: AFUEvent) => {
  if (event.type !== 'COOPERATIVE_ORDER_CREATED') return;
  const { orderId, cooperativeId, commodity, quantity } = event.data;

  await notifyAdmins(
    'Cooperative Bulk Order',
    `New cooperative order: ${quantity}kg ${commodity} (Cooperative: ${cooperativeId})`,
    { type: 'cooperative', actionUrl: '/admin/cooperatives' },
  );

  // Notify cooperative members
  const supabase = getAdmin();
  try {
    const { data: members } = await supabase
      .from('cooperative_members')
      .select('user_id')
      .eq('cooperative_id', cooperativeId);

    if (members) {
      await Promise.allSettled(
        members.map((m) =>
          notifyUser(
            m.user_id,
            'Cooperative Order Created',
            `A bulk order for ${quantity}kg ${commodity} has been placed by your cooperative.`,
            'in_app',
            { type: 'cooperative', actionUrl: '/dashboard/cooperatives' },
          ),
        ),
      );
    }
  } catch {
    // Non-critical
  }
});

registerHandler('COOPERATIVE_MEMBER_JOINED', async (event: AFUEvent) => {
  if (event.type !== 'COOPERATIVE_MEMBER_JOINED') return;
  const { cooperativeId, userId } = event.data;

  // Get cooperative name
  const supabase = getAdmin();
  const { data: coop } = await supabase
    .from('cooperatives')
    .select('name')
    .eq('id', cooperativeId)
    .single();

  await notifyUser(
    userId,
    'Cooperative Membership',
    `You have joined ${coop?.name || 'a cooperative'}. Welcome!`,
    'in_app',
    { type: 'cooperative', actionUrl: '/dashboard/cooperatives' },
  );

  await notifyAdmins(
    'Cooperative Member Added',
    `New member joined cooperative: ${coop?.name || cooperativeId}`,
    { type: 'cooperative', actionUrl: '/admin/cooperatives' },
  );
});
