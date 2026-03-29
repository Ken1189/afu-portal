'use client';

import { useEffect } from 'react';

/**
 * S7.6: Web Vitals monitoring component.
 * Reports Core Web Vitals (LCP, FID/INP, CLS) to console and optionally to analytics.
 * Add <WebVitals /> to root layout to start collecting.
 */
export function WebVitals() {
  useEffect(() => {
    // Dynamic import to avoid bundling web-vitals for users who don't need it
    import('web-vitals').then(({ onCLS, onLCP, onINP, onTTFB }) => {
      const reportMetric = (metric: { name: string; value: number; id: string; rating: string }) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
        }

        // Send to analytics endpoint (Sentry, Vercel Analytics, etc.)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
          // Beacon API for reliable delivery even on page unload
          const body = JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
            page: window.location.pathname,
          });

          if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/vitals', body);
          }
        }
      };

      onCLS(reportMetric);
      onLCP(reportMetric);
      onINP(reportMetric);
      onTTFB(reportMetric);
    }).catch(() => {
      // web-vitals not installed — that's fine, skip silently
    });
  }, []);

  return null;
}
