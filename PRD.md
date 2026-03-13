# Product Requirements Document (PRD)
# African Farming Union (AFU) — Membership Portal & AI-Powered Agricultural Platform

**Version:** 2.0
**Date:** March 13, 2026
**Status:** Approved for Development
**Classification:** Confidential

---

## 1. Executive Summary

The AFU Membership Portal is an AI-powered agricultural operating system that serves as the digital backbone for the African Farming Union's vertically integrated agriculture development platform. Operating across Botswana (Institutional Base), Zimbabwe (Export Lane), and Tanzania (Scale Lane), the platform provides farmers with financing, inputs, processing, offtake, trade finance, and training — all through a single integrated digital experience.

The platform combines a public marketing website, a member self-service portal, an administrative operations center, and an AI assistant layer that transforms how African farmers access capital, knowledge, and markets.

### Vision
One platform where a farmer gets their bank, agronomist, market analyst, trainer, and business advisor — all powered by AI.

### The African Agriculture Paradox
- 60% of the world's uncultivated arable land is in Africa
- Africa imports $50B+ in food annually
- 30-40% post-harvest losses due to broken value chains

AFU exists to close this gap through its integrated flywheel: Capital → Inputs → Production → Processing → Offtake → Trade Finance → Cash Recycle.

---

## 2. Membership Structure

### Tier A — Smallholder Farmer
- **Price:** $50/year
- **Target:** Individual farmers, < 10 hectares
- **Access:** Basic financing, input bundles, training, group offtake

### Tier B — Commercial Farmer
- **Price:** $500/year
- **Target:** Established farms, 10-500 hectares
- **Access:** Full financing suite, premium inputs, priority offtake, advanced training, dedicated relationship manager

### Tier C — Enterprise / Large Projects
- **Price:** Custom pricing
- **Target:** Large-scale operations, estates, agri-businesses
- **Access:** Bespoke financing, full platform access, board-level reporting, white-glove service

### Partner Tier
- **Price:** $250/year
- **Target:** Commercial farmers, tech partners, input suppliers, offtakers, vocational colleges, trade finance providers
- **Access:** Partner dashboard, referral tracking, co-branded services, aggregate reporting

---

## 3. Platform Architecture

### 3.1 Tech Stack
- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 with custom AFU design tokens
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State:** React Context + Zustand for global state
- **Mock Data:** Centralized TypeScript data layer
- **Images:** Unsplash/Pexels (free stock, African agriculture)
- **AI Chatbot:** Client-side pattern matching (demo) → Claude API (enterprise)

### 3.2 Enterprise Stack (Phase 2+)
- **Auth:** Supabase Auth
- **Database:** Supabase PostgreSQL with Row-Level Security
- **Storage:** Supabase Storage (documents, images)
- **Payments:** Stripe
- **Email:** Resend or SendGrid
- **SMS:** Twilio
- **WhatsApp:** Twilio WhatsApp Business API
- **AI:** Anthropic Claude API with RAG
- **Vision:** Google Cloud Vision API
- **Satellite:** Sentinel-2 / Planet Labs API
- **Weather:** Tomorrow.io API
- **Monitoring:** Sentry + PostHog

### 3.3 Design System

**Brand Colors:**
| Token | Hex | Usage |
|-------|-----|-------|
| navy | #1B2A4A | Primary backgrounds, text |
| navy-light | #2D4A7A | Secondary backgrounds |
| navy-dark | #0F1A30 | Admin panel, deep backgrounds |
| teal | #2AA198 | Primary actions, CTAs, links |
| teal-light | #E8F5F3 | Light backgrounds, badges |
| teal-dark | #1A7A72 | Hover states |
| gold | #D4A843 | Accents, highlights, premium |
| cream | #F9FAFB | Page backgrounds |

**Typography:** Inter (Google Fonts) — weights 400, 500, 600, 700

---

## 4. Public Website

### 4.1 Homepage
- **Hero:** Full-width parallax background image (African farmland), gradient overlay, typewriter headline animation, dual CTAs (Become a Member + Watch Our Story)
- **Social Proof Bar:** Partner logo marquee (grayscale, color on hover)
- **Paradox Stats:** 3 animated counting stat cards (intersection observer triggered)
- **Services Grid:** 6 cards (Financing, Inputs, Processing, Offtake, Trade Finance, Training) with hover lift animation
- **Interactive Flywheel:** Circular diagram, click nodes to see stage details, animated connecting arrows
- **How It Works:** 4-step process (Apply → Assess → Access → Grow) with animated connecting dots
- **Membership Tiers:** 4 pricing cards with feature comparison matrix, Commercial tier highlighted
- **Testimonials:** Carousel with farmer photos, quotes, country flags
- **Impact Numbers:** Full-width teal section with animated counters
- **News/Blog Preview:** 3 article cards
- **CTA Section:** "Ready to Transform Your Farm?" with split paths for Farmer vs Partner
- **Footer:** 4-column with newsletter signup, social icons, language selector

### 4.2 About Page
- Team section with headshots and bios
- Interactive timeline (founding → Phase 1 → growth)
- Broken Cash Cycle animated visualization
- Operating model (3 tiers) visual
- Risk control framework table
- Advisory board section

### 4.3 Service Pages (6 individual pages)
Each follows consistent template:
- Service hero with background image
- Overview with key benefits (3 icon blocks)
- How It Works (step-by-step with example scenario)
- Products/Options (service-specific)
- Eligibility self-checker (5-question assessment)
- FAQ accordion (6-8 questions)
- CTA to apply

**Financing:** Pre-Export Working Capital (90-180 days, 12-18% APR) + Invoice Finance (30-60 days, 8-10% APR), escrow waterfall explanation
**Inputs:** Categories, seasonal bundles, delivery logistics
**Processing:** Packhouse access, cold chain, quality control
**Offtake:** Buyer network, contract types, quality standards
**Trade Finance:** LC facilitation, export documentation, currency management
**Training:** Curriculum overview, certification paths, delivery methods

### 4.4 Country Pages
- **Botswana:** Institutional Base, HQ, regulatory home
- **Zimbabwe:** Export Lane, blueberry focus, cold chain corridor
- **Tanzania:** Scale Lane, cassava + sesame, port access (Dar es Salaam)

Each: country stats, AFU operations, key crops, local team, regulatory context, interactive map

### 4.5 Partners Page
6 categories: Commercial Farmers, Tech Partners, Input Suppliers, Offtakers, Vocational Colleges, Trade Finance Providers

### 4.6 Contact Page
Form (name, email, org, subject dropdown, message) + Gaborone HQ details + map

---

## 5. Membership Application Flow

### 5.1 Multi-Step Application
**Step 1 — Tier Selection:** 4 tier cards with feature comparison matrix, pricing, select one
**Step 2 — Personal Details:** Name, DOB, nationality, ID, contact info, address (conditional fields per tier)
**Step 3 — Farm/Organization Details:** Farm name, location (map picker), size, crops, experience, equipment, certifications
**Step 4 — Document Upload:** Drag-and-drop upload with preview for ID, farm photos, land title (requirements vary by tier)
**Step 5 — Review & Submit:** Full summary, edit any section, terms acceptance, submit

### 5.2 Post-Submission
- Reference number generated (AFU-2024-XXXX)
- Email confirmation with timeline
- Status tracking page: Draft → Submitted → Under Review → Approved/Rejected
- Estimated 5-7 day processing time

### 5.3 Technical Requirements
- Progress bar with step labels
- Save draft to localStorage (resume later)
- Field-level validation with helpful errors
- Conditional logic (different fields per tier, farmer vs partner)
- File upload: drag-drop, progress bars, preview, 10MB max, PDF/JPG/PNG
- Auto-save indicator

---

## 6. Member Portal

### 6.1 First-Time Experience
- Guided tour overlay (5 steps with tooltips)
- Profile completeness checklist
- Skip tour option
- Welcome modal with quick actions

### 6.2 Dashboard
- **Welcome Banner:** "Good [morning/afternoon/evening], [Name]" + date + weather + rotating quote
- **Profile Completeness Widget:** Donut chart, missing items list with links
- **Action Items:** Prioritized to-do list (payments, documents, training)
- **Financial Summary Cards (4):** Total Financing, Outstanding Balance, Next Payment, Credit Score — each with sparkline trend
- **Active Loans Mini-View:** Top 3 loans as compact cards with progress bars
- **Training Progress Widget:** Circular progress + current course + achievement badges
- **Market Prices Ticker:** Scrolling commodity prices with change indicators
- **Recent Activity Feed:** Chronological log (last 7 items)
- **Announcements:** Dismissible news banner
- **Quick Actions Grid:** 6 buttons (Apply, Upload, Contracts, Training, Support, Statement)

### 6.3 Financing Module
**Overview:** Tab bar (Active Loans | Applications | Payment History | Calculator)

**Active Loans:**
- Card view or table view toggle
- Each loan card: ID, type, amount, outstanding, rate, circular progress ring, next payment countdown, timeline bar
- Click for detail page

**Loan Detail Page:**
- Full info panel
- Repayment schedule table
- Payment timeline visualization
- Escrow waterfall diagram (animated)
- Related documents
- Communication thread

**New Application (5-step wizard):**
1. Financing type selection (Working Capital, Invoice, Equipment, Input Bundle)
2. Dynamic details (fields vary by type)
3. Farm & financial info
4. Document upload (required docs vary by type and amount)
5. Review + estimated terms + submit

**Loan Calculator:**
- Interactive sliders (amount, tenor)
- Real-time calculation: monthly payment, total interest, APR
- Amortization table preview

**Payment History:**
- Filterable table, date range picker, export CSV, download receipts

### 6.4 Training Module
**Home:** Learning path, in-progress courses, catalog, certificates, stats
**Catalog:** Grid cards with filters (category, difficulty, duration), search, sort
**Course Detail:** Hero, description, objectives, module accordion, prerequisites, reviews, enroll/continue
**Lesson View:** Video player area, sidebar module list, written content, key takeaways, resources, discussion
**Quiz:** Question progress, radio/checkbox answers, timer, results with review, 70% pass threshold
**Certificate:** AFU-branded design, downloadable PDF, QR verification, share button

### 6.5 Documents Center
**Folder Tree:** Personal (ID, Address) → Farm (Title, Photos, Plans, Certs) → Financial (Statements, Tax, Projections) → Contracts → Training
**File List:** Icon, name, date, size, status badge (Verified/Pending/Rejected/Expired), actions
**Upload Flow:** Type selector, drag-drop zone, format/size restrictions, progress bar, preview, description, expiry date
**Document Viewer:** Inline PDF/image viewer, metadata, admin comments, version history
**Required Checklist:** Tier-specific requirements, completion percentage, missing items highlighted

### 6.6 Inputs & Equipment
**Catalog:** Category tabs (Seeds, Fertilizers, Pest Control, Irrigation, Equipment, Technology), product grid with images
**Product Detail:** Gallery, specs, recommended crops, pricing tiers, delivery estimate
**Bundle Builder:** Select crops → farm size → recommended bundle → customize → review → submit
**Request Cart:** Items, quantities, delivery address, date, notes, financing link
**Order History:** Status pipeline (Submitted → Processing → Shipped → Delivered)

### 6.7 Offtake & Contracts
**Overview:** Active contract cards with buyer logo, crop, volume, price, delivery progress bar
**Contract Detail:** Key terms, delivery calendar, tracker, performance chart, quality metrics, document viewer
**Log Delivery:** Date, volume, grade, transport, upload docs/photos
**Market Intelligence:** Price charts, best-sell timing, buyer matching, demand alerts

### 6.8 Profile
**Member Card:** Downloadable digital card with QR code, verification badges
**Personal Info:** Editable form with all personal details
**Farm Details:** Editable with map pin, photo gallery, equipment checklist
**Banking:** Masked account details, mobile money
**Verification Status:** Visual checklist (Identity, Address, Farm, Financial)

### 6.9 Settings
- Account management (email, password, phone)
- Notification preferences (granular by channel)
- Language preference
- 2FA setup
- Data export
- Account deactivation
- Connected sessions

### 6.10 Notification Center
- Bell icon with count badge
- Dropdown panel with categorized notifications
- Types: Application updates, payment reminders, training, new features, alerts
- Mark read/unread, notification history

---

## 7. AI Features

### 7.1 Mkulima AI Assistant (Chatbot)
- Floating chat bubble on every portal page
- Multi-language: English, Swahili, Shona
- Voice input and output capability (UI for demo)
- Context-aware (knows user's page, tier, crops, country)

**Knowledge Domains:**
- Crop advice and best practices
- Pest and disease identification
- Financial literacy education
- Platform navigation help
- Market information
- Weather forecasts
- Export regulation guidance

**Demo Implementation:** Pre-built response patterns, typing animation, chat history, escalation to human advisor option

### 7.2 Crop Health Scanner
- Upload or capture crop photo
- AI analysis returns: identified crop, health status, detected issues with confidence %, severity, recommended treatment, products needed (linked to input catalog)
- Scan history with timeline tracking
- Before/after comparison
- Expert review request option

**Demo:** Accept image upload, display mock analysis with realistic results

### 7.3 AI Credit Scoring
- Automated credit assessment on financing applications
- **Inputs:** Farm data, weather patterns, payment history, training completion, document completeness, market conditions, offtake contracts, peer comparison
- **Output:** AFU Credit Score (0-100), risk rating (A-D), radar chart breakdown (Farm Viability, Financial History, Market Conditions, Documentation, Training), recommended terms, risk factors, positive indicators
- Admin override capability with audit trail

**Demo:** Weighted scoring algorithm based on profile data, pre-calculated for demo members

### 7.4 Smart Farm Dashboard
- **Weather Intelligence:** 14-day localized forecast, planting window advisor, frost/drought alerts, season outlook
- **Yield Prediction:** Based on crop, farm, weather, inputs → predicted harvest kg, revenue forecast, scenario modeling
- **Market Intelligence AI:** Price prediction, best sell timing, buyer matching, demand alerts, benchmarking
- **Input Optimization:** Fertilizer/water recommendations, cost optimization, peer comparison

### 7.5 Document AI
- **Auto-Extraction:** Passport → name, DOB, number, expiry auto-fill
- **Verification:** Quality check, document type detection, fraud detection, expiry checking, completeness check
- **Smart Filing:** Auto-categorization, missing document suggestions

### 7.6 Personalized Recommendations
- Training course recommendations based on crops, experience, gaps
- Input recommendations based on season, soil, budget
- Financing product recommendations based on cash flow, contracts
- Offtake buyer matching based on crop, volume, quality

### 7.7 Satellite Farm Monitoring
- Satellite view of member's farm
- NDVI vegetation index overlay (health visualization)
- Farm boundary detection
- Change detection alerts
- Historical comparison

**Demo:** Static satellite images with mock NDVI overlays

### 7.8 WhatsApp AI Bot (Preview)
- Interactive demo within portal showing WhatsApp conversation UI
- Sample flows: balance check, status check, market prices, crop diagnosis, payment reminders, micro-lessons

---

## 8. Admin Panel

### 8.1 Dashboard
- **KPI Row:** Total Members, Active Loans, Pending Applications, Monthly Revenue, Default Rate, Avg Processing Time — each with sparkline
- **Charts (2x2):** Member Growth (line), Loan Portfolio (stacked bar), Application Pipeline (funnel), Revenue Breakdown (donut)
- **Map View:** Interactive map with member pins (clustered, color-coded by tier)
- **Alerts Panel:** Priority-sorted (red/amber/blue) with click-through
- **Country/Tier Breakdown Table**

### 8.2 Member Management
- Advanced data table: sortable, filterable, searchable, column toggle, bulk actions, export
- Member detail page with tabs: Overview, Profile, Documents, Financing, Training, Activity, Notes
- Full CRUD (create, read, update, deactivate)
- Tags/labels, assigned relationship manager

### 8.3 Application Processing
- **Kanban board:** 5 columns (New → Documents Review → Credit Assessment → Decision → Completed), draggable cards, SLA indicators
- **Table view:** Alternative to Kanban
- **Application detail:** Inline document preview, credit assessment, decision controls (approve/reject/request info/refer), internal comments, timeline, SLA tracking
- Approval templates

### 8.4 Financial Management
- Portfolio dashboard: quality breakdown, concentration analysis, vintage analysis, aging
- Collections: overdue table, reminder actions, escalation, restructuring
- Disbursement queue: approve with 2FA for large amounts

### 8.5 Training Administration
- Course builder: create/edit courses with modules
- Content management: upload materials
- Enrollment management: assign by tier
- Analytics: completion rates, scores, engagement

### 8.6 Reports & Analytics
- Pre-built reports: Monthly Summary, Portfolio Quality, Member Growth, Revenue, Training, Country-Level
- Custom report builder: select metrics, dimensions, date range
- Export: CSV, PDF
- Milestone tracker with progress visualization

### 8.7 AI Admin Tools
- Smart application triage (auto-sort by risk/priority)
- Anomaly detection alerts
- Portfolio predictive insights
- Auto-generated narrative reports
- Smart communication drafts

---

## 9. Component Library

### Primitives
Button, Input, Textarea, Select, Multi-select, Checkbox, Radio, Toggle, DatePicker, FileUpload, Slider

### Feedback
Toast, Alert, Modal, SlideOver, Tooltip, Popover, ProgressBar, ProgressRing, Skeleton, Spinner, EmptyState

### Data Display
DataTable, Card, Badge, Avatar, Stat, Timeline, Accordion, Tabs, Breadcrumb, Stepper

### Navigation
Sidebar, TopBar, DropdownMenu, CommandPalette, Pagination

### Charts (Recharts)
LineChart, BarChart, DonutChart, AreaChart, FunnelChart, Sparkline, RadarChart

### Specialized
MemberCard, KanbanBoard, Calendar, Map, PDFViewer, ImageGallery, RichTextEditor, QRCode, CertificateTemplate, ChatWidget

---

## 10. Mock Data Requirements

| Entity | Count | Notes |
|--------|-------|-------|
| Members | 50+ | Realistic African names, mix of tiers, 3 countries, varying completeness |
| Loans | 25+ | Mix of products, stages, amounts ($5K-$200K), payment histories |
| Applications | 15+ | Every pipeline stage, various types |
| Training Courses | 10+ | Real content outlines, varying completion |
| Documents | 100+ | Spread across members, various states |
| Offtake Contracts | 8+ | Real buyer names, delivery data |
| Activity Logs | 200+ | 6-month span, all types |
| Input Products | 20+ | With images, pricing, availability |
| Notifications | 30+ | All types represented |

---

## 11. Development Phases

### Phase 1 — Enhanced Demo (Current Sprint)
- Reusable component library
- Centralized mock data layer
- Real images throughout
- AI Chatbot (Mkulima) with pre-built responses
- Crop Health Scanner with mock analysis
- Credit Scoring visualization
- Dashboard overhaul with real charts
- Interactive forms with validation
- Document upload system with drag-drop
- Admin panel with charts and Kanban
- Framer Motion animations
- Toast notifications
- All pages fully interactive

### Phase 2 — Backend Integration
- Supabase Auth (email/password, magic links, OAuth)
- Supabase Database (all tables with RLS)
- Supabase Storage (documents, images)
- Real CRUD operations
- API routes for business logic
- Stripe for membership payments
- Invoice generation

### Phase 3 — Enterprise AI & Communications
- Claude API integration for chatbot
- Google Vision for crop disease detection
- Real credit scoring ML model
- Resend/SendGrid for email
- Twilio SMS
- Twilio WhatsApp Business API
- Satellite imagery integration
- Weather API integration
- Market price feed integration

### Phase 4 — Scale & Optimize
- PWA (installable, offline capability)
- Multi-language (English, Swahili, Shona)
- Advanced analytics (PostHog)
- Error monitoring (Sentry)
- Performance optimization
- Custom report builder
- API for external integrations
- Mobile-specific optimizations

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Member Registration Conversion | >15% of site visitors |
| Application Completion Rate | >70% of started applications |
| Loan Processing Time | <7 days average |
| Training Completion Rate | >60% |
| Member Monthly Active Rate | >40% |
| Default Rate | <5% |
| NPS Score | >50 |
| Platform Uptime | 99.5% |

---

## 13. Security & Compliance

- HTTPS everywhere
- Role-based access control (RBAC)
- Row-level security in database
- Document encryption at rest
- Audit trail on all admin actions
- GDPR-aligned data handling
- PCI compliance for payment processing
- 2FA for admin and financial operations
- Session management with auto-logout
- Rate limiting on API routes
- Input sanitization and CSRF protection

---

## 14. Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader labels on all interactive elements
- Visible focus indicators
- Color contrast ratios ≥ 4.5:1
- Alt text on all images
- Skip navigation link
- Semantic HTML with proper heading hierarchy
- ARIA attributes where needed

---

*Document prepared for African Farming Union (AFU)*
*Confidential — Not for distribution*
