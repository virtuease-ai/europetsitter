'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { STRIPE_CONFIG, PlanKey } from '@/lib/stripe/config';
import { Check, Sparkles, Crown, Zap, ExternalLink } from 'lucide-react';

function SubscriptionContent() {
  const { user } = useAuth();
  const t = useTranslations('sitterDashboard.subscriptionPage');
  const tPaywall = useTranslations('paywall');
  const locale = useLocale();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE'
    );
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

  const handleManageSubscription = async () => {
    if (!user) return;

    setLoading('portal');
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('Error creating portal session:', err);
      setError(t('errors.portalFailed'));
      setLoading(null);
    }
  };

  const getStatusLabel = () => {
    switch (user?.subscription_status) {
      case 'active':
        return t('active');
      case 'trial':
        return t('trial');
      case 'cancelled':
        return t('cancelled');
      case 'expired':
        return t('expired');
      default:
        return t('none');
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

  const isSubscribed = user?.subscription_status === 'active' || user?.stripe_subscription_id;

  return (
    <SitterLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('currentStatus')}</h2>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600">{t('subscriptionType')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {getStatusLabel()}
              </p>
            </div>
            {user?.trial_end_date && user?.subscription_status === 'trial' && (
              <div className="md:text-right">
                <p className="text-sm text-gray-600">{t('trialEnds')}</p>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(user.trial_end_date)}
                </p>
              </div>
            )}
            {user?.subscription_end_date && user?.subscription_status === 'active' && (
              <div className="md:text-right">
                <p className="text-sm text-gray-600">{t('renewsOn')}</p>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(user.subscription_end_date)}
                </p>
              </div>
            )}
          </div>

          {/* Manage subscription button */}
          {isSubscribed && (
            <button
              onClick={handleManageSubscription}
              disabled={loading === 'portal'}
              className="mt-4 flex items-center gap-2 text-primary hover:text-primary-hover font-medium transition-colors disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              {loading === 'portal' ? t('loading') : t('manageSubscription')}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Plans */}
        <h2 className="text-xl font-bold mb-4">{t('availablePlans')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
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
                      {tPaywall('popular')}
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
                    <span className="text-gray-500">/{tPaywall(`periods.${key}`)}</span>
                  </div>
                  {key === 'annual' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {tPaywall('savings')}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{tPaywall(`features.${feature}`)}</span>
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
                  {loading === key ? t('loading') : t('subscribe')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          {tPaywall('allPlansIncludeTrial')}
        </p>
      </div>
    </SitterLayout>
  );
}

export default function SitterSubscriptionPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <SubscriptionContent />
    </AuthGuard>
  );
}
