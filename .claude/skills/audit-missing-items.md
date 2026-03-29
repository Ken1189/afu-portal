# Missing Items Detector

Find every placeholder, TODO, stub, broken link, and missing feature across the entire platform.

## What to search for

### Code Smells
1. `// TODO` comments
2. `// FIXME` comments
3. `// HACK` comments
4. `// In production` comments (stub code)
5. `// Wire` or `// Connect` comments
6. `// Placeholder` comments
7. `console.log()` statements (should not be in production)
8. `console.error()` statements (should use proper error handling)
9. `alert()` calls (should use toasts)
10. `window.confirm()` calls (should use modals)
11. `window.location.reload()` calls (should re-fetch data)
12. Empty function bodies `() => {}`
13. `any` type usage (TypeScript weakness)

### Stub Pages
14. Pages under 50 lines (likely stubs/coming soon)
15. Pages that import ComingSoon component
16. Pages with "Coming Soon" text

### Broken Links
17. Nav links pointing to pages that don't exist
18. Footer links pointing to pages that don't exist
19. Button href/onClick pointing nowhere
20. Internal links to routes with no page.tsx

### Missing Features
21. Forms with no submit handler
22. Buttons with no onClick
23. Modals that open but have no save action
24. Tables with no data and no empty state
25. Charts with hardcoded data (no fetch)
26. Pages that show demo data but claim to be "live"

### Content Issues
27. Lorem ipsum or placeholder text
28. "Example" or "Sample" in content that should be real
29. Default Next.js content (favicon, icons)
30. Broken image URLs (pointing to non-existent files)

### Security Issues
31. API keys or secrets in client-side code
32. Missing auth checks on protected API routes
33. Missing RLS on Supabase queries
34. Service role key used in client-side code

## How to audit
Use grep/ripgrep across the entire src/ directory for each pattern above.

## Output format
### Critical (Must fix before production):
| File | Line | Issue | Fix |

### Medium (Should fix soon):
| File | Line | Issue | Fix |

### Low (Nice to have):
| File | Line | Issue | Fix |

### Stub Pages:
| Page | Lines | Content | Action (Remove/Build/Hide) |
