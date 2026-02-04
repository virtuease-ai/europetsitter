'use client';

import { Euro, Calendar, Users, TrendingUp, CheckCircle, Star } from 'lucide-react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

function SectionBgAccents() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-white/10" />
      <div className="absolute top-[25%] right-[12%] w-8 h-8 rounded-lg bg-white/10" />
      <div className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-lg bg-white/10" />
      <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-white/10" />
    </div>
  );
}

export default function BecomeSitterPage() {
  const t = useTranslations('becomeSitter');

  const advantages = [
    {
      title: t('whyJoin.income.title'),
      text: t('whyJoin.income.text'),
      stat: t('whyJoin.income.stat'),
      icon: Euro
    },
    {
      title: t('whyJoin.flexibility.title'),
      text: t('whyJoin.flexibility.text'),
      stat: t('whyJoin.flexibility.stat'),
      icon: Calendar
    },
    {
      title: t('whyJoin.noCommission.title'),
      text: t('whyJoin.noCommission.text'),
      stat: t('whyJoin.noCommission.stat'),
      icon: Users
    },
    {
      title: t('whyJoin.visibility.title'),
      text: t('whyJoin.visibility.text'),
      stat: t('whyJoin.visibility.stat'),
      icon: TrendingUp
    },
  ];

  const steps = [
    { title: t('howTo.step1.title'), text: t('howTo.step1.text') },
    { title: t('howTo.step2.title'), text: t('howTo.step2.text') },
    { title: t('howTo.step3.title'), text: t('howTo.step3.text') },
    { title: t('howTo.step4.title'), text: t('howTo.step4.text') },
  ];

  const services = [
    { emoji: '🏠', title: t('services.boarding.title'), text: t('services.boarding.text'), price: t('services.boarding.price') },
    { emoji: '☀️', title: t('services.dayCare.title'), text: t('services.dayCare.text'), price: t('services.dayCare.price') },
    { emoji: '🏡', title: t('services.homeVisit.title'), text: t('services.homeVisit.text'), price: t('services.homeVisit.price') },
    { emoji: '🐕', title: t('services.walking.title'), text: t('services.walking.text'), price: t('services.walking.price') },
    { emoji: '🚗', title: t('services.transport.title'), text: t('services.transport.text'), price: t('services.transport.price') },
  ];

  const testimonials = [
    {
      text: t('testimonials.testimonial1.text'),
      name: t('testimonials.testimonial1.name'),
      info: t('testimonials.testimonial1.role'),
      emoji: '👩'
    },
    {
      text: t('testimonials.testimonial2.text'),
      name: t('testimonials.testimonial2.name'),
      info: t('testimonials.testimonial2.role'),
      emoji: '👨'
    }
  ];

  const requirements = [
    t('requirements.age'),
    t('requirements.experience'),
    t('requirements.id'),
    t('requirements.housing'),
    t('requirements.insurance'),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4 overflow-hidden bg-primary">
        <SectionBgAccents />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-white/90 font-semibold text-sm uppercase tracking-widest mb-2">{t('subtitle')}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
          <div className="inline-block bg-white/15 backdrop-blur rounded-3xl px-6 py-3 mb-8 border border-white/20">
            <p className="text-xl font-bold text-white">
              🎁 {t('trialBadge')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/inscription/petsitter">
              <button className="bg-white hover:bg-gray-100 text-primary font-semibold px-8 py-3.5 rounded-full transition-all text-sm">
                {t('createProfile')}
              </button>
            </Link>
            <Link href="/comment-ca-marche">
              <button className="bg-primary-hover hover:bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-full border border-white/30 transition-all text-sm">
                {t('learnMore')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pourquoi devenir petsitter */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-primary/10" />
          <div className="absolute top-[25%] right-[12%] w-8 h-8 rounded-lg bg-primary/10" />
          <div className="absolute bottom-[20%] left-[15%] w-10 h-10 rounded-lg bg-primary/10" />
          <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-primary/10" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('whyJoin.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">{t('whyJoin.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((adv, i) => {
              const Icon = adv.icon;
              return (
                <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{adv.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{adv.text}</p>
                  <p className="text-primary font-semibold text-sm">{adv.stat}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[10%] left-[5%] w-12 h-12 rounded-lg bg-primary/10" />
          <div className="absolute bottom-[15%] right-[8%] w-14 h-14 rounded-lg bg-primary/10" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('howTo.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            {t('howTo.title')}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services que vous pouvez offrir */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[20%] right-[10%] w-10 h-10 rounded-lg bg-primary/10" />
          <div className="absolute bottom-[25%] left-[8%] w-8 h-8 rounded-lg bg-primary/10" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('services.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            {t('services.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="text-4xl mb-3">{service.emoji}</div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-3 leading-relaxed">{service.text}</p>
                <p className="text-xs text-primary font-semibold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages petsitters */}
      <section className="relative py-16 md:py-24 px-4 bg-[#f8faf9] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[15%] left-[8%] w-10 h-10 rounded-lg bg-primary/10" />
          <div className="absolute bottom-[20%] right-[12%] w-12 h-12 rounded-lg bg-primary/10" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('testimonials.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            {t('testimonials.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map((j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-5 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                    {testimonial.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conditions */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[30%] right-[5%] w-8 h-8 rounded-lg bg-primary/10" />
        </div>
        <div className="container mx-auto max-w-4xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest text-center mb-2">{t('requirements.subtitle')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">{t('requirements.title')}</h2>
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <ul className="space-y-4">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t('cta.title')}
          </h2>
          <p className="text-lg text-white/90 mb-2">
            {t('cta.text')}
          </p>
          <p className="text-xl font-bold text-white mb-8">
            🎁 {t('cta.trialText')}
          </p>
          <Link href="/inscription/petsitter">
            <button className="bg-white hover:bg-gray-100 text-primary font-semibold px-10 py-3.5 rounded-full transition-all text-sm">
              {t('cta.createBtn')}
            </button>
          </Link>
          <p className="text-sm text-white/80 mt-4">
            {t('cta.note')}
          </p>
        </div>
      </section>
    </div>
  );
}
