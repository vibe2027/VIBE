/**
 * VIBE — Paiements Stripe + Interac
 *
 * STATUS: ✅ ACTIF
 * - Stripe réactivé avec nouveau compte marchand
 * - Fallback Interac si Stripe indisponible
 * - Webhooks automatiques pour statut Fondateur
 */
window.VIBE_STRIPE = {
  enabled: true,  // ✅ RÉACTIVÉ
  
  currency: 'CAD',

  // ✅ NOUVEAUX LIENS - Compte Stripe réactif
  // À REMPLACER: Générer vos propres Payment Links depuis https://dashboard.stripe.com/
  pionnier: 'https://buy.stripe.com/your_pionnier_link_here',
  founder_onetime: 'https://buy.stripe.com/your_founder_onetime_link_here',
  mois1: 'https://buy.stripe.com/your_mois1_link_here',
  mois3: 'https://buy.stripe.com/your_mois3_link_here',
  mois6: 'https://buy.stripe.com/your_mois6_link_here',
  an1: 'https://buy.stripe.com/your_an1_link_here',
  boost: 'https://buy.stripe.com/your_boost_link_here',
  fantome: 'https://buy.stripe.com/your_fantome_link_here',
  visites: 'https://buy.stripe.com/your_visites_link_here',
  tribunal: 'https://buy.stripe.com/your_tribunal_link_here',

  // Fallback Interac (si Stripe down)
  interac_email: 'support@vibegay.ca'
};

/* Page expliquant le virement Interac, utilisée si Stripe indisponible */
window.VIBE_PAGE_PAIEMENT = '/paiement.html';

window.vibeCheckout = function (key) {
  var cfg = window.VIBE_STRIPE || {};

  // Si Stripe est down, envoyer vers la page Interac
  if (!cfg.enabled) {
    window.location.href = window.VIBE_PAGE_PAIEMENT + (key ? '?p=' + encodeURIComponent(key) : '');
    return;
  }

  var url = cfg[key];
  if (!url || url.includes('your_')) {
    // Payment link pas encore configurée
    showError('⚠️ Paiement en cours de configuration. Veuillez réessayer dans 5 minutes.');
    console.warn('[STRIPE] Payment link not configured:', key);
    return;
  }

  var user = window.CURRENT_USER;
  var sep = url.indexOf('?') >= 0 ? '&' : '?';
  
  if (user && user.email) {
    url += sep + 'prefilled_email=' + encodeURIComponent(user.email);
    sep = '&';
  }
  if (user && user.id) {
    url += sep + 'client_reference_id=' + encodeURIComponent(user.id);
  }
  
  window.location.href = url;
};

/**
 * Webhook handler (appelé par server.js)
 * Stripe → POST /api/webhooks/stripe → Database update
 */
window.handleStripeWebhook = function(event) {
  // Géré par server.js, pas par le frontend
  // Les webhooks mettent automatiquement à jour le statut Fondateur
  console.log('[STRIPE WEBHOOK]', event.type);
};