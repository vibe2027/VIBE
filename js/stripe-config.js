/**
 * VIBE — Stripe Payment Links (compte vibegay.ca)
 * Tous les liens actifs du Dashboard Stripe.
 */
window.VIBE_STRIPE = {
  currency: 'CAD',

  /* Pionnier 99 $ — 1 seul versement */
  pionnier: 'https://buy.stripe.com/5kQ6oJ8Rc1rVb563rx9R609',
  founder_onetime: 'https://buy.stripe.com/28E14pgjE0nR5KM7HN9R608',

  /* Abonnements */
  mois1: 'https://buy.stripe.com/3cIdRbd7sfiL3CEd279R60d',
  mois3: 'https://buy.stripe.com/fZubJ3ebw1rV5KM5zF9R601',
  mois6: 'https://buy.stripe.com/fZu28t0kG8Un7SU8LR9R603',
  an1: 'https://buy.stripe.com/aFaaEZ9Vg5Ibflmfaf9R60e',

  /* Extras */
  boost: 'https://buy.stripe.com/eVqeVf3wSc6zflm1jp9R604',
  fantome: 'https://buy.stripe.com/fZu3cx4AW6Mfb565zF9R60b',
  visites: 'https://buy.stripe.com/eVq9AVgjE8Un0qs6DJ9R60c',
  tribunal: 'https://buy.stripe.com/dRmcN79VgeeHc9aaTZ9R607',

  interac_email: 'support@vibegay.ca'
};

window.vibeCheckout = function (key) {
  var cfg = window.VIBE_STRIPE || {};
  var url = cfg[key];
  if (!url) {
    if (typeof showError === 'function') showError('\u26a0 Paiement indisponible.');
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
