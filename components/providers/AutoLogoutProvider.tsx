import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import toast from 'react-hot-toast';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const THROTTLE_MS = 500; // Only reset timer at most every 500ms

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'keydown',
  'keypress',
  'click',
  'scroll',
  'touchstart',
];

/**
 * AutoLogoutProvider
 *
 * Monitors user activity and automatically logs out
 * after 5 minutes of inactivity. Renders nothing —
 * just installs event listeners while the user is authenticated.
 */
export default function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResetRef = useRef<number>(Date.now());

  const handleLogout = useCallback(async () => {
    toast('You have been logged out due to 10 minutes of inactivity.', {
      icon: '🔒',
      duration: 5000,
    });
    await logout();
    // Clear all storage to remove stale tokens
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/signin';
  }, [logout]);

  const resetTimer = useCallback(() => {
    // Throttle: skip if last reset was < THROTTLE_MS ago
    const now = Date.now();
    if (now - lastResetRef.current < THROTTLE_MS) return;
    lastResetRef.current = now;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Start the idle timer
    timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);

    // Listen for activity
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [isAuthenticated, resetTimer, handleLogout]);

  return <>{children}</>;
}
