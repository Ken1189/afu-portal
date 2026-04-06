# AFU Revenue-Ready Audit — Can We Actually Make Money?

## Mission
You are the head of product and CTO at a YC-backed startup that is launching tomorrow. AFU needs to start making real money from real users this week. Your job is to find every blocker between "user signs up" and "money in the bank account."

NO FIXES — only the brutal, honest list of what's broken and what's missing. Every issue must be classified as REVENUE BLOCKER, USABILITY BLOCKER, or POLISH.

## Part 1 — Pete's Two Critical Concerns

### 1A. "I cannot make changes on the site"
Pete is the CEO. He needs to edit content WITHOUT being a developer. The current state:
- Admin has a `/admin/content` page where Pete edits site_content rows
- Admin has `/admin/settings/homepage-images` for images
- Admin has `/admin/blog` for blog posts
- Admin has many scattered settings pages

**The question:** Is this enough? Or does Pete need INLINE EDITING — the ability to be on the live homepage, click "Edit Hero Title", and change it right there?

Investigate:
1. List EVERY piece of content on the public site that Pete might want to change:
   - Homepage hero title, subtitle, CTA text
   - Service descriptions
   - Stats numbers (when they become real)
   - Country descriptions
   - About page sections
   - Footer text
   - Contact details
   - Email templates
2. For EACH piece, check:
   - Is it editable via the admin portal RIGHT NOW?
   - If yes, where? Is it obvious to find?
   - If no, is it hardcoded in the file?
3. Document the gap. What % of public content is currently hardcoded vs editable?

### 1B. "Circle of death" loading errors
Devon and Pete keep seeing infinite loading spinners.

Investigate:
1. Find every loading spinner in the codebase that depends on auth
2. Check for these anti-patterns:
   - `if (!profile) return spinner` with no timeout
   - `if (loading) return spinner` where loading never gets set to false
   - useEffect that fetches but doesn't set loading=false on error
   - Race conditions between auth context and page-level auth checks
   - Middleware redirecting to /login while page-level checks also try to load
3. Find the SPECIFIC pages that hang. Common suspects:
   - /admin (after login)
   - /admin/inbox
   - /admin/members
   - /supplier/dashboard
   - /investor/dashboard

## Part 2 — Can Each Role Actually Use This?

For each role, walk through the COMPLETE user journey and document every blocker:

### 2A. Supplier Journey (REVENUE CRITICAL)
1. Visitor lands on /supplier/apply or /apply
2. Selects "Supplier" or partner tier
3. Fills application
4. Submits
5. Admin approves
6. Supplier receives credentials email
7. Supplier logs in
8. Supplier lands on /supplier dashboard
9. Supplier completes profile
10. Supplier uploads logo
11. Supplier adds first product
12. Product goes live in marketplace
13. A farmer sees the product
14. Farmer places order
15. Supplier gets notification
16. Supplier fulfills order
17. Supplier gets paid

For EACH step, check:
- Does it work?
- Is anything broken?
- Is anything missing?
- Where does the supplier get stuck?

### 2B. Partner Journey
A "partner" is an organization (NGO, government, university, etc.) that wants to integrate with AFU.

1. Visit /partners page
2. Click "Become a Partner" or similar
3. Fill application
4. Submit
5. Admin reviews
6. Partner gets credentials
7. Partner logs in — WHERE? They use the supplier portal? Their own portal?
8. Partner does what exactly?

The question: **Does the platform actually support partners as a distinct role?** Or is "partner" just a checkbox with no actual functionality?

### 2C. Farmer/Member Journey
1. Apply on /apply (Free tier)
2. Get instant approval (auto)
3. Receive welcome email
4. Login at /login
5. Land on /farm or /dashboard
6. See farm portal
7. Add first crop
8. Browse marketplace
9. Make first purchase
10. Pay via Stripe/MoMo

For each step, check it works.

### 2D. Ambassador Journey
1. Apply on /ambassador/apply
2. Get approved
3. Login
4. Get referral link
5. Share link
6. Someone signs up via link
7. Ambassador sees referral in dashboard
8. Commission is calculated
9. Ambassador requests payout
10. Admin approves payout
11. Money sent to ambassador

### 2E. Investor Journey
1. Visit /investors
2. Click "Express Interest"
3. Fill form
4. Admin contacts them
5. Investor gets credentials
6. Investor logs in
7. Sees portfolio dashboard
8. Reviews opportunities
9. Commits capital — HOW? Is there an actual flow for committing money?

## Part 3 — Money Flow Verification

### 3A. Membership Payment Flow
1. User clicks "Get Started" on Smallholder ($4.99/mo)
2. Stripe checkout opens
3. User pays with card
4. Stripe webhook fires
5. Member record updated to active
6. Welcome email sent
7. Member can access paid features

Test EVERY step. Does the webhook actually update the DB? Is there a payments table record? Does the member's tier actually change?

### 3B. Marketplace Payment Flow
1. Farmer adds item to cart
2. Checkout
3. Pays
4. Money goes to... where? Supplier directly? AFU then to supplier?
5. Supplier sees order
6. Supplier fulfills
7. Supplier gets paid (when?)

Document the full money flow. Is escrow involved? When does money actually move?

### 3C. Loan Disbursement Flow
1. Farmer applies for loan
2. Admin approves
3. Money sent to farmer
4. HOW? Bank transfer? Mobile money? AFU's account?

## Part 4 — Critical "Day 1 Money" Checks

For AFU to make $1 from a real user this week, ALL of these must work:

1. ✅ User can land on /memberships
2. ✅ User clicks "Get Started" on Smallholder
3. ✅ Stripe checkout loads
4. ✅ Test payment goes through (use test card 4242 4242 4242 4242)
5. ✅ User redirected to success page
6. ✅ Stripe webhook fires
7. ✅ Member record created with tier='smallholder'
8. ✅ User receives welcome email with login credentials
9. ✅ User can log in
10. ✅ User lands on their portal
11. ✅ User can access paid features

For each, verify it works END TO END. Document where it breaks.

## Part 5 — Security & Trust Blockers

Things that make Pete look unprofessional or expose the platform:

1. ✅ HTTPS on all pages
2. ✅ No console.log() in production
3. ✅ No exposed API keys
4. ✅ No fake testimonials with stock photos
5. ✅ No fake partnership logos
6. ✅ Honest stats everywhere
7. ✅ No "Lloyd's of London" or other false claims
8. ✅ Privacy policy + terms of service exist
9. ✅ Cookie consent (if EU users)
10. ✅ Email deliverability (SPF, DKIM, DMARC set up)

## Part 6 — Things That Will Break Under Load

1. ✅ Rate limiting on application forms
2. ✅ CAPTCHA on signup
3. ✅ Pagination on admin tables (or will it crash with 1000 members?)
4. ✅ Database indexes on common queries
5. ✅ Image optimization (or are we serving 5MB images?)
6. ✅ CDN for static assets
7. ✅ Error tracking (Sentry?)
8. ✅ Backup strategy

## Part 7 — Pete's "Edit On Page" Question

The big question: should we build inline editing?

**Option A: Keep current admin model**
- All edits via /admin/content, /admin/blog, etc.
- Pete has to remember which admin page edits which content
- Less complex to build, more complex to use

**Option B: Inline editing (like Webflow/Wix)**
- Pete logs in, visits live homepage, sees "Edit" buttons
- Clicks any text/image to edit in place
- Changes save immediately
- Very complex to build, very simple to use
- Needs a "preview" mode vs "edit" mode toggle

**Option C: Hybrid**
- Admin portal stays for complex stuff (members, payments, settings)
- Inline editing ONLY for marketing content (homepage hero, blog posts, etc.)
- Best of both worlds

Investigate which option fits AFU best. Look at what content Pete actually needs to change vs what should stay in admin.

## Output Format

Group findings into these sections:

### REVENUE BLOCKERS (must fix to make money)
- Each item with: Page | Issue | Impact | Fix needed

### USABILITY BLOCKERS (Pete/Devon can't use it)
- Each item

### POLISH (nice to have)
- Each item

### PETE'S INLINE EDITING ANALYSIS
- What he can edit now (list)
- What he can't edit but needs to (list)
- Recommended approach (Option A/B/C above)
- Implementation effort estimate

### CIRCLE OF DEATH FIXES
- Specific files where loading hangs
- Root cause for each
- Fix recommendation

Be brutal. Be honest. Pete needs to make money this week.
