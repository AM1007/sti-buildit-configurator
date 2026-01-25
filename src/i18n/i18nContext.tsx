import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { type Language, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./types";

const STORAGE_KEY = "app-language";

type TranslationData = Record<string, unknown>;

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  loadModelTranslations: (modelId: string) => Promise<void>;
  isModelLoaded: (modelId: string) => boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
}

function storeLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
}

function getNestedValue(obj: TranslationData, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

function interpolate(
  template: string,
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

async function loadCommonTranslations(lang: Language): Promise<TranslationData> {
  const module = await import(`./locales/${lang}/common.json`);
  return module.default;
}

async function loadModelTranslationsFile(
  lang: Language,
  modelId: string
): Promise<TranslationData> {
  try {
    const module = await import(`./locales/models/${lang}/${modelId}.json`);
    return module.default;
  } catch {
    return {};
  }
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [lang, setLangState] = useState<Language>(getStoredLanguage);
  const [commonTranslations, setCommonTranslations] = useState<TranslationData>({});
  const [modelTranslations, setModelTranslations] = useState<
    Record<string, TranslationData>
  >({});
  const [loadedModels, setLoadedModels] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    loadCommonTranslations(lang)
      .then((data) => {
        setCommonTranslations(data);
        setIsLoading(false);
      })
      .catch(() => {
        setCommonTranslations({});
        setIsLoading(false);
      });
  }, [lang]);

  useEffect(() => {
    if (loadedModels.size === 0) return;

    const reloadModels = async () => {
      const newModelTranslations: Record<string, TranslationData> = {};
      
      for (const modelId of loadedModels) {
        const data = await loadModelTranslationsFile(lang, modelId);
        newModelTranslations[modelId] = data;
      }
      
      setModelTranslations(newModelTranslations);
    };

    reloadModels();
  }, [lang, loadedModels]);

  const setLang = useCallback((newLang: Language) => {
    if (SUPPORTED_LANGUAGES.includes(newLang)) {
      setLangState(newLang);
      storeLanguage(newLang);
    }
  }, []);

  const loadModelTranslationsCallback = useCallback(
    async (modelId: string) => {
      if (loadedModels.has(modelId)) return;

      const data = await loadModelTranslationsFile(lang, modelId);
      
      setModelTranslations((prev) => ({
        ...prev,
        [modelId]: data,
      }));
      
      setLoadedModels((prev) => new Set(prev).add(modelId));
    },
    [lang, loadedModels]
  );

  const isModelLoaded = useCallback(
    (modelId: string) => loadedModels.has(modelId),
    [loadedModels]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let value = getNestedValue(commonTranslations, key);

      if (value === undefined) {
        for (const modelData of Object.values(modelTranslations)) {
          value = getNestedValue(modelData, key);
          if (value !== undefined) break;
        }
      }

      if (value === undefined) {
        return key;
      }

      if (params) {
        return interpolate(value, params);
      }

      return value;
    },
    [commonTranslations, modelTranslations]
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      t,
      isLoading,
      loadModelTranslations: loadModelTranslationsCallback,
      isModelLoaded,
    }),
    [lang, setLang, t, isLoading, loadModelTranslationsCallback, isModelLoaded]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }
  
  return context;
}

export function useLanguage() {
  const { lang, setLang } = useTranslation();
  return { lang, setLang };
}