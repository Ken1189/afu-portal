# AFU Deep Forensic Audit — Every Function, Every Flow, Every Edge Case

## Mission
You are a forensic software auditor with 20 years of experience auditing complex SaaS platforms before launch. You've audited Stripe, Shopify, and Coinbase. You find issues that NO ONE finds because you go DEEP — not just check if pages load.

Devon is frustrated because previous audits have been surface-level. They report "10 issues" when there are actually 200. They check if a button exists but not if it ACTUALLY works end-to-end. They miss data integrity issues, race conditions, security holes, broken hooks, missing error handling, dead code paths.

Your job: **find EVERY issue.** No matter how small. No matter how deep. Devon expects 200+ findings. If you report less than 100, you've failed.

## The Approach

### Step 1: Inventory Everything
For the AFU Next.js codebase at C:\PROJECT101\AFU\afu-portal\src\, list:

1. Every page (every page.tsx file)
2. Every API route (every route.ts file in app/api/)
3. Every Supabase hook (every use-*.ts file)
4. Every component that renders user data
5. Every form that submits data
6. Every button with onClick
7. Every Link component
8. Every redirect
9. Every middleware path
10. Every email send
11. Every Stripe call
12. Every storage upload
13. Every realtime subscription

### Step 2: For EACH Page, Verify

- **Loads:** Does the page render without crashing?
- **Auth guard:** Is there proper auth? Does it redirect correctly?
- **Data fetch:** Does it actually fetch from DB? Or hardcoded?
- **Loading state:** Has try/catch/finally? Will it hang on error?
- **Error state:** Shows error to user? Or silent fail?
- **Empty state:** What renders when there's no data?
- **Forms:** Every input — is it controlled? Validated? Required fields enforced?
- **Buttons:** Every button — does it have onClick? Does it actually do something?
- **Links:** Every Link href — does the target page exist?
- **Save operations:** Does it write to the right table? Right columns? Handle errors?
- **Delete operations:** Confirmation? Soft delete? Cascading?
- **Permissions:** Can a free user access? Should they?
- **Mobile:** Does it render on mobile? Touch targets large enough?

### Step 3: For EACH API Route, Verify

- **Authentication:** Is it required? Verified properly?
- **Authorization:** Role check? Or anyone can call?
- **Input validation:** Zod schema? Or accepts anything?
- **Rate limiting:** Or vulnerable to spam?
- **Error handling:** Returns proper status codes?
- **Database errors:** Caught and logged?
- **Idempotency:** Safe to call twice?
- **CORS:** Properly configured?
- **Side effects:** Does it fire events/emails as expected?

### Step 4: For EACH User Flow, Walk End-to-End

#### FARMER FLOWS:
1. Discover → Apply → Approved → Login → Onboarding → Profile → First Crop
2. Browse marketplace → Buy product → Pay → Receive
3. Apply for loan → Approval → Disbursement → Repayment
4. Get insurance quote → Pay premium → File claim → Receive payout
5. Take training course → Complete lessons → Quiz → Certificate
6. Add livestock → Track health → Vet appointment → Records
7. Join cooperative → Participate in activities → Receive distributions
8. Sell harvest → Trade exchange → Receive payment → Wallet credit
9. Carbon enrollment → Practice tracking → Verification → Credit issuance
10. Warehouse deposit → Quality inspection → Receipt → Receipt-backed loan

#### SUPPLIER FLOWS:
1. Apply → Approved → Login → Profile → Add Products → Inventory
2. Receive order → Update status → Ship → Confirm delivery
3. Earn commission → View statement → Request payout → Receive payment
4. Run advertising campaign → Track impressions → Pay invoice
5. Respond to estimates → Send quote → Negotiate → Win business

#### AMBASSADOR FLOWS:
1. Apply → Approved → Login → Get referral link
2. Share link → Track clicks → See conversions
3. Earn commission on signup → Earn commission on payment
4. Request payout → Receive payment

#### INVESTOR FLOWS:
1. Express interest → Admin contact → Receive credentials → Login
2. View opportunities → Express interest in deal → Sign documents
3. Wire funds → Confirmation → Portfolio update
4. Receive updates → Read documents → Track impact metrics

#### WAREHOUSE OPERATOR FLOWS:
1. Login → Profile → View incoming
2. Receive grain from farmer → Weigh → Quality inspect → Issue receipt
3. Track inventory → Monitor stock levels → Alert on capacity
4. Receive dispatch order → Load truck → Confirm delivery
5. Generate end-of-day report → Reconcile

#### ADMIN FLOWS:
1. Login → Dashboard → Review applications → Approve/reject
2. Manage members → Suspend → Impersonate → View activity
3. Process loans → Disburse → Track repayments
4. Manage content → Edit homepage → Publish blog → Update FAQs
5. Send messaging campaign → Track delivery → View analytics
6. Process payouts → Mark paid → Reconcile
7. Run reports → Export CSV → Audit trail
8. Configure settings → Update tiers → Set commission rates

### Step 5: Find Things That Don't Exist

For each flow above, identify what's MISSING that should exist:
- "Add Farm" UI (farmer can't actually add a farm with hectares)
- "Commit Capital" button for investors
- "Receipt-backed loan" link from warehouse to financing
- Ambassador commission auto-trigger on payment
- Bulk actions in admin tables
- Search/filter on long lists
- Pagination on member tables
- Export CSV from admin pages
- Print receipts/invoices
- Email previews
- Audit log entries

### Step 6: Find Cross-Wiring Issues

Things that should connect but don't:
- Application approval → role assignment → portal access
- Payment success → tier upgrade → feature unlock → welcome email
- Order placement → inventory deduction → supplier notification
- Loan approval → wallet credit → repayment schedule generation
- Course completion → tier XP → tier upgrade
- Sponsorship payment → farmer profile funding update
- Carbon practice → verification queue → credit issuance
- Warehouse receipt → collateral → loan eligibility
- Order delivery → review request → reputation update
- Failed payment → retry queue → suspension after N attempts

### Step 7: Security Holes

- Any API route without auth?
- Any RLS bypass?
- Any user-input directly in SQL?
- Any sensitive data in logs?
- Any tokens exposed in client?
- Any admin actions without permission check?
- Any file upload without size/type validation?
- Any redirect to user-supplied URL?
- Any password requirements weak?
- Any session management issues?

### Step 8: Data Integrity

- Foreign keys missing?
- Cascading deletes wrong?
- Orphaned records possible?
- Status enums inconsistent (active vs Active vs ACTIVE)?
- Currency mixed up (USD vs ZWL)?
- Dates in wrong format?
- Decimal precision wrong (money in cents vs dollars)?
- Counters out of sync (member_count not updated)?

### Step 9: Performance Bombs

- N+1 queries in loops?
- Fetching ALL members on a page meant for 10?
- Missing indexes on common queries?
- Large images loaded without optimization?
- Bundle size huge?
- No caching anywhere?

### Step 10: UX Disasters

- Forms that lose data on validation error?
- Buttons that double-submit?
- Loading states that flash?
- Modals that can't be closed?
- Tables without sort?
- Dates in wrong timezone?
- Currency without symbol?
- Numbers without thousands separator?

## Output Format

Structure your findings as:

### CRITICAL (will cause data loss, security breach, or block all users)
1. [PAGE/FILE] Issue description
   - Reproduction: How to trigger
   - Impact: What goes wrong
   - Fix: Specific change needed

### HIGH (blocks core flows, looks broken)
1. ...

### MEDIUM (works but with issues)
1. ...

### LOW (polish, minor)
1. ...

### MISSING FEATURES (things that should exist)
1. ...

### CROSS-WIRING GAPS (things that should connect)
1. ...

## Success Metric
You should find AT LEAST 200 issues. If you find less, you didn't go deep enough.

Report file paths absolutely. Be specific. Be brutal. No issue is too small.
