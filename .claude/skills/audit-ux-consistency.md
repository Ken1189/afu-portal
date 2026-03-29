# UX & Design Consistency Auditor

Check every page for consistent design patterns, component usage, and user experience.

## Design System Checks

### Colors
1. Are AFU brand colors used consistently? (#5DB347 green, #1B2A4A navy, #8CB89C sage)
2. Any hardcoded colors that don't match the brand?
3. Status colors consistent? (green=success, amber=warning, red=error, blue=info)
4. Background colors consistent across similar page types?

### Components
5. All buttons use the same styling pattern (rounded-xl, font-medium)
6. All cards use consistent border-radius, shadow, padding
7. All tables use same header styling
8. All modals use same overlay + centered card pattern
9. All toasts use same position + styling
10. All loading states use Loader2 spinner consistently
11. All empty states have clear messaging and CTA

### Typography
12. Headings use consistent sizes across portal pages
13. Body text size consistent
14. Font weight usage consistent (bold for headers, medium for buttons, normal for body)

### Spacing
15. Page padding consistent (p-4 sm:p-6)
16. Card padding consistent
17. Section spacing consistent
18. Form field spacing consistent

### Forms
19. All forms have labels
20. All required fields are marked
21. All forms show validation errors inline
22. All forms have loading state on submit button
23. All forms show success feedback after submit
24. All forms prevent double-submit

### Navigation
25. Active page highlighted in sidebar
26. Breadcrumbs where needed (deep nested pages)
27. Back buttons where needed
28. Home/escape route from every portal page

### Mobile
29. All tables have overflow-x-auto
30. All grids collapse to single column on mobile
31. Touch targets minimum 44px
32. No horizontal scroll on any page
33. Mobile sidebar drawer works

### Accessibility
34. All interactive elements are keyboard accessible
35. All images have alt text
36. Sufficient color contrast
37. Focus states visible
38. Form labels associated with inputs

## Output format
### Inconsistencies Found:
| Category | Page | Issue | Expected | Actual |

### UX Issues:
| Page | Issue | Severity | Fix |

### Consistency Score: /100
