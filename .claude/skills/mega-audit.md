# AFU Mega Audit — Run All Auditors Simultaneously

Launch ALL 6 audit skills in parallel using the Agent tool. Each agent runs independently and reports back.

## How to use
Tell Claude: "Run the mega audit" or "/mega-audit"

## What it launches (6 parallel agents):

### Agent 1: User Flow Auditor
Checks: signup, login, onboarding, approval, session management
Skill: .claude/skills/audit-user-flows.md

### Agent 2: Portal Health Auditor
Checks: all 9 portals, every page, every button, every form
Skill: .claude/skills/audit-portals.md

### Agent 3: Cross-System Flow Auditor
Checks: event bus, notifications, wallet, ledger, SMS across all systems
Skill: .claude/skills/audit-cross-system.md

### Agent 4: Database Wiring Auditor
Checks: every page has DB connection, every table is used, every save persists
Skill: .claude/skills/audit-database-wiring.md

### Agent 5: Missing Items Detector
Checks: TODOs, stubs, broken links, placeholders, security issues
Skill: .claude/skills/audit-missing-items.md

### Agent 6: Build & Type Safety Auditor
Checks: TypeScript errors, build status, ESLint, security vulnerabilities
Skill: .claude/skills/audit-build-types.md

## After all complete
Compile a unified report with:
1. Critical issues (must fix)
2. Medium issues (should fix)
3. Low issues (nice to have)
4. Total score out of 100

## Scoring
- User flows: /20
- Portal health: /20
- Cross-system: /15
- Database wiring: /15
- Missing items: /15
- Build health: /15
- Total: /100
