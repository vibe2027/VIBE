/**
 * VIBE — Stripe Payment Links (vibegay.ca)
 *
 * Comment créer les liens manquants :
 * 1. https://dashboard.stripe.com/payment-links
 * 2. Créer un produit (prix CAD) pour chaque ligne
 * 3. Copier l'URL buy.stripe.com/... ici
 * 4. Commit + push
 *
 * Pionnier : déjà branché (99 $ CAD, 1 versement).
 */
window.VIBE_STRIPE = {
  currency: 'CAD',

  /* 1 seul versement — 99 $ CAD · 1 an */
  pionnier: 'https://buy.stripe.com/28E3cx85P6UI9YM6xm3wQ01',

  /* Abonnements (coller les Payment Links Stripe ici) */
  mois1: '',   /* 19,99 $ CAD */
  mois3: '',   /* 49,99 $ CAD */
  mois6: '',   /* 89,99 $ CAD */
  an1: '',     /* 139,99 $ CAD */

  /* Extras */
  boost: '',    /* 8,99 $ CAD · Boost 24h */
  fantome: '',  /* 9,99 $ CAD · Mode Fantôme 7j */
  visites: '',  /* 6,99 $ CAD · Qui m'a consulté */
  tribunal: '', /* 25 $ CAD · Pardon */

  /* PayPal fallback Pionnier */
  paypal_pionnier:
    'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=vibeqbc2026%40hotmail.com&item_name=Pass%20Pionnier%20VIBE%20%E2%80%94%201%20an&amount=99.00&currency_code=CAD',

  interac_email: 'vibeqbc2026@hotmail.com'
};

/** Ouvre un lien Stripe avec email + user id préremplis */
window.vibeCheckout = function (key) {
  var cfg = window.VIBE_STRIPE || {};
  var url = cfg[key];
  if (!url) {
    if (typeof showError === 'function') showError('\u26a0 Paiement bient\u00f4t disponible pour cette option.');
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
