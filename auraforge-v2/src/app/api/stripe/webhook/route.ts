import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[Webhook] Invalid signature:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      // ── Checkout completed ─────────────────────────────────────────
      case 'checkout.session.completed': {
        // Use Stripe.Checkout.Session (correct namespace)
        const session = event.data.object as Stripe.Checkout.Session
        const userId  = session.metadata?.userId
        if (!userId) break

        const customerId     = typeof session.customer === 'string' ? session.customer : null
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null

        await supabase
          .from('users')
          .update({ is_premium: true, stripe_customer_id: customerId })
          .eq('id', userId)

        if (subscriptionId) {
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: session.metadata?.priceId ?? '',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          })
        }
        break
      }

      // ── Subscription updated ───────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const isActive = ['active', 'trialing'].includes(sub.status)
        await supabase.from('users').update({ is_premium: isActive }).eq('id', userId)
        await supabase.from('subscriptions').update({
          status: sub.status as 'active' | 'canceled' | 'past_due' | 'trialing',
          cancel_at_period_end: sub.cancel_at_period_end,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      // ── Subscription cancelled ─────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub    = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await supabase.from('users').update({ is_premium: false }).eq('id', userId)
        await supabase.from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    // Don't return 500 — Stripe will retry; just log
  }

  return NextResponse.json({ received: true })
}
