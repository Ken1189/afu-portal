# Payment & Financial Flow Auditor

Verify every money-related flow works end to end — from payment initiation to ledger entry.

## Payment Flows to Verify

### Stripe Flows
1. Membership checkout → Stripe session created → webhook confirms → tier updated → ledger entry
2. Donation checkout → Stripe session → webhook → donor record → ledger
3. Carbon credit purchase → Stripe session → webhook → credit status updated → farmer payout → ledger
4. Ad payment → Stripe session → webhook → ad activated → ledger
5. Marketplace checkout → Stripe session → webhook → order confirmed → supplier notified → ledger

### Mobile Money Flows
6. M-Pesa deposit to wallet → callback → wallet credited → ledger
7. EcoCash deposit → callback → wallet credited → ledger
8. MTN MoMo deposit → callback → wallet credited → ledger
9. Wallet withdrawal → mobile money payout → wallet debited → ledger

### Internal Flows
10. Loan disbursement → admin action → wallet credited → ledger (debit loan book, credit wallet)
11. Loan repayment → wallet debit → ledger (debit wallet, credit loan book)
12. Insurance premium → wallet debit → ledger (debit wallet, credit insurance pool)
13. Insurance payout → wallet credit → ledger (debit insurance pool, credit wallet)
14. Trade execution → escrow → settlement → ledger entries for both parties
15. Warehouse receipt financing → loan created → wallet credited → ledger
16. Carbon credit revenue split → 70% farmer wallet + 20% AFU revenue + 10% buffer → 3 ledger entries
17. Ambassador commission → pending → approved → payout → ledger
18. Ad impression charges → advertiser account debited → AFU revenue credited

## Ledger Verification
19. Every wallet credit has a corresponding debit somewhere
20. Every wallet debit has a corresponding credit somewhere
21. System balances sum to zero (double-entry check)
22. Ledger entries have transaction_id linking paired entries
23. Balance_after is calculated correctly

## What to check in code
For each flow:
- Find the API route or action handler
- Trace the money: what tables are updated?
- Is a ledger entry created? (check for ledger_entries insert)
- Is the wallet balance updated? (check for wallet_accounts update)
- Is there error handling if payment fails mid-flow?
- Is there a rollback mechanism?

## Output format
### Working Flows:
| # | Flow | Payment | Wallet | Ledger | Status |

### Broken/Missing Flows:
| # | Flow | Issue | Fix Needed |

### Ledger Integrity:
- Total debits: $X
- Total credits: $X
- Balance: $X (should be 0)
- Orphaned entries: X

### Recommendations:
For each broken flow, provide exact fix with file and code.
