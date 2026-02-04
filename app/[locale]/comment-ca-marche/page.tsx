'use client';

import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Search, Calendar, MessageCircle, CheckCircle, Shield, Heart, Zap, Users } from 'lucide-react';

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

export default function CommentCaMarchePage() {
  const t = useTranslations('howItWorks');

  const advantages = [
    { title: t('advantages.community.title'), text: t('advantages.community.text'), icon: Users },
    { title: t('advantages.security.title'), text: t('advantages.security.text'), icon: Shield },
    { title: t('advantages.personalized.title'), text: t('advantages.personalized.text'), icon: Heart },
    { title: t('advantages.flexible.title'), text: t('advantages.flexible.text'), icon: Zap },
  ];

  const servicesList = [
    { name: t('servicesList.boarding.name'), desc: t('servicesList.boarding.desc') },
    { name: t('servicesList.dayCare.name'), desc: t('servicesList.dayCare.desc') },
    { name: t('servicesList.visits.name'), desc: t('servicesList.visits.desc') },
    { name: t('servicesList.walks.name'), desc: t('servicesList.walks.desc') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#f0f7f2]" />
        <SectionBgAccents />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('subtitle')}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">{t('description')}</p>
          <Link href="/recherche">
            <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3 rounded-full transition-all text-sm">
              {t('startNow')}
            </button>
          </Link>
        </div>
      </section>

      {/* Les 3 étapes */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('steps.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-900">{t('steps.title')}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">{t('steps.description')}</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">{t('steps.step1.title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('steps.step1.text')}</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">{t('steps.step2.title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('steps.step2.text')}</p>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
              <div className="bg-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">{t('steps.step3.title')}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{t('steps.step3.text')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('advantages.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{t('advantages.title')}</h2>
          <p className="text-gray-500 mb-10 max-w-2xl">{t('advantages.description')}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-5 shadow-sm">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1.5 text-gray-900">{adv.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{adv.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('servicesList.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{t('servicesList.title')}</h2>
          <p className="text-gray-500 mb-6 max-w-2xl">{t('servicesList.description')}</p>
          <blockquote className="border-l-4 border-primary pl-5 italic text-gray-600 text-sm mb-10">
            "{t('servicesList.quote')}"
          </blockquote>
          <div className="grid md:grid-cols-2 gap-4">
            {servicesList.map((s, i) => (
              <div key={i} className="bg-[#f8faf9] rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-0.5">{s.name}</h3>
                  <p className="text-gray-600 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{t('cta.title')}</h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">{t('cta.text')}</p>
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

      {/* FAQ */}
      <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('faqSection.subtitle')}</p>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('faqSection.title')}</h2>
          <p className="text-gray-500 mb-8">{t('faqSection.description')}</p>
          <Link href="/#faq">
            <button className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-2.5 rounded-full transition-all text-sm">
              {t('faqSection.viewAll')}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
