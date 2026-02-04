import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { STRIPE_CONFIG, PlanKey } from '@/lib/stripe/config';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { planKey, userId, locale = 'fr' } = await request.json();

    if (!planKey || !userId) {
      return NextResponse.json(
        { error: 'Missing planKey or userId' },
        { status: 400 }
      );
    }

    // Validate plan key
    if (!STRIPE_CONFIG.prices[planKey as PlanKey]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const plan = STRIPE_CONFIG.prices[planKey as PlanKey];
    const supabase = await createClient();

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let customerId = userData.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.name || undefined,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Save Stripe customer ID to database
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Get the site URL for redirects
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Create checkout session with trial period
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.trialDays,
        metadata: {
          supabase_user_id: userId,
          plan_key: planKey,
        },
      },
      success_url: `${siteUrl}/${locale}/petsitter/tableau-de-bord?subscription=success`,
      cancel_url: `${siteUrl}/${locale}/petsitter/abonnement/paywall?cancelled=true`,
      metadata: {
        supabase_user_id: userId,
        plan_key: planKey,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
