/**
 * VIBE Pricing Engine
 * Founder Pass $199/year | Premium $149/year | Free tier | Boosts & Extras à la carte
 */

const PRICING_TIERS = {
  founder: {
    id: 'founder_pass_2026',
    name: 'Founder Pass',
    price: 19900, // $199 CAD in cents
    currency: 'CAD',
    billingCycle: 'yearly',
    spotLimit: 500,
    features: {
      salonFloating: { unlimited: true, distanceKm: null },
      salonVoice: true,
      ghostMode: true,
      compatibilityFilters: true,
      guardianAngels: 4,
      boosts: { monthly: 1, free: true },
      badge: 'Founder',
      founderBadge: true,
      tribunalImmunity: true,
      prioritySupport: true,
      earlyAccess: true,
      maxProfilePhotos: 20,
      responseTime: '1h'
    },
    stripeProductId: process.env.STRIPE_PRODUCT_FOUNDER || 'prod_founder_2026',
    stripePriceId: process.env.STRIPE_PRICE_FOUNDER || 'price_founder_2026',
    description: 'The ultimate VIBE experience. Founder status, unlimited access, tribunal immunity.'
  },

  premium: {
    id: 'premium_standard_2026',
    name: 'Premium Standard',
    price: 14900, // $149 CAD in cents
    currency: 'CAD',
    billingCycle: 'yearly',
    spotLimit: null,
    features: {
      salonFloating: { unlimited: true, distanceKm: null },
      salonVoice: true,
      ghostMode: true,
      compatibilityFilters: true,
      guardianAngels: 1,
      boosts: { monthly: 0, pricedAt: 'addon' },
      badge: 'Premium',
      founderBadge: false,
      tribunalImmunity: false,
      prioritySupport: false,
      earlyAccess: false,
      maxProfilePhotos: 15,
      responseTime: '24h'
    },
    stripeProductId: process.env.STRIPE_PRODUCT_PREMIUM || 'prod_premium_2026',
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM || 'price_premium_2026',
    description: 'Full premium experience. All salons, filters, and tools. Community support.'
  },

  free: {
    id: 'free_tier_2026',
    name: 'Free',
    price: 0,
    currency: 'CAD',
    billingCycle: 'free',
    spotLimit: null,
    features: {
      salonFloating: { unlimited: false, distanceKm: 25 },
      salonVoice: false,
      ghostMode: false,
      compatibilityFilters: false,
      guardianAngels: 1,
      boosts: { monthly: 0, pricedAt: 'addon' },
      badge: null,
      founderBadge: false,
      tribunalImmunity: false,
      prioritySupport: false,
      earlyAccess: false,
      maxProfilePhotos: 5,
      responseTime: '48h'
    },
    description: 'Get started with VIBE. Basic salon, guardian angel, limited radius.'
  }
};

const EXTRAS_AND_BOOSTS = {
  ghostMode: {
    id: 'addon_ghost_mode',
    name: 'Ghost Mode',
    description: 'Browse silently without showing your location',
    pricing: [
      { duration: 'monthly', price: 499, currency: 'CAD' },
      { duration: 'yearly', price: 3999, currency: 'CAD' }
    ]
  },

  salonVoice: {
    id: 'addon_salon_voice',
    name: 'Salon de la Voix',
    description: 'Premium audio salon experience',
    pricing: [
      { duration: 'monthly', price: 499, currency: 'CAD' },
      { duration: 'yearly', price: 3999, currency: 'CAD' }
    ]
  },

  djLiveAccess: {
    id: 'addon_dj_live',
    name: 'DJ Live Access',
    description: 'Exclusive DJ performances and live music',
    pricing: [
      { duration: 'monthly', price: 299, currency: 'CAD' },
      { duration: 'yearly', price: 1999, currency: 'CAD' }
    ]
  },

  compatibilityFiltersPlus: {
    id: 'addon_compat_plus',
    name: 'Compatibility Filters+',
    description: 'Advanced matching and preference filters',
    pricing: [
      { duration: 'monthly', price: 399, currency: 'CAD' },
      { duration: 'yearly', price: 2999, currency: 'CAD' }
    ]
  },

  unlimitedDistance: {
    id: 'addon_unlimited_distance',
    name: 'Unlimited Distance',
    description: 'Browse anyone, anywhere, anytime',
    pricing: [
      { duration: 'monthly', price: 799, currency: 'CAD' },
      { duration: 'yearly', price: 5999, currency: 'CAD' }
    ]
  },

  extraGuardianAngels: {
    id: 'addon_extra_angels',
    name: 'Extra Guardian Angels (3)',
    description: 'Add 3 more trusted contacts for protection',
    pricing: [
      { duration: 'monthly', price: 999, currency: 'CAD' },
      { duration: 'yearly', price: 7999, currency: 'CAD' }
    ]
  }
};

const BOOSTS = {
  visibility: {
    id: 'boost_visibility',
    name: 'Visibility Boost',
    description: '7 days of premium visibility in salons',
    durations: [
      { days: 7, price: 499 },
      { days: 30, price: 999 },
      { days: 90, price: 1999 },
      { days: 180, price: 3499 },
      { days: 365, price: 4999 }
    ],
    currency: 'CAD'
  },

  profilePriority: {
    id: 'boost_priority',
    name: 'Profile Priority',
    description: 'Your profile shown first to matches',
    durations: [
      { days: 7, price: 699 },
      { days: 30, price: 1299 },
      { days: 90, price: 2499 },
      { days: 180, price: 4299 },
      { days: 365, price: 5999 }
    ],
    currency: 'CAD'
  }
};

function getPricingTier(tier) {
  return PRICING_TIERS[tier.toLowerCase()] || PRICING_TIERS.free;
}

function canAccessFeature(tier, feature) {
  const tierConfig = getPricingTier(tier);
  const features = tierConfig.features;
  return features[feature] !== undefined && features[feature] !== false;
}

function getMonthlyValue(tier) {
  const tierConfig = getPricingTier(tier);
  const yearly = tierConfig.price;
  return Math.floor(yearly / 12);
}

function formatPrice(cents, currency = 'CAD') {
  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency
  });
  return formatter.format(cents / 100);
}

module.exports = {
  PRICING_TIERS,
  EXTRAS_AND_BOOSTS,
  BOOSTS,
  getPricingTier,
  canAccessFeature,
  getMonthlyValue,
  formatPrice
};
