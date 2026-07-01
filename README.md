# VIBE 🏳️‍🌈

**VIBE** — Réseau LGBTQ+ canadien nouvelle génération, né à Québec.

Une plateforme communautaire sécurisée conçue pour les personnes LGBTQ+ au Canada, combinant:
- 🎙️ **Salons à voix** — Écoute avant de voir
- 🛡️ **Mode Ange Gardien** — Protection active avec alerte SOS en 3 taps
- 💬 **Salons privés** — Communautés par villes et thèmes
- 👑 **Accès Fondateurs** — Plan d'édition limitée
- ⚖️ **Tribunal Communautaire** — Modération par la communauté

## 🚀 Stack Technique

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla + Canvas APIs)
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Auth:** Supabase Auth (Email/Password)
- **Hosting:** Vercel
- **Domain:** vibegay.ca

## 📁 Structure du Projet

```
VIBE/
├── index.html              # Page principale (SPA)
├── _redirects             # Config Vercel
├── CNAME                  # Domain custom
├── bg.png                 # Ressources visuelles
├── js/
│   ├── config.js          # Supabase init & auth
│   ├── salons.js          # Système de salons
│   └── ui-salons.js       # UI pour salons
├── sql/
│   └── schema.sql         # Schema PostgreSQL
├── .env.example           # Template env
└── README.md              # Cette doc
```

## 🔧 Installation & Setup

### Prérequis
- Compte Supabase (https://supabase.com)
- Vercel connecté au repo GitHub

### 1. Créer projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller à **SQL Editor** et exécuter `sql/schema.sql` entièrement
4. Copier les credentials:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Key** → `VITE_SUPABASE_ANON_KEY`

### 2. Configurer variables d'env

Copier `.env.example` → `.env.local`:
```bash
cp .env.example .env.local
```

Remplir avec tes credentials Supabase:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_APP_ENV=development
```

### 3. Deploy sur Vercel

1. Push les changements vers GitHub
2. Dans Vercel, ajouter les env vars dans **Settings → Environment Variables**
3. Vercel va auto-deployer

### 4. Tester

Aller à [vibegay.ca](https://vibegay.ca) ou ton URL Vercel

## 💬 Système de Salons

### Catégories

#### Par Villes 🏙️
- Montréal, Toronto, Vancouver, Ottawa, Québec
- Accès: Tous les membres

#### Par Thèmes 💬
- Santé Mentale
- Événements Pride
- Rencontres
- Carrière & Finance
- Arts & Culture
- Actualité & Engagement
- Accès: Tous les membres

#### Par Accès 👑
- **Lounge Fondateurs** — Privé (Founders only)
- **Salle Modérateurs** — Privé (Moderators only)
- **Réseau SOS** — Privé (Members, coordinateurs)

### Utiliser les Salons dans le Code

```javascript
// Initialiser
await window.vibeSalons.init(supabaseClient);

// Charger les salons disponibles
const categories = await window.vibeSalons.loadSalons();

// Rejoindre un salon
await window.vibeSalons.joinSalon('mtl');

// Envoyer un message
await window.vibeSalons.sendMessage('mtl', 'Bonjour tout le monde!');

// Écouter les nouveaux messages
window.addEventListener('salon-new-message', (event) => {
  console.log('Nouveau message:', event.detail);
});
```

## 🔐 Sécurité & RLS

Toutes les tables utilisent **Row Level Security (RLS)**:
- Users ne voient que leurs propres données
- Messages visibles seulement dans salons autorisés
- Modérateurs peuvent supprimer messages
- Fondateurs ont accès complet

## 🛠️ Dépannage

### Supabase non connecté
```
⚠️ Supabase credentials not configured
```
→ Vérifie `.env.local` et les variables Vercel

### Messages ne s'envoient pas
```
❌ Error: Not authenticated
```
→ L'utilisateur doit être connecté. Vérifie `signInUser()` est appelé

### Salons non visibles
```
Salon not found: salon_id
```
→ Vérifie la table `salons` dans Supabase. Réexécute `schema.sql`

## 📊 Roadmap

- [ ] Implémentation complète du chat en temps réel
- [ ] Système de notifications push
- [ ] Gestion des media (photos, vidéos)
- [ ] Appels audio/vidéo groupés
- [ ] App mobile (React Native)
- [ ] Modération IA assistée
- [ ] Système de badges et achievements

## 📝 Licence

VIBE est propriétaire. © 2026 VIBE Network.

## 📞 Support

Issues GitHub ou contact@vibegay.ca

---

**Mise à jour:** 1er juillet 2026