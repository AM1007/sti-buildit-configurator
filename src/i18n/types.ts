export type Language = "uk" | "en";

export const DEFAULT_LANGUAGE: Language = "uk";

export const SUPPORTED_LANGUAGES: Language[] = ["uk", "en"];

export const LANGUAGE_LABELS: Record<Language, string> = {
  uk: "UA",
  en: "EN",
};

export interface TranslationKeys {
  common: {
    home: string;
    myList: string;
    reset: string;
    save: string;
    cancel: string;
    confirm: string;
    close: string;
    copy: string;
    copied: string;
    download: string;
    share: string;
    edit: string;
    delete: string;
    clear: string;
    clearAll: string;
    loading: string;
    error: string;
    success: string;
    noResults: string;
    required: string;
    optional: string;
    back: string;
    next: string;
    submit: string;
    privacy: string;
    terms: string;
    contact: string;
    allRightsReserved: string;
  };

  header: {
    logo: string;
  };

  footer: {
    copyright: string;
  };

  home: {
    heroTitle: string;
    heroSubtitle: string;
    configuratorsTitle: string;
    inDevelopment: string;
  };

  configurator: {
    editSelections: string;
    productPreview: string;
    productModel: string;
    previewNotAvailable: string;
    completeSelections: string;
    imageFailedToLoad: string;
    missingSelections: string;
    configurationComplete: string;
    addToMyList: string;
    removeFromMyList: string;
    inMyList: string;
    copyProductModel: string;
    copyUrl: string;
    downloadPdf: string;
    resetConfiguration: string;
    selectOption: string;
    optionDisabled: string;
    extendedLeadTimes: string;
    notUlListed: string;
    nonReturnable: string;
    customText: string;
    enterCustomText: string;
    lineCount: string;
    lines: string;
    maxCharacters: string;
    charactersRemaining: string;
    textPreview: string;
    submitCustomText: string;
  };

  myList: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
    browseConfigurators: string;
    itemsCount: string;
    savedAt: string;
    loadConfiguration: string;
    removeItem: string;
    clearList: string;
    clearListConfirm: string;
    exportXlsx: string;
    copyAllModels: string;
  };

  share: {
    menuTitle: string;
    copyUrl: string;
    copyProductModel: string;
    downloadPdf: string;
    urlCopied: string;
    modelCopied: string;
    pdfGenerated: string;
  };

  validation: {
    requiredField: string;
    maxLength: string;
    invalidCharacters: string;
  };

  toast: {
    addedToMyList: string;
    removedFromMyList: string;
    configurationReset: string;
    copiedToClipboard: string;
    errorOccurred: string;
  };
}

export type TranslationKey = keyof TranslationKeys;

export type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${NestedKeyOf<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

export type FlatTranslationKey = NestedKeyOf<TranslationKeys>;

export interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}