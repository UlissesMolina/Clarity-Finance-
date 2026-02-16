import { useState, useEffect, useRef } from 'react';

export interface UseCountUpOptions {
  /** Start value (default 0) */
  start?: number;
  /** Duration in ms (default 1600) */
  duration?: number;
  /** Easing: 'easeOutQuart' | 'linear' (default easeOutQuart) */
  easing?: 'easeOutQuart' | 'linear';
  /** Only run when true (e.g. when in view) */
  enabled?: boolean;
  /** Run only once when enabled becomes true */
  runOnce?: boolean;
}

function easeOutQuart(t: number): number {
  return 1 - (1 - t) ** 4;
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
): number {
  const {
    start = 0,
    duration = 1600,
    easing = 'easeOutQuart',
    enabled = true,
    runOnce = true,
  } = options;

  const [value, setValue] = useState(start);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!enabled || (runOnce && hasRunRef.current)) return;
    hasRunRef.current = true;

    const startTime = performance.now();
    const range = end - start;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easing === 'easeOutQuart' ? easeOutQuart(t) : t;
      setValue(Math.round(start + range * eased));
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [enabled, end, start, duration, easing, runOnce]);

  return value;
}
