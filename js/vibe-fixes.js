/**
 * VIBE — Corrections plateforme (vibegay.ca)
 * Tarifs finaux + Mode Fantôme + 2 salons + identité + Ange gratuit + légal
 */
(function () {
  'use strict';

  /* ── TARIFS VERROUILLÉS ── */
  var TARIFS = {
    pionnier: '99 $',
    mois1: '14,99 $',
    mois3: '34,99 $',
    mois6: '59,99 $',
    an1: '89,99 $',
    boost: '8,99 $ CAD',
    fantome: '9,99 $ CAD',
    visites: '6,99 $ CAD',
    tribunal: '25 $ CAD'
  };

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function injectCSS() {
    if (document.getElementById('vibe-fixes-css')) return;
    var s = document.createElement('style');
    s.id = 'vibe-fixes-css';
    s.textContent = [
      '.id-chip{background:transparent;border:1px solid rgba(0,170,255,0.45);color:rgba(255,255,255,0.75);padding:8px 12px;font-family:Share Tech Mono,monospace;font-size:0.5rem;letter-spacing:1px;cursor:pointer;transition:all .2s;margin:2px}',
      '.id-chip.on{background:rgba(0,170,255,0.85);color:#000;border-color:#00aaff}',
      '.fog-overlay{position:absolute;inset:0;z-index:2;background:rgba(180,180,220,0.55);backdrop-filter:blur(28px) saturate(0.55);-webkit-backdrop-filter:blur(28px) saturate(0.55);transition:opacity .9s ease,backdrop-filter .9s ease;pointer-events:none}',
      '.fog-overlay.dissipating{opacity:0;backdrop-filter:blur(0);-webkit-backdrop-filter:blur(0)}',
      '.vibe-legal-bar{position:relative;z-index:10;text-align:center;padding:10px 16px;font-family:Share Tech Mono,monospace;font-size:0.42rem;letter-spacing:2px;color:rgba(212,175,55,0.75);border-bottom:0.5px solid rgba(212,175,55,0.12);background:rgba(0,0,0,0.6)}',
      '.tarif-card-v{border:1px solid rgba(0,170,255,0.3);padding:14px 10px;text-align:center;background:rgba(0,40,70,0.25)}',
      '.tarif-card-v .t-lbl{font-size:0.42rem;color:rgba(255,255,255,0.5);letter-spacing:1px;margin-bottom:6px}',
      '.tarif-card-v .t-prc{font-size:1.15rem;color:#3bb6ff;font-family:Playfair Display,serif;font-weight:700}'
    ].join('');
    document.head.appendChild(s);
  }

  function removeFantomesSalon() {
    document.querySelectorAll('.salon-card[data-salon="fantomes"]').forEach(function (el) {
      el.remove();
    });
  }

  function fixModeFantomeText() {
    document.querySelectorAll('.af-row').forEach(function (row) {
      var title = row.querySelector('.af-title');
      var text = row.querySelector('.af-text');
      if (title && /Mode Fant/i.test(title.textContent) && text) {
        text.textContent =
          "\u00c9paisse brume dense sur ta photo de profil. Personne ne te voit clairement. Quand tu veux te montrer, le brouillard se dissipe d'un tap. Ce n'est pas un salon \u2014 c'est un mode profil.";
      }
    });
  }

  function badgeAngeGratuit() {
    var btn = document.getElementById('sos-btn');
    if (!btn || document.getElementById('ange-gratuit-badge')) return;
    var badge = document.createElement('div');
    badge.id = 'ange-gratuit-badge';
    badge.style.cssText =
      'margin-top:10px;font-size:0.48rem;letter-spacing:3px;color:rgba(212,175,55,0.65);text-transform:uppercase;font-family:Share Tech Mono,monospace';
    badge.textContent = '\u2726 Gratuit pour tous';
    btn.insertAdjacentElement('afterend', badge);
  }

  window.signupIdentites = window.signupIdentites || [];
  function addSignupIdentites() {
    var form = document.getElementById('signup-form');
    if (!form || document.getElementById('signup-identites')) return;
    var villeGroup = form.querySelector('#ville');
    if (!villeGroup) return;
    var parent = villeGroup.closest('.form-group');
    if (!parent) return;

    var wrap = document.createElement('div');
    wrap.className = 'form-group';
    wrap.innerHTML =
      '<label class="form-label">Identit\u00e9</label>' +
      '<div id="signup-identites" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">' +
      ['gay', 'lesbienne', 'bi', 'trans', 'nonbinaire', 'queer', 'autre']
        .map(function (id) {
          var labels = {
            gay: 'Gay',
            lesbienne: 'Lesbienne',
            bi: 'Bi',
            trans: 'Trans',
            nonbinaire: 'Non-binaire',
            queer: 'Queer',
            autre: 'Autre'
          };
          return '<button type="button" data-id="' + id + '" class="id-chip">' + labels[id] + '</button>';
        })
        .join('') +
      '</div>';
    parent.insertAdjacentElement('afterend', wrap);

    document.getElementById('signup-identites').addEventListener('click', function (e) {
      var b = e.target.closest('[data-id]');
      if (!b) return;
      var id = b.getAttribute('data-id');
      var arr = window.signupIdentites;
      if (arr.indexOf(id) >= 0) {
        window.signupIdentites = arr.filter(function (x) { return x !== id; });
      } else {
        window.signupIdentites.push(id);
      }
      b.classList.toggle('on', window.signupIdentites.indexOf(id) >= 0);
    });
  }

  function addTarifsSuite() {
    if (document.getElementById('tarifs-suite')) return;
    var plan = document.querySelector('.plan-choice');
    if (!plan) return;
    var box = document.createElement('div');
    box.id = 'tarifs-suite';
    box.style.cssText = 'margin:8px 0 24px;text-align:left';
    box.innerHTML =
      '<div style="font-size:0.48rem;letter-spacing:3px;color:rgba(0,170,255,0.7);text-transform:uppercase;margin-bottom:12px;font-family:Share Tech Mono,monospace">// Apr\u00e8s les 500 Pionniers \u2014 abonnements</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px">' +
      [
        ['1 mois', TARIFS.mois1],
        ['3 mois', TARIFS.mois3],
        ['6 mois', TARIFS.mois6],
        ['1 an', TARIFS.an1]
      ]
        .map(function (t) {
          return '<div class="tarif-card-v"><div class="t-lbl">' + t[0] + '</div><div class="t-prc">' + t[1] + '</div></div>';
        })
        .join('') +
      '</div>' +
      '<div style="margin-top:12px;font-size:0.44rem;letter-spacing:1px;color:rgba(255,255,255,0.5);font-family:Share Tech Mono,monospace;line-height:1.8">' +
      '\u2726 <b style="color:#D4AF37">Pionnier</b> (500 places) : <b style="color:#D4AF37">' + TARIFS.pionnier + ' CAD</b> \u2014 <b>1 seul versement</b> \u00b7 1 an complet \u00b7 pas de renouvellement auto' +
      '</div>';
    plan.insertAdjacentElement('afterend', box);
  }

  function addExtraPrices() {
    var section = document.getElementById('boutique-section');
    if (!section || section.dataset.pricesDone) return;
    section.dataset.pricesDone = '1';
    var prices = { boost: TARIFS.boost, fantome: TARIFS.fantome, visites: TARIFS.visites };
    var colors = {
      boost: 'rgba(0,238,255,0.85)',
      fantome: 'rgba(180,180,255,0.9)',
      visites: '#D4AF37'
    };
    section.querySelectorAll('button[onclick*="acheterExtra"]').forEach(function (btn) {
      var m = (btn.getAttribute('onclick') || '').match(/acheterExtra\('(\w+)'\)/);
      if (!m) return;
      var key = m[1];
      if (!prices[key]) return;
      if (btn.parentElement.querySelector('.extra-price')) return;
      var p = document.createElement('div');
      p.className = 'extra-price';
      p.style.cssText =
        'margin-top:8px;font-size:0.52rem;font-weight:700;color:' +
        colors[key] +
        ';font-family:Share Tech Mono,monospace;letter-spacing:1px';
      p.textContent = prices[key];
      btn.insertAdjacentElement('afterend', p);
    });
    section.querySelectorAll('div').forEach(function (d) {
      if (d.textContent && /Invisible dans D\u00e9couverte pendant 7 jours/.test(d.textContent)) {
        d.textContent = 'Brume dense sur ta photo 7 jours \u2014 tu choisis quand te montrer';
      }
    });
  }

  function legalBanner() {
    if (document.getElementById('vibe-legal-bar')) return;
    var hud = document.querySelector('.live-hud');
    var bar = document.createElement('div');
    bar.id = 'vibe-legal-bar';
    bar.className = 'vibe-legal-bar';
    bar.innerHTML =
      'R\u00c9SERV\u00c9 AUX <b style="color:#D4AF37">18 ANS ET PLUS</b> \u00b7 Aucune donn\u00e9e vendue \u00b7 Loi 25 (Qu\u00e9bec) \u00b7 LPRPDE \u00b7 <a href="/conditions.html" style="color:rgba(0,170,255,0.85)">Conditions</a> \u00b7 <a href="/confidentialite.html" style="color:rgba(0,170,255,0.85)">Confidentialit\u00e9</a>';
    if (hud && hud.parentNode) hud.insertAdjacentElement('afterend', bar);
    else document.body.insertBefore(bar, document.body.firstChild);
  }

  function patchChargerDecouverte() {
    if (typeof window.chargerDecouverte !== 'function') return;
    if (window.chargerDecouverte._vibePatched) return;
    var orig = window.chargerDecouverte;
    window.chargerDecouverte = async function () {
      var r = await orig.apply(this, arguments);
      try {
        document.querySelectorAll('#annuaire-membres > div').forEach(function (card) {
          var photoWrap = card.querySelector('div[style*="aspect-ratio"]');
          if (!photoWrap) return;
          if (card.dataset.modeFantome === '1' || card.classList.contains('mode-fantome')) {
            if (!photoWrap.querySelector('.fog-overlay')) {
              var fog = document.createElement('div');
              fog.className = 'fog-overlay';
              photoWrap.appendChild(fog);
            }
          }
        });
      } catch (e) {}
      return r;
    };
    window.chargerDecouverte._vibePatched = true;
  }

  window.dissiperBrouillard = function (el) {
    var fog =
      el && el.closest
        ? (el.closest('[style*="aspect-ratio"]') || {}).querySelector &&
          el.closest('[style*="aspect-ratio"]').querySelector('.fog-overlay')
        : document.querySelector('.fog-overlay');
    if (fog) fog.classList.add('dissipating');
  };

  function reinforceTribunal25() {
    document.querySelectorAll('.vtxt').forEach(function (el) {
      if (/25\s*\$/.test(el.textContent) && !/CAD/.test(el.textContent)) {
        el.innerHTML = el.innerHTML.replace(/25\s*\$/, '<span style="color:#DC3232;font-weight:700">25 $ CAD</span>');
      }
    });
  }

  function runAll() {
    injectCSS();
    removeFantomesSalon();
    fixModeFantomeText();
    badgeAngeGratuit();
    addSignupIdentites();
    addTarifsSuite();
    addExtraPrices();
    legalBanner();
    patchChargerDecouverte();
    reinforceTribunal25();
  }

  ready(function () {
    runAll();
    setTimeout(runAll, 800);
    setTimeout(runAll, 2500);
  });
})();
