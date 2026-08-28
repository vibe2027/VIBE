# VIBE — Guide de Déploiement Vercel (Phase 6)

## État actuel
✅ **Code**: Prêt pour production (Elasticsearch optionnel, toutes dépendances résolues)
✅ **Sécurité**: Zéro identifiant personnel public, clés Stripe récupérées
⏳ **Déploiement**: Clés Supabase et SendGrid manquantes

---

## Clés DISPONIBLES MAINTENANT

### STRIPE (✅ Récupérées - Voir credentials.txt)
```
STRIPE_PUBLIC_KEY=pk_test_51U8PSb6J6CxrJ9ySJdfDnfHCDv3cVHu8LLeGzjhcmp4tvwQa6mVTBPMn1HZKOnWF62MYNYgQVXdZks42Te235Uhs00mByqEMHa
STRIPE_SECRET_KEY=<voir credentials.txt>
```

✅ **Note**: Les clés Stripe complètes sont dans `credentials.txt` (non-public).

### SUPABASE (✅ Partiellement)
```
SUPABASE_URL=https://vdqamjtzksiifnsnztki.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcWFtanR6a3NpaWZuc256dGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODA0MjAsImV4cCI6MjEwMjY1NjQyMH0.6vwQwinxLeGXHKQ1VRPwRHtaIM6ZTXFYpfeVaW-7aoA
```

### CONFIGURATION
```
SENDGRID_FROM_EMAIL=support@vibegay.ca
NODE_ENV=production
```

---

## Clés MANQUANTES

### 1. SUPABASE_SERVICE_ROLE_KEY
**Où**: https://dashboard.supabase.com/project/vdqamjtzksiifnsnztki/settings/api
**Procédure**:
1. Accéde à Settings → API
2. Copie la clé sous "service_role" (commence par "eyJh...")
3. Ajoute à Vercel (voir étape 3 ci-dessous)

### 2. SENDGRID_API_KEY
**Où**: https://app.sendgrid.com/settings/api_keys
**Procédure**:
1. Clique sur "Create API Key"
2. Donne-lui le nom "Vercel Production"
3. Full Access ou Mail Send seulement
4. Copie la clé complète (commence par "SG.")
5. Ajoute à Vercel (voir étape 3 ci-dessous)

### 3. STRIPE_WEBHOOK_SECRET (optionnel pour v1)
**Où**: https://dashboard.stripe.com/webhooks
**Procédure**:
1. Create endpoint: `https://vibegay.ca/api/webhooks/stripe`
2. Sélectionne événements: `payment_intent.succeeded`, `invoice.payment_succeeded`
3. Copie "Signing Secret" (commence par "whsec_")
4. Ajoute à Vercel

---

## Ajout des variables à Vercel

### Option A: Dashboard Vercel (Plus simple)
1. Va à https://vercel.com/dashboard/vibegay/settings/environment-variables
2. Pour chaque clé manquante:
   - Clique "Add"
   - Colle le nom (ex: `SUPABASE_SERVICE_ROLE_KEY`)
   - Colle la valeur
   - Sélectionne "Production"
   - Clique "Save"
3. **Redéploie automatiquement** (Vercel va rebuilder)

### Option B: Ligne de commande (Si tu as accès local à Vercel CLI)
```bash
# D'abord, configure les clés dans .env.local
cat > .env.local << 'EOF'
SUPABASE_SERVICE_ROLE_KEY=<paste-key-here>
SENDGRID_API_KEY=<paste-key-here>
STRIPE_WEBHOOK_SECRET=<paste-key-here-or-skip>
EOF

# Puis utilise le script
VERCEL_TOKEN=<your-token> ./configure-vercel.sh "$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)" "$(grep STRIPE_SECRET_KEY .env.local | cut -d= -f2)" "$(grep STRIPE_WEBHOOK_SECRET .env.local | cut -d= -f2)" "$(grep SENDGRID_API_KEY .env.local | cut -d= -f2)"
```

---

## Déploiement en Direct

La branche `claude/vibe-v1-architecture-53i2dd` est **déjà pushée et prête**.

Vercel va redéployer automatiquement quand tu ajoutes les variables.

---

## Vérification post-déploiement

Une fois les clés ajoutées, teste:

```bash
# Contact form
curl -X POST https://vibegay.ca/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'

# Health check
curl https://vibegay.ca/api/health

# Search (si Elasticsearch disponible)
curl https://vibegay.ca/api/search/full-text?q=test
```

---

## Résumé
✅ **Code**: Production-ready  
✅ **Stripe**: Configuré  
❌ **Supabase service role**: Besoin de dashboard  
❌ **SendGrid**: Besoin de dashboard ou nouvelle clé API  
⏳ **Stripe webhooks**: Optionnel (peut être fait après v1)  

**Prochaine action**: Ajoute les 2 clés manquantes au dashboard Vercel → redéploiement automatique.
