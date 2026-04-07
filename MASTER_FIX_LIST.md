# AFU MASTER FIX LIST — All 660+ Findings Consolidated

## Status: SQL Migration 048 ✅ Complete (all 168 tables exist)

---

## TIER 1 — REVENUE/SECURITY EMERGENCIES (Fix Immediately)

### Security Holes
1. **`/api/admin/migrate`** — Arbitrary SQL execution with hardcoded secret. DELETE THIS ROUTE.
2. **`/api/payments/webhook/mpesa`** — No signature verification. Anyone can mark payments completed.
3. **`/api/payments/webhook/mobile`** — Same. Zero auth on mobile money webhook.
4. **`/api/notifications/send`** — Public endpoint, anyone can email anything from official domain.
5. **`/api/payments/notify`** — Public, unauthenticated email blaster.
6. **`/api/admin/applications/approve`** — Returns temp passwords in JSON response AND emails plaintext.
7. **`/api/account/delete`** — No password re-entry. Stolen cookie wipes account permanently.
8. **`/api/admin/impersonate`** — Stored in localStorage, no audit log, XSS = silent role takeover.
9. **`/api/payments/checkout`** — Public endpoint trusts caller-provided userId. Can attribute payments to any victim.
10. **`/api/ai/chat`** — Public, no rate limit, no image size limit. Billing-DoS against Gemini.
11. **`/api/apply/notify`, `/api/contact/send`, `/api/chat/human`** — All unauthenticated, all return success on failure, all interpolate raw HTML.
12. **Rate limiter is in-memory** — per-Lambda-instance, effectively bypassed on Vercel. Replace with Upstash Redis.
13. **Middleware fails OPEN** when env var contains `placeholder` string.
14. **No CSRF protection** on any cookie-authenticated POST/DELETE.
15. **`select('*')` on admin endpoints** — leaks PII columns. Need explicit allowlists.

### Money Flow Bugs (Stop Revenue Loss)
16. **DOUBLE COMMISSION BUG** — `use-orders.ts:115` AND `stripe/route.ts:247` both create commission rows for same order. Suppliers paid 2x.
17. **Stripe webhook NOT deduplicated** — retries cause duplicate members, sponsorships, commissions.
18. **`members.email` column missing** — Stripe webhook lookup fails for 100% of paid memberships (FIXED IN MIGRATION).
19. **`tier` enum mismatch** — `001_initial_schema.sql` has `student/new_enterprise/etc`, code writes `free/enterprise/partner`. Inserts FAIL.
20. **`user_role` enum missing values** — code writes `farmer/ambassador/partner/vet` not in enum. Inserts FAIL.
21. **`loan_status` missing `overdue`** — cron tries to set status='overdue' but enum doesn't have it.
22. **`loans.next_payment_amount` column referenced but doesn't exist** in cron queries.
23. **Loan disbursement is COSMETIC** — no actual money movement. Just a status change.
24. **Carbon sales don't pay farmers** — revenue split calculated but never disbursed.
25. **No idempotency keys** on any payment/wallet/loan/payout write. Network retry = double-charge.
26. **Stock check race condition** in marketplace checkout — oversell guaranteed.
27. **No row-level lock** on supplier total updates — lost-update guaranteed under concurrency.

---

## TIER 2 — UX BLOCKERS (Fix This Week)

### Loading Hangs (Circle of Death)
28. **80%+ of admin pages have try without finally** — any error leaves spinner stuck forever. 56 pages affected.
29. **80%+ of farm pages have same issue** — 38 farm pages affected.
30. **All hooks have unstable supabase reference** in useCallback deps → infinite re-fetch loops.
31. **Profile fetch has no timeout** in auth context (PARTIALLY FIXED).
32. **Farm layout violates Rules of Hooks** — useEffect after conditional return.

### Auto-Authorize Vulnerability (5 portals)
33. **Supplier layout** auto-authorizes on null role / API failure (line 100).
34. **Ambassador layout** same bug.
35. **Investor layout** same bug.
36. **Warehouse layout** same bug.
37. **Farm layout** has 5-second auth timeout that shows content to anonymous users.

### Fake Data Showing as Real
38. **Homepage testimonials** — fake names with stock photos.
39. **Login page** — fake "5,000+ Members", "$50M+ Financed", "SOC 2 compliant" claims.
40. **Sponsor page** — fake farmer profiles (Grace Moyo, Joseph Odhiambo) with fabricated bios.
41. **Donate page** — fake impact stats ("5,000+ women trained").
42. **Partners page** — fake partnerships with AfDB, IFAD, WFP, Stanbic, FNB. Legal exposure.
43. **Investors page** — "$500M Seed Round" claim. Securities-law adjacent.
44. **Jobs page** — 40+ fake job postings with fake salaries.
45. **Marketplace page** — 12 hardcoded fake products (Kalahari Seeds, etc.) with fake ratings.
46. **Carbon page** — 6 fake credits with fabricated Verra serial numbers. FRAUD TERRITORY.
47. **Exchange page** — fake demo listings.
48. **Ambassadors page** — fake ambassador profiles with fabricated bios.
49. **Members detail page** — entire page is mockMembers/mockLoans/mockDocuments/mockActivity arrays.
50. **Admin warehouse page** — 5 tabs of fake data (demoWarehouses, demoReceipts, etc.).
51. **Admin financial page** — mockLoans hardcoded.
52. **Admin exports page** — mockShipments hardcoded.
53. **Admin carbon projects/credits** — demoProjects, demoCredits, demoSales hardcoded.
54. **Supplier products page** — staticProducts hardcoded with `supplierId: 'SUP-001'` shown to ALL suppliers.
55. **Farm crops page** — FALLBACK_FARM_PLOTS shown to new farmers.
56. **Farm livestock page** — 15+ fake animals shown to new farmers.

### "Coming Soon" Stubs (broken features in production)
57. **Investor documents** — alert("No downloads yet") even though it's the main investor value.
58. **Ambassador campaign links** — `alert('Coming soon')` blocks core ambassador feature.
59. **Investor settings password reset** — uses native alert().
60. **Investor opportunities EOI errors** — native alert().
61. **All supplier alerts** — payments, settings, commissions, reviews use native alert().
62. **Reports page** — Schedule tab is `alert('Coming soon')`. PDF/Excel exports are lies (always emit CSV).
63. **Admin payouts** — markPaid uses native alert() for errors.
64. **Credit scores** — recompute action is "Feature coming soon".

### Honesty Issues (false claims)
65. **"Lloyd's of London"** mentioned in chatbot/insurance copy without authorization.
66. **"AFU Bank"** branding without banking license.
67. **Specific insurance premium quotes** ("$12/mo") — regulated activity.
68. **Specific loan APR quotes** ("12-18% APR") — regulated lending.
69. **"200+ veterinarians"** claim without verification.
70. **"500+ vetted suppliers"** claim without verification.
71. **"200+ extension officers"** claim.
72. **"15 export corridors"** claim.
73. **"Toll-free helpline"** for legal — does it exist?
74. **"SOC 2 compliant"** on login page — legally significant.

---

## TIER 3 — DATA INTEGRITY (Fix Before Real Users)

### Schema Mismatches
75. **`membership_tier` enum** — code uses `free/smallholder/commercial/enterprise/partner`, DB enum has `student/new_enterprise/farmer_grower/commercial`. RECONCILE.
76. **`user_role` enum** — DB has `member/supplier/admin/super_admin`, code writes `farmer/ambassador/partner/vet/legal`. ADD VALUES.
77. **`loan_status` enum** — missing `overdue` value referenced by cron.
78. **`application_status` enum** — `bulk/approve` writes `review_notes` column that doesn't exist (it's `notes`).
79. **`members.stripe_subscription_id`** — written by webhook but not in 001 schema.
80. **`suppliers.profile_id`** — referenced by approve route but not in 001.
81. **`commissions.order_item_id`** — used by webhook but not in schema.
82. **`commissions.payout_id` FK** — doesn't exist. Can't link commission → payout.
83. **`loans` has no `currency` column** — multi-currency impossible.
84. **`carbon_purchases` has no `currency`** — same.

### Counter Out-of-Sync (Race Conditions)
85. **suppliers.total_sales/total_orders** — read-modify-write in `use-orders.ts:131`. Lost updates guaranteed.
86. **suppliers.products_count** — same race in `use-products.ts:102`.
87. **suppliers.rating/review_count** — never updated anywhere.
88. **farmer_public_profiles.total_sponsors** — race in webhook line 213.
89. **courses.enrollment_count** — never incremented on enroll.
90. **ambassadors.total_referrals** — only updated for real ambassadors; fallback path bypasses.

### Orphaned Records
91. **order_items** if order insert succeeds and items insert fails (no transaction).
92. **commissions** with no order if order rolled back.
93. **referral_links** with `ambassador_id` pointing to a profile (FK violation).
94. **payments** with no order_id validation.
95. **kyc_documents** without valid member_id.
96. **loan_disbursements** without matching loan row.
97. **sponsorships** where `farmer_profile_id` points to deleted profile.

### Missing Foreign Keys
98. **payouts.processed_by** — bare UUID, not FK to profiles.
99. **audit_log.user_id/entity_id** — no FK constraints.
100. **commissions → payouts** — no FK.
101. **receipt_financing → loans** — no FK.

### Currency Mixing
102. **use-contracts.ts:58** — sums across mixed currencies (KES + USD + NGN as scalar).
103. **All UI hardcodes USD** — multi-country deployment broken.
104. **Warehouse page line 148** — hardcoded USD currency formatter.

### Inconsistent Status Values
105. **Loans use 9 different status values across migrations** — some pages use lowercase, some uppercase.
106. **Orders use OrderStatus type** — different from loans/applications/suppliers.
107. **No shared enum helper** — duplicate string literals everywhere.

---

## TIER 4 — FUNCTIONAL BUGS (Hooks)

### All 24 Supabase Hooks Have These Patterns
108. **createClient() at component scope** — new instance per render, infinite loops.
109. **No AbortController** — setState after unmount warnings.
110. **No request cancellation** — race conditions on rapid navigation.
111. **catch blocks swallow errors** — no error state surfaced to user.
112. **No optimistic updates with rollback** — every mutation requires full refetch.
113. **No SWR/React Query** — duplicate fetches across tabs.
114. **Type assertions hide schema drift** — `as XxxRow[]` everywhere.
115. **Realtime channel collisions** — same channel name across instances.

### Specific Hook Bugs
116. **use-applications.ts approveApplication** — bypasses real API, doesn't generate member_id, no auth user creation, no email.
117. **use-loans.ts** — no member scoping (relies on RLS only).
118. **use-orders.ts createOrder** — non-transactional, race-prone, double commissions.
119. **use-products.ts addProduct** — race on supplier products_count.
120. **use-suppliers.ts approveSupplier** — diverges from real route.
121. **use-courses.ts** — no XP/certificate/tier upgrade logic.
122. **use-equipment.ts useCreateBooking** — no availability check, double-booking possible.
123. **use-farm-plots.ts** — duplicate symbols with use-farm-activities.
124. **use-farmer-references.ts addReference** — silently breaks "one primary" invariant.
125. **use-livestock.ts** — no sold/slaughtered/died lifecycle.

---

## TIER 5 — CROSS-WIRING GAPS (Things That Should Connect)

126. **Application approval → role assignment → portal access** — broken for partners (no /partner portal).
127. **Payment success → tier upgrade → feature unlock → welcome email** — webhook fails on email column missing (FIXED).
128. **Order placement → inventory deduction → supplier notification** — no inventory deduction.
129. **Loan approval → wallet credit → repayment schedule** — no wallet credit, no schedule.
130. **Course completion → tier XP → tier upgrade** — no XP system wired.
131. **Sponsorship payment → farmer profile funding update** — race on counter.
132. **Carbon practice → verification queue → credit issuance** — no verification flow.
133. **Warehouse receipt → collateral → loan eligibility** — no link from receipts to loans table.
134. **Order delivery → review request → reputation update** — no review submission flow.
135. **Failed payment → retry queue → suspension** — no retry logic.
136. **Ambassador referral → signup → payment → commission** — no auto-trigger on signup.
137. **Session timeout → re-auth → state preservation** — no returnTo param, no draft saving.

---

## TIER 6 — MISSING FEATURES

### Critical Missing
138. **Add Farm UI with hectares** — useCreateFarmPlot exists but no UI surfaces it.
139. **Investor commit-capital flow** — no actual investment mechanism.
140. **Receipt-backed loan link** — no UI between warehouse receipt and loans.
141. **Bulk approve applications** — backend exists, no UI button.
142. **Supplier orders bulk fulfill** — no bulk actions.
143. **KYC bulk approve/reject** — most-needed admin action, missing.
144. **Loans bulk disbursement** — missing.
145. **Members bulk operations** — no bulk activate, assign tier, message.

### High Value Missing
146. **CSV export from 49+ admin pages** — only 11 have it.
147. **Pagination on members/loans/applications/farmers/suppliers** — all fetch entire tables.
148. **Search on audit log** — none.
149. **Permission editor UI** — endpoint exists, no UI.
150. **Tier upgrade self-service** — no /dashboard/settings/billing.
151. **Refund flow** — webhook handles it but no admin trigger.
152. **Dispute resolution** — no table, no flow.
153. **Supplier reviews** — table exists, no submission flow.
154. **2FA setup** — none.
155. **Notification preferences** — none.
156. **Language preferences** — DB has locale, not surfaced.
157. **Currency preferences** — none.
158. **GDPR data export** — none (legal requirement).
159. **Account closure** — exists but no confirmation flow.
160. **Email preferences** — none.

---

## TIER 7 — SEO / METADATA / CONTENT

161. **28 of 35 public pages have NO openGraph** — most are 'use client' so can't export metadata.
162. **3 different domains used** in metadata (afu-portal.vercel.app, africanfarmingunion.org, africanfarmersunion.org).
163. **No OG image set** on most pages.
164. **No `loading.tsx` or `error.tsx`** route boundaries anywhere.
165. **Inconsistent country counts** — 5/9/11/20/12 across different pages.
166. **Service pages have no descriptions** — bare metadata.

---

## TIER 8 — CONTENT EDITABILITY (Pete's Concern)

### Hardcoded on Homepage (Pete can't edit)
167. Hero stats (4 stat cards with unsourced claims)
168. Flywheel labels (7 steps)
169. "How It Works" 4 steps
170. AI Feature split section
171. 5 membership tier cards (prices + features)
172. Investor section copy
173. Section eyebrows + titles + subtitles for every major section

### Hardcoded on About Page
174. Hero copy (title, subtitle, 3 paragraphs)
175. Problem cards (5 broken-cycle items)
176. "How We Work" headings
177. "Risk & Control" headings
178. "Giving Back" callout ("10% of profits")
179. Final CTA text

### Hardcoded on All 16 Service Pages
180-195. Each service page is 100% hardcoded — every word, every price, every product description.

### Hardcoded in Footer
196. AFU logo SVG inline
197. Mission paragraph
198. "Phase 1 Countries" list
199. Copyright text
200. Social links
201. Footer columns (Services + Company)

### Hardcoded in Navbar
202. Logo SVG
203. Wordmark "AFU"
204. Mega-dropdown contents
205. "Join AFU" CTA label

---

## TIER 9 — POLISH

206. Hardcoded brand colors duplicated in 200+ places (no design tokens).
207. Inline `<img>` instead of `<Image>` (no optimization).
208. No skip-to-content links (accessibility).
209. No focus traps in modals.
210. No keyboard navigation in custom dropdowns.
211. Forms lose data on validation error.
212. No double-submit prevention on buttons.
213. Loading states flash before populating.
214. Tables without sort.
215. Dates in wrong timezone (UTC shown to local users).
216. Numbers without thousands separators.
217. Currency symbols missing in places.
218. No timezone preferences.
219. No mobile-optimized tables (overflow horizontally).
220. ChatWidget realtime channel may not deliver messages.

---

## EXECUTION PLAN

Given the scope, here's the recommended attack order. We can't fix all 220 in one session — this is realistic prioritization:

### Sprint 1 (next 2-3 hours): Tier 1 — Security + Money Flow
- Delete /api/admin/migrate
- Fix mobile money webhook signatures
- Add auth to notifications/send + payments/notify
- Fix double commission bug
- Add Stripe event deduplication
- Fix idempotency on payments/loans/payouts
- Fix enum mismatches (run a follow-up SQL migration)
- Move impersonation to server-side

### Sprint 2: Tier 2 — Remove ALL Fake Data
- Strip mock arrays from 14+ pages
- Replace with proper empty states
- Remove fake testimonials, partners, jobs, products, carbon credits
- Remove fake stats from homepage/login/about/donate

### Sprint 3: Tier 2 — Fix Auto-Authorize + Missing Auth
- Fix all 5 portal layouts to NOT auto-authorize on null role
- Add server-side admin guard for /api/admin/*
- Fix CSRF on cookie-auth POST/DELETE

### Sprint 4: Tier 3 — Schema Reconciliation
- Generate migration to fix enum mismatches
- Add missing columns
- Add foreign keys
- Add currency columns where missing

### Sprint 5: Tier 4 — Hooks Refactor
- Extract single supabase client instance
- Add try/catch/finally to all hooks
- Add error state to all hooks
- Add cleanup on unmount

### Sprint 6: Tier 5 — Cross-Wiring
- Wire ambassador commission auto-trigger
- Wire loan disbursement → wallet credit
- Wire receipt → loan eligibility
- Wire course completion → XP

### Sprint 7: Tier 6 — Missing Features
- Add Farm UI
- Bulk approve applications/KYC
- CSV exports across admin
- Pagination on big tables

### Sprint 8: Tier 7-9 — Content + Polish
- Make Pete's content editable (homepage stats, service pages)
- SEO metadata
- Polish + accessibility

---

## RECOMMENDATION

**Don't try to fix all 220 in one go.** That's how we end up with regressions and Pete getting frustrated again.

**My honest suggestion:** Sprint 1 + Sprint 2 + Sprint 3 in this session. That fixes the security holes, removes the fake data (most embarrassing thing), and locks down auth properly. The platform will be honest, secure, and money will actually flow.

After that, we tackle Sprint 4-8 in subsequent sessions in a more controlled way.

**Tell me: shall I execute Sprints 1, 2, and 3 right now?**
