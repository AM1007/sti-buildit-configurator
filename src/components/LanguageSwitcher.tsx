import { useLanguage, LANGUAGE_LABELS, type Language } from "../i18n";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = lang === "uk" ? "en" : "uk";
    setLang(newLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors rounded border border-gray-300 hover:border-brand-600"
      aria-label="Switch language"
    >
      <span className={lang === "uk" ? "text-brand-600 font-bold" : ""}>
        {LANGUAGE_LABELS.uk}
      </span>
      <span className="text-gray-400">/</span>
      <span className={lang === "en" ? "text-brand-600 font-bold" : ""}>
        {LANGUAGE_LABELS.en}
      </span>
    </button>
  );
}