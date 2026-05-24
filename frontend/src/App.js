import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { HUD } from '@/components/layout/HUD';
import { Hero } from '@/components/sections/Hero';
import {
  UniverseCanvas,
  DNACanvas,
  AngeCanvas,
  GlobeCanvas,
  TribunalCanvas,
  SalonCanvas,
  FloatingProfileCanvas,
} from '@/components/canvas';
import { supabase, STRIPE_FOUNDER_LINK } from '@/lib/supabase';
import '@/vibe.css';

// Stats Component
const Stats = () => {
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    // Animated counter
    let count = 0;
    const target = 50247;
    const step = () => {
      count += 980;
      if (count >= target) {
        setMemberCount(target);
        return;
      }
      setMemberCount(count);
      setTimeout(step, 22);
    };
    setTimeout(step, 400);

    // Also fetch real count from Supabase
    const fetchCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
          setMemberCount(count);
        }
      } catch (e) {
        console.log('Could not fetch member count');
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="stats-strip">
      <div className="stat-cell">
        <span className="stat-n">{memberCount.toLocaleString('fr-CA')}</span>
        <span className="stat-l">Membres</span>
      </div>
      <div className="stat-cell">
        <span className="stat-n">500</span>
        <span className="stat-l">Places fondateur</span>
      </div>
      <div className="stat-cell">
        <span className="stat-n">12</span>
        <span className="stat-l">Villes</span>
      </div>
      <div className="stat-cell">
        <span className="stat-n">0</span>
        <span className="stat-l">Données vendues</span>
      </div>
    </div>
  );
};

// Ticker Component
const Ticker = () => {
  const text =
    'VIBE 2026 :: NÉ À QUÉBEC :: ANGE GARDIEN ACTIF :: TRIPLE-TAP GPS :: GLOBE TEMPS RÉEL :: TRIBUNAL COMMUNAUTAIRE :: SALON FLOTTANT :: MODE FANTÔME :: LGBTQ+ CANADA :: DONNÉES SOUVERAINES :: FIERTÉ ::    ';

  return (
    <div className="ticker">
      <span className="ticker-inner">
        {text}
        {text}
      </span>
    </div>
  );
};

// Ange Section
const AngeSection = () => {
  const [sosActive, setSosActive] = useState(false);

  const activateSOS = () => {
    setSosActive(true);
    setTimeout(() => setSosActive(false), 4000);
  };

  return (
    <section id="ange-section" className="section bg-[rgba(212,175,55,0.01)] border-t border-b border-[rgba(212,175,55,0.08)]">
      <div className="section-label">// Module ange gardien — Protection active //</div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative w-[180px] h-[180px] mb-4">
          <AngeCanvas />
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[180px] pointer-events-none" viewBox="0 0 280 180" fill="none">
            <path d="M140 90 Q90 40 20 60 Q55 82 65 115 Q100 97 140 90Z" fill="rgba(212,175,55,0.07)" stroke="rgba(212,175,55,0.22)" strokeWidth="0.5" />
            <path d="M140 90 Q190 40 260 60 Q225 82 215 115 Q180 97 140 90Z" fill="rgba(212,175,55,0.07)" stroke="rgba(212,175,55,0.22)" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="flex gap-1 h-11 items-end mb-6">
          {[10, 16, 24, 34, 42, 34, 24, 16, 10].map((height, i) => (
            <div
              key={i}
              className="w-0.5 rounded-sm bg-[#D4AF37]"
              style={{
                height: `${height}px`,
                animation: `fwave 2s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
                background: i === 2 || i === 6 ? '#b44fff' : i === 4 ? '#00eeff' : '#D4AF37',
              }}
            />
          ))}
        </div>

        <div className="text-[0.58rem] tracking-[4px] text-[rgba(212,175,55,0.45)] uppercase text-center mb-6">
          Gardien assigné · Surveillance continue · QC-CA
        </div>
      </div>

      <div className="border border-[rgba(255,80,80,0.25)] p-5 bg-[rgba(255,80,80,0.02)] mb-6 max-w-[500px] mx-auto">
        <div className="text-[0.55rem] tracking-[4px] text-[rgba(255,80,80,0.6)] uppercase mb-2.5">
          // Triple-tap d'urgence //
        </div>
        <p className="text-[0.72rem] text-[rgba(255,255,255,0.3)] leading-[2]">
          <strong className="text-[rgba(255,80,80,0.85)]">3 taps rapides</strong> sur l'écran envoient instantanément ta position GPS + 30 secondes d'audio à ton contact de confiance. Silencieux. Invisible. Instantané.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(212,175,55,0.06)] mb-7">
        {[
          { icon: '🛡', title: 'Vérification', text: 'Faux profils détectés et éliminés en temps réel par IA.' },
          { icon: '☽', title: 'Gardien 24/7', text: 'Surveille tes interactions. Alerte discrète dès qu\'un comportement suspect est détecté.' },
          { icon: '⚡', title: 'Alerte 60 sec', text: 'Signale un inconfort. L\'équipe VIBE intervient en moins de 60 secondes.' },
          { icon: '◎', title: 'Code sécurité', text: 'Code secret envoyé toutes les 30 minutes lors d\'un rendez-vous en personne.' },
        ].map((card, i) => (
          <div key={i} className="p-7 bg-black hover:bg-[rgba(212,175,55,0.03)] transition-colors">
            <span className="text-2xl mb-3 block">{card.icon}</span>
            <div className="text-[0.72rem] text-[#D4AF37] tracking-[3px] uppercase mb-2 font-bold">{card.title}</div>
            <p className="text-[0.68rem] text-[rgba(255,255,255,0.28)] leading-[1.9]">{card.text}</p>
          </div>
        ))}
      </div>

      <button
        onClick={activateSOS}
        className="block max-w-[340px] mx-auto bg-transparent border text-center py-3.5 px-8 text-[0.65rem] tracking-[4px] uppercase cursor-pointer font-[Space_Mono] transition-all"
        style={{
          color: sosActive ? '#D4AF37' : 'rgba(255,80,80,0.7)',
          borderColor: sosActive ? '#D4AF37' : 'rgba(255,80,80,0.4)',
          background: sosActive ? 'rgba(212,175,55,0.1)' : 'transparent',
        }}
      >
        {sosActive ? '✦ Ange activé — aide en route' : 'SOS — Activer l\'ange gardien'}
      </button>

      <style>{`
        @keyframes fwave {
          0%, 100% { transform: scaleY(0.4); opacity: 0.2; }
          50% { transform: scaleY(1); opacity: 0.9; }
        }
      `}</style>
    </section>
  );
};

// Globe Section
const GlobeSection = () => {
  const cities = [
    { code: 'QC', name: 'Québec', delay: '0s' },
    { code: 'MTL', name: 'Montréal', delay: '0.4s' },
    { code: 'YYZ', name: 'Toronto', delay: '0.8s' },
    { code: 'YVR', name: 'Vancouver', delay: '1.2s' },
    { code: 'YOW', name: 'Ottawa', delay: '1.6s' },
  ];

  return (
    <div id="globe-section" className="text-center p-0">
      <div className="relative bg-black overflow-hidden flex items-center justify-center min-h-[420px] border-t border-b border-[rgba(212,175,55,0.08)]">
        <GlobeCanvas />
        <div className="absolute bottom-0 left-0 right-0 py-2.5 px-0 text-[0.48rem] tracking-[5px] text-[rgba(212,175,55,0.3)] uppercase text-center bg-gradient-to-t from-[rgba(0,0,0,0.8)] to-transparent">
          Glisse pour faire tourner le globe · Membres en temps réel
        </div>
      </div>

      <div className="flex justify-around py-3.5 px-3 border-b border-[rgba(212,175,55,0.07)]">
        {cities.map((city) => (
          <div key={city.code} className="text-center">
            <span className="block text-[0.8rem] text-[#D4AF37] font-bold tracking-[2px] mb-0.5">{city.code}</span>
            <span className="block text-[0.44rem] tracking-[2px] text-[rgba(255,255,255,0.2)] uppercase">{city.name}</span>
            <div className="w-1 h-1 rounded-full bg-[#D4AF37] mx-auto mt-1 animate-[blink_2s_ease-in-out_infinite]" style={{ animationDelay: city.delay }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Tribunal Section
const TribunalSection = () => {
  return (
    <div id="tribunal-section" className="p-0">
      <TribunalCanvas />
      <div className="p-7 px-6">
        <div className="text-[0.55rem] tracking-[5px] text-[rgba(212,175,55,0.38)] uppercase text-center mb-3.5">
          // Salle du tribunal — Justice communautaire //
        </div>
        <div className="font-[Playfair_Display] italic text-base text-[rgba(255,255,255,0.18)] text-center leading-[1.9] mb-5">
          "Ici, chaque voix compte.<br />
          La communauté juge, protège et décide."
        </div>

        <div className="border border-[rgba(220,50,50,0.25)] p-5 bg-[rgba(220,50,50,0.02)] mb-5 max-w-[540px] mx-auto">
          <div className="text-[0.52rem] text-[rgba(220,50,50,0.55)] tracking-[3px] mb-2">01 · TRIBUNAL · VERDICT</div>
          <div className="font-[Playfair_Display] text-lg text-[rgba(255,255,255,0.7)] mb-2.5">
            Coupable ? 7 jours en mode lecture seule, ou 20 $ pour le pardon.
          </div>
          <p className="text-[0.66rem] text-[rgba(255,255,255,0.22)] leading-[1.9]">
            Si le tribunal te juge coupable, ton accès devient passif : tu vois mais tu ne peux rien écrire pendant 7 jours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[rgba(212,175,55,0.05)]">
          {[
            { num: '01', title: 'Signalement', text: 'Soumets anonymement. Le jury examine en 24h.' },
            { num: '02', title: 'Délibération', text: '12 membres tirés au sort. Identités protégées.' },
            { num: '03', title: 'Verdict', text: 'Avertissement, suspension ou bannissement définitif.' },
          ].map((item) => (
            <div key={item.num} className="p-6 px-5 bg-black">
              <div className="text-[0.5rem] text-[rgba(212,175,55,0.3)] tracking-[4px] mb-2">// {item.num}</div>
              <div className="text-[0.8rem] text-[#D4AF37] tracking-[2px] mb-2 font-bold">{item.title}</div>
              <p className="text-[0.65rem] text-[rgba(255,255,255,0.22)] leading-[1.9]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Salon Section
const SalonSection = () => {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');

  const tracks = [
    { title: 'Nuit de Québec', artist: 'VIBE Ambient · Salon Flottant' },
    { title: 'Brouillard d\'hiver', artist: 'VIBE Chill · Mode Fantôme' },
    { title: 'Lumière de la fierté', artist: 'VIBE Pride · 2026' },
    { title: 'Âmes connectées', artist: 'VIBE Deep · Salon Flottant' },
  ];

  const chatMessages = [
    'Bienvenue dans le salon ✦',
    'Quelqu\'un veut danser ? ◉',
    'Ce brouillard est magnifique',
    'Je suis fantôme mais je vous entends ☽',
    'L\'ange gardien veille sur nous tous',
  ];

  const profiles = [
    { name: 'Alexandre', age: '28 · Québec', trait: 'Artiste · Libre', hue: 45 },
    { name: 'Maxime', age: '32 · Montréal', trait: 'Musicien · Rêveur', hue: 280 },
    { name: 'Jordan', age: '25 · Gatineau', trait: 'Photo · Voyageur', hue: 160 },
  ];

  useEffect(() => {
    const trackInterval = setInterval(() => {
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    }, 8000);

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setLiveMessage(chatMessages[messageIndex % chatMessages.length]);
      messageIndex++;
    }, 5000);

    return () => {
      clearInterval(trackInterval);
      clearInterval(messageInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="salon-section" className="p-0">
      <SalonCanvas />
      <div className="p-6">
        <div className="flex items-center gap-3.5 py-3.5 px-4 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)] mb-5">
          <div className="text-2xl animate-spin">♪</div>
          <div className="flex-1">
            <div className="text-[0.72rem] text-[#D4AF37] tracking-[2px]">{tracks[currentTrack].title}</div>
            <div className="text-[0.54rem] text-[rgba(255,255,255,0.25)] tracking-[2px] mt-0.5">{tracks[currentTrack].artist}</div>
          </div>
          <div className="flex gap-0.5 items-end h-5">
            {[0, 0.12, 0.24, 0.36, 0.48].map((delay, i) => (
              <div
                key={i}
                className="w-0.5 bg-[#D4AF37] rounded-sm"
                style={{
                  animation: 'eqpulse 0.8s ease-in-out infinite',
                  animationDelay: `${delay}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {profiles.map((profile, i) => (
            <div key={i} className="relative bg-[rgba(20,10,40,0.95)] border border-[rgba(212,175,55,0.15)] rounded-lg p-4 px-3 text-center min-h-[140px] overflow-hidden">
              <FloatingProfileCanvas hue={profile.hue} />
              <div className="relative z-[2]">
                <div className="text-[0.7rem] text-[#D4AF37] tracking-[2px] mb-0.5">{profile.name}</div>
                <div className="text-[0.52rem] text-[rgba(255,255,255,0.3)] tracking-[1px] mb-0.5">{profile.age}</div>
                <div className="text-[0.48rem] text-[rgba(212,175,55,0.35)] tracking-[1px]">{profile.trait}</div>
                <div className="text-[0.48rem] text-[rgba(255,255,255,0.2)] tracking-[2px] mt-1.5">◉ Fantôme</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[rgba(212,175,55,0.07)] pt-4">
          <div className="text-[0.48rem] tracking-[4px] text-[rgba(212,175,55,0.25)] uppercase mb-3">
            // Voix du salon flottant //
          </div>
          <div className="flex gap-2.5 mb-2.5 text-[0.62rem] leading-[1.7]">
            <span className="tracking-[2px] min-w-[80px] text-[rgba(212,175,55,0.7)]">Alex·QC</span>
            <span className="text-[rgba(255,255,255,0.25)]">Ce salon me fait sentir libre ✦</span>
          </div>
          <div className="flex gap-2.5 mb-2.5 text-[0.62rem] leading-[1.7]">
            <span className="tracking-[2px] min-w-[80px] text-[rgba(255,255,255,0.2)]">◉ Fantôme</span>
            <span className="text-[rgba(255,255,255,0.25)]">Je suis là mais vous ne me voyez pas...</span>
          </div>
          <div className="flex gap-2.5 mb-2.5 text-[0.62rem] leading-[1.7]">
            <span className="tracking-[2px] min-w-[80px] text-[rgba(212,175,55,0.7)]">Sasha·MTL</span>
            <span className="text-[rgba(255,255,255,0.25)]">La musique ce soir est parfaite</span>
          </div>
          {liveMessage && (
            <div className="flex gap-2.5 text-[0.62rem] leading-[1.7] transition-opacity duration-500">
              <span className="tracking-[2px] min-w-[80px] text-[rgba(212,175,55,0.7)]">◈ Salon</span>
              <span className="text-[rgba(255,255,255,0.25)]">{liveMessage}</span>
            </div>
          )}
        </div>

        <style>{`
          @keyframes eqpulse {
            0%, 100% { height: 4px; opacity: 0.4; }
            50% { height: 18px; opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

// Manifeste Section
const Manifeste = () => {
  return (
    <section id="manifeste" className="relative z-10 py-20 px-6 text-center">
      <p className="font-[Playfair_Display] text-[clamp(1.2rem,4vw,2rem)] leading-[2.2] text-[rgba(255,255,255,0.12)]">
        Le monde surveille.<br />
        <strong className="text-[rgba(255,255,255,0.6)]">VIBE</strong> <em className="text-[#D4AF37]">protège.</em><br />
        L'amour n'a pas de frontières —<br />
        mais il a une <em className="text-[#D4AF37]">origine.</em><br />
        Québec. Canada.<br />
        <em className="text-[#D4AF37]">Fierté.</em>
      </p>
    </section>
  );
};

// Signup Section
const SignupSection = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    email: '',
    password: '',
    ville: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        formData.prenom,
        formData.ville
      );

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = STRIPE_FOUNDER_LINK;
      }, 2500);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="inscription" className="section">
        <div className="section-label">// Rejoindre le réseau //</div>
        <div className="text-center py-10 px-5">
          <div className="text-[2.5rem] mb-4">✦</div>
          <div className="font-[Playfair_Display] text-2xl text-[#D4AF37] mb-2">Bienvenue dans VIBE</div>
          <div className="text-[0.65rem] text-[rgba(255,255,255,0.3)] tracking-[2px] leading-[2]">
            Profil créé avec succès.<br />
            Redirection vers le paiement fondateur...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="inscription" className="section">
      <div className="section-label">// Rejoindre le réseau //</div>
      <div className="form-wrap">
        <div className="form-title">Créer mon profil</div>
        <div className="form-sub">Gratuit · Sécurisé · Québec</div>

        {error && (
          <div className="text-[#ff5050] text-[0.65rem] tracking-[2px] mb-3.5 p-2.5 border border-[rgba(255,80,80,0.3)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Prénom</label>
            <input
              className="form-input"
              type="text"
              name="prenom"
              placeholder="Ton prénom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Courriel</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="ton@courriel.ca"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              className="form-input"
              type="password"
              name="password"
              placeholder="Minimum 8 caractères"
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label>Ta ville</label>
            <select
              className="form-select"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              required
            >
              <option value="">Choisir une ville...</option>
              <option value="Quebec">Québec</option>
              <option value="Montreal">Montréal</option>
              <option value="Toronto">Toronto</option>
              <option value="Vancouver">Vancouver</option>
              <option value="Ottawa">Ottawa</option>
            </select>
          </div>

          <div className="flex items-start gap-2.5 mb-5 text-[0.6rem] text-[rgba(255,255,255,0.25)] leading-[1.7]">
            <input type="checkbox" className="mt-0.5 cursor-pointer" required />
            <label>
              J'accepte les{' '}
              <a href="#" className="text-[rgba(212,175,55,0.5)]">
                conditions d'utilisation
              </a>{' '}
              et la politique de confidentialité de VIBE.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent text-[#D4AF37] border border-[rgba(212,175,55,0.5)] py-4 px-0 text-[0.72rem] font-bold tracking-[5px] uppercase cursor-pointer font-[Space_Mono] relative overflow-hidden transition-colors disabled:opacity-50"
          >
            <span className="relative z-[1]">
              {loading ? 'Création en cours...' : 'Créer mon profil ✦'}
            </span>
          </button>
        </form>

        <div className="mt-4 text-center text-[0.58rem] text-[rgba(255,255,255,0.2)] tracking-[2px]">
          Déjà membre ?{' '}
          <button
            onClick={onLoginClick}
            className="text-[rgba(212,175,55,0.6)] cursor-pointer bg-transparent border-none underline"
          >
            Se connecter
          </button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="relative z-10">
      <div className="text-center py-15 px-6 border-t border-[rgba(212,175,55,0.08)]">
        <div className="text-[0.55rem] tracking-[6px] text-[rgba(212,175,55,0.35)] uppercase mb-4.5">
          // Rejoindre le mouvement //
        </div>
        <a
          href={STRIPE_FOUNDER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-block mb-4"
        >
          <span>Fondateur·trice — 99$ CAD ✦</span>
        </a>
        <br />
        <span className="text-[0.5rem] tracking-[3px] text-[rgba(212,175,55,0.25)]">
          500 PLACES · OFFRE LANCEMENT · 1 AN COMPLET
        </span>
        <div className="mt-6 text-[0.52rem] text-[rgba(255,255,255,0.15)] tracking-[2px]">
          vibeqbc2026@hotmail.com · Québec, QC · 2026
        </div>
        <div className="mt-2 text-[0.48rem] text-[rgba(255,255,255,0.1)] tracking-[2px]">
          © 2026 VIBE Canada · Données hébergées au Canada 🇨🇦
        </div>
      </div>
    </footer>
  );
};

// Login Modal
const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isFounder } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      onClose();
      if (email.toLowerCase() === 'vibeqbc2026@hotmail.com') {
        setTimeout(() => {
          // Open admin panel
          window.location.hash = 'admin';
        }, 300);
      }
    } catch (err) {
      setError(err.message || 'Courriel ou mot de passe invalide');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <div className="modal-title">Connexion</div>
        <div className="modal-sub">// Accès au réseau VIBE //</div>

        {error && (
          <div className="text-[#ff5050] text-[0.65rem] tracking-[2px] mb-3.5 p-2.5 border border-[rgba(255,80,80,0.3)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Courriel</label>
            <input
              className="form-input"
              type="email"
              placeholder="ton@courriel.ca"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-transparent text-[#D4AF37] border border-[rgba(212,175,55,0.5)] py-4 px-0 text-[0.72rem] font-bold tracking-[5px] uppercase cursor-pointer font-[Space_Mono] relative overflow-hidden disabled:opacity-50"
          >
            <span className="relative z-[1]">
              {loading ? 'Connexion...' : 'Entrer dans VIBE ✦'}
            </span>
          </button>
        </form>

        <div className="mt-4 text-center text-[0.58rem] text-[rgba(255,255,255,0.2)] tracking-[2px]">
          Pas encore membre ?{' '}
          <a
            href="#inscription"
            onClick={() => {
              onClose();
              document.getElementById('inscription')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-[rgba(212,175,55,0.6)] no-underline"
          >
            S'inscrire
          </a>
        </div>
      </div>
    </div>
  );
};

// Main App Component  
function AppContent() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const { user, isFounder } = useAuth();

  useEffect(() => {
    // Easter egg - type "VIBE" to open admin
    let code = '';
    const handleKeyDown = (e) => {
      code += e.key.toUpperCase();
      if (code.includes('VIBE')) {
        code = '';
        if (user) {
          setAdminPanelOpen(true);
        } else {
          setLoginModalOpen(true);
        }
      }
      if (code.length > 10) code = code.slice(-10);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  return (
    <div className="App">
      <UniverseCanvas />
      <HUD
        onLoginClick={() => setLoginModalOpen(true)}
        onAdminClick={() => setAdminPanelOpen(true)}
      />
      <Hero onLoginClick={() => setLoginModalOpen(true)} />
      <Stats />
      <Ticker />
      <AngeSection />
      <GlobeSection />
      <TribunalSection />
      <SalonSection />
      <Manifeste />
      <SignupSection onLoginClick={() => setLoginModalOpen(true)} />
      <Footer />
      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
