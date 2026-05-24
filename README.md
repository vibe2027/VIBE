# VIBE 2026 — Réseau LGBTQ+ Canadien

<div align="center">
  <h3>✦ Né à Québec · Canada · 2026 ✦</h3>
  <p><em>Réseau LGBTQ+ de nouvelle génération</em></p>
</div>

## 🌈 À Propos

VIBE est une application web innovante conçue pour la communauté LGBTQ+ canadienne, avec un focus particulier sur le Québec. Notre plateforme combine sécurité, communauté et fierté dans une expérience utilisateur unique.

## ✨ Fonctionnalités Principales

### 🛡 Ange Gardien
- **Triple-tap d'urgence**: Envoi instantané de position GPS + 30 sec d'audio
- **Surveillance 24/7**: Détection comportements suspects en temps réel
- **Alerte 60 secondes**: Intervention rapide de l'équipe VIBE
- **Vérification IA**: Élimination automatique des faux profils

### 🌍 Globe Temps Réel
- Visualisation interactive des membres à travers le monde
- Focus sur 12 villes principales (Québec, Montréal, Toronto, Vancouver, etc.)
- Équateur arc-en-ciel Pride animé
- Interface drag & rotate

### ⚖ Tribunal Communautaire
- Système de justice communautaire transparent
- Jury anonyme de 12 membres
- Verdicts en 24h
- Protection contre les abus

### 🌟 Salon Flottant
- Profils en mode "Fantôme" pour anonymat
- Chat en temps réel
- Musique ambient VIBE
- Atmosphère immersive avec animations

## 🚀 Technologies Utilisées

### Frontend
- **React 19** - Framework UI moderne
- **Tailwind CSS** - Styling utilitaire
- **Canvas API** - Animations 2D/3D personnalisées
- **Google Fonts** - Typography (Playfair Display, Space Mono)

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)

### Déploiement
- **Frontend**: Emergent Preview (gay-quebec.preview.emergentagent.com)
- **Production**: vibegay.ca (à configurer)

## 🛠 Installation & Configuration

### Prérequis
- Node.js 18+
- Yarn 1.22+
- Compte Supabase

### Setup Local

1. **Cloner le repository**
```bash
git clone <repository-url>
cd vibe-2026
```

2. **Installer les dépendances**
```bash
cd frontend
yarn install
```

3. **Configuration des variables d'environnement**

Créer `/frontend/.env`:
```env
REACT_APP_BACKEND_URL=https://gay-quebec.preview.emergentagent.com
REACT_APP_SUPABASE_URL=https://fhksytcoyjtcrkmhnoyw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
REACT_APP_FOUNDER_EMAIL=vibeqbc2026@hotmail.com
REACT_APP_STRIPE_FOUNDER_LINK=https://buy.stripe.com/28E3cx85P6UI9YM6xm3wQ01
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

4. **Lancer le serveur de développement**
```bash
yarn start
```

L'application sera accessible sur `http://localhost:3000`

## 🗄 Structure du Projet

```
/app/frontend/
├── public/                 # Fichiers statiques
├── src/
│   ├── components/
│   │   ├── canvas/        # Composants Canvas (Globe, DNA, Ange, etc.)
│   │   ├── layout/        # HUD, Footer
│   │   └── sections/      # Sections principales
│   ├── contexts/
│   │   └── AuthContext.js # Gestion authentification
│   ├── hooks/
│   │   └── useCanvas.js   # Hook personnalisé canvas
│   ├── lib/
│   │   └── supabase.js    # Configuration Supabase
│   ├── App.js             # Composant principal
│   ├── index.js           # Point d'entrée
│   ├── index.css          # Styles globaux
│   └── vibe.css           # Styles VIBE spécifiques
├── .env                   # Variables d'environnement
└── package.json           # Dépendances
```

## 🔐 Configuration Supabase

### Tables Requises

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  city TEXT,
  membership_tier TEXT DEFAULT 'free',
  is_online BOOLEAN DEFAULT false,
  real_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_founder BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  ghost_mode BOOLEAN DEFAULT false,
  is_immune BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
```

## 🎨 Design System

### Couleurs Principales
- **Gold**: `#D4AF37` - Accent principal
- **Purple**: `#b44fff` - Accent secondaire
- **Cyan**: `#00eeff` - Highlights
- **Red**: `#ff5050` - Alertes/Urgence
- **Background**: `#000000` - Fond noir pur

### Typography
- **Titres**: Playfair Display (serif, italic)
- **Corps**: Space Mono (monospace)

### Animations
- DNA Helix animation
- Universe starfield
- Globe rotation interactive
- Pulse effects sur éléments importants

## 🚀 Déploiement vers vibegay.ca

### Configuration DNS
1. Pointer le domaine `vibegay.ca` vers votre serveur
2. Configurer les enregistrements A/CNAME
3. Activer SSL/TLS (Let's Encrypt recommandé)

### Variables d'Environnement Production
Mettre à jour `.env` avec:
```env
REACT_APP_BACKEND_URL=https://vibegay.ca
```

### Build Production
```bash
cd frontend
yarn build
```

Les fichiers optimisés seront dans `/frontend/build/`

## 👥 Compte Fondateur

### Accès Admin
- **Email**: vibeqbc2026@hotmail.com
- **Fonctionnalités**:
  - Dashboard statistiques complètes
  - Gestion des membres
  - Révéler profils fantômes
  - Modération signalements
  - Immunité totale

### Easter Egg
Taper "VIBE" sur le clavier ouvre le panneau admin (si connecté comme fondateur)

## 📊 Offre de Lancement

**Fondateur·trice - 99$ CAD**
- 500 places limitées
- 1 an d'accès complet
- Badge fondateur unique
- Immunité modération
- Accès anticipé nouvelles features

## 🐛 Bogues Corrigés

Cette version corrige les bogues suivants de l'HTML original:
1. ✅ Credentials Supabase maintenant en variables d'environnement
2. ✅ Gestion d'erreurs robuste pour tous les appels API
3. ✅ Validation email/password côté client améliorée
4. ✅ Canvas resize handlers sur tous les éléments
5. ✅ Performance optimisée pour mobile
6. ✅ Loading states pour toutes les requêtes async
7. ✅ Modal overlay event handling corrigé
8. ✅ ESLint warnings résolus

## 📝 Licence

© 2026 VIBE Canada · Tous droits réservés
Données hébergées au Canada 🇨🇦

## 📧 Contact

**Email**: vibeqbc2026@hotmail.com
**Localisation**: Québec, QC, Canada

---

<div align="center">
  <p><strong>Le monde surveille. VIBE protège.</strong></p>
  <p><em>L'amour n'a pas de frontières — mais il a une origine.</em></p>
  <p>✦ Fierté ✦</p>
</div>
