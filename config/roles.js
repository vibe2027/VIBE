const ROLE_DEFINITIONS = {
  founder: {
    label: 'Founder',
    access: 'all',
    immuneToTribunal: true,
    prioritySupport: true,
    badge: 'Founder',
    priceCode: 'FOUNDER_PASS'
  },
  premium: {
    label: 'Premium',
    access: 'premium',
    immuneToTribunal: false,
    prioritySupport: false,
    badge: 'Premium',
    priceCode: 'PREMIUM_STANDARD'
  },
  free: {
    label: 'Free',
    access: 'limited',
    immuneToTribunal: false,
    prioritySupport: false,
    badge: 'Free',
    priceCode: 'FREE'
  },
  admin: {
    label: 'Admin',
    access: 'all',
    immuneToTribunal: true,
    prioritySupport: true,
    badge: 'Admin',
    priceCode: 'ADMIN'
  },
  operations: {
    label: 'Operations',
    access: 'ops',
    immuneToTribunal: false,
    prioritySupport: true,
    badge: 'Ops',
    priceCode: 'OPS'
  },
  co_founder: {
    label: 'Co-founder',
    access: 'ops',
    immuneToTribunal: false,
    prioritySupport: true,
    badge: 'Co-founder',
    priceCode: 'CO_FOUNDER'
  },
  suspended: {
    label: 'Suspended',
    access: 'none',
    immuneToTribunal: false,
    prioritySupport: false,
    badge: 'Suspended',
    priceCode: 'SUSPENDED'
  }
};

const TEAM_ROLES = ['admin', 'operations', 'co_founder', 'founder'];
const PREMIUM_ROLES = ['founder', 'premium'];

function normalizeRole(role) {
  return String(role || 'free').toLowerCase();
}

function isFounder(role) {
  return normalizeRole(role) === 'founder';
}

function isAdmin(role) {
  const r = normalizeRole(role);
  return r === 'admin' || r === 'founder' || r === 'operations';
}

function isPremiumEligible(role) {
  const r = normalizeRole(role);
  return PREMIUM_ROLES.includes(r) || r === 'admin' || r === 'operations';
}

function canAccessFeature(role, feature) {
  const r = normalizeRole(role);
  const allAccess = ['founder', 'admin', 'operations'];

  if (allAccess.includes(r)) return true;

  const featureMap = {
    guardian: ['premium', 'founder', 'admin', 'operations'],
    salonFloating: ['free', 'premium', 'founder', 'admin', 'operations'],
    salonVoice: ['premium', 'founder', 'admin', 'operations'],
    ghostMode: ['premium', 'founder', 'admin', 'operations'],
    compatibilityFilters: ['premium', 'founder', 'admin', 'operations'],
    unlimitedDistance: ['premium', 'founder', 'admin', 'operations'],
    founderBadge: ['founder'],
    tribunalImmunity: ['founder', 'admin', 'operations']
  };

  if (!featureMap[feature]) return false;
  return featureMap[feature].includes(r);
}

module.exports = {
  ROLE_DEFINITIONS,
  TEAM_ROLES,
  PREMIUM_ROLES,
  normalizeRole,
  isFounder,
  isAdmin,
  isPremiumEligible,
  canAccessFeature
};
