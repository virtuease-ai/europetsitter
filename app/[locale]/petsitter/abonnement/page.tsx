'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Check } from 'lucide-react';

function SubscriptionContent() {
  const { user } = useAuth();
  const t = useTranslations('sitterDashboard.subscriptionPage');
  const locale = useLocale();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE'
    );
  };

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('subscriptionType')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {user?.subscription_status === 'trial' ? t('trial') : t('plans.free')}
              </p>
            </div>
            {user?.trial_end_date && (
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('trialEnds')}</p>
                <p className="text-lg font-semibold mt-1">
                  {formatDate(user.trial_end_date)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Gratuit */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-2">{t('plans.free')}</h3>
            <p className="text-3xl font-bold mb-4">0€<span className="text-sm text-gray-600">/{t('perQuarter')}</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.visibleProfile')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>2 {t('features.unlimitedBookings').toLowerCase()}/max</span>
              </li>
            </ul>
            <button disabled className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed">
              {t('currentPlan')}
            </button>
          </div>

          {/* Essentiel */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-primary">
            <div className="bg-primary text-dark text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
              POPULAIRE
            </div>
            <h3 className="text-xl font-bold mb-2">{t('plans.essential')}</h3>
            <p className="text-3xl font-bold mb-4">29€<span className="text-sm text-gray-600">/{t('perQuarter')}</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.unlimitedBookings')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.prioritySupport')}</span>
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-dark font-semibold rounded-lg transition-colors">
              {t('subscribe')}
            </button>
          </div>

          {/* Premium */}
          <div className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
            <h3 className="text-xl font-bold mb-2">{t('plans.premium')}</h3>
            <p className="text-3xl font-bold mb-4">96€<span className="text-sm text-gray-600">/{t('perYear')}</span></p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.unlimitedBookings')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.prioritySupport')}</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-600 shrink-0" />
                <span>{t('features.analytics')}</span>
              </li>
            </ul>
            <button className="w-full py-2 px-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors">
              {t('subscribe')}
            </button>
          </div>
        </div>
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
