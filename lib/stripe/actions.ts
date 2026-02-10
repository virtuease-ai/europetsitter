'use server';

import { createClient } from '@/lib/supabase/server';

export async function checkSubscriptionStatus(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .select('subscription_status, trial_end_date, subscription_end_date, stripe_customer_id, stripe_subscription_id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking subscription:', error);
    return { isValid: false, status: null };
  }

  const now = new Date();

  // Check if subscription is active
  if (data.subscription_status === 'active') {
    // Check if subscription hasn't expired
    if (data.subscription_end_date) {
      const endDate = new Date(data.subscription_end_date);
      if (endDate > now) {
        return { isValid: true, status: 'active', endDate: data.subscription_end_date };
      }
    }
    return { isValid: true, status: 'active' };
  }

  // Check if trial is still valid
  if (data.subscription_status === 'trial') {
    if (data.trial_end_date) {
      const trialEnd = new Date(data.trial_end_date);
      if (trialEnd > now) {
        return { isValid: true, status: 'trial', endDate: data.trial_end_date };
      }
    }
    return { isValid: false, status: 'trial_expired' };
  }

  // No valid subscription
  return { isValid: false, status: data.subscription_status || 'none' };
}
