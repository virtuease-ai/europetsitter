'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signIn } from '@/lib/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError(t('errors.fillAllFields'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setError(result.error || t('errors.invalidCredentials'));
        setIsLoading(false);
        return;
      }

      // Attendre que les cookies soient mis à jour
      console.log('Connexion réussie, redirection...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirection selon le rôle
      if (result.role === 'sitter') {
        window.location.href = `/${locale}/petsitter/tableau-de-bord`;
      } else {
        window.location.href = `/${locale}/proprietaire/tableau-de-bord`;
      }
    } catch (err: any) {
      setError(err.message || t('errors.genericError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
            <p className="text-gray-600">
              {t('subtitle')}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  className="rounded"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  {t('rememberMe')}
                </label>
              </div>
              <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">
                {t('forgotPassword')}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-dark font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('submitting') : t('submit')}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-600">{t('noAccount')}</p>
            <div className="flex gap-2">
              <Link
                href="/inscription/petsitter"
                className="flex-1 bg-primary hover:bg-primary-hover text-dark font-semibold py-2 rounded-lg transition-all text-center"
              >
                {t('becomePetsitter')}
              </Link>
              <Link
                href="/inscription/proprietaire"
                className="flex-1 border-2 border-dark hover:bg-gray-50 text-dark font-semibold py-2 rounded-lg transition-all text-center"
              >
                {t('owner')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
