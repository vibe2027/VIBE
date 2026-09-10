/**
 * VIBE — Paiements Stripe (+ repli Interac)
 *
 * L'ancien compte marchand (acct_1TdsbPAZtcXHdCSG) a été fermé le
 * 2026-08-17 ; les liens buy.stripe.com ci-dessous doivent être remplacés
 * par les nouveaux Payment Links générés depuis le nouveau compte Stripe
 * (dashboard.stripe.com → Payment Links) avant que les boutons d'achat
 * fonctionnent. Tant qu'un lien reste un placeholder `your_..._link_here`,
 * vibeCheckout affiche une erreur au lieu de rediriger vers un lien mort.
 *
 * Repli : mettre `enabled: false` fait retomber tous les boutons d'achat
 * sur les instructions de virement Interac (/paiement.html).
 */
window.VIBE_STRIPE = {
  enabled: true,

  currency: 'CAD',

  /* À REMPLACER par les Payment Links du nouveau compte Stripe */
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

  interac_email: 'support@vibegay.ca'
};

/* Page expliquant le virement Interac, utilisée si Stripe est désactivé ou qu'un lien manque */
window.VIBE_PAGE_PAIEMENT = '/paiement.html';

window.vibeCheckout = function (key) {
  var cfg = window.VIBE_STRIPE || {};

  if (!cfg.enabled) {
    window.location.href = window.VIBE_PAGE_PAIEMENT + (key ? '?p=' + encodeURIComponent(key) : '');
    return;
  }

  var url = cfg[key];
  if (!url || url.indexOf('your_') >= 0) {
    if (typeof showError === 'function') showError('⚠ Paiement en cours de configuration, réessayez plus tard.');
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
