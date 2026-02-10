import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';

function SectionBgAccents() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-primary/10" />
      <div className="absolute top-[25%] right-[12%] w-8 h-8 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-lg bg-primary/10" />
      <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-primary/10" />
    </div>
  );
}

export default async function AProposPage() {
  const t = await getTranslations('about');

  const services = [
    t('services.boarding'),
    t('services.dayCare'),
    t('services.homeVisit'),
    t('services.dogWalking'),
    t('services.excursion'),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero - subtitle + headline */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#f0f7f2]" />
        <SectionBgAccents />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('subtitle')}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Notre philosophie - two columns, image right with rounded-3xl */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('philosophy.subtitle')}</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">{t('philosophy.title')}</h2>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {t('philosophy.text1')}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t('philosophy.text2')}
              </p>
              <blockquote className="border-l-4 border-primary pl-5 italic text-gray-700 rounded-r-xl py-2 bg-primary-light/20">
                "{t('philosophy.quote')}"
              </blockquote>
            </div>
            <div className="bg-primary-light/30 rounded-3xl aspect-[4/3] flex items-center justify-center text-7xl border-2 border-primary/20 shadow-sm" role="img" aria-label="Chien regardant au loin">
              🐕
            </div>
          </div>
        </div>
      </section>

      {/* Notre ambition - two columns, image left */}
      <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1 bg-primary-light/30 rounded-3xl aspect-[4/3] flex items-center justify-center text-7xl border-2 border-primary/20 shadow-sm" role="img" aria-label="Golden Retriever">
              🦮
            </div>
            <div className="order-1 md:order-2">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('ambition.subtitle')}</p>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">{t('ambition.title')}</h2>
              <p className="text-gray-600 mb-5 leading-relaxed">
                {t('ambition.text')}
              </p>
              <ul className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
                {services.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
              <blockquote className="border-l-4 border-primary pl-5 italic text-gray-700 rounded-r-xl py-2 bg-primary-light/20">
                "{t('ambition.quote')}"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
            {t('cta.text')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/recherche">
              <button className="bg-white hover:bg-gray-100 text-primary font-semibold px-8 py-3 rounded-full transition-all text-sm">
                {t('cta.findBtn')}
              </button>
            </Link>
            <Link href="/devenir-petsitter">
              <button className="bg-primary-hover hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all text-sm">
                {t('cta.becomeBtn')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
