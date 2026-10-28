import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { translations } from 'assets/i18n';
import { Translation } from 'assets/i18n/en';
import { useSettings } from 'core/settings/settings.context';
import { Language } from 'types/language.interface';

interface LanguageValue {
  lang: Language;
  /** Texts of the current language, e.g. t.home.title. */
  t: Translation;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageValue | null>(null);

/** The language is one of the saved settings; this gives screens its texts. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const lang = settings.language;
  const value = useMemo(
    () => ({
      lang,
      t: translations[lang],
      setLanguage: (language: Language) => updateSettings({ language }),
    }),
    [lang, updateSettings],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return value;
}
