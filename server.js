/**
 * VIBE Backend Server
 * Handles Stripe checkout + webhooks + role management
 */

const express = require('express');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Supabase Client (service_role bypasses RLS)
// ─────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

// ⚠️ CRITICAL: Raw body parser for Stripe webhooks (MUST be before json)
app.post('/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Regular JSON parser for other routes
app.use(express.json());

// Simple auth middleware (optional — add if you want to verify requests)
function verifyAuth(req, res, next) {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  req.userId = auth; // In production, validate this token
  next();
}

// ─────────────────────────────────────────────────────────────
// ROUTE: Create Checkout Session
// ─────────────────────────────────────────────────────────────

app.post('/api/checkout-session', async (req, res) => {
  try {
    const { tier, auth_id, email } = req.body;

    // Validate input
    if (!tier || !auth_id || !email) {
      return res.status(400).json({
        error: 'Missing required fields: tier, auth_id, email'
      });
    }

    // Pricing tiers
    const PRICING = {
      premium: {
        priceId: process.env.STRIPE_PRICE_PREMIUM || 'price_123',
        name: 'VIBE Premium',
        description: '1 month premium access'
      },
      founder: {
        priceId: process.env.STRIPE_PRICE_FOUNDER || 'price_456',
        name: 'VIBE Founder Pass',
        description: 'Lifetime founder benefits'
      }
    };

    if (!PRICING[tier]) {
      return res.status(400).json({ error: `Invalid tier: ${tier}` });
    }

    console.log(`🛒 Creating checkout for ${auth_id} (${tier})`);

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICING[tier].priceId,
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: email,

      // ⚠️ CRITICAL: Metadata links payment to user
      metadata: {
        auth_id,
        tier
      },

      // Redirects after payment
      success_url: `${process.env.BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/payment/cancelled`
    });

    console.log(`✅ Checkout session created: ${session.id}`);
    res.json({ id: session.id, url: session.url });

  } catch (err) {
    console.error(`❌ Checkout error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ROUTE: Payment Success Redirect
// ─────────────────────────────────────────────────────────────

app.get('/payment/success', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.redirect('/dashboard?payment=missing');
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const authId = session.metadata.auth_id;

    console.log(`✅ Payment confirmed for ${authId}`);

    // Webhook already updated DB, but we can verify here
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .single();

    if (user?.role === 'premium') {
      res.redirect('/dashboard?payment=success&role=premium');
    } else {
      res.redirect('/dashboard?payment=success');
    }

  } catch (err) {
    console.error(`❌ Success redirect error: ${err.message}`);
    res.redirect('/dashboard?payment=error');
  }
});

app.get('/payment/cancelled', (req, res) => {
  res.redirect('/dashboard?payment=cancelled');
});

// ─────────────────────────────────────────────────────────────
// WEBHOOK: Stripe Events Handler
// ─────────────────────────────────────────────────────────────

async function handleWebhook(req, res) {
  const rawBody = req.body;
  const signature = req.headers['stripe-signature'];

  // Verify signature
  if (!verifyStripeSignature(rawBody, signature)) {
    console.error('❌ Invalid Stripe signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('✅ Stripe signature verified');

  // Parse JSON
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error(`❌ JSON parse error: ${err.message}`);
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log(`📨 Webhook event: ${event.type}`);

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const stripeCustomerId = paymentIntent.customer;
      const metadata = paymentIntent.metadata || {};
      const authId = metadata.auth_id;

      if (!authId) {
        console.error('❌ Missing auth_id in payment metadata');
        return res.status(400).json({ error: 'Missing auth_id' });
      }

      if (!stripeCustomerId) {
        console.error('❌ Missing customer ID');
        return res.status(400).json({ error: 'Missing customer ID' });
      }

      await assignPremiumRole(authId, stripeCustomerId);
      return res.status(200).json({ received: true });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      console.log(`⚠️ Payment failed: ${paymentIntent.id}`);
      // Optional: notify user
      return res.status(200).json({ received: true });
    }

    // Ignore other events
    console.log(`⏭️ Ignoring event: ${event.type}`);
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER: Verify Stripe Signature (HMAC-SHA256)
// ─────────────────────────────────────────────────────────────

function verifyStripeSignature(body, signature) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET || !signature) {
    console.error('❌ Missing WEBHOOK_SECRET or stripe-signature');
    return false;
  }

  // Parse signature: t=timestamp,v1=hash
  const parts = signature.split(',');
  const timestamp = parts[0]?.split('=')[1];
  const hash = parts[1]?.split('=')[1];

  if (!timestamp || !hash) {
    console.error('❌ Invalid signature format');
    return false;
  }

  // Reconstruct signed content
  const signedContent = `${timestamp}.${body}`;

  // Compute HMAC-SHA256
  const computed = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signedContent)
    .digest('hex');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER: Assign Premium Role
// ─────────────────────────────────────────────────────────────

async function assignPremiumRole(authId, stripeCustomerId) {
  console.log(`🔄 Assigning premium role to ${authId}`);

  // Find user by auth_id
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id, stripe_customer_id, role')
    .eq('auth_id', authId)
    .single();

  if (fetchError || !user) {
    console.error(`❌ User not found: ${authId}`);
    throw new Error(`User ${authId} not found`);
  }

  // Idempotence check
  if (user.stripe_customer_id === stripeCustomerId) {
    console.log(`✅ User already linked, idempotent OK`);
    return user;
  }

  // Update user
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({
      stripe_customer_id: stripeCustomerId,
      role: 'premium'
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error(`❌ Update error: ${updateError.message}`);
    throw updateError;
  }

  console.log(`✅ Premium assigned to ${authId}`);
  return updated;
}

// ─────────────────────────────────────────────────────────────
// ROUTE: Check User Status (for frontend)
// ─────────────────────────────────────────────────────────────

app.get('/api/user/status', async (req, res) => {
  try {
    const authId = req.headers.authorization?.split(' ')[1];

    if (!authId) {
      return res.status(401).json({ error: 'Missing auth' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('auth_id, email, role, stripe_customer_id')
      .eq('auth_id', authId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      auth_id: user.auth_id,
      email: user.email,
      role: user.role,
      is_premium: user.role === 'premium',
      stripe_linked: !!user.stripe_customer_id
    });

  } catch (err) {
    console.error(`❌ Status check error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ROUTE: Health Check
// ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    stripe: !!process.env.STRIPE_SECRET_KEY,
    supabase: !!process.env.SUPABASE_URL
  });
});

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 VIBE Server running on port ${PORT}`);
  console.log(`📍 Webhook endpoint: POST /api/webhooks/stripe`);
  console.log(`💳 Checkout endpoint: POST /api/checkout-session`);
  console.log(`✅ Health check: GET /health`);
});

module.exports = app;
