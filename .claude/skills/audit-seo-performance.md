# SEO & Performance Auditor

Check every public page for SEO readiness and performance issues.

## SEO Checks

### Meta Tags
1. Every public page has unique title
2. Every public page has meta description
3. OG image is set (opengraph-image)
4. Twitter card meta tags
5. Canonical URLs
6. robots.txt exists and is correct
7. sitemap.xml exists and includes all public pages

### Content
8. Every public page has an h1 tag
9. Heading hierarchy is correct (h1 → h2 → h3)
10. No duplicate titles across pages
11. No thin pages (under 100 words of content)
12. Alt text on all images
13. Internal linking between related pages

### Technical SEO
14. Dynamic sitemap at /sitemap.xml — check what pages are included
15. robots.txt blocks portal pages, allows public pages
16. No noindex on pages that should be indexed
17. Clean URL structure (no query params for main pages)
18. 404 page returns proper 404 status code

## Performance Checks

### Page Weight
19. Homepage total JS bundle size
20. Largest images (find unoptimized images)
21. Check if next/image is used for all images
22. Check for unused CSS/JS imports

### Loading
23. Pages with large data fetches on initial load
24. Pages missing loading/skeleton states
25. Pages that block render waiting for API calls
26. Dynamic imports for heavy components (charts, maps)

### Core Web Vitals Indicators
27. Large layout shifts (elements that load and push content)
28. Long blocking JS tasks
29. Lazy loading on below-fold content

## Output format
### SEO Issues:
| Page | Issue | Impact | Fix |

### Performance Issues:
| Page | Issue | Impact | Fix |

### SEO Score: /100
### Performance Score: /100
