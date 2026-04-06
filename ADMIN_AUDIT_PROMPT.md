# AFU Admin Portal & Profile Upload — Deep Verification Audit

## Mission
You are a brutally honest QA engineer testing every single feature of the AFU admin portal and every profile upload point across the platform. Your job is to find what works, what's broken, what's half-built, and what's just not wired up at all. NO FIXES — only a comprehensive TODO list.

## Part 1 — PROFILE UPLOAD VERIFICATION (Every Role)

For each role, check the profile/settings page and verify:

### 1.1 Member/Farmer Profile
**File:** `src/app/dashboard/profile/page.tsx`
- [ ] Can upload avatar from device file picker?
- [ ] Can take photo with device camera (mobile)?
- [ ] Does the upload save to Supabase Storage?
- [ ] Does the avatar URL persist to the `profiles` table?
- [ ] Does the new avatar display immediately after upload?
- [ ] Can the user CROP or RESIZE the image?
- [ ] Is there a file size limit?
- [ ] Are there error messages on failure?
- [ ] Does it work on mobile (touch + camera capture)?
- [ ] Can they DELETE/remove the avatar?

### 1.2 Supplier Profile
**File:** `src/app/supplier/profile/page.tsx`
- [ ] Same checks as 1.1
- [ ] Plus: Can upload company logo separately from personal avatar?
- [ ] Can upload certifications/documents?
- [ ] Can upload product photos?

### 1.3 Ambassador Profile
**File:** `src/app/ambassador/settings/page.tsx`
- [ ] Same checks as 1.1
- [ ] Plus: Can upload promotional photos?
- [ ] Can upload bio image?

### 1.4 Investor Profile
**File:** `src/app/investor/settings/page.tsx`
- [ ] Same checks as 1.1
- [ ] Plus: Can upload company logo?

### 1.5 Warehouse Operator
**File:** `src/app/warehouse/page.tsx` or settings
- [ ] Does this role even have a profile page?
- [ ] If yes, can they upload avatar?

### 1.6 Admin Profile
- [ ] Does admin have a profile page where they can edit their own info?
- [ ] Can admin upload their own avatar?

## Part 2 — ADMIN PORTAL FEATURE VERIFICATION (Every Page, Every Button)

For each admin page, document:
- ✅ Loads without error
- ✅ Data fetches from real DB (or notes if hardcoded)
- ✅ All buttons have working onClick handlers
- ✅ Create/Edit/Delete operations actually persist
- ✅ Search/filter works
- ✅ Pagination works (if applicable)
- ✅ Empty state handled gracefully
- ❌ Anything broken or half-built

### 2.1 Dashboard Group
- `/admin` — Main dashboard
- `/admin/analytics` — Analytics
- `/admin/reports` — Reports
- `/admin/inbox/pipeline` — Pipeline

### 2.2 People Group
- `/admin/members` — List, view, edit, suspend, impersonate
- `/admin/applications` — List, approve, reject
- `/admin/farmers` — List, view, edit
- `/admin/suppliers` — List, view, edit, approve
- `/admin/ambassadors` — List, view, edit, payouts
- `/admin/investor-relations` — List, view, edit
- `/admin/partners` — List, CRUD
- `/admin/kyc` — Review, approve, reject
- `/admin/contacts` — List, add, edit

### 2.3 Finance Group
- `/admin/loans` — Loan management
- `/admin/payments` — Payment list
- `/admin/financial` — Financial overview
- `/admin/trade-finance` — Trade finance
- `/admin/wallet` — Wallet management
- `/admin/credit-scores` — Credit scoring
- `/admin/exports` — Exports

### 2.4 Operations Group
- `/admin/farm-overview` — Farm overview
- `/admin/equipment` — Equipment CRUD
- `/admin/insurance` — Insurance
- `/admin/insurance/products` — Insurance products
- `/admin/insurance/parametric` — Parametric
- `/admin/crops` — Crops CRUD
- `/admin/livestock` — Livestock CRUD
- `/admin/warehouse` — Warehouse
- `/admin/cooperatives` — Cooperatives
- `/admin/programs` — Programs
- `/admin/trading` — Trading desk
- `/admin/carbon` — Carbon
- `/admin/carbon/projects`, `/credits`, `/verifications`

### 2.5 Content Group
- `/admin/content` — Site content
  - **CRITICAL:** Can the address actually save?
  - Can videos be uploaded/embedded?
  - Can images be uploaded inline?
- `/admin/blog` — Blog CRUD
  - Can upload featured image from device?
  - Can embed images in body?
  - Save/publish actually works?
- `/admin/media` — Media library
  - Folder navigation works?
  - Upload from device works?
  - Take photo works?
  - Delete works?
- `/admin/faq` — FAQ CRUD
- `/admin/announcements` — Announcements
- `/admin/training` — Training courses
- `/admin/training/catalog` — Training catalog
- `/admin/legal` — Legal pages
- `/admin/testimonials` — Testimonials
  - Can add real testimonials with photos?
- `/admin/settings/videos` — Videos
- `/admin/research` — Research
- `/admin/countries` — Countries
- `/admin/settings/homepage-sections` — Homepage sections
- `/admin/settings/homepage-images` — Homepage images
  - **CRITICAL:** Can admin actually change homepage images from device?

### 2.6 Marketing Group
- `/admin/inbox` — Inbox (messages)
  - Can admin reply to chatbot conversations?
  - Does the reply go back to the visitor in real-time?
- `/admin/messaging` — SMS/WhatsApp
- `/admin/messaging/templates` — Templates
- `/admin/messaging/campaigns` — Campaigns
- `/admin/automations` — Automation rules
- `/admin/advertising/review` — Ad review
- `/admin/sponsor` — Sponsor management
- `/admin/sponsor-tiers` — Sponsor tiers
- `/admin/jobs` — Jobs board CRUD

### 2.7 Settings Group (36 links)
For each settings sub-page, check if it actually saves:
- `/admin/settings` — Main settings
- `/admin/settings/branding` — Brand colors, logos
- `/admin/settings/navigation` — Navbar config
- `/admin/settings/contact-info` — Contact details
- `/admin/settings/membership-tiers` — Tier config
- `/admin/settings/loan-products` — Loan products
- `/admin/settings/onboarding-options` — Onboarding
- `/admin/settings/product-categories` — Categories
- `/admin/settings/commodities` — Commodities
- `/admin/settings/marketplace-rules` — Marketplace rules
- `/admin/settings/ad-packages` — Ad packages
- `/admin/settings/impact-metrics` — Impact metrics
- `/admin/settings/fund-documents` — Fund docs
- `/admin/settings/equipment-catalog` — Equipment
- `/admin/settings/cooperative-rules` — Coop rules
- `/admin/settings/crop-recommendations` — Crops
- `/admin/settings/weather-alerts` — Weather
- `/admin/settings/insurance-pricing` — Insurance pricing
- `/admin/settings/supplier-verification` — Supplier verification
- `/admin/settings/grading-standards` — Grading
- `/admin/settings/trading-rules` — Trading rules
- `/admin/settings/trading-commissions` — Trading commissions
- `/admin/settings/storage-fees` — Storage fees
- `/admin/settings/ltv-ratios` — LTV ratios
- `/admin/settings/market-prices` — Market prices
- `/admin/settings/fresh-tiers` — Fresh tiers
- `/admin/settings/supplier-commissions` — Supplier commissions
- `/admin/users/permissions` — Users & permissions
- `/admin/audit` — Audit trail
- `/admin/system` — System health
- `/admin/notifications` — Notifications
- `/admin/run-migration` — Migrations

## Part 3 — CRITICAL CROSS-CUTTING CHECKS

### 3.1 Image/File Upload Pattern
Check that EVERY admin page that displays images allows uploading from device:
- [ ] Branding logos
- [ ] Homepage images
- [ ] Blog featured images
- [ ] Testimonial photos
- [ ] Partner logos
- [ ] Country images
- [ ] Crop/livestock photos
- [ ] Equipment photos
- [ ] Job listing images
- [ ] Sponsor tier images
- [ ] Ad package images

For each, note: ✅ has device upload | ❌ URL only | ⚠️ field exists but no UI

### 3.2 Save/Persist Operations
For every admin form, verify:
- [ ] Submit button has onClick handler
- [ ] Calls Supabase update/insert
- [ ] Shows success feedback
- [ ] Shows error feedback
- [ ] Refreshes data after save
- [ ] Doesn't silently fail on RLS errors

### 3.3 Navigation Links
- [ ] Every link in admin sidebar points to a page that exists
- [ ] No 404s
- [ ] Active state highlights correct page

### 3.4 Permissions
- [ ] Super admin sees everything
- [ ] Regular admin sees limited
- [ ] Permission checks work without breaking the UI

## Part 4 — PROFILE UPLOAD STANDARD

**For every profile/settings page (member, supplier, ambassador, investor, warehouse, admin), the upload section MUST have:**

1. ✅ Current avatar displayed (or initials fallback)
2. ✅ "Upload from Device" button — opens file picker, accepts image/*
3. ✅ "Take Photo" button — opens device camera (capture="environment")
4. ✅ Optional URL paste for power users
5. ✅ Preview before save
6. ✅ Loading spinner during upload
7. ✅ Success/error toast
8. ✅ Updates Supabase storage AND profiles table
9. ✅ Cache-busting on display (so new image shows immediately)
10. ✅ Works on iOS Safari, Android Chrome, Desktop browsers

## Output Format

Produce a comprehensive TODO list grouped by:

### CRITICAL (blocks usage)
- Things that don't work AT ALL
- Things that error out
- Things that look like they work but silently fail

### HIGH (broken UX)
- Half-built features
- Missing upload buttons
- Buttons with no onClick
- Forms that don't save

### MEDIUM (polish)
- Inconsistent patterns
- Missing feedback
- Could be improved

### LOW (nice-to-have)
- Power user features
- Performance
- Code quality

Each item should have:
- **Page**: file path
- **Issue**: what's wrong
- **Fix**: what needs to happen

NO CODE CHANGES YET. Just the brutal, honest list.
