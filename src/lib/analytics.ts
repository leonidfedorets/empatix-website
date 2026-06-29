// Lightweight analytics helper.
// Pushes events into window.dataLayer (GTM / GA4 friendly) if available,
// otherwise logs to console in dev. Safe on SSR.
type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  try {
    const payload = { event, ...params };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
    if (import.meta.env.DEV) {
       
      console.debug("[analytics]", event, params);
    }
  } catch {
    /* no-op */
  }
}
