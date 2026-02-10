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
const formatDate = (timestamp: number | null | undefined): string | null => {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  if (isNaN(date.getTime())) return null;
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
        const customerId = session.customer as string;

        console.log('[Webhook] checkout.session.completed:', {
          userId,
          customerId,
          subscriptionId: session.subscription,
        });

        if (userId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as any;

          console.log('[Webhook] Subscription retrieved:', {
            id: subscription.id,
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            trial_end: subscription.trial_end,
          });

          // Determine status based on subscription state
          let status = 'active';
          if (subscription.status === 'trialing') {
            status = 'trial';
          }

          const subEndDate = formatDate(subscription.current_period_end);
          const trialEndDate = subscription.trial_end
            ? formatDate(subscription.trial_end)
            : null;

          // Update user with all subscription info (including stripe_customer_id as safety net)
          const updateData: Record<string, any> = {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            updated_at: new Date().toISOString(),
          };

          // Only set dates if they're valid
          if (subEndDate) updateData.subscription_end_date = subEndDate;
          if (trialEndDate) updateData.trial_end_date = trialEndDate;

          console.log('[Webhook] Updating user:', userId, updateData);

          const { error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);

          if (error) {
            console.error('[Webhook] Error updating user after checkout:', error);
          } else {
            console.log(`[Webhook] Subscription activated for user ${userId}, status: ${status}`);
          }
        } else {
          console.warn('[Webhook] checkout.session.completed missing data:', {
            userId,
            subscription: session.subscription,
          });
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
            const subEndDate = formatDate(subscription.current_period_end);
            const updateData: Record<string, any> = {
              subscription_status: 'active',
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            };
            if (subEndDate) updateData.subscription_end_date = subEndDate;

            const { error } = await supabaseAdmin
              .from('users')
              .update(updateData)
              .eq('id', userData.id);

            if (error) {
              console.error('[Webhook] Error updating user after invoice paid:', error);
            } else {
              console.log(`[Webhook] Invoice paid for user ${userData.id}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer as string;

        console.log(`[Webhook] ${event.type}:`, {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          trial_end: subscription.trial_end,
        });

        // Find user by stripe_customer_id OR by metadata
        let userId: string | null = null;
        const metaUserId = subscription.metadata?.supabase_user_id;

        if (metaUserId) {
          userId = metaUserId;
        } else if (customerId) {
          const { data: userData } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
          userId = userData?.id || null;
        }

        if (userId) {
          let status: string = 'active';

          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            status = 'cancelled';
          } else if (subscription.status === 'past_due') {
            status = 'expired';
          } else if (subscription.status === 'trialing') {
            status = 'trial';
          }

          const subEndDate = formatDate(subscription.current_period_end);
          const trialEndDate = subscription.trial_end
            ? formatDate(subscription.trial_end)
            : null;

          const updateData: Record<string, any> = {
            stripe_subscription_id: subscription.id,
            subscription_status: status,
            updated_at: new Date().toISOString(),
          };

          if (subEndDate) updateData.subscription_end_date = subEndDate;
          if (trialEndDate) updateData.trial_end_date = trialEndDate;

          // Also save stripe_customer_id if not already set
          if (customerId) updateData.stripe_customer_id = customerId;

          console.log(`[Webhook] Updating user ${userId}:`, updateData);

          const { error } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', userId);

          if (error) {
            console.error(`[Webhook] Error updating subscription for ${userId}:`, error);
          } else {
            console.log(`[Webhook] Subscription ${event.type} for user ${userId}: ${status}`);
          }
        } else {
          console.warn(`[Webhook] ${event.type}: Could not find user for customer ${customerId}`);
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
