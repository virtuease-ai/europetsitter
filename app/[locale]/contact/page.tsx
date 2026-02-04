'use client';

import { useState } from 'react';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

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

export default function ContactPage() {
  const t = useTranslations('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const subjects = [
    { key: 'general', label: t('form.subjects.general') },
    { key: 'support', label: t('form.subjects.support') },
    { key: 'partnership', label: t('form.subjects.partnership') },
    { key: 'report', label: t('form.subjects.report') },
    { key: 'other', label: t('form.subjects.other') },
  ];

  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[#f0f7f2]" />
        <SectionBgAccents />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('subtitle')}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 tracking-tight">{t('title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('description')}</p>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="relative py-16 md:py-24 px-4 border-t border-gray-100 overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Nos coordonnées */}
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('info.subtitle')}</p>
              <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('info.title')}</h2>
              <p className="text-gray-500 mb-8">{t('info.description')}</p>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="bg-primary/10 p-2.5 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-gray-900">{t('info.phone')}</h3>
                    <p className="text-gray-600">+32 2 123 45 67</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="bg-primary/10 p-2.5 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-gray-900">{t('info.email')}</h3>
                    <p className="text-gray-600">contact@europetsitter.be</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="bg-primary/10 p-2.5 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1 text-gray-900">{t('info.address')}</h3>
                    <p className="text-gray-600">Belgique</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-6 font-semibold">{t('info.followUs')}</p>
            </div>

            {/* Formulaire */}
            <div>
              <h2 className="text-2xl font-bold mb-6">{t('form.title')}</h2>
              {submitStatus === 'success' && (
                <div className="mb-6 p-6 bg-primary-light/60 border border-primary/30 rounded-2xl">
                  <h3 className="font-bold text-primary mb-2">{t('form.success.title')}</h3>
                  <p className="text-gray-700 text-sm mb-4">{t('form.success.text')}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus('idle')}
                    className="text-primary font-semibold text-sm hover:underline"
                  >
                    {t('form.success.sendAnother')}
                  </button>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  {t('form.error')}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.fullName')} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('form.fullNamePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.email')} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('form.emailPlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('form.phonePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.subject')} *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">{t('form.subjectPlaceholder')}</option>
                    {subjects.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('form.message')} *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder={t('form.messagePlaceholder')}
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">* {t('form.required')}</p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? t('form.submitting') : t('form.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Contact */}
      <section className="relative py-20 px-4 bg-[#f8faf9] overflow-hidden">
        <SectionBgAccents />
        <div className="container mx-auto max-w-3xl relative z-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">{t('faq.subtitle')}</p>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">{t('faq.title')}</h2>
          <p className="text-gray-500 mb-10">{t('faq.description')}</p>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold mb-3">{item.q}</h3>
                <p className="text-gray-600 text-sm">{item.a}</p>
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
    </div>
  );
}
