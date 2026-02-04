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

  // No subscription status means never set up
  if (!subscription_status) {
    return false;
  }

  // Active subscription
  if (subscription_status === 'active') {
    // If there's an end date, check it hasn't passed
    if (subscription_end_date) {
      return new Date(subscription_end_date) > now;
    }
    return true;
  }

  // Trial period
  if (subscription_status === 'trial') {
    if (!trial_end_date) {
      return false;
    }
    return new Date(trial_end_date) > now;
  }

  // Expired or cancelled
  return false;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // If no user, let AuthGuard handle it
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Only check for sitters
    if (user.role !== 'sitter') {
      setIsChecking(false);
      return;
    }

    // Check subscription validity
    const isValid = checkSubscriptionValidity(user);

    if (!isValid) {
      router.replace(`/${locale}/petsitter/abonnement/paywall`);
    } else {
      setIsChecking(false);
    }
  }, [loading, user, router, locale]);

  // Show loading while checking
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  // If no user, return null (AuthGuard will handle redirect)
  if (!user) {
    return null;
  }

  // For non-sitters, just render children
  if (user.role !== 'sitter') {
    return <>{children}</>;
  }

  // Check again before rendering (in case effect hasn't redirected yet)
  const isValid = checkSubscriptionValidity(user);
  if (!isValid) {
    return null;
  }

  return <>{children}</>;
}
