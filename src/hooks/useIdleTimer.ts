import { useEffect, useRef, useCallback } from 'react';

export function useIdleTimer(onIdle: () => void, timeoutMs: number = 90000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onIdle);
  callbackRef.current = onIdle;

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callbackRef.current();
    }, timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      reset();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    reset();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [reset]);

  return reset;
}
