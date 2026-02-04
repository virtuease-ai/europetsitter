'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/client';
import { SitterLayout } from '@/components/layout/SitterLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SubscriptionGuard } from '@/components/auth/SubscriptionGuard';
import { Link } from '@/navigation';
import { User, Mail, Lock, Trash2, CreditCard } from 'lucide-react';

function SettingsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const t = useTranslations('sitterDashboard.settingsPage');
  const locale = useLocale();

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setAccountData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();

      const { error: userError } = await supabase
        .from('users')
        .update({ name: accountData.name })
        .eq('id', user.id);

      if (userError) throw userError;

      const { error: profileError } = await supabase
        .from('sitter_profiles')
        .update({ name: accountData.name })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'OK' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage({ type: 'error', text: err.message || 'Error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'OK' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage({ type: 'error', text: err.message || 'Error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('sitter_profiles')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      await signOut();
      window.location.href = `/${locale}`;
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage({ type: 'error', text: err.message || 'Error' });
    }
  };

  return (
    <SitterLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Informations du compte */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                {t('accountInfo')}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('displayName')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={accountData.name}
                    onChange={handleAccountChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={accountData.email}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-dark font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {t('save')}
                </button>
              </form>
            </div>
          </div>

          {/* Changer le mot de passe */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-600" />
                {t('changePassword')}
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('newPassword')}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-primary text-dark font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {t('updatePassword')}
                </button>
              </form>
            </div>
          </div>

          {/* Abonnement */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-600" />
                {t('subscription')}
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-primary-light/60 border border-primary/30 p-4 rounded-xl mb-4">
                <p className="font-medium text-primary mb-1">
                  {user?.subscription_status === 'trial' ? 'Trial period' : 'Active'}
                </p>
                {user?.trial_end_date && (
                  <p className="text-sm text-gray-700">
                    {new Date(user.trial_end_date).toLocaleDateString(locale === 'en' ? 'en-GB' : locale === 'nl' ? 'nl-BE' : 'fr-BE')}
                  </p>
                )}
              </div>
              <Link
                href="/petsitter/abonnement"
                className="text-primary hover:underline text-sm font-medium"
              >
                {t('manageSubscription')}
              </Link>
            </div>
          </div>

          {/* Zone dangereuse */}
          <div className="bg-white rounded-lg shadow border border-red-200">
            <div className="p-6 border-b border-red-200 bg-red-50 rounded-t-lg">
              <h2 className="text-xl font-semibold text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {t('dangerZone')}
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{t('deleteAccount')}</p>
                  <p className="text-sm text-gray-600">{t('deleteAccountText')}</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-red-600">
                {t('confirmDeleteAccount')}
              </h3>
              <p className="text-gray-700 mb-6">
                {t('deleteAccountText')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SitterLayout>
  );
}

export default function SitterSettingsPage() {
  return (
    <AuthGuard requiredRole="sitter">
      <SubscriptionGuard>
        <SettingsContent />
      </SubscriptionGuard>
    </AuthGuard>
  );
}
