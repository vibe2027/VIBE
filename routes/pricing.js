/**
 * VIBE Pricing API Routes
 * GET /pricing/tiers, /pricing/extras, POST /pricing/checkout
 */

const express = require('express');
const { verifyToken, requirePremium } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { PRICING_TIERS, EXTRAS_AND_BOOSTS, BOOSTS, getPricingTier, formatPrice } = require('../config/pricing');

const router = express.Router();

// GET /pricing/tiers - List all pricing tiers
router.get('/tiers', rateLimiter('api'), (req, res) => {
  res.json({
    tiers: Object.values(PRICING_TIERS).map(tier => ({
      id: tier.id,
      name: tier.name,
      price: formatPrice(tier.price),
      billingCycle: tier.billingCycle,
      spotLimit: tier.spotLimit,
      features: tier.features,
      description: tier.description
    }))
  });
});

// GET /pricing/tiers/:tier - Get specific tier details
router.get('/tiers/:tier', rateLimiter('api'), (req, res) => {
  const tierConfig = getPricingTier(req.params.tier);
  if (!tierConfig) {
    return res.status(404).json({ error: 'Tier not found' });
  }

  res.json({
    ...tierConfig,
    price: formatPrice(tierConfig.price)
  });
});

// GET /pricing/extras - List add-on features
router.get('/extras', rateLimiter('api'), (req, res) => {
  const extras = Object.values(EXTRAS_AND_BOOSTS).map(extra => ({
    id: extra.id,
    name: extra.name,
    description: extra.description,
    pricing: extra.pricing.map(p => ({
      duration: p.duration,
      price: formatPrice(p.price)
    }))
  }));

  res.json({ extras });
});

// GET /pricing/boosts - List visibility boosts
router.get('/boosts', rateLimiter('api'), (req, res) => {
  const boosts = Object.values(BOOSTS).map(boost => ({
    id: boost.id,
    name: boost.name,
    description: boost.description,
    durations: boost.durations.map(d => ({
      days: d.days,
      price: formatPrice(d.price)
    }))
  }));

  res.json({ boosts });
});

// POST /pricing/checkout - Create checkout session (requires auth)
router.post('/checkout', rateLimiter('api'), verifyToken, async (req, res) => {
  const { tier, boostId, extraId, promoCode } = req.body;

  if (!tier && !boostId && !extraId) {
    return res.status(400).json({ error: 'Must specify tier, boost, or extra' });
  }

  try {
    // TODO: Integrate with Stripe to create checkout session
    // For now, return mock response
    res.json({
      checkoutId: `checkout_${Date.now()}`,
      url: 'https://checkout.stripe.com/pay/mock',
      total: '199.00',
      currency: 'CAD'
    });
  } catch (error) {
    console.error(`❌ Checkout error: ${error.message}`);
    res.status(500).json({ error: 'Checkout creation failed' });
  }
});

// GET /pricing/user - Get current user's tier & usage
router.get('/user', rateLimiter('api'), verifyToken, async (req, res) => {
  // TODO: Fetch from DB based on req.user.id
  res.json({
    currentTier: 'free',
    upgradeTo: 'premium',
    featuresAvailable: getPricingTier('free').features,
    nextBillingDate: null
  });
});

module.exports = router;
