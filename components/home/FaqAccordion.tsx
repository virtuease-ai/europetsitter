'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export function FaqAccordion() {
  const t = useTranslations('home');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ];

  return (
    <div className="container mx-auto max-w-3xl relative z-10">
      <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">FAQ</p>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">{t('faq.title')}</h2>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              className="w-full px-5 py-4 text-left font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="w-1 h-8 rounded-full bg-primary flex-shrink-0" />
                {item.q}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openFaqIndex === index && (
              <div className="px-5 pb-4 pt-0 text-gray-600 whitespace-pre-line text-sm leading-relaxed border-t border-gray-100">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
