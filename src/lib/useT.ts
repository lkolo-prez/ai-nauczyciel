import { create } from 'zustand';
import { translate, loadLocale, saveLocale, type Locale } from './i18n';

interface LocaleStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

// Tiny global locale store (separate from the learner store so language can
// change without touching progress data).
export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: loadLocale(),
  setLocale: (l) => {
    saveLocale(l);
    set({ locale: l });
  },
}));

// Translation hook. Returns t(key, vars) bound to the current locale, plus the
// locale and a setter — so any component re-renders when the language changes.
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return { t, locale, setLocale };
}

// Subject name localized via the i18n dictionary (data files stay Polish).
export function localizedSubject(locale: Locale, subjectId: string, fallback: string): string {
  return translate(locale, `subjects.${subjectId}`, undefined) || fallback;
}
