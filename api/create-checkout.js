// api/create-checkout.js
// Vercel Serverless Function — crea una Stripe Checkout Session
// Nunca expone la Secret Key al frontend

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, email, userId } = req.body;

    if (!priceId || !email) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    // Crear o recuperar el customer de Stripe
    let customerId;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId || '' }
      });
      customerId = customer.id;
    }

    // Crear la Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/#pricing-section`,
      locale: 'es',
      subscription_data: {
        metadata: { supabase_user_id: userId || '' }
      },
      allow_promotion_codes: true, // Permite códigos descuento
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
