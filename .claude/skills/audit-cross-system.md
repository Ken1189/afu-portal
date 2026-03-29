# Cross-System Flow Auditor

Verify that actions in one portal correctly trigger effects in other portals via the event bus.

## Event Bus Location
`src/lib/events/event-bus.ts` — defines all event types
`src/lib/events/handlers.ts` — registers handlers for each event
`src/lib/events/notifications.ts` — notification dispatch

## Flows to Verify

### 1. Farmer Signs Up → Multiple Systems
- Application submitted → saved to DB ✓
- Admin notified → check /admin/applications loads it
- Admin approves → auth account created → temp password shown
- Welcome email sent → check Resend call
- Welcome SMS sent → check SMS service call
- Ambassador commission tracked → if referral code present
- Profile created → check profiles table insert
- Member created → check members table insert

### 2. Farmer Posts Trade Order → Trading + Admin + Supplier
- Order saved to trade_orders → TRADE_ORDER_CREATED event emitted?
- Admin trade desk shows it → check /admin/trading fetches from trade_orders
- If marketplace → suppliers see it in /supplier/trade
- Supplier quotes → QUOTE_RECEIVED event emitted?
- Quote accepted → TRADE_ORDER_MATCHED event emitted?
- Both parties notified (SMS + in-app)
- Wallet transactions created
- Ledger entries created
- Ambassador commission if applicable

### 3. Warehouse Receives Commodity → Warehouse + Farmer + Trading + Finance
- Receipt created → COMMODITY_RECEIVED event emitted?
- Farmer gets SMS notification
- Farmer sees receipt in /farm/warehouse
- Inventory updated in /warehouse/inventory
- If farmer has trade order → auto-match check triggered
- If receipt financing eligible → farmer notified
- Admin sees it in /admin/warehouse

### 4. Loan Approved → Finance + Farmer + Ledger + Wallet
- Loan status updated → LOAN_APPROVED event emitted?
- Farmer gets SMS + email notification
- Admin can disburse → wallet credited
- Ledger entries: debit loan book, credit farmer wallet
- Repayment schedule created
- Collections system tracks it

### 5. Insurance Trigger → Insurance + Weather + Wallet + Farmer
- Weather check runs → checks all parametric policies
- Threshold breached → INSURANCE_PAYOUT event emitted?
- Admin notified for verification
- Admin verifies → farmer wallet credited automatically
- Farmer gets SMS: payout notification
- Ledger entries created

### 6. Payment Received → Finance + Membership + Ambassador
- Stripe/mobile money payment → PAYMENT_RECEIVED event emitted?
- If membership → tier updated
- If loan repayment → loan balance updated
- If insurance premium → policy activated
- Ambassador commission calculated (10% membership, etc.)
- Ledger entries created

### 7. Carbon Credit Sold → Carbon + Wallet + Investor + Farmer
- Purchase completed → check carbon_purchases insert
- Revenue split: 70% farmer wallet, 20% AFU, 10% buffer
- Farmer notification
- Investor impact page updated
- Ledger entries created

## How to audit
For each flow:
1. Find the API route that handles the trigger action
2. Check if emitEvent() is called with the correct event type
3. Check handlers.ts to see what the handler does
4. Verify each downstream effect has real code (not just comments)
5. Check if notifications actually send (Resend + SMS calls)
6. Check if ledger entries are created
7. Check if wallet transactions are created

## Output format
| Flow | Event Emitted | Handler Exists | SMS Sent | Email Sent | Wallet Updated | Ledger Entry | Issues |
