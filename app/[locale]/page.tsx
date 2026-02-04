'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { Search, ChevronDown } from 'lucide-react';
import { getOrganizationSchema, getWebSiteSchema, generateStructuredData } from '@/lib/structuredData';

// Lazy load the slider component (below the fold, does DB query)
const HomeSittersSlider = dynamic(
  () => import('@/components/home/HomeSittersSlider').then(mod => mod.HomeSittersSlider),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    ),
  }
);

type InfoTab = 'owners' | 'app' | 'sitters';

/* Decorative background squares (Animal Cove style) */
function SectionBgAccents() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-primary/10" />
      <div className="absolute top-[25%] right-[12%] w-8 h-8 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-primary/10" />
      <div className="absolute top-[50%] left-[3%] w-6 h-6 rounded-lg bg-primary/10" />
      <div className="absolute top-[60%] right-[20%] w-8 h-8 rounded-lg bg-primary/10" />
    </div>
  );
}

export default function HomePage() {
  const t = useTranslations('home');
  const [activeInfoTab, setActiveInfoTab] = useState<InfoTab>('owners');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateStructuredData(getOrganizationSchema())} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateStructuredData(getWebSiteSchema())} />

      <div className="min-h-screen bg-white">
        {/* Hero - two columns: text left, image/deco right (Animal Cove style) */}
        <section className="relative py-20 md:py-28 lg:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[#f0f7f2]" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <SectionBgAccents />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t('hero.title')} <span className="text-primary">{t('hero.titleHighlight')}</span> {t('hero.titleEnd')}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t('hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/recherche">
                    <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm">
                      <Search className="w-5 h-5" />
                      {t('hero.searchBtn')}
                    </button>
                  </Link>
                  <Link href="/devenir-petsitter">
                    <button className="bg-white hover:bg-gray-50 text-primary font-semibold px-8 py-3.5 rounded-full border-2 border-primary transition-all">
                      {t('hero.becomeBtn')}
                    </button>
                  </Link>
                </div>
              </div>
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-dashed border-primary/40 bg-primary-light/30 flex items-center justify-center shadow-lg">
                  <span className="text-8xl md:text-9xl" role="img" aria-label="Chien">🐕</span>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-primary/20 border-2 border-dashed border-primary/50 flex items-center justify-center text-4xl" aria-hidden>🐈</div>
                <div className="absolute top-4 -left-2 w-16 h-16 rounded-full bg-primary/20 border-2 border-dashed border-primary/50 flex items-center justify-center text-3xl" aria-hidden>🐶</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section PetSitters affiliés - slider infini sur 2 lignes */}
        <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
          <SectionBgAccents />
          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="text-center mb-10">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Nos PetSitters</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{t('affiliates.title')}</h2>
              <p className="text-gray-500 mb-4 max-w-xl mx-auto">{t('affiliates.scrollHint')}</p>
            </div>
            
            {/* Slider infini */}
            <HomeSittersSlider />
            
            {/* CTA */}
            <div className="flex flex-wrap gap-3 justify-center mt-10">
              <Link href="/recherche">
                <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-full transition-all text-sm">
                  Voir tous les PetSitters
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Informations pratiques - tabs + card with green subtitle */}
        <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
          <SectionBgAccents />
          <div className="container mx-auto max-w-4xl relative z-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">Informations</p>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">Informations pratiques</h2>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              <button
                onClick={() => setActiveInfoTab('owners')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeInfoTab === 'owners' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
                }`}
              >
                {t('tabs.owners')}
              </button>
              <button
                onClick={() => setActiveInfoTab('app')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeInfoTab === 'app' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
                }`}
              >
                {t('tabs.app')}
              </button>
              <button
                onClick={() => setActiveInfoTab('sitters')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeInfoTab === 'sitters' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:text-gray-900 border-2 border-primary'
                }`}
              >
                {t('tabs.sitters')}
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 shadow-sm">
              {activeInfoTab === 'owners' && (
                <>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('ownersTab.title')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('ownersTab.shortText')}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {t('ownersTab.fullText')}
                  </p>
                  <Link href="/recherche">
                    <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm">
                      {t('ownersTab.discoverBtn')}
                    </button>
                  </Link>
                </>
              )}

              {activeInfoTab === 'app' && (
                <>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('appTab.title')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('appTab.shortText')}
                  </p>
                  <p className="text-gray-600">
                    {t('appTab.fullText')}
                  </p>
                </>
              )}

              {activeInfoTab === 'sitters' && (
                <>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{t('sittersTab.title')}</h3>
                  <p className="text-gray-600 mb-4">
                    {t('sittersTab.shortText')}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {t('sittersTab.fullText')}
                  </p>
                  <Link href="/devenir-petsitter">
                    <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-5 py-2.5 rounded-full transition-all text-sm">
                      {t('sittersTab.becomeBtn')}
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Blog section - subtitle + headline + CTA */}
        <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
          <SectionBgAccents />
          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Notre blog</p>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{t('blog.title')}</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">{t('blog.subtitle')}</p>
            <Link href="/blog">
              <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-full transition-all text-sm">
                {t('blog.viewAll')}
              </button>
            </Link>
          </div>
        </section>

        {/* FAQ - green subtitle + accordion with left border accent (testimonial style) */}
        <section id="faq" className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
          <SectionBgAccents />
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
        </section>
      </div>
    </>
  );
}
