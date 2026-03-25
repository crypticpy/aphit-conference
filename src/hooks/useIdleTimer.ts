import { useEffect, useRef, useCallback } from "react";

export function useIdleTimer(
  onIdle: () => void,
  timeoutMs: number | null = 90000,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onIdle);
  useEffect(() => {
    callbackRef.current = onIdle;
  });

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (timeoutMs !== null) {
      timerRef.current = setTimeout(() => {
        callbackRef.current();
      }, timeoutMs);
    }
  }, [timeoutMs]);

  useEffect(() => {
    // Skip event listener registration when idle detection is disabled
    if (timeoutMs === null) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const handleActivity = () => {
      reset();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    reset();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [reset, timeoutMs]);

  return reset;
}
