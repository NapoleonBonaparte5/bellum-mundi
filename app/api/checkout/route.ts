// ═══════════════════════════════════════════════════════════
// BELLUM MUNDI — STRIPE CHECKOUT API
// POST /api/checkout — creates a Stripe Checkout Session
// Secret key never exposed to the browser
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })
  try {
    const { priceId, email, userId } = await req.json()

    if (!priceId || !email) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get or create Stripe customer
    const existing = await stripe.customers.list({ email, limit: 1 })
    let customerId: string

    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId ?? '' },
      })
      customerId = customer.id
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/es#pricing`,
      locale: 'es',
      subscription_data: {
        metadata: { supabase_user_id: userId ?? '' },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe checkout error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
