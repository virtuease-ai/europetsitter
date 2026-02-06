'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signUp } from '@/lib/auth/actions';

export default function SignupOwnerPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.name.trim()) {
      setError(t('errors.nameRequired'));
      return;
    }

    if (!formData.email.trim()) {
      setError(t('errors.emailRequired'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('errors.passwordMin'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (!formData.terms) {
      setError(t('errors.termsRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: 'owner',
      });

      if (!result.success) {
        setError(result.error || t('errors.genericError'));
        setIsLoading(false);
        return;
      }

      if (result.needsEmailConfirmation) {
        // Afficher message de confirmation email
        alert(t('checkEmail'));
        setIsLoading(false);
      } else {
        // Redirection vers le tableau de bord
        window.location.href = `/${locale}/proprietaire/tableau-de-bord`;
      }
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || t('errors.genericError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐕</div>
            <h1 className="text-3xl font-bold mb-2">{t('owner.title')}</h1>
            <p className="text-gray-600">
              {t('owner.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('fullName')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                placeholder={t('fullNamePlaceholder')}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                placeholder={t('emailPlaceholder')}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                placeholder={t('passwordPlaceholder')}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                placeholder={t('passwordPlaceholder')}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="mt-1"
                disabled={isLoading}
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('termsStart')}{' '}
                <Link href="/cgu" className="text-primary hover:underline">
                  {t('termsLink')}
                </Link>
                {' '}{t('termsAnd')}{' '}
                <Link href="/confidentialite" className="text-primary hover:underline">
                  {t('privacyLink')}
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-dark font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('submitting') : t('submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('alreadyAccount')}{' '}
              <Link href="/connexion" className="text-primary hover:underline font-semibold">
                {t('loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
