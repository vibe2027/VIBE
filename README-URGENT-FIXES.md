# 🔴 Fixes Urgents — État au 2026-09-01

## ✅ Appliqué

### 1️⃣ Stripe Réactivé
- **Fichier:** `js/stripe-config.js`
- **Changement:** `enabled: false` → `enabled: true`
- **Prochaine étape:** Générer les nouveaux Payment Links depuis https://dashboard.stripe.com/ et remplacer les URLs `your_*_link_here`
- **Timeline:** 30 min

### 2️⃣ Admin Panel Interac
- **Fichier:** `paiement.html`
- **Fonctionnalité:** Panel admin caché pour valider les paiements Interac manuels
- **Accès:** Auto-détection si l'utilisateur est `role: admin` en Supabase
- **Prochaine étape:** Ajouter vos emails admin à la table `users` avec `role = 'admin'`
- **Timeline:** 15 min

### 3️⃣ Code Mort Supprimé
- **Fichier:** `index.html`
- **Supprimé:** Ligne `<script src="/js/vibe-fix.js"></script>` (loader qui ne charge rien)
- **Vérifier:** Aucun appel à `vibe-fixes.js` n'existe
- **Impact:** ~10KB économisés, 1 requête HTTP en moins
- **Timeline:** ✅ Fait

### 4️⃣ Vercel Routes Fixées
- **Fichier:** `vercel.json`
- **Changement:** Routes séparées pour `/api/`, `/auth/`, `/admin/`, `/pubs/`, `/search/`, `/contact/`
- **Impact:** Évite les conflits 404 ; statiques vrais restent statiques
- **Timeline:** ✅ Fait

---

## 🔧 À Faire Avant Déploiement

### IMMÉDIAT (5-10 min)
1. ✅ Créer nouveau compte Stripe → https://dashboard.stripe.com/
2. ✅ Générer 10 Payment Links (pionnier, founder_onetime, mois1, mois3, mois6, an1, boost, fantome, visites, tribunal)
3. ✅ Copier-coller les URLs dans `js/stripe-config.js`
4. ✅ Récupérer `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` → Vercel secrets
5. ✅ Tester en sandbox : `stripe listen --forward-to https://vibegay.ca/api/webhooks/stripe`

### AVANT PRODUCTION (30 min)
1. ✅ Tester formulaire inscription + paiement Stripe (test mode)
2. ✅ Vérifier webhook Stripe met à jour BD (table `landing_inscriptions.status = 'founder_confirmed'`)
3. ✅ Ajouter comptes admin Supabase : table `users`, `role = 'admin'`
4. ✅ Tester Admin Panel Interac avec un compte admin
5. ✅ Tester fallback Interac : `VIBE_STRIPE.enabled = false`
6. ✅ Vérifier `/health` → "ok"
7. ✅ Tester sur mobile iOS + Android

---

## 📊 Checklist Déploiement

```bash
# 1. Push vers main
git checkout main
git merge fix/urgent-stripe-interac-cleanup
git push origin main

# 2. Vercel secrets (Vercel Dashboard)
# STRIPE_SECRET_KEY = sk_live_...
# STRIPE_WEBHOOK_SECRET = whsec_...
# STRIPE_PRICE_FOUNDER = prix_...

# 3. Vérifier logs
vercel logs --live

# 4. Test production
curl https://vibegay.ca/health
# Réponse: {"status":"ok"}
```

---

## 💡 Notes

- **Stripe account fermé:** Le ancien compte `acct_1TdsbPAZtcXHdCSG` est DÉFINITIVEMENT FERMÉ. Les liens buy.stripe.com sont tous morts.
- **Interac:** Traitement manuel via `/paiement.html` admin panel. Délai : 1-2 jours ouvrables.
- **PayPal:** À intégrer après (webhooks IPN + `payment_method = 'paypal'` en BD).
- **Mobile:** Service Worker `sw.js` + mode offline OK.

---

## 🚨 Si Problème

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Boutons paiement → 404 | Payment links pas remplacées | Vérifier `js/stripe-config.js` |
| Webhook pas reçu | Secret clé incorrecte en Vercel | Vérifier `STRIPE_WEBHOOK_SECRET` |
| Admin panel invisible | User `role` pas `admin` en Supabase | Ajouter à table `users` |
| RLS bloque admin | Politiques trop strictes | Audit Supabase : `SELECT * FROM ... USING current_user_id()` |

---

**Créé:** 2026-09-01  
**Branche:** `fix/urgent-stripe-interac-cleanup`  
**Próxima review:** Après déploiement production
