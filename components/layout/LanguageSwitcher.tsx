'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/navigation';
import { localeNames, type Locale } from '@/i18n';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    setIsOpen(false);
    // Force a full page navigation to properly refresh auth state
    window.location.href = `/${newLocale}${pathname}`;
  };

  const locales: Locale[] = ['fr', 'nl', 'en'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="hidden sm:inline font-medium text-gray-700">
          {locale.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => changeLanguage(loc)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                locale === loc ? 'bg-gray-50 font-semibold text-primary' : 'text-gray-700'
              }`}
            >
              {localeNames[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
