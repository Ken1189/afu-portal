# AFU Mega Audit — Run All Auditors Simultaneously

Launch ALL audit skills in parallel using the Agent tool. Each agent runs independently, finds issues, and provides specific fix recommendations.

## How to use
Tell Claude: "Run the mega audit" or "mega audit"

## What it launches (5 parallel agents, each covering multiple skills):

### Agent 1: User & Onboarding Audit
Covers: audit-user-flows.md + audit-onboarding-retention.md
- Every signup, login, approval, onboarding flow
- First visit experience, empty states, retention hooks
- Drop-off points, missing welcome messages

### Agent 2: Portal & UX Audit
Covers: audit-portals.md + audit-ux-consistency.md
- Every page in all 9 portals — buttons, forms, data
- Design consistency, mobile responsive, accessibility
- Component patterns, empty states, loading states

### Agent 3: Systems & Data Audit
Covers: audit-cross-system.md + audit-database-wiring.md + audit-data-integrity.md
- Events fire correctly, notifications send, wallets update
- Every page connects to DB, every table is used
- Schema health, RLS, indexes, migration integrity

### Agent 4: Quality & Content Audit
Covers: audit-missing-items.md + audit-content-quality.md + audit-email-notifications.md
- TODOs, stubs, broken links, placeholders, security issues
- Public page content accuracy, credibility, consistency
- Every notification that should send — does it?

### Agent 5: Technical Audit
Covers: audit-build-types.md + audit-security.md + audit-seo-performance.md + audit-api-health.md + audit-payment-flows.md
- TypeScript errors, build status, ESLint
- Security vulnerabilities, exposed secrets, auth checks
- SEO readiness, performance, page weight
- API routes health, payment flow integrity

## After all complete
Compile a unified report with:
1. CRITICAL issues (must fix before going live)
2. HIGH issues (fix within 1 week)
3. MEDIUM issues (fix within 1 month)
4. LOW issues (nice to have)
5. Total score out of 100

## Scoring
- User flows & onboarding: /15
- Portal health & UX: /15
- Cross-system & data integrity: /15
- Content quality & notifications: /15
- API & payment flows: /10
- Security: /10
- Build & types: /10
- SEO & performance: /10
- Total: /100

## Fix Recommendations
Every issue must include:
- Exact file to modify
- What to change
- Why it matters
- Effort estimate (5 min / 30 min / 1 hour / 2+ hours)
