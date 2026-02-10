import { fr, enGB, nl } from 'date-fns/locale';
import type { Locale } from 'date-fns';

const localeMap: Record<string, Locale> = {
  fr,
  en: enGB,
  nl,
};

export function getDateFnsLocale(locale: string): Locale {
  return localeMap[locale] || fr;
}
