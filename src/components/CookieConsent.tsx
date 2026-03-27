'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield } from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Cookie consent values stored in localStorage & a cookie so the server can
// read preference if needed in the future.
// ---------------------------------------------------------------------------

type ConsentChoice = 'all' | 'essential';
const STORAGE_KEY = 'cookie_consent';
const COOKIE_NAME = 'cookie_consent';

function setConsentCookie(value: ConsentChoice) {
  // Set a cookie that expires in 1 year
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_NAME}=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if the user already made a choice
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so the banner slides in after initial paint
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    localStorage.setItem(STORAGE_KEY, choice);
    setConsentCookie(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-light/40 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-teal" />
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                <p>
                  We use cookies to improve your experience. Essential cookies
                  keep the site running; optional cookies help us understand
                  usage.{' '}
                  <Link
                    href="/legal/privacy"
                    className="text-teal underline underline-offset-2 hover:text-teal-dark transition-colors"
                  >
                    Learn more
                  </Link>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={() => handleChoice('essential')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-navy border-2 border-gray-300 rounded-lg hover:border-navy hover:bg-gray-50 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Essential Only
              </button>
              <button
                onClick={() => handleChoice('all')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal-dark transition-colors shadow-sm"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
