import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric portion within a string label, e.g. "10+ yrs".
 * SSR-safe: renders the final value on first paint to avoid hydration mismatch,
 * then re-animates from 0 once the element enters the viewport on the client.
 */
export function CountUp({
  value,
  duration = 1200,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : value;

  const [display, setDisplay] = useState<string>(value);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  // Keep display in sync when the source value changes (e.g. live CMS updates).
  useEffect(() => {
    setDisplay(value);
    started.current = false;
  }, [value]);

  useEffect(() => {
    if (!match || !ref.current) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const step = (now: number) => {
              const p = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisplay(`${Math.round(target * eased)}${suffix}`);
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [match, target, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
