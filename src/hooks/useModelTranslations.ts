import { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../i18n';

export interface ModelTranslationStep {
  title: string;
  options: Record<string, string>;
}

export interface ModelTranslationMeta {
  name: string;
  description: string;
  heroTitle?: string;
  heroDescription?: string;
}

export interface ModelTranslation {
  meta: ModelTranslationMeta;
  steps: Record<string, ModelTranslationStep>;
}

interface UseModelTranslationsResult {
  meta: ModelTranslationMeta | null;
  getStepTitle: (stepId: string) => string;
  getOptionLabel: (stepId: string, optionId: string) => string;
  isLoaded: boolean;
  error: Error | null;
}

const translationCache = new Map<string, ModelTranslation>();

export function useModelTranslations(configuratorId: string): UseModelTranslationsResult {
  const { lang } = useLanguage();
  const [translation, setTranslation] = useState<ModelTranslation | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheKey = `${lang}:${configuratorId}`;

  useEffect(() => {
    let isMounted = true;

    async function loadTranslation() {
      const cached = translationCache.get(cacheKey);
      if (cached) {
        setTranslation(cached);
        setIsLoaded(true);
        setError(null);
        return;
      }

      setIsLoaded(false);
      setError(null);

      try {
        const module = await import(`../i18n/locales/${lang}/models/${configuratorId}.json`);
        const data: ModelTranslation = module.default || module;
        
        if (isMounted) {
          translationCache.set(cacheKey, data);
          setTranslation(data);
          setIsLoaded(true);
        }
      } catch (err) {
        if (lang !== 'en') {
          try {
            const fallbackModule = await import(`../i18n/locales/en/models/${configuratorId}.json`);
            const fallbackData: ModelTranslation = fallbackModule.default || fallbackModule;
            
            if (isMounted) {
              translationCache.set(cacheKey, fallbackData);
              setTranslation(fallbackData);
              setIsLoaded(true);
            }
            return;
          } catch {
            // Both languages failed
          }
        }

        if (isMounted) {
          const loadError = new Error(`Failed to load translations for model: ${configuratorId}`);
          setError(loadError);
          setIsLoaded(true);
          console.error(loadError);
        }
      }
    }

    loadTranslation();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, lang, configuratorId]);

  const getStepTitle = useCallback(
    (stepId: string): string => {
      if (!translation?.steps?.[stepId]) {
        return stepId.replace(/([A-Z])/g, ' $1').toUpperCase().trim();
      }
      return translation.steps[stepId].title;
    },
    [translation]
  );

  const getOptionLabel = useCallback(
    (stepId: string, optionId: string): string => {
      if (!translation?.steps?.[stepId]?.options?.[optionId]) {
        return `#${optionId}`;
      }
      return translation.steps[stepId].options[optionId];
    },
    [translation]
  );

  return {
    meta: translation?.meta ?? null,
    getStepTitle,
    getOptionLabel,
    isLoaded,
    error,
  };
}

export async function preloadModelTranslation(
  configuratorId: string,
  lang: string
): Promise<void> {
  const cacheKey = `${lang}:${configuratorId}`;
  
  if (translationCache.has(cacheKey)) {
    return;
  }

  try {
    const module = await import(`../i18n/locales/${lang}/models/${configuratorId}.json`);
    const data: ModelTranslation = module.default || module;
    translationCache.set(cacheKey, data);
  } catch {
    // Silent fail for preload
  }
}

export function clearModelTranslationCache(): void {
  translationCache.clear();
}

export default useModelTranslations;