/**
 * VIBE Live — Salons + Mode Ange (production)
 * A) Bulles = vrais profils
 * B) Ange : GPS temps réel + audio 30s + contact obligatoire
 * C) Salon de la Voix : messages texte + notes vocales
 */
(function () {
  'use strict';

  var SOS_SECONDS = 30;
  var _sb = null;
  var _sosRec = null;
  var _sosChunks = [];
  var _sosWatch = null;
  var _sosPos = null;
  var _sosActive = false;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function sb() {
    if (_sb) return _sb;
    try {
      if (window._supa) { _sb = window._supa; return _sb; }
      if (window.supabase && window.supabase.createClient) {
        _sb = window.supabase.createClient(
          'https://fhksytcoyjtcrkmhnoyw.supabase.co',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3N5dGNveWp0Y3JrbWhub3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTkzODIsImV4cCI6MjA5MjE3NTM4Mn0.nW9xgEQSuXlq96d53AFE7jUADmr04YdMoD9hCNmw64k'
        );
        return _sb;
      }
    } catch (e) {}
    return null;
  }

  function notify(msg, ok) {
    if (ok && typeof showSuccess === 'function') return showSuccess(msg);
    if (!ok && typeof showError === 'function') return showError(msg);
    try { console.log('[VIBE]', msg); } catch (e) {}
  }

  /* ─── CSS bulles + ange ─── */
  function injectLiveCSS() {
    if (document.getElementById('vibe-live-css')) return;
    var s = document.createElement('style');
    s.id = 'vibe-live-css';
    s.textContent = [
      '.vibe-bubble{position:absolute;width:72px;height:72px;border-radius:50%;overflow:hidden;border:2px solid rgba(0,170,255,0.55);box-shadow:0 0 18px rgba(0,170,255,0.25);cursor:pointer;transition:transform .25s;animation:vibeFloat 6s ease-in-out infinite}',
      '.vibe-bubble:hover{transform:scale(1.12);z-index:5}',
      '.vibe-bubble img{width:100%;height:100%;object-fit:cover}',
      '.vibe-bubble .vb-name{position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:0.42rem;letter-spacing:1px;color:rgba(255,255,255,0.75);font-family:Share Tech Mono,monospace}',
      '.vibe-bubble-wrap{position:relative;width:100%;min-height:280px;overflow:hidden;border-radius:12px;background:radial-gradient(ellipse at center,rgba(0,40,80,0.35),rgba(0,0,0,0.5))}',
      '@keyframes vibeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}',
      '.vibe-ange-panel{margin-top:14px;padding:14px;border:1px solid rgba(212,175,55,0.35);background:rgba(212,175,55,0.06);font-family:Share Tech Mono,monospace}',
      '.vibe-ange-panel input{width:100%;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);color:#fff;padding:10px;margin:8px 0;font-family:inherit;font-size:0.7rem}',
      '.vibe-ange-timer{font-size:1.4rem;color:#DC3232;letter-spacing:2px;text-align:center;margin:10px 0}',
      '.vibe-voix-box{margin-top:12px;padding:12px;border:1px solid rgba(0,170,255,0.3);background:rgba(0,30,60,0.3)}',
      '.vibe-voix-msg{padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.08);font-size:0.65rem;color:rgba(255,255,255,0.8)}',
      '.vibe-voix-msg b{color:#3bb6ff}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ─── A) SALON FLOTTANT — vrais profils en bulles ─── */
  async function loadFlottantBubbles() {
    var cloud =
      document.getElementById('salon-cloud') ||
      document.querySelector('.bubble-cloud') ||
      document.querySelector('[data-salon-view="flottant"]') ||
      document.getElementById('salon-room');

    // Créer un wrap si on est dans le salon flottant ouvert
    var room = document.getElementById('salon-room') || document.querySelector('.salon-room');
    if (!cloud && room) {
      cloud = document.createElement('div');
      cloud.id = 'vibe-bubble-wrap';
      cloud.className = 'vibe-bubble-wrap';
      room.insertBefore(cloud, room.firstChild);
    }
    if (!cloud) {
      // fallback : zone visible sous les cartes salon
      var cards = document.querySelector('.salon-card[data-salon="flottant"]');
      if (cards && cards.parentElement && !document.getElementById('vibe-bubble-wrap')) {
        cloud = document.createElement('div');
        cloud.id = 'vibe-bubble-wrap';
        cloud.className = 'vibe-bubble-wrap';
        cloud.style.marginTop = '16px';
        cards.parentElement.appendChild(cloud);
      }
    }
    if (!cloud) return;

    var client = sb();
    var profiles = [];
    try {
      if (client) {
        var res = await client
          .from('profiles')
          .select('id,prenom,ville,photo_url,mode_fantome')
          .order('updated_at', { ascending: false })
          .limit(24);
        if (!res.error && res.data) profiles = res.data;
        if (!profiles.length) {
          var r2 = await client.from('profiles').select('id,prenom,ville,photo_url').limit(24);
          if (!r2.error && r2.data) profiles = r2.data;
        }
      }
    } catch (e) {}

    // Nettoyer anciennes bulles dynamiques
    cloud.querySelectorAll('.vibe-bubble').forEach(function (b) { b.remove(); });

    if (!profiles.length) {
      if (!cloud.querySelector('.vibe-empty-bubbles')) {
        var empty = document.createElement('div');
        empty.className = 'vibe-empty-bubbles';
        empty.style.cssText =
          'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Share Tech Mono,monospace;font-size:0.55rem;color:rgba(255,255,255,0.4);letter-spacing:1px;text-align:center;padding:20px';
        empty.textContent = 'Aucun profil en ligne pour l\'instant \u2014 sois le premier.';
        cloud.appendChild(empty);
      }
      return;
    }

    var emptyMsg = cloud.querySelector('.vibe-empty-bubbles');
    if (emptyMsg) emptyMsg.remove();

    profiles.forEach(function (p, i) {
      var b = document.createElement('div');
      b.className = 'vibe-bubble';
      b.style.left = 8 + (i % 6) * 15 + Math.random() * 4 + '%';
      b.style.top = 10 + Math.floor(i / 6) * 28 + Math.random() * 6 + '%';
      b.style.animationDelay = (i * 0.3) + 's';
      if (p.mode_fantome) b.style.filter = 'blur(12px)';
      var name = (p.prenom || '?').slice(0, 12);
      var ville = p.ville ? '\u00b7' + String(p.ville).slice(0, 3).toUpperCase() : '';
      if (p.photo_url) {
        b.innerHTML = '<img src="' + p.photo_url + '" alt="" loading="lazy"/><span class="vb-name">' + name + ville + '</span>';
      } else {
        b.style.display = 'flex';
        b.style.alignItems = 'center';
        b.style.justifyContent = 'center';
        b.style.background = 'rgba(0,80,140,0.5)';
        b.innerHTML =
          '<span style="font-size:1.2rem;color:#3bb6ff">' +
          name.charAt(0).toUpperCase() +
          '</span><span class="vb-name">' +
          name +
          ville +
          '</span>';
      }
      b.onclick = function () {
        if (typeof openPrivateChat === 'function') openPrivateChat(p.id, p.prenom);
        else notify('Profil : ' + name + (p.ville ? ' \u00b7 ' + p.ville : ''), true);
      };
      cloud.appendChild(b);
    });
  }

  /* ─── B) MODE ANGE — 30s + GPS + contact ─── */
  function ensureAngePanel() {
    var btn = document.getElementById('sos-btn');
    if (!btn || document.getElementById('vibe-ange-panel')) return;
    var panel = document.createElement('div');
    panel.id = 'vibe-ange-panel';
    panel.className = 'vibe-ange-panel';
    panel.innerHTML =
      '<div style="font-size:0.48rem;letter-spacing:2px;color:#D4AF37;margin-bottom:6px">CONTACT DE CONFIANCE (obligatoire)</div>' +
      '<input id="vibe-ange-contact" type="email" placeholder="courriel@exemple.com" autocomplete="email"/>' +
      '<div style="font-size:0.42rem;color:rgba(255,255,255,0.45);line-height:1.6">GPS temps r\u00e9el + enregistrement <b style="color:#fff">30 secondes</b>. Ne remplace pas le 911.</div>' +
      '<div id="vibe-ange-timer" class="vibe-ange-timer" style="display:none">30</div>' +
      '<button type="button" id="vibe-ange-go" style="margin-top:10px;width:100%;padding:12px;background:rgba(220,50,50,0.85);border:none;color:#fff;font-family:Share Tech Mono,monospace;letter-spacing:2px;cursor:pointer;font-size:0.55rem">D\u00c9CLENCHER ALERTE (30s)</button>';
    btn.parentNode.insertBefore(panel, btn.nextSibling);

    // Charger contact sauv\u00e9
    try {
      var saved = localStorage.getItem('vibe_ange_contact');
      if (saved) document.getElementById('vibe-ange-contact').value = saved;
    } catch (e) {}

    document.getElementById('vibe-ange-go').onclick = function () {
      startAngeAlert();
    };

    // Triple-tap sur le bouton SOS existant
    var taps = [];
    btn.addEventListener('click', function (e) {
      var now = Date.now();
      taps = taps.filter(function (t) { return now - t < 900; });
      taps.push(now);
      if (taps.length >= 3) {
        taps = [];
        e.preventDefault();
        e.stopPropagation();
        startAngeAlert();
      }
    }, true);
  }

  function getContact() {
    var input = document.getElementById('vibe-ange-contact');
    var email = (input && input.value ? input.value : '').trim();
    if (!email) {
      try {
        email = localStorage.getItem('vibe_ange_contact') || '';
      } catch (e) {}
    }
    // Profil connect\u00e9
    if (!email && window.CURRENT_USER) {
      email = window.CURRENT_USER.user_metadata && window.CURRENT_USER.user_metadata.contact_urgence
        ? window.CURRENT_USER.user_metadata.contact_urgence
        : '';
    }
    return email;
  }

  async function startAngeAlert() {
    if (_sosActive) {
      notify('\u26a0 Alerte d\u00e9j\u00e0 en cours', false);
      return;
    }
    var contact = getContact();
    if (!contact || contact.indexOf('@') < 0) {
      notify('\u26a0 Ajoute un courriel de contact de confiance', false);
      var panel = document.getElementById('vibe-ange-panel');
      if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      var inp = document.getElementById('vibe-ange-contact');
      if (inp) inp.focus();
      return;
    }
    try {
      localStorage.setItem('vibe_ange_contact', contact);
    } catch (e) {}

    _sosActive = true;
    _sosChunks = [];
    _sosPos = null;

    // GPS temps r\u00e9el
    if (navigator.geolocation) {
      try {
        _sosWatch = navigator.geolocation.watchPosition(
          function (pos) {
            _sosPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              ts: Date.now()
            };
          },
          function () {},
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
        // Premi\u00e8re position imm\u00e9diate
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            _sosPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              ts: Date.now()
            };
          },
          function () {},
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } catch (e) {}
    }

    // Audio 30 secondes
    var timerEl = document.getElementById('vibe-ange-timer');
    if (timerEl) {
      timerEl.style.display = 'block';
      timerEl.textContent = String(SOS_SECONDS);
    }
    notify('Mode Ange activ\u00e9 \u2014 enregistrement ' + SOS_SECONDS + 's', true);

    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      _sosRec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      _sosChunks = [];
      _sosRec.ondataavailable = function (ev) {
        if (ev.data && ev.data.size) _sosChunks.push(ev.data);
      };
      _sosRec.onstop = function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        finishAngeAlert(contact);
      };
      _sosRec.start(1000);

      var left = SOS_SECONDS;
      var iv = setInterval(function () {
        left -= 1;
        if (timerEl) timerEl.textContent = String(Math.max(0, left));
        if (left <= 0) {
          clearInterval(iv);
          try {
            if (_sosRec && _sosRec.state !== 'inactive') _sosRec.stop();
          } catch (e) {
            finishAngeAlert(contact);
          }
        }
      }, 1000);

      // S\u00e9curit\u00e9 : forcer l'arr\u00eat à 30s + 1s
      setTimeout(function () {
        try {
          if (_sosRec && _sosRec.state !== 'inactive') _sosRec.stop();
        } catch (e) {}
      }, (SOS_SECONDS + 1) * 1000);
    } catch (err) {
      // Pas de micro : envoyer quand m\u00eame GPS
      notify('\u26a0 Micro refus\u00e9 \u2014 envoi GPS seulement', false);
      await finishAngeAlert(contact);
    }
  }

  async function finishAngeAlert(contact) {
    if (_sosWatch != null && navigator.geolocation) {
      try {
        navigator.geolocation.clearWatch(_sosWatch);
      } catch (e) {}
      _sosWatch = null;
    }

    var blob = null;
    if (_sosChunks.length) {
      blob = new Blob(_sosChunks, { type: _sosChunks[0].type || 'audio/webm' });
    }

    var payload = {
      contact_email: contact,
      lat: _sosPos ? _sosPos.lat : null,
      lng: _sosPos ? _sosPos.lng : null,
      accuracy: _sosPos ? _sosPos.accuracy : null,
      user_id: window.CURRENT_USER ? window.CURRENT_USER.id : null,
      created_at: new Date().toISOString(),
      duration_sec: SOS_SECONDS
    };

    var client = sb();
    try {
      if (client) {
        // Upload audio si possible
        if (blob && blob.size > 0) {
          var path =
            'sos/' +
            (payload.user_id || 'anon') +
            '_' +
            Date.now() +
            '.webm';
          var up = await client.storage.from('sos-audio').upload(path, blob, {
            contentType: blob.type || 'audio/webm',
            upsert: true
          });
          if (!up.error) payload.audio_path = path;
        }
        await client.from('sos_alerts').insert([payload]);
      }
    } catch (e) {
      // Fallback local
      try {
        var q = JSON.parse(localStorage.getItem('vibe_sos_queue') || '[]');
        q.push(payload);
        localStorage.setItem('vibe_sos_queue', JSON.stringify(q.slice(-20)));
      } catch (e2) {}
    }

    // mailto de secours vers le contact
    try {
      var body =
        'ALERTE MODE ANGE VIBE%0A' +
        (payload.lat
          ? 'GPS: https://maps.google.com/?q=' + payload.lat + ',' + payload.lng
          : 'GPS indisponible') +
        '%0AHeure: ' +
        new Date().toLocaleString('fr-CA');
      // Ne pas ouvrir mailto auto (peut bloquer UX) — log seulement
      console.log('[VIBE Ange] contact=', contact, 'pos=', payload.lat, payload.lng);
    } catch (e) {}

    _sosActive = false;
    _sosRec = null;
    _sosChunks = [];
    var timerEl = document.getElementById('vibe-ange-timer');
    if (timerEl) {
      timerEl.textContent = '0';
      setTimeout(function () {
        timerEl.style.display = 'none';
      }, 2000);
    }
    notify('\u2713 Alerte envoy\u00e9e (GPS' + (blob ? ' + audio 30s' : '') + ')', true);
  }

  /* ─── C) SALON DE LA VOIX — chat + note vocale ─── */
  function ensureVoixUI() {
    var card = document.querySelector('.salon-card[data-salon="voix"]');
    if (!card || document.getElementById('vibe-voix-box')) return;
    var box = document.createElement('div');
    box.id = 'vibe-voix-box';
    box.className = 'vibe-voix-box';
    box.innerHTML =
      '<div style="font-size:0.48rem;letter-spacing:2px;color:#3bb6ff;margin-bottom:8px">SALON DE LA VOIX \u00b7 TEMPS R\u00c9EL</div>' +
      '<div id="vibe-voix-msgs" style="max-height:180px;overflow-y:auto;margin-bottom:8px"></div>' +
      '<div style="display:flex;gap:6px">' +
      '<input id="vibe-voix-input" type="text" placeholder="\u00c9cris ou envoie une note vocale..." style="flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(0,170,255,0.3);color:#fff;padding:8px;font-family:Share Tech Mono,monospace;font-size:0.6rem"/>' +
      '<button type="button" id="vibe-voix-send" style="padding:8px 12px;background:#00aaff;border:none;color:#000;font-family:Share Tech Mono,monospace;cursor:pointer;font-size:0.5rem">ENVOYER</button>' +
      '<button type="button" id="vibe-voix-rec" style="padding:8px 12px;background:rgba(220,50,50,0.8);border:none;color:#fff;font-family:Share Tech Mono,monospace;cursor:pointer;font-size:0.5rem">\uD83C\uDF99 15s</button>' +
      '</div>';
    card.parentNode.insertBefore(box, card.nextSibling);

    document.getElementById('vibe-voix-send').onclick = function () {
      sendVoixText();
    };
    document.getElementById('vibe-voix-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendVoixText();
    });
    document.getElementById('vibe-voix-rec').onclick = function () {
      recordVoixNote();
    };

    loadVoixMessages();
    subscribeVoix();
  }

  async function loadVoixMessages() {
    var client = sb();
    var box = document.getElementById('vibe-voix-msgs');
    if (!box || !client) return;
    try {
      var res = await client
        .from('salon_messages')
        .select('id,username,message,created_at')
        .eq('salon_id', 'voix')
        .order('created_at', { ascending: false })
        .limit(40);
      if (res.error || !res.data) return;
      box.innerHTML = res.data
        .slice()
        .reverse()
        .map(function (m) {
          return (
            '<div class="vibe-voix-msg"><b>' +
            (m.username || '?') +
            '</b> ' +
            escapeHtml(m.message) +
            '</div>'
          );
        })
        .join('');
      box.scrollTop = box.scrollHeight;
    } catch (e) {}
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
  }

  async function sendVoixText() {
    var input = document.getElementById('vibe-voix-input');
    var msg = (input && input.value ? input.value : '').trim();
    if (!msg) return;
    if (!window.CURRENT_USER) {
      notify('\u26a0 Connecte-toi pour \u00e9crire', false);
      if (typeof openLogin === 'function') openLogin();
      return;
    }
    var client = sb();
    if (!client) return;
    try {
      await client.from('salon_messages').insert([
        {
          salon_id: 'voix',
          user_id: window.CURRENT_USER.id,
          username: (window.CURRENT_USER.email || 'membre').split('@')[0],
          message: msg
        }
      ]);
      input.value = '';
      loadVoixMessages();
    } catch (e) {
      notify('\u26a0 Envoi impossible', false);
    }
  }

  async function recordVoixNote() {
    if (!window.CURRENT_USER) {
      notify('\u26a0 Connecte-toi', false);
      return;
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var rec = new MediaRecorder(stream);
      var chunks = [];
      rec.ondataavailable = function (e) {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async function () {
        stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(chunks, { type: 'audio/webm' });
        var client = sb();
        if (!client) return;
        var path = 'voix/' + window.CURRENT_USER.id + '_' + Date.now() + '.webm';
        try {
          await client.storage.from('salon-audio').upload(path, blob, { contentType: 'audio/webm' });
        } catch (e) {}
        await client.from('salon_messages').insert([
          {
            salon_id: 'voix',
            user_id: window.CURRENT_USER.id,
            username: (window.CURRENT_USER.email || 'membre').split('@')[0],
            message: '[Note vocale 15s]'
          }
        ]);
        notify('\u2713 Note vocale envoy\u00e9e', true);
        loadVoixMessages();
      };
      rec.start();
      notify('Enregistrement 15s...', true);
      setTimeout(function () {
        try {
          if (rec.state !== 'inactive') rec.stop();
        } catch (e) {}
      }, 15000);
    } catch (e) {
      notify('\u26a0 Micro refus\u00e9', false);
    }
  }

  function subscribeVoix() {
    var client = sb();
    if (!client || window._vibeVoixSub) return;
    try {
      client
        .channel('salon:voix')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'salon_messages', filter: 'salon_id=eq.voix' },
          function () {
            loadVoixMessages();
          }
        )
        .subscribe();
      window._vibeVoixSub = true;
    } catch (e) {}
  }

  /* ─── Init ─── */
  function init() {
    injectLiveCSS();
    ensureAngePanel();
    ensureVoixUI();
    loadFlottantBubbles();
  }

  ready(function () {
    init();
    setTimeout(init, 1000);
    setTimeout(loadFlottantBubbles, 2500);
    setInterval(loadFlottantBubbles, 45000);
  });

  // Expose
  window.vibeStartAnge = startAngeAlert;
  window.vibeLoadBubbles = loadFlottantBubbles;
})();
