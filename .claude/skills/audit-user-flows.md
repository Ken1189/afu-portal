# User Flow Auditor

Audit every user signup, login, and onboarding flow in the AFU platform.

## What to check

### Signup Flows
1. **Farmer signup** (`/apply`) — does the form save to DB? Does it validate required fields?
2. **Supplier signup** (`/supplier/apply`) — does it save? Is it accessible without auth?
3. **Ambassador signup** (`/ambassador/apply`) — does it save? Is it accessible without auth?
4. **Login page signup** (`/login` Create Account tab) — does signUp() create auth user + profile?
5. **Investor access** — is it admin-created only? No self-signup?

### Login Flows
6. **Login** (`/login`) — does signInWithPassword work? Does it redirect by role?
7. **Investor login** (`/investor-login`) — does it redirect to /investor?
8. **Role-based redirect** — admin→/admin, investor→/investor, supplier→/supplier, ambassador→/ambassador, member→/dashboard?
9. **Password reset** — is there a forgot password flow? Does it send email via Resend?

### Approval Flows
10. **Application approval** (`/admin/applications`) — does Approve create auth account? Show temp password? WhatsApp share button?
11. **KYC approval** (`/admin/kyc`) — does approve/reject update the record?
12. **Supplier approval** — after admin approves, can supplier log in?
13. **Ambassador approval** — after admin approves, can ambassador log in?

### Onboarding
14. **Onboarding page** (`/onboarding`) — does it redirect after completion?
15. **First login experience** — what does a new user see? Is it clear what to do?

### Session & Auth
16. **Protected routes** — check middleware.ts protectedPaths and publicExceptions
17. **Role guards** — each portal layout checks role before rendering
18. **Session timeout** — does it exist?

## How to audit
- Read each file mentioned above
- Check for: createClient/supabase calls, fetch() calls, router.push/replace
- Check for: error handling, loading states, success feedback
- Check for: TODO/placeholder comments
- Report: what works, what's broken, what's missing

## Output format
For each flow, report:
- STATUS: ✅ Working / ⚠️ Partial / ❌ Broken / 🔍 Needs Testing
- FILES: which files are involved
- ISSUES: specific problems found
- FIXES: what needs to change
