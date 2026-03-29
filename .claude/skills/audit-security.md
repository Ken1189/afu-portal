# Security Auditor

Scan the entire codebase for security vulnerabilities, exposed secrets, and missing protections.

## Checks

### Secrets Exposure
1. grep for API keys, passwords, tokens in source code (not .env)
2. Check .gitignore includes .env.local, .env
3. Check no secrets in package.json scripts
4. Check no hardcoded Supabase service role key in client-side code

### Authentication
5. Every API route under /api/admin/ checks for admin role
6. Every API route under /api/banking/ checks for auth
7. Webhooks (USSD, SMS, Stripe, WhatsApp) correctly skip auth
8. Service role key only used in server-side code (route.ts, not page.tsx)

### Input Validation
9. API routes validate request body before DB operations
10. No SQL injection vectors (parameterized queries via Supabase)
11. No XSS vectors (React auto-escapes, but check dangerouslySetInnerHTML)
12. File upload validates file type and size

### RLS (Row Level Security)
13. Every table with user data has RLS enabled
14. Policies don't have recursive references (the bug from earlier)
15. Admin policies use raw_user_meta_data not profiles table

### Headers
16. Check next.config.ts for security headers (CSP, X-Frame-Options, etc.)
17. Check for CORS configuration
18. Check for rate limiting on auth endpoints

### Dependencies
19. npm audit for known vulnerabilities
20. Check for outdated packages with known CVEs

## Output format
### Critical (Exploitable):
| Issue | File | Risk | Fix |

### High (Should fix before production):
| Issue | File | Risk | Fix |

### Medium (Best practice):
| Issue | File | Risk | Fix |
