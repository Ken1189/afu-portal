# AFU Mega Platform — Document Generation Prompts

## Context for Both Prompts

The African Farming Union (AFU) is an integrated agriculture platform operating across 20 African countries: Botswana, Zimbabwe, Tanzania, Kenya, Nigeria, Zambia, Mozambique, South Africa, Ghana, Uganda, Sierra Leone, Egypt, Ethiopia, Malawi, Namibia, Republic of Guinea, Guinea-Bissau, Liberia, Mali, and Ivory Coast.

**Current state:**
- Next.js 16 / React 19 / TypeScript / Supabase / Vercel
- 388 pages across 7 portals (farmer, supplier, driver, admin, ambassador, investor, warehouse)
- 205 Supabase tables, 163 API endpoints
- Foober logistics platform (Uber-style delivery)
- Marketplace, exchange, commodity trading
- AI assistant (Gemini), training courses, farm management tools
- Current users: ~250 members, 84 profiles, 7 suppliers, 21 ambassadors
- Founder: Peter Watson (CEO), Co-founder: Devon Kennaird

**Where we're going:**
- 50 million users within 24 months
- Full fintech platform: digital wallets, payments, lending, insurance underwriting
- Banking license application across multiple African jurisdictions
- Warehouse receipt financing at scale
- Commodity exchange with real-time trading
- Cross-border payments and remittances
- Mobile-first (USSD, WhatsApp, SMS for low-connectivity users)
- Carbon credit marketplace
- IoT integration (soil sensors, weather stations, satellite imagery)

---

## PROMPT 1: Requirements & Costs Document

```
You are a senior technology consultant specialising in African fintech infrastructure, agricultural platforms, and banking technology. You have deep expertise in regulatory frameworks across Sub-Saharan Africa, payment systems (mobile money, SWIFT, RTGS), and scaling platforms to tens of millions of users.

Create a comprehensive "Requirements and Costs" document for scaling the African Farming Union (AFU) from its current state (~250 users, Next.js/Supabase MVP) to a pan-African fintech and banking platform serving 50 million users across 20 African countries.

The document must cover ALL of the following sections in detail:

---

### SECTION 1: INFRASTRUCTURE REQUIREMENTS

**1.1 Compute & Hosting**
- Current: Vercel (serverless, Next.js)
- What's needed for 50M users: dedicated infrastructure, multi-region deployment, CDN strategy
- Compare: AWS (Cape Town, Lagos regions) vs Azure (South Africa) vs GCP vs hybrid
- Kubernetes clusters, auto-scaling, load balancing
- Edge computing for low-latency in rural Africa
- Disaster recovery, failover, multi-AZ deployment
- Estimated costs: monthly, annual, 3-year projection

**1.2 Database**
- Current: Supabase (PostgreSQL)
- What's needed: horizontal scaling, read replicas, sharding strategy
- Options: managed PostgreSQL (RDS/Aurora) vs CockroachDB vs TimescaleDB for time-series
- Separate databases: transactional (OLTP), analytics (OLAP), real-time (Redis/Kafka)
- Data warehouse for reporting (Snowflake, BigQuery, Redshift)
- Estimated storage: 50M users x average data per user
- Backup, point-in-time recovery, cross-region replication

**1.3 Messaging & Real-Time**
- Message queues: Kafka, RabbitMQ, or AWS SQS for async processing
- Real-time: WebSockets for live tracking, order updates, chat
- Push notifications at scale (Firebase, OneSignal)
- SMS gateway (Africa's Talking, Twilio) — cost per message across 20 countries
- WhatsApp Business API integration
- USSD gateway for feature phones (still 60%+ of African users)
- Email at scale (Resend → SendGrid/Postmark for volume)

**1.4 Security Infrastructure**
- WAF (Web Application Firewall)
- DDoS protection (Cloudflare, AWS Shield)
- API gateway with rate limiting (Kong, AWS API Gateway)
- Secrets management (HashiCorp Vault, AWS Secrets Manager)
- Intrusion detection/prevention
- SOC 2 Type II compliance infrastructure
- Penetration testing schedule and cost
- Bug bounty programme

**1.5 Monitoring & Observability**
- APM: Datadog, New Relic, or Grafana Cloud
- Log aggregation: ELK stack or Loki
- Uptime monitoring: PagerDuty, Opsgenie
- Custom dashboards for business KPIs
- Alerting for financial transactions (fraud detection)

---

### SECTION 2: FINTECH & BANKING REQUIREMENTS

**2.1 Digital Wallet System**
- Multi-currency wallet (USD, ZAR, KES, TZS, NGN, BWP, etc.)
- Wallet-to-wallet transfers
- Mobile money integration (M-Pesa, EcoCash, MTN MoMo, Orange Money, Airtel Money)
- Float management and reconciliation
- KYC/AML for wallet opening (tiered: basic, standard, enhanced)
- Transaction limits per tier
- Escrow functionality for marketplace transactions
- Build vs buy analysis (Rapyd, Flutterwave, Paystack, dLocal, custom)

**2.2 Payment Processing**
- Card acquiring (Visa, Mastercard across 20 countries)
- Mobile money acceptance (all major operators per country)
- Bank transfers (EFT, RTGS per country)
- Cross-border payments (SWIFT, SEPA for Egypt)
- QR code payments
- NFC/contactless payments
- Offline payment capability (store-and-forward for rural areas)
- Payment gateway costs: per-transaction fees, monthly fees, setup fees
- PCI DSS compliance requirements and certification cost

**2.3 Lending & Credit**
- Credit scoring model for African smallholder farmers (alternative data: mobile usage, farm size, harvest history, cooperative membership, satellite imagery)
- Loan origination system
- Loan management system (disbursement, repayment, collections)
- Interest rate models (regulatory caps per country)
- Warehouse receipt financing (commodity-backed lending)
- Input finance (seeds, fertilizer on credit)
- Trade finance (pre-export, post-harvest)
- Non-performing loan management
- Regulatory requirements per country for lending
- Core banking system options: Mambu, Temenos, FIS, or custom
- Cost comparison

**2.4 Insurance**
- Parametric crop insurance (weather-indexed, satellite-based)
- Livestock insurance
- Equipment insurance
- Index insurance vs indemnity insurance
- Reinsurance partnerships
- Claims processing system
- Underwriting engine
- Regulatory requirements (insurance license per country)
- Partner vs own license analysis

**2.5 Banking License**
- Country-by-country analysis for banking license requirements
- Minimum capital requirements per country
- Timeline to obtain license
- Ongoing compliance costs
- Alternative: partner with existing banks vs own license
- EMI (Electronic Money Institution) license as stepping stone
- Microfinance license vs full banking license
- Cost: application, legal, capital, ongoing compliance

**2.6 Regulatory Compliance**
- KYC requirements per country (ID verification, biometrics)
- AML/CFT (Anti-Money Laundering / Counter-Terrorism Financing)
- Data protection laws per country (GDPR-equivalent: POPIA in SA, Data Protection Act in Kenya, etc.)
- Central bank reporting requirements
- Foreign exchange regulations
- Consumer protection requirements
- Agent banking regulations
- Cross-border transaction regulations
- Sanctions screening (OFAC, EU, UN lists)
- Suspicious Transaction Reporting (STR)
- Cost of compliance team and technology

---

### SECTION 3: TECHNOLOGY TEAM REQUIREMENTS

**3.1 Engineering Team**
- Current: 0 engineers (built by AI — Claude Code)
- What's needed at each stage:
  - Stage 1 (0-500K users): team size, roles, cost
  - Stage 2 (500K-5M users): team size, roles, cost
  - Stage 3 (5M-50M users): team size, roles, cost
- Roles needed: CTO, VP Engineering, Backend, Frontend, Mobile (iOS, Android, React Native), DevOps/SRE, Data Engineering, ML/AI, Security, QA
- Salary ranges for African tech market vs global remote
- Where to hire: Nairobi, Lagos, Cape Town, Cairo, Accra, remote
- Build vs outsource analysis for each capability

**3.2 Product Team**
- Product managers (per vertical: farming, fintech, logistics, marketplace)
- UX/UI designers
- User researchers (critical for African rural UX)
- Content/localisation team (14 languages)

**3.3 Compliance & Legal Team**
- Chief Compliance Officer
- Country compliance officers (per operating country)
- Legal counsel (fintech, banking, data protection)
- External legal firms per jurisdiction
- Cost: in-house vs outsourced

**3.4 Operations Team**
- Customer support (multi-language, multi-channel: call centre, WhatsApp, USSD)
- Agent network management (field agents for farmer onboarding)
- Fraud operations team
- Reconciliation team
- Treasury/finance team

---

### SECTION 4: MOBILE & ACCESSIBILITY

**4.1 Mobile Apps**
- Native iOS and Android apps (not just responsive web)
- React Native vs Flutter vs native (pros/cons for Africa)
- Offline-first architecture (critical for rural Africa)
- App size optimisation (data costs are high)
- Progressive Web App as bridge
- Feature phone support (USSD, SMS interfaces)

**4.2 Connectivity Challenges**
- 2G/3G optimisation (not everyone has 4G/5G)
- Offline transaction queuing
- SMS-based transaction confirmations
- USSD menu system for basic banking
- WhatsApp Business integration for customer service
- IVR (Interactive Voice Response) for voice-based access
- Lite/low-data version of the platform

**4.3 Localisation**
- 14 languages already supported — which additional languages needed?
- Right-to-left support (Arabic for Egypt)
- Local currency formatting
- Cultural UX considerations per region
- Local content (farming advice per country/crop/season)

---

### SECTION 5: COST SUMMARY

Provide detailed cost estimates in USD for:

**5.1 One-time costs**
- Infrastructure setup and migration
- Security audit and certification (PCI DSS, SOC 2)
- Banking/fintech license applications
- Core banking system implementation
- Mobile app development
- Initial team recruitment

**5.2 Monthly recurring costs**
- Cloud infrastructure
- Third-party services (SMS, email, KYC, payment processing)
- Team salaries
- Compliance and legal
- Customer support
- Office/co-working spaces

**5.3 Per-user costs**
- KYC verification cost per user
- SMS/notification cost per user per month
- Cloud cost per user per month
- Payment processing margin per transaction

**5.4 Total Cost of Ownership**
- Year 1, Year 2, Year 3 projections
- Breakeven analysis
- Revenue model assumptions

Present costs in THREE scenarios:
1. **Lean** — minimum viable fintech, partner for everything possible
2. **Balanced** — mix of build and partner, moderate team
3. **Enterprise** — full banking license, own infrastructure, large team

Format as professional tables with line items.

---

### SECTION 6: RISK ANALYSIS

- Technology risks (scaling, vendor lock-in, data loss)
- Regulatory risks (license rejection, regulation changes)
- Market risks (competition, adoption rates)
- Operational risks (fraud, agent network, connectivity)
- Financial risks (non-performing loans, foreign exchange)
- Reputational risks
- Mitigation strategies for each

---

Output this as a professional document suitable for board presentation and investor due diligence. Use tables, charts where appropriate, and cite real-world comparisons (M-Pesa, Flutterwave, Chipper Cash, FarmCrowdy, AgroMall, Twiga Foods scale-up stories).

Total length: 8,000-12,000 words.
```

---

## PROMPT 2: Implementation Plan

```
You are a Chief Technology Officer with experience scaling African fintech platforms from MVP to 50+ million users. You have led engineering teams at companies like M-Pesa, Flutterwave, Paystack, or Jumo. You understand the unique challenges of building technology for Africa: connectivity issues, mobile money dominance, regulatory fragmentation, and the need for agent networks.

Create a detailed "Implementation Plan" for transforming the African Farming Union (AFU) from its current MVP state into a pan-African fintech and banking platform serving 50 million users.

The current platform is built with Next.js 16, React 19, TypeScript, Supabase (PostgreSQL), deployed on Vercel. It has 388 pages, 205 database tables, 163 API endpoints, 7 user portals, AI assistant, logistics (Foober), marketplace, and farm management tools.

The plan must be structured in PHASES with clear milestones, timelines, dependencies, team requirements, and costs per phase.

---

### PHASE 0: FOUNDATION (Months 1-3)
**Goal: Hire core team, set up proper engineering practices**

Cover:
- CTO hire and first 5 engineering hires
- Set up CI/CD pipeline (GitHub Actions → staging → production)
- Automated testing framework (unit, integration, e2e)
- Code review process and engineering standards
- Infrastructure migration plan (Vercel → scalable cloud)
- Security audit of current codebase
- Technical debt assessment and prioritisation
- Monitoring and alerting setup
- On-call rotation
- Development environment standardisation

---

### PHASE 1: SCALE & HARDEN (Months 3-6)
**Goal: Support 100K users reliably**

Cover:
- Database migration from Supabase to managed PostgreSQL (Aurora/RDS)
- Redis for caching and session management
- CDN setup for static assets across Africa
- API rate limiting and throttling
- Load testing (simulate 100K concurrent users)
- Performance optimisation (Core Web Vitals, bundle size)
- Error tracking and monitoring (Sentry, Datadog)
- Automated backups and disaster recovery
- Mobile app v1 (React Native — iOS + Android)
- Offline-first data synchronisation
- Multi-language support hardening (14 languages)
- USSD gateway integration (basic banking via feature phones)
- SMS-based account access

---

### PHASE 2: FINTECH CORE (Months 6-12)
**Goal: Digital wallets, payments, basic lending**

Cover:
- Digital wallet system architecture
- Integration with mobile money operators per country:
  - M-Pesa (Kenya, Tanzania, Mozambique, Ghana)
  - EcoCash (Zimbabwe)
  - MTN MoMo (Uganda, Ghana, Nigeria)
  - Orange Money (Mali, Guinea, Ivory Coast)
  - Airtel Money (multiple countries)
- KYC system (ID verification, biometrics, liveness detection)
- AML/CFT screening integration
- Basic lending: input finance, harvest advance
- Credit scoring v1 (farm data + mobile money history)
- Payment processing (cards + mobile money + bank transfer)
- Transaction processing engine (event-driven, Kafka)
- Reconciliation system
- Float management
- Regulatory filings for each country

---

### PHASE 3: BANKING & INSURANCE (Months 12-18)
**Goal: Banking license applications, insurance products**

Cover:
- Core banking system selection and implementation
- Savings accounts
- Fixed deposits
- Loan management system (full lifecycle)
- Warehouse receipt financing system
- Trade finance (LCs, SBLCs, documentary credits)
- Parametric crop insurance (weather-indexed)
- Livestock insurance
- Underwriting engine
- Claims processing
- Reinsurance partnerships
- Banking license application (start with 2-3 countries)
- Agent banking network (field agents with POS devices)
- Cross-border payment corridors

---

### PHASE 4: MARKETPLACE & COMMODITY EXCHANGE (Months 12-18, parallel)
**Goal: Full commodity trading platform**

Cover:
- Real-time commodity price feeds (Reuters, Bloomberg, local exchanges)
- Order matching engine
- Spot trading
- Forward contracts
- Warehouse receipt tokenisation
- Quality grading integration
- Logistics integration (Foober expansion)
- Settlement and clearing
- Market maker programme
- Regulatory compliance for commodity exchanges per country

---

### PHASE 5: DATA & AI (Months 18-24)
**Goal: Advanced analytics, AI-driven decisions**

Cover:
- Data lake / data warehouse architecture
- Satellite imagery integration (Sentinel-2, Planet Labs)
- IoT platform for soil sensors, weather stations
- Crop yield prediction models
- Credit scoring v2 (ML-based, alternative data)
- Fraud detection ML models
- Recommendation engine (inputs, crops, markets)
- Farmer advisory AI (Claude/Gemini based)
- Crop disease detection from camera (computer vision)
- Carbon credit measurement and verification
- ESG reporting dashboard

---

### PHASE 6: SCALE TO 50M (Months 18-30)
**Goal: Full pan-African operation**

Cover:
- Multi-region deployment (East Africa, West Africa, Southern Africa)
- Country-by-country rollout plan (which countries first, why)
- Agent network scaling (target: 100K+ agents)
- Customer support scaling (AI-first, human escalation)
- WhatsApp Business API at scale
- USSD menus for all core functions
- Offline-first everything
- Feature phone app (KaiOS)
- Community leader / cooperative integration programme
- Government partnership strategy per country
- NGO and development finance integration (IFC, AfDB, IFAD)

---

### FOR EACH PHASE, PROVIDE:

1. **Detailed task breakdown** (epics and major stories)
2. **Team required** (roles, headcount, hire timeline)
3. **Technology choices** with justification
4. **Dependencies and blockers**
5. **Key risks and mitigations**
6. **Estimated cost** (development, infrastructure, licenses, team)
7. **Success metrics / KPIs**
8. **Timeline** (Gantt-style milestones)
9. **Go/no-go criteria** before moving to next phase

---

### ARCHITECTURE DIAGRAMS

Include text-based architecture diagrams for:
1. Overall system architecture (microservices, databases, message queues)
2. Payment flow (mobile money → wallet → settlement)
3. Lending flow (application → scoring → disbursement → repayment)
4. Data pipeline (IoT → processing → storage → analytics → action)
5. Authentication and authorisation (multi-tenant, multi-role)

---

### TEAM GROWTH PLAN

Month-by-month hiring plan:
- Month 1-3: Core team
- Month 3-6: Scale team
- Month 6-12: Full product teams
- Month 12-18: Country teams
- Month 18-24: Enterprise teams
- Total headcount at 50M users

For each role: title, level, location preference, salary range (Africa market rate vs global remote), whether to hire or contract.

---

### VENDOR & PARTNER STRATEGY

For each major capability, recommend:
- Build vs buy vs partner
- Specific vendor recommendations with pricing
- Contract negotiation strategy
- Fallback options

Categories:
- Cloud infrastructure
- Core banking
- Payment processing
- KYC/AML
- Insurance
- SMS/communications
- Mobile money integration
- Satellite imagery
- IoT platform
- Customer support
- Fraud detection

---

Output as a professional implementation plan suitable for the board, investors, and potential banking license applications. Include realistic timelines, costs, and risk assessments based on comparable African fintech scale-ups.

Total length: 10,000-15,000 words.
```

---

## HOW TO USE THESE PROMPTS

1. Copy Prompt 1 into a fresh Claude conversation with Opus model → generates the Requirements & Costs document
2. Copy Prompt 2 into a fresh Claude conversation with Opus model → generates the Implementation Plan
3. Both prompts reference AFU's actual current state so the documents are grounded in reality
4. Feed the outputs to Devon and Pete for review
5. Use the documents for investor pitches, banking license applications, and board presentations
