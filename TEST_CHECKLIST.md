# AFU — Manual Test Checklist

Run this after each major sprint ships. Check boxes as you go. Report anything that fails.

---

## 🚪 1. Switch Portal + Auth (~3 min)

- [ ] Hard-refresh admin portal (Ctrl+Shift+R)
- [ ] **Top of sidebar:** see "PORTAL" label with a "Admin Portal ▼" trigger button (green-accented border)
- [ ] Click trigger → dropdown opens DOWNWARD showing 7 portals
- [ ] Click "Farmer Portal" → lands on `/farm` cleanly, no crash
- [ ] From `/farm`, click Switch → back to Admin
- [ ] From `/admin`, click Switch → Supplier Portal → lands on `/supplier`
- [ ] Same for Ambassador, Investor, Warehouse
- [ ] Open DevTools console → confirm `[PortalSwitcher]` log shows your roles + available portals
- [ ] Hit `https://www.africanfarmingunion.org/api/debug/my-role` — confirm `isAdmin: true`

## 👥 2. User CRUD (~5 min)

- [ ] `/admin/members` → see new sidebar has "People" group with Members + Cooperatives
- [ ] Click **"+ Add User"** (top right, green gradient)
- [ ] Fill: test email (use your alt), name "Test User", role "supplier", check "supplier" capability, "Send welcome" ON
- [ ] Submit → toast confirms created
- [ ] Check test inbox → welcome email arrives
- [ ] Welcome email lists "Supplier Portal" + features (Products, Orders, Commissions, etc.)
- [ ] From address: `info@mail.africanfarmingunion.org`
- [ ] Reply-to works (click Reply in your mail client, destination is correct)
- [ ] Back in /admin/members → find test user row → click Mail icon (Resend Welcome) → new email arrives with new password
- [ ] Click Trash icon on test user → confirm "DELETE" → row disappears

## 🎭 3. Role + Capability Manager (~3 min)

- [ ] `/admin/members` → click Manage (UserCog icon) on yourself
- [ ] Modal opens showing your role + capabilities
- [ ] Toggle "ambassador" capability ON → saves instantly
- [ ] Close modal, reload → capability persists
- [ ] Go to `/farm` (your own farmer hub) → ambassador upsell card should now say "You're an AFU Ambassador"
- [ ] Open `/ambassador` → lands on ambassador portal (not bounced)
- [ ] Back in /admin/members → toggle ambassador OFF → confirm it removes

## 🏪 4. Supplier Flow (~4 min)

- [ ] `/admin/suppliers` → table renders, no crash
- [ ] Click any supplier row → detail page renders (no "unexpected error")
- [ ] Click Edit → edit page renders
- [ ] Change a field → save → toast confirms → navigates back
- [ ] `/admin/subscriptions` → page exists, summary cards render
- [ ] `/admin/payouts` → page exists, filter tabs work

## 💳 5. Subscription Billing (~5 min, no purchase)

- [ ] `/supplier/billing` (log in as a supplier or use Manage modal to give yourself supplier role first)
- [ ] Page loads without crash
- [ ] See 3 plan cards: Starter $299, Growth $499, Pro $999
- [ ] Click "Subscribe" on Starter → should redirect to Stripe checkout URL
  - **If redirects to Stripe:** ✅ API works. Don't complete purchase unless you want.
  - **If errors:** copy error, report back — likely missing Stripe price IDs in `supplier_subscription_plans` or env vars
- [ ] Back out — no subscription created yet

## 📝 6. Content Editor (~5 min)

- [ ] `/admin/content-editor` → sidebar shows 25 schemas in 5 groups
- [ ] Click Homepage → form loads on middle panel, iframe preview on right
- [ ] Edit `stats_title` → see iframe update live
- [ ] Click "Save Draft" → status pill shows Saved
- [ ] Click "Publish" → confirm toast
- [ ] Open `/` in a new tab → homepage stats title shows new value
- [ ] Click an image field → "Choose File" button works (upload OR paste URL)
- [ ] Click the Services > Financing schema → form loads with 9-services fields
- [ ] Revert button works

## 🚜 7. Farmer Pages (~4 min)

- [ ] `/farm` → farmer dashboard loads, NO fake blueberry/cassava demo data
- [ ] `/farm/farms` → can add a real farm with photo
- [ ] `/farm/crops` → empty state OR real crops
- [ ] `/farm/journal` → empty state (no fake entries)
- [ ] `/farm/profile` → NEW page — shows your profile, tier progression, capability chips
- [ ] `/farm/carbon` → NEW page — lists 6 practice cards, enroll modal works
- [ ] `/farm/loans` → redirects to `/farm/financing` ✓
- [ ] `/farm/financing` → shows active loans table, apply button
- [ ] `/farm/orders` → empty state "No orders yet"

## 🛍 8. Marketplace (~3 min)

- [ ] `/marketplace` → product grid loads (may be empty if no real products)
- [ ] If products exist, click one → product detail page `/marketplace/[id]` renders
- [ ] Product detail shows image gallery, supplier card, Buy Now button
- [ ] `/marketplace/bad-id-12345` → 404 fallback "Product not found" with link back

## 📨 9. Email + Inbox (~3 min)

- [ ] Submit `/contact` form with a test message
- [ ] Check all 3 inboxes: info@, peter@, devon@africanfarmingunion.org
- [ ] Email arrives from `info@mail.africanfarmingunion.org`
- [ ] Reply-To set to the submitter
- [ ] Go to `/admin/inbox` → new conversation visible
- [ ] Submit `/ambassador/apply` → same checks
- [ ] Submit `/supplier/apply` → same checks

## 🧭 10. Sidebar Navigation Sweep (~2 min)

- [ ] `/admin` → all 7 groups expand/collapse cleanly
- [ ] Click through each link once — each should load OR redirect to login cleanly (no crash)
- [ ] Dashboard: Overview, Analytics, Reports, **Map View**
- [ ] People: Members, Applications, Farmers, Suppliers, Ambassadors, Investors, Partners, **Cooperatives**, KYC, Country Teams
- [ ] Finance: **Financial Overview**, Loans, Payments, Payouts, Subscriptions, Disputes, Trade Finance, **Contracts**, Wallet, Credit Scoring, **Sponsor Tiers**
- [ ] Operations: Farm Operations, Insurance, Carbon Credits, Trading Desk, Exchange, **Exports**, Warehouse, Programs, Crops, Livestock, Equipment, **Training Catalog**, **Legal Services**, **Veterinary**
- [ ] Content: Content Editor, Blog, FAQ, Media Library, Testimonials, Announcements, Training, Legal Pages, Research
- [ ] Marketing: Unified Inbox, Messaging, **Templates Library**, Campaigns, Automations, Advertising, **Ad Review**, Sponsor a Farmer, Jobs Board
- [ ] Settings: System Settings, Roles & Permissions, Audit Log, System Health, Compliance, Event Monitor

## 🚨 Known incomplete / TODO
- [ ] Stripe: 3 monthly products need to be created in Stripe dashboard with price IDs copied to `supplier_subscription_plans.stripe_price_id` (or env vars)
- [ ] Stripe Customer Portal needs to be configured in Stripe dashboard → Settings → Billing → Customer portal
- [ ] /admin/legal-services + /admin/veterinary have demo data (not real DB wired yet)
- [ ] /admin/insurance, /admin/carbon, /admin/investor-relations need proper tabbed navigation to subpages (currently subpages exist but no tab UI)
- [ ] ~60% of what was shipped this session hasn't been clicked by a human — this checklist fixes that

---

## Reporting

When something fails:
1. Note which checkbox
2. Copy any error message from the page OR browser DevTools console
3. Note the URL
4. Drop it in chat so we can fix
