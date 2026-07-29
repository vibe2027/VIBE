/**
 * VIBE — Corrections plateforme (vibegay.ca)
 * Mode Fantôme (brouillard), 2 salons, tarifs, identité inscription,
 * Mode Ange gratuit, prix extras, renfort légal 18+.
 */
(function () {
  'use strict';

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
      '.tarif-card-v{border:1px solid rgba(0,170,255,0.3);padding:12px 8px;text-align:center;background:rgba(0,40,70,0.25)}',
      '.tarif-card-v .t-lbl{font-size:0.42rem;color:rgba(255,255,255,0.5);letter-spacing:1px}',
      '.tarif-card-v .t-prc{font-size:1.1rem;color:#3bb6ff;font-family:Playfair Display,serif;font-weight:700}'
    ].join('');
    document.head.appendChild(s);
  }

  /** 1. Supprimer la carte salon Fantômes (ce n'est PAS un salon) */
  function removeFantomesSalon() {
    document.querySelectorAll('.salon-card[data-salon="fantomes"]').forEach(function (el) {
      el.remove();
    });
  }

  /** 2. Mode Fantôme = brouillard dense sur la photo */
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

  /** 3. Badge Mode Ange gratuit pour tous */
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

  /** 4. Identit\u00e9 \u00e0 l'inscription (gay, lesbienne, bi, trans...) */
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
          return (
            '<button type="button" data-id="' +
            id +
            '" class="id-chip">' +
            labels[id] +
            '</button>'
          );
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
        window.signupIdentites = arr.filter(function (x) {
          return x !== id;
        });
      } else {
        window.signupIdentites.push(id);
      }
      b.classList.toggle('on', window.signupIdentites.indexOf(id) >= 0);
    });

    // Enrichir handleSignup si pr\u00e9sent
    if (typeof window.handleSignup === 'function') {
      var orig = window.handleSignup;
      window.handleSignup = async function (e) {
        try {
          var prenomEl = document.getElementById('prenom');
          if (prenomEl && window.signupIdentites.length) {
            prenomEl.dataset.identites = JSON.stringify(window.signupIdentites);
          }
        } catch (err) {}
        return orig.call(this, e);
      };
    }
  }

  /** 5. Tarifs apr\u00e8s les 500 premiers */
  function addTarifsSuite() {
    if (document.getElementById('tarifs-suite')) return;
    var plan = document.querySelector('.plan-choice');
    if (!plan) return;
    var box = document.createElement('div');
    box.id = 'tarifs-suite';
    box.style.cssText = 'margin:8px 0 24px;text-align:left';
    box.innerHTML =
      '<div style="font-size:0.48rem;letter-spacing:3px;color:rgba(0,170,255,0.7);text-transform:uppercase;margin-bottom:12px;font-family:Share Tech Mono,monospace">// Apr\u00e8s les 500 premiers \u2014 abonnements</div>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px">' +
      [
        ['1 mois', '14 $'],
        ['3 mois', '35 $'],
        ['6 mois', '59 $'],
        ['1 an', '99 $']
      ]
        .map(function (t) {
          return (
            '<div class="tarif-card-v"><div class="t-lbl">' +
            t[0] +
            '</div><div class="t-prc">' +
            t[1] +
            '</div></div>'
          );
        })
        .join('') +
      '</div>' +
      '<div style="margin-top:10px;font-size:0.42rem;letter-spacing:1px;color:rgba(255,255,255,0.45);font-family:Share Tech Mono,monospace;line-height:1.7">Les 500 premiers billets Pionnier : <b style="color:#D4AF37">99 $ CAD</b> en un seul versement. Ensuite, abonnements mensuels / trimestriels / semestriels / annuels ci-dessus.</div>';
    plan.insertAdjacentElement('afterend', box);
  }

  /** 6. Prix visibles sur les extras */
  function addExtraPrices() {
    var section = document.getElementById('boutique-section');
    if (!section || section.dataset.pricesDone) return;
    section.dataset.pricesDone = '1';
    var prices = {
      boost: '4,99 $ CAD',
      fantome: '6,99 $ CAD',
      visites: '3,99 $ CAD'
    };
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
        'margin-top:8px;font-size:0.48rem;color:' +
        colors[key] +
        ';font-family:Share Tech Mono,monospace';
      p.textContent = prices[key];
      btn.insertAdjacentElement('afterend', p);
    });

    // Clarifier Mode Fant\u00f4me boutique = mode profil, pas salon
    section.querySelectorAll('div').forEach(function (d) {
      if (/MODE FANT/i.test(d.textContent) && d.children.length === 0 && d.textContent.length < 40) {
        /* title node */
      }
    });
    var fantDesc = section.querySelectorAll('div');
    fantDesc.forEach(function (d) {
      if (d.textContent && /Invisible dans D\u00e9couverte pendant 7 jours/.test(d.textContent)) {
        d.textContent =
          'Brume dense sur ta photo 7 jours \u2014 tu choisis quand te montrer';
      }
    });
  }

  /** 7. Bandeau l\u00e9gal 18+ / Loi 25 */
  function legalBanner() {
    if (document.getElementById('vibe-legal-bar')) return;
    var hud = document.querySelector('.live-hud');
    var bar = document.createElement('div');
    bar.id = 'vibe-legal-bar';
    bar.className = 'vibe-legal-bar';
    bar.innerHTML =
      'R\u00c9SERV\u00c9 AUX <b style="color:#D4AF37">18 ANS ET PLUS</b> \u00b7 Aucune donn\u00e9e vendue \u00b7 Loi 25 (Qu\u00e9bec) \u00b7 LPRPDE \u00b7 <a href="/conditions.html" style="color:rgba(0,170,255,0.85)">Conditions</a> \u00b7 <a href="/confidentialite.html" style="color:rgba(0,170,255,0.85)">Confidentialit\u00e9</a>';
    if (hud && hud.parentNode) {
      hud.insertAdjacentElement('afterend', bar);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  /** 8. Fog overlay sur photos en Mode Fant\u00f4me (d\u00e9couverte) */
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
          // Si le membre a mode_fantome dans les donn\u00e9es (data attribute futur) ou classe
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

  /** 9. Toggle brouillard depuis mon profil (si bouton pr\u00e9sent) */
  window.dissiperBrouillard = function (el) {
    var fog = (el && el.closest ? el.closest('[style*="aspect-ratio"]') : null)
      ? el.closest('[style*="aspect-ratio"]').querySelector('.fog-overlay')
      : document.querySelector('.fog-overlay');
    if (fog) fog.classList.add('dissipating');
  };

  /** 10. Tribunal 25 $ bien visible */
  function reinforceTribunal25() {
    document.querySelectorAll('.vtxt').forEach(function (el) {
      if (/25\s*\$/.test(el.textContent) && !/CAD/.test(el.textContent)) {
        el.innerHTML = el.innerHTML.replace(
          /25\s*\$/,
          '<span style="color:#DC3232;font-weight:700">25 $ CAD</span>'
        );
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
    // Re-run l\u00e9ger si le DOM salon est rendu plus tard
    setTimeout(runAll, 800);
    setTimeout(runAll, 2500);
  });
})();
