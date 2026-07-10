// Framework-agnostic language source of truth.
// Lives outside React so plain modules (services/api.ts, zustand stores) can read
// the current language without a hook. The React layer (LanguageContext) syncs to it.

const STORAGE_KEY = "adshark_lang";
export const SUPPORTED = ["es", "en"];
export const DEFAULT_LANG = "en";

const listeners = new Set();

function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch { /* localStorage unavailable */ }
  // Fall back to the browser preference so ES speakers land in Spanish.
  const nav = (typeof navigator !== "undefined" && navigator.language) || "";
  return nav.toLowerCase().startsWith("es") ? "es" : DEFAULT_LANG;
}

let current = detectInitial();

export function getLang() {
  return current;
}

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch { /* ignore write failure */ }
  listeners.forEach((fn) => fn(lang));
}

// Subscribe to language changes; returns an unsubscribe fn.
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
