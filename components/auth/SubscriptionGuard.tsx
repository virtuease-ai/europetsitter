'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

function checkSubscriptionValidity(user: {
  subscription_status?: string | null;
  trial_end_date?: string | null;
  subscription_end_date?: string | null;
}): boolean {
  const { subscription_status, trial_end_date, subscription_end_date } = user;
  const now = new Date();

  if (!subscription_status) return false;

  if (subscription_status === 'active') {
    if (subscription_end_date) {
      return new Date(subscription_end_date) > now;
    }
    return true;
  }

  if (subscription_status === 'trial') {
    if (!trial_end_date) return false;
    return new Date(trial_end_date) > now;
  }

  return false;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    // If no user, let AuthGuard handle it
    if (!user) {
      setAllowed(true); // AuthGuard will redirect
      return;
    }

    // Only check for sitters
    if (user.role !== 'sitter') {
      setAllowed(true);
      return;
    }

    // Need enriched data (subscription_status comes from DB enrichment)
    // If not yet enriched, wait for it
    if (!user.subscription_status && !user.trial_end_date) {
      // User might not be enriched yet - allow briefly to avoid flash
      // The enrichment from AuthContext will trigger a re-render
      return;
    }

    const isValid = checkSubscriptionValidity(user);

    if (!isValid) {
      router.replace(`/${locale}/petsitter/abonnement/paywall`);
    } else {
      setAllowed(true);
    }
  }, [loading, user, router, locale]);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
