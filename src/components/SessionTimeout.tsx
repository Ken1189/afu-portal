'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import { Clock } from 'lucide-react';

const TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_MS = 5 * 60 * 1000; // 5 minute warning before logout
const CHECK_INTERVAL_MS = 60 * 1000; // Check every 60 seconds

export default function SessionTimeout() {
  const { user } = useAuth();
  const router = useRouter();
  const lastActivityRef = useRef(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login?reason=timeout');
  }, [router]);

  const handleStayLoggedIn = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  useEffect(() => {
    if (!user) return;

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    // Check for timeout periodically
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = TIMEOUT_MS - elapsed;

      if (remaining <= 0) {
        handleLogout();
      } else if (remaining <= WARNING_MS) {
        setShowWarning(true);
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setShowWarning(false);
      }
    }, CHECK_INTERVAL_MS);

    // Countdown timer when warning is showing
    let countdownInterval: NodeJS.Timeout | null = null;
    if (showWarning) {
      countdownInterval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [user, updateActivity, handleLogout, showWarning]);

  if (!user || !showWarning) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1B2A4A]">Session Expiring</h3>
            <p className="text-sm text-gray-500">Your session will expire due to inactivity</p>
          </div>
        </div>
        <p className="text-gray-600 mb-4">
          You will be automatically logged out in{' '}
          <span className="font-bold text-amber-600">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Log Out Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#5DB347] rounded-xl hover:bg-[#4ea03c] transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
