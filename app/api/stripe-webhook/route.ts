// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — STRIPE WEBHOOK API
// POST /api/stripe-webhook
// Verifies Stripe signature — activates / deactivates Premium
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  // Service Role — server only, never exposed to browser
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Webhook signature failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  switch (event.type) {

    // Payment completed → activate Premium
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const email = session.customer_details?.email
      const customerId = session.customer as string

      if (email) {
        await supabase
          .from('profiles')
          .update({ plan: 'premium', stripe_customer_id: customerId })
          .eq('email', email)
        console.log(`✓ Premium activated: ${email}`)
      }
      break
    }

    // Subscription plan change → update plan accordingly
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customerId = sub.customer as string
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      const status = sub.status
      if (customer.email) {
        const plan = (status === 'active' || status === 'trialing') ? 'premium' : 'free'
        await supabase.from('profiles').update({ plan }).eq('email', customer.email)
        console.log(`↔ Subscription updated (${status}): ${customer.email} → ${plan}`)
      }
      break
    }

    // Subscription cancelled / expired → downgrade to free
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice
      const customerId = (obj as Stripe.Subscription).customer as string

      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
      if (customer.email) {
        await supabase.from('profiles').update({ plan: 'free' }).eq('email', customer.email)
        console.log(`↓ Downgraded to free: ${customer.email}`)
      }
      break
    }

    // Invoice paid → confirm Premium active
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer

      if (customer.email) {
        await supabase.from('profiles').update({ plan: 'premium' }).eq('email', customer.email)
      }
      break
    }

    default:
      console.log(`Unhandled event: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}
