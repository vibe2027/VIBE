# VIBE 🏳️‍🌈

**VIBE** — Réseau LGBTQ+ canadien nouvelle génération, né à Québec.

Une plateforme communautaire sécurisée conçue pour les personnes LGBTQ+ au Canada, combinant:
- 🎙️ **Salons à voix** — Écoute avant de voir
- 🛡️ **Mode Ange Gardien** — Protection active avec alerte SOS en 3 taps
- 💬 **Salons privés** — Communautés par villes et thèmes
- 👑 **Accès Fondateurs** — Plan d'édition limitée
- ⚖️ **Tribunal Communautaire** — Modération par la communauté

## 🚀 Stack Technique

- **Frontend:** un seul fichier `index.html` (HTML5, CSS3, JavaScript vanilla — pas de framework, pas de build)
- **Backend:** Supabase (PostgreSQL + Realtime + Auth)
- **Auth:** Supabase Auth (Email/Password)
- **Paiements:** Stripe (Payment Link), PayPal, virement Interac — activation manuelle du statut Fondateur, aucune réconciliation automatique pour l'instant
- **Hosting:** GitHub Pages
- **Domain:** vibegay.ca (DNS via Namecheap)

## 📁 Structure du Projet

```
VIBE/
├── index.html              # Page principale (tout le site : HTML/CSS/JS)
├── bande-annonce.html       # Page bande-annonce
├── conditions.html          # Conditions d'utilisation
├── confidentialite.html     # Politique de confidentialité (Loi 25 / LPRPDE)
├── manifest.json            # Manifest PWA
├── sw.js                    # Service worker PWA
├── _redirects                # Config de redirection
├── CNAME                    # Domaine custom (GitHub Pages)
├── bg.png, icon-*.png       # Ressources visuelles
├── js/                      # Fichiers non utilisés actuellement (non chargés par index.html) —
│   │                          conservés pour référence future, à nettoyer ou réintégrer
│   ├── config.js
│   ├── salons.js
│   └── ui-salons.js
└── README.md
```

> ⚠️ Les fichiers dans `js/` ne sont **pas** chargés par `index.html`. Toute la logique
> Supabase/salons/auth actuellement en production est inline dans `index.html`.

## 🔧 Déploiement

Le site est un fichier statique servi par **GitHub Pages** (repo `vibe2027/VIBE`, branche `main`).
Pousser sur `main` déploie automatiquement.

Les credentials Supabase (URL + clé anon) sont codés en dur dans `index.html` (c'est
normal et attendu pour la clé **anon** de Supabase — la sécurité repose sur les
règles RLS côté base de données, pas sur le secret de cette clé).

## 💳 Paiements — état actuel

Le plan Fondateur (99 $CAD/an) propose 3 méthodes : Stripe (lien de paiement direct),
PayPal, et virement Interac. **Aucune de ces méthodes ne met à jour automatiquement**
le statut dans la table `landing_inscriptions` — la réconciliation entre paiement
reçu et statut Fondateur confirmé se fait manuellement.

## 🔐 Sécurité & RLS

Les tables Supabase utilisent Row Level Security (RLS). Un audit de sécurité a corrigé :
GPS exposé dans les alertes SOS, emails exposés dans les inscriptions, permissions
UPDATE ouvertes, exécution anonyme de fonctions privilégiées, et une politique RLS
récursive sur `profiles`.

## 📝 Licence

VIBE est propriétaire. © 2026 VIBE Network.

## 📞 Support

Issues GitHub.

---

**Mise à jour:** 25 juillet 2026
