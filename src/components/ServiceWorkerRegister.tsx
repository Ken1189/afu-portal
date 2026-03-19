'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[AFU] Service Worker registered:', registration.scope);
        })
        .catch((err) => {
          console.warn('[AFU] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}
