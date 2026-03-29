# Data Integrity & Schema Auditor

Verify database schema, relationships, data consistency, and migration health.

## Schema Checks

### Tables
1. List ALL tables across all migrations (001-027+)
2. Verify each table has: id (UUID PK), created_at, updated_at (where appropriate)
3. Check foreign key relationships are correct
4. Check no orphaned references (FK to non-existent table)
5. Check enum types are defined before use

### RLS (Row Level Security)
6. Every table with user data has RLS ENABLED
7. Every table has at least one policy
8. No policies reference profiles table from within profiles policy (recursion bug)
9. Admin policies use raw_user_meta_data, not profiles table
10. Public read tables (commodity_prices, ad_packages, etc.) have permissive SELECT
11. User-scoped tables filter by auth.uid()

### Indexes
12. Every foreign key column has an index
13. Every frequently filtered column has an index (status, type, country_code)
14. Every table with text search has appropriate indexes
15. No duplicate indexes

### Migrations
16. Migrations are numbered sequentially (001, 002, ... no gaps)
17. Each migration has proper BEGIN/COMMIT or runs without transaction
18. ON CONFLICT handlers exist for seed data (idempotent)
19. IF NOT EXISTS on all CREATE TABLE statements
20. Triggers don't duplicate (wrapped in DO $$ exception handler)

## Data Consistency Checks

### Profiles & Auth
21. Every auth.users entry has a matching profiles entry
22. Every profiles.role matches auth.users.raw_user_meta_data.role
23. No profiles without auth user (orphaned profiles)

### Financial
24. Every wallet_account has a matching ledger_account
25. wallet_account.balance matches sum of wallet_transactions
26. ledger_account.balance matches sum of ledger_entries
27. Every ledger entry has a contra entry (double-entry check)

### Relationships
28. Every loan has a valid user_id in profiles
29. Every trade_order has a valid user_id
30. Every commission_entry has a valid ambassador_id
31. Every carbon_enrollment has a valid project_id and user_id

## Migration Files to Check
- supabase/migrations/001_initial_schema.sql through latest
- Check SQL files match what's actually in the database

## Output format
### Schema Issues:
| Table | Issue | Severity | Fix |

### RLS Issues:
| Table | Issue | Policy | Fix |

### Missing Indexes:
| Table | Column | Query Pattern | Recommendation |

### Data Integrity Issues:
| Check | Expected | Actual | Fix |

### Recommendations:
Prioritized list of schema fixes with exact SQL to run.
