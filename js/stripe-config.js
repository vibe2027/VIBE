/**
 * VIBE — Paiements
 *
 * ⚠️ STRIPE HORS SERVICE (compte fermé le 2026-08-17)
 * Stripe a fermé le compte marchand acct_1TdsbPAZtcXHdCSG. Les liens
 * buy.stripe.com ci-dessous renvoient « no valid payment methods » et ne
 * peuvent plus encaisser. Ils sont conservés pour référence uniquement.
 *
 * En attendant un nouveau processeur, `enabled: false` fait basculer tous
 * les boutons d'achat vers les instructions de virement Interac.
 *
 * POUR RÉACTIVER : remettre `enabled: true` et remplacer les liens
 * ci-dessous par ceux du nouveau compte marchand.
 */
window.VIBE_STRIPE = {
  enabled: false,

  currency: 'CAD',

  /* Liens de l'ancien compte — INACTIFS */
  pionnier: 'https://buy.stripe.com/5kQ6oJ8Rc1rVb563rx9R609',
  founder_onetime: 'https://buy.stripe.com/28E14pgjE0nR5KM7HN9R608',
  mois1: 'https://buy.stripe.com/3cIdRbd7sfiL3CEd279R60d',
  mois3: 'https://buy.stripe.com/fZubJ3ebw1rV5KM5zF9R601',
  mois6: 'https://buy.stripe.com/fZu28t0kG8Un7SU8LR9R603',
  an1: 'https://buy.stripe.com/aFaaEZ9Vg5Ibflmfaf9R60e',
  boost: 'https://buy.stripe.com/eVqeVf3wSc6zflm1jp9R604',
  fantome: 'https://buy.stripe.com/fZu3cx4AW6Mfb565zF9R60b',
  visites: 'https://buy.stripe.com/eVq9AVgjE8Un0qs6DJ9R60c',
  tribunal: 'https://buy.stripe.com/dRmcN79VgeeHc9aaTZ9R607',

  interac_email: 'support@vibegay.ca'
};

/* Montants affichés dans les instructions de virement */
window.VIBE_MONTANTS = {
  pionnier: '99 $', founder_onetime: '99 $', an1: '99 $',
  mois1: '14 $', mois3: '35 $', mois6: '59 $',
  boost: '4,99 $', fantome: '6,99 $', visites: '3,99 $', tribunal: '25 $'
};

/**
 * Affiche les instructions de virement Interac.
 * Autonome : ne dépend d'aucun système de fenêtre de la page.
 */
window.vibeInterac = function (montant) {
  var existant = document.getElementById('vibe-interac-overlay');
  if (existant) existant.remove();

  var fond = document.createElement('div');
  fond.id = 'vibe-interac-overlay';
  fond.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.88);' +
    'display:flex;align-items:center;justify-content:center;padding:20px';

  var boite = document.createElement('div');
  boite.style.cssText =
    'max-width:420px;width:100%;background:#0a0a10;border:1px solid rgba(212,175,55,0.4);' +
    'border-radius:6px;padding:30px 26px;text-align:center;' +
    "font-family:'Share Tech Mono',monospace;color:rgba(255,255,255,0.85);line-height:1.9";

  var titre = document.createElement('div');
  titre.textContent = 'Paiement par virement Interac';
  titre.style.cssText =
    'color:#D4AF37;font-size:0.72rem;letter-spacing:3px;text-transform:uppercase;margin-bottom:18px';

  var corps = document.createElement('div');
  corps.style.cssText = 'font-size:0.62rem;letter-spacing:1px;margin-bottom:18px';
  corps.appendChild(document.createTextNode('Envoie un virement Interac' + (montant ? ' de ' + montant : '') + ' à :'));
  corps.appendChild(document.createElement('br'));

  var courriel = document.createElement('span');
  courriel.textContent = window.VIBE_STRIPE.interac_email;
  courriel.style.cssText = 'color:#fff;font-size:0.8rem;user-select:all;display:inline-block;margin:10px 0';
  corps.appendChild(courriel);
  corps.appendChild(document.createElement('br'));
  corps.appendChild(document.createTextNode(
    "Indique ton courriel d'inscription dans le message du virement. Ton accès est activé dès réception (maximum 24 h)."
  ));

  var fermer = document.createElement('button');
  fermer.textContent = 'Compris';
  fermer.style.cssText =
    'margin-top:8px;padding:12px 30px;background:#D4AF37;color:#000;border:none;cursor:pointer;' +
    "font-family:'Share Tech Mono',monospace;font-size:0.6rem;letter-spacing:3px;font-weight:700;border-radius:3px";
  fermer.onclick = function () { fond.remove(); };

  boite.appendChild(titre);
  boite.appendChild(corps);
  boite.appendChild(fermer);
  fond.appendChild(boite);
  fond.onclick = function (e) { if (e.target === fond) fond.remove(); };
  document.body.appendChild(fond);
};

window.vibeCheckout = function (key) {
  var cfg = window.VIBE_STRIPE || {};

  // Compte marchand fermé : rediriger vers Interac plutôt que vers un lien mort.
  if (!cfg.enabled) {
    window.vibeInterac((window.VIBE_MONTANTS || {})[key]);
    return;
  }

  var url = cfg[key];
  if (!url) {
    if (typeof showError === 'function') showError('⚠ Paiement indisponible.');
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
