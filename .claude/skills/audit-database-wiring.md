# Database Wiring Auditor

Verify every page that should read/write from Supabase actually does.

## What to check

### For every page.tsx in src/app/ (excluding static public pages):
1. Does it import createClient or createBrowserClient?
2. Does it have a useEffect with supabase.from() call?
3. Does it have demo/fallback data for when DB is empty?
4. Do forms call supabase.from().insert/update/delete?
5. Are there any setState-only handlers that should save to DB?

### Specific checks:
- Every "Save" button → must call supabase or fetch()
- Every "Delete" button → must call supabase.from().delete()
- Every "Approve/Reject" → must update status in DB
- Every form submission → must POST to API or direct supabase
- Every toggle/switch → must persist (not just local state)

### Tables to verify are used:
Check that these tables are actually queried somewhere in the codebase:
- profiles, members, applications, kyc_verifications
- loans, payments, credit_scores
- farm_plots, farm_activities, livestock, equipment
- insurance_claims, insurance_policies
- trade_orders, trade_quotes, trade_executions, commodity_prices
- warehouse_receipts, quality_inspections, receipt_financing
- carbon_projects, carbon_enrollments, carbon_credits, carbon_purchases
- advertisements, ad_impressions, ad_payments
- ambassadors, commission_entries, referral_links, ambassador_payouts
- wallet_accounts, wallet_transactions, ledger_accounts, ledger_entries
- legal_cases, vet_appointments, vaccination_records
- sms_messages, ussd_sessions, whatsapp_messages
- faq_items, legal_pages, testimonials, research_centres
- managed_partners, announcements, site_content, feature_flags
- admin_permissions, permission_groups
- cooperatives, cooperative_members
- event_log, notifications
- supplier_directory, products, orders
- courses, course_enrollments

## How to audit
1. grep -r "supabase.from\|\.from(" across all page.tsx files
2. For each table above, grep to find which files query it
3. Flag tables with zero queries (unused tables)
4. Flag pages with zero supabase calls (unwired pages)
5. Check every onClick handler for DB calls vs state-only

## Output format
### Unwired Pages (no DB connection):
| Page | Issue | Fix Needed |

### Unused Tables (no queries found):
| Table | Expected Usage | Status |

### State-Only Handlers (save to state but not DB):
| Page | Handler | Should Save To |
