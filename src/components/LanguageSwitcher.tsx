import { LOCALES } from '../lib/i18n';
import { useT } from '../lib/useT';

// Compact flag toggle used in the Home header and onboarding.
export default function LanguageSwitcher() {
  const { locale, setLocale } = useT();
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white/5 p-0.5">
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          aria-label={l.label}
          title={l.label}
          className={`grid h-7 w-7 place-items-center rounded-full text-sm transition ${
            locale === l.id ? 'bg-brand text-white' : 'opacity-60 hover:opacity-100'
          }`}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
