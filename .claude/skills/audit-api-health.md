# API Health Auditor

Verify every API route is properly structured, authenticated, and handles errors.

## What to check for each API route in src/app/api/

### Structure
1. Does it export the correct HTTP methods (GET, POST, PATCH, DELETE)?
2. Does it return proper JSON responses with status codes?
3. Does it handle errors with try/catch?
4. Does it return meaningful error messages?

### Authentication
5. Protected routes: does it verify the user is authenticated?
6. Admin routes: does it check for admin/super_admin role?
7. Does it use service role key for server-side operations?
8. Are webhooks properly excluded from auth (USSD, SMS, Stripe, WhatsApp)?

### Data Validation
9. Does it validate request body before processing?
10. Does it check required fields?
11. Does it sanitize input?
12. Does it handle missing/malformed data gracefully?

### Database
13. Does it use the correct Supabase client (service role for server, anon for client)?
14. Does it handle Supabase errors?
15. Does it return appropriate data (not too much, not too little)?

### Cross-System
16. Does it emit events via the event bus where appropriate?
17. Does it trigger notifications where appropriate?
18. Does it create ledger entries for financial operations?

## API Routes to audit (all under src/app/api/):
- auth/me
- admin/applications/approve
- admin/loans/approve
- admin/permissions
- admin/settings
- admin/stats, analytics/*
- banking/* (wallet, ledger, monitoring, recon, reporting)
- carbon/* (projects, enroll, practices, credits, purchase, certificate)
- insurance/parametric/* (products, policies, check)
- trading/* (route, [id], quotes)
- warehouse/* (receipts, inspections, financing, receive)
- cooperatives/* (route, [id], [id]/orders)
- payments/* (checkout, webhook/stripe, webhook/mpesa, webhook/mobile)
- ads/* (serve, track, packages)
- sms/* (send, webhook)
- ussd/callback
- whatsapp/webhook
- events/emit
- notifications
- weather/current
- investor/express-interest
- email/send
- referral
- All other routes

## Output format
| Route | Methods | Auth | Validation | Error Handling | Events | Issues |
