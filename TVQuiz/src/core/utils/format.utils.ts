import { Language } from 'types/language.interface';

const LOCALES: Record<Language, string> = {
  en: 'en-US',
  // ar-EG uses Arabic-Indic digits (١٢٣).
  ar: 'ar-EG',
};

// Creating an Intl formatter is slow on TVs (it loads locale data), so each one is made once
// per language and reused. Measured on an LG webOS TV: new formatters on every card cost ~60 ms
// per key press on Home.
const numberFormats = new Map<Language, Intl.NumberFormat>();
const dateFormats = new Map<Language, Intl.DateTimeFormat>();

export function formatNumber(value: number, lang: Language): string {
  let format = numberFormats.get(lang);
  if (!format) {
    format = new Intl.NumberFormat(LOCALES[lang]);
    numberFormats.set(lang, format);
  }
  return format.format(value);
}

/** Short date in the language's own style, e.g. "Oct 26, 2026" / "٢٦ أكتوبر ٢٠٢٦". */
export function formatDate(iso: string, lang: Language): string {
  let format = dateFormats.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(LOCALES[lang], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    dateFormats.set(lang, format);
  }
  return format.format(new Date(iso));
}
