import { useI18n } from "../i18n/LanguageContext.jsx";

// Compact ES/EN segmented switch. Reads/writes the global language so the whole
// app (including api.ts content) re-localizes on toggle.
export default function LanguageToggle({ className = "" }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 p-0.5 text-xs font-bold ${className}`}
    >
      {["es", "en"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === code ? "bg-amber-500 text-black" : "text-white/50 hover:text-white/80"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
