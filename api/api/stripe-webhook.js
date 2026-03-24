// api/stripe-webhook.js
// Escucha eventos de Stripe y actualiza el plan en Supabase automáticamente

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase con Service Role (solo en servidor — NUNCA en frontend)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Service Role Key — solo aquí
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar que el webhook viene realmente de Stripe
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // ── MANEJAR EVENTOS ──────────────────────────────────────
  switch (event.type) {

    // Pago completado → activar Premium
    case 'checkout.session.completed': {
      const session = event.data.object;
      const email = session.customer_details?.email;
      const customerId = session.customer;

      if (email) {
        await supabase
          .from('profiles')
          .update({
            plan: 'premium',
            stripe_customer_id: customerId
          })
          .eq('email', email); // match por email

        console.log(`✓ Premium activado: ${email}`);
      }
      break;
    }

    // Suscripción cancelada o expirada → degradar a free
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj = event.data.object;
      const customerId = obj.customer;

      // Buscar email del customer en Stripe
      const customer = await stripe.customers.retrieve(customerId);
      const email = customer.email;

      if (email) {
        await supabase
          .from('profiles')
          .update({ plan: 'free' })
          .eq('email', email);

        console.log(`↓ Plan degradado a free: ${email}`);
      }
      break;
    }

    // Suscripción renovada → confirmar Premium activo
    case 'invoice.paid': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const customer = await stripe.customers.retrieve(customerId);

      if (customer.email) {
        await supabase
          .from('profiles')
          .update({ plan: 'premium' })
          .eq('email', customer.email);
      }
      break;
    }

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.status(200).json({ received: true });
};
