/**
 * Simple circuit breaker for Supabase calls.
 * After N consecutive failures, opens the circuit and returns fallback for cooldown period.
 */

interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuits = new Map<string, CircuitState>();

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 30_000; // 30 seconds

export function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const state = circuits.get(name) || { failures: 0, lastFailure: 0, isOpen: false };

  // Check if circuit is open
  if (state.isOpen) {
    if (Date.now() - state.lastFailure > COOLDOWN_MS) {
      // Half-open: try once
      state.isOpen = false;
      state.failures = 0;
    } else {
      return Promise.resolve(fallback);
    }
  }

  return fn().then(
    (result) => {
      state.failures = 0;
      state.isOpen = false;
      circuits.set(name, state);
      return result;
    },
    (error) => {
      state.failures++;
      state.lastFailure = Date.now();
      if (state.failures >= FAILURE_THRESHOLD) {
        state.isOpen = true;
        console.warn(`[CircuitBreaker] "${name}" opened after ${FAILURE_THRESHOLD} failures`);
      }
      circuits.set(name, state);
      return fallback;
    }
  );
}
