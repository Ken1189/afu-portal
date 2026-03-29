# Portal Health Auditor

Audit every portal for completeness, broken pages, and missing functionality.

## Portals to check

### For EACH portal, verify:
1. Layout loads (sidebar, header, role guard)
2. Every nav link points to a real page
3. Every page has data fetching (createClient or useAuth)
4. Every form has a working submit handler (not just state update)
5. Every button has an onClick that does something real
6. No alert() or window.confirm() calls (should use toasts/modals)
7. No console.log() in production code
8. Loading states exist on async operations
9. Error handling on all fetch/supabase calls
10. Mobile responsive (check for overflow-x-auto on tables)

### Portals:
- **Admin** (`src/app/admin/`) — 65+ pages, collapsible sidebar, permissions system
- **Farmer** (`src/app/farm/`) — 45+ pages, tier-based sidebar
- **Investor** (`src/app/investor/`) — 7 pages
- **Supplier** (`src/app/supplier/`) — 17 pages
- **Dashboard** (`src/app/dashboard/`) — 18 pages
- **Ambassador** (`src/app/ambassador/`) — 8 pages
- **Warehouse** (`src/app/warehouse/`) — 6 pages
- **Carbon** (`src/app/carbon/`) — 2 public pages

### Specific checks per portal:

**Admin Portal:**
- All CRUD operations work (create/edit/delete buttons wired)
- Permissions system filters sidebar correctly
- Super admin sees everything, regular admin sees only permitted sections
- Export CSV buttons work
- Search/filter on all tables

**Farmer Portal:**
- Tier-based nav shows correct items per tier
- All forms save to database (crops, livestock, insurance, marketplace)
- Wallet deposit/withdraw/transfer modals work
- Trading order submission works
- Cooperative features work
- Carbon credit enrollment works

**Investor Portal:**
- Settings save works
- Express interest form works
- All data fetches have fallback demo data

**Supplier Portal:**
- Product CRUD works
- Order management works
- Advertising create wizard works
- Trade marketplace quote submission works
- Profile/settings save

**Ambassador Portal:**
- Referral link copy works
- Payout request works
- Commission history loads

**Warehouse Portal:**
- Receiving flow (4-step) works end to end
- Receipt generation works
- Inventory tracking works
- Dispatch creation works

## How to audit
For each portal:
1. List ALL page.tsx files
2. Read each one, check for the items above
3. Flag any issues

## Output format
| Portal | Page | Data Fetch | Forms Save | Buttons Work | Alerts | Issues |
