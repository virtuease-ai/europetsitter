import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role key for webhook to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to format date as YYYY-MM-DD for Supabase date type
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.supabase_user_id;

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as any;

          // Determine status based on subscription state
          let status = 'active';
          if (subscription.status === 'trialing') {
            status = 'trial';
          }

          // Update user with subscription info
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: status,
              subscription_end_date: formatDate(subscription.current_period_end),
              trial_end_date: subscription.trial_end
                ? formatDate(subscription.trial_end)
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (error) {
            console.error('Error updating user after checkout:', error);
          } else {
            console.log(`Subscription activated for user ${userId}, status: ${status}`);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
          const customerId = invoice.customer as string;

          // Find user by stripe_customer_id
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();

          if (userData) {
            const { error } = await supabaseAdmin
              .from('users')
              .update({
                subscription_status: 'active',
                subscription_end_date: formatDate(subscription.current_period_end),
                updated_at: new Date().toISOString(),
              })
              .eq('id', userData.id);

            if (error) {
              console.error('Error updating user after invoice paid:', error);
            } else {
              console.log(`Invoice paid for user ${userData.id}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userData) {
          let status: string = 'active';

          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'cancelled';
          } else if (subscription.status === 'past_due') {
            status = 'expired';
          } else if (subscription.status === 'trialing') {
            status = 'trial';
          }

          const { error } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: status,
              subscription_end_date: formatDate(subscription.current_period_end),
              trial_end_date: subscription.trial_end
                ? formatDate(subscription.trial_end)
                : null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userData.id);

          if (error) {
            console.error('Error updating subscription:', error);
          } else {
            console.log(`Subscription updated for user ${userData.id}: ${status}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer_id
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userData) {
          const { error } = await supabaseAdmin
            .from('users')
            .update({
              subscription_status: 'cancelled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userData.id);

          if (error) {
            console.error('Error cancelling subscription:', error);
          } else {
            console.log(`Subscription cancelled for user ${userData.id}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
