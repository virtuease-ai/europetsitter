export const locales = ['fr', 'nl', 'en'] as const;
export const defaultLocale = 'fr' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  nl: 'Nederlands',
  en: 'English',
};
