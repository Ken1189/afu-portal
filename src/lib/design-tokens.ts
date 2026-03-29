/**
 * S6.5 + S6.6 + S6.7 + S6.13: AFU Design Tokens
 *
 * Central source of truth for spacing, focus rings, loading patterns,
 * and animation timings. Import these when building new components.
 */

// ── S6.5: Spacing Scale ──────────────────────────────────────────────────
// Use these Tailwind classes consistently across components.
// Gap between sections: gap-6 (24px)
// Card padding: p-6 (24px) for lg, p-4 (16px) for sm
// Form field gap: space-y-4 (16px)
// Inline element gap: gap-2 (8px) or gap-3 (12px)
export const SPACING = {
  section: 'gap-6',        // Between major sections
  card: {
    sm: 'p-4',             // Compact cards (dashboard widgets)
    md: 'p-5',             // Standard cards
    lg: 'p-6',             // Large cards (forms, modals)
  },
  formGap: 'space-y-4',   // Between form fields
  inlineGap: 'gap-2',     // Between inline elements (icons + text)
} as const;

// ── S6.6: Focus Ring ─────────────────────────────────────────────────────
// Single consistent focus ring pattern for all interactive elements.
export const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2';

// ── S6.7: Loading Patterns ───────────────────────────────────────────────
// Use Skeleton for layout placeholders, Spinner for action feedback.
// - Skeleton (animate-pulse): Page load, data fetching, initial render
// - Spinner (Loader2 from lucide): Button loading, form submission, actions
export const LOADING = {
  skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded',
  spinnerClass: 'animate-spin',
} as const;

// ── S6.12: Disabled State ────────────────────────────────────────────────
export const DISABLED = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

// ── S6.13: Animation Timings ─────────────────────────────────────────────
// Single spring config for all micro-interactions.
export const SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 };
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 400, damping: 25 };
export const FADE_IN = { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const };
