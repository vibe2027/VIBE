# VIBE — Déploiement Vercel

État vérifié en production le 2026-08-28 via `https://www.vibegay.ca/health`
et des requêtes réelles sur les routes de l'API.

## Ce qui fonctionne déjà

- Le serveur Express tourne en production (`x-powered-by: Express`, `/health` → 200).
- `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont **déjà présentes** dans Vercel :
  elles ont été injectées automatiquement par l'intégration Vercel–Supabase.
  Preuve : `GET /pubs/active/voix` renvoie « Could not find the table 'public.pubs' »,
  une erreur de schéma — donc Supabase a accepté la clé. Une clé absente ou invalide
  aurait renvoyé une erreur d'authentification.
- Le domaine `vibegay.ca` est vérifié pour l'envoi sur Resend.

## Variables à ajouter dans Vercel

Réglages → Environment Variables → Production :
https://vercel.com/vibe2026applis-projects/project-ne5p9/settings/environment-variables

| Variable | Pourquoi |
|---|---|
| `RESEND_API_KEY` | Formulaire de contact. Voir `credentials.txt` (non versionné). |
| `STRIPE_SECRET_KEY` | `/health` rapporte `stripe: false` — la clé manque. |
| `STRIPE_PUBLIC_KEY` | Idem. |
| `STRIPE_WEBHOOK_SECRET` | Optionnel. Endpoint : `https://www.vibegay.ca/api/webhooks/stripe` |

`SENDGRID_API_KEY` n'est plus nécessaire : le code utilise Resend.

## Vérification après déploiement

    GET https://www.vibegay.ca/health

Renvoie un bloc `config` avec un booléen par variable (aucune valeur exposée) :

```json
{
  "status": "ok",
  "config": {
    "supabase_url": true,
    "supabase_service_role": true,
    "stripe_secret": true,
    "stripe_webhook": false,
    "resend": true,
    "elasticsearch": false
  }
}
```

Tout ce qui doit être à `true` ci-dessus l'est une fois les variables ajoutées.
`elasticsearch` à `false` est normal : la recherche se désactive proprement
(503 sur les routes `/api/search/*`) sans empêcher le reste de fonctionner.

## Points à trancher avant la mise en service

Trois problèmes de configuration de base de données ont été constatés. Ils ne
bloquent pas le déploiement mais empêchent les routes qui lisent Supabase de
fonctionner. Ils demandent une décision, pas un correctif automatique.

1. **Deux bases distinctes, une seule contient les données.**
   - `fhksytcoyjtcrkmhnoyw` (us-east-1) : 37 tables avec des données réelles
     (`profiles`, `salons`, `founder_codes`, `members`…).
   - `vdqamjtzksiifnsnztki` (ca-central-1) : **aucune table**.

   Il faut décider laquelle est la base de référence, puis pointer
   `SUPABASE_URL` dessus.

2. **Le schéma attendu par ce backend n'existe nulle part.**
   Le code interroge `pubs` et `users` (voir `sql/complete-schema.sql` et
   `sql/users_schema.sql`), alors que la base peuplée utilise un schéma
   différent (`profiles`, `salons`, `salon_messages`…). Il faut soit appliquer
   les fichiers SQL du dépôt, soit adapter le code au schéma existant.

3. **`js/supabase-config.js` pointe vers un projet inexistant.**
   La référence `depblhxmrzjqnvkszbbl` ne correspond à aucun projet du compte.
   À corriger vers le projet retenu au point 1.
