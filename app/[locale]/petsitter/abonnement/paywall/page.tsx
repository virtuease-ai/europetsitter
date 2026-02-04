'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { startFreeTrial } from '@/lib/stripe/actions';
import { STRIPE_CONFIG, PlanKey } from '@/lib/stripe/config';
import { Check, Sparkles, Crown, Zap } from 'lucide-react';
import Image from 'next/image';

function PaywallContent() {
  const t = useTranslations('paywall');
  const locale = useLocale();
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    if (!user) return;

    setLoading('trial');
    setError(null);

    try {
      await startFreeTrial(user.id);
      await refresh();
      router.push(`/${locale}/petsitter/tableau-de-bord`);
    } catch (err: any) {
      console.error('Error starting trial:', err);
      setError(t('errors.trialFailed'));
      setLoading(null);
    }
  };

  const handleSelectPlan = async (planKey: PlanKey) => {
    if (!user) return;

    setLoading(planKey);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planKey,
          userId: user.id,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      setError(t('errors.checkoutFailed'));
      setLoading(null);
    }
  };

  const plans: { key: PlanKey; icon: React.ReactNode; popular?: boolean }[] = [
    { key: 'quarterly', icon: <Zap className="w-6 h-6" /> },
    { key: 'semiannual', icon: <Sparkles className="w-6 h-6" />, popular: true },
    { key: 'annual', icon: <Crown className="w-6 h-6" /> },
  ];

  const features = [
    'unlimitedBookings',
    'visibleProfile',
    'prioritySupport',
    'analytics',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/30 to-white py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/logo.webp"
              alt="EuroPetSitter"
              width={180}
              height={60}
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Trial Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8 border-2 border-primary">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary-hover" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('trialTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('trialDescription')}</p>
            <button
              onClick={handleStartTrial}
              disabled={loading !== null}
              className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-dark font-bold text-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'trial' ? t('loading') : t('trialButton')}
            </button>
            <p className="text-sm text-gray-500 mt-3">{t('trialNote')}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-gray-500 font-medium">{t('orChoosePlan')}</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map(({ key, icon, popular }) => {
            const plan = STRIPE_CONFIG.prices[key];
            const planName = plan.name[locale as keyof typeof plan.name] || plan.name.fr;

            return (
              <div
                key={key}
                className={`relative bg-white rounded-2xl shadow-lg p-6 ${
                  popular ? 'border-2 border-primary ring-2 ring-primary/20' : 'border border-gray-200'
                }`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-dark text-sm font-bold px-4 py-1 rounded-full">
                      {t('popular')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                    popular ? 'bg-primary/20 text-primary-hover' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold">{planName}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.amount / 100}€</span>
                    <span className="text-gray-500">/{t(`periods.${key}`)}</span>
                  </div>
                  {key === 'annual' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {t('savings')}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t(`features.${feature}`)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(key)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    popular
                      ? 'bg-primary hover:bg-primary-hover text-dark'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {loading === key ? t('loading') : t('choosePlan')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-center text-gray-500 text-sm">
          {t('allPlansIncludeTrial')}
        </p>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaywallPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <PaywallContent />
    </AuthGuard>
  );
}
