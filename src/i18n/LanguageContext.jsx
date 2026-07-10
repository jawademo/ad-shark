import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getLang, setLang as setLangGlobal, subscribe } from "./lang.js";
import { translate } from "./ui.js";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getLang());

  // Keep React state in sync with the global language store (which api.ts and
  // the zustand stores also read). Any setLang call anywhere re-renders here.
  useEffect(() => subscribe(setLangState), []);

  const setLang = useCallback((next) => setLangGlobal(next), []);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider
export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}
