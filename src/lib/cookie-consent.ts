export type ConsentLevel = "refused" | "essential" | "all";

const CONSENT_KEY = "ki_cookie_consent_v1";
const EVENT = "ki-consent-change";

/** Reads the stored consent choice. `null` = the visitor has not chosen yet. */
export function getConsent(): ConsentLevel | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (raw === "refused" || raw === "essential" || raw === "all") return raw;
  } catch {}
  return null;
}

export function setConsent(level: ConsentLevel) {
  try {
    window.localStorage.setItem(CONSENT_KEY, level);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: level }));
}

export function onConsentChange(cb: (level: ConsentLevel) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail as ConsentLevel);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/**
 * Session storage (session-only, keeps the user logged in for the current tab)
 * is used when consent is refused or not yet given: it is strictly necessary
 * and expires with the session. Persistent storage only after "essential"/"all".
 */
export function consentStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  const level = getConsent();
  try {
    return level === "essential" || level === "all" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}