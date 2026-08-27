# 📋 Plan de Déploiement Phase 6 en Production
## vibegay.ca — Déploiement Sécurisé & Séquencé

**Date cible:** [À définir]  
**Responsable:** Pascal Laurendeau  
**Durée estimée:** 4-6 heures (avec smoke tests)

---

## 🎯 Étapes de Déploiement (Ordre Critique)

### **PHASE 1: Préparation Infrastructure (T-24h)**

#### ✅ 1.1 Vérifier les Dépendances Externes

- [ ] **Elasticsearch**: Cluster accessible sur `ELASTICSEARCH_URL`
  - Tester la connexion: `curl -u elastic:password https://elasticsearch.yourdomain.com/_health`
  - Créer le template d'index si nécessaire
  - Vérifier quota disque (minimum 50 GB)

- [ ] **OpenAI API**: Clé valide et quota suffisant
  - Tester: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`
  - Estimer coûts modération (~0.002$ par 1000 requêtes)

- [ ] **TURN Server**: Accessible et fonctionnel
  - Tester avec stunclient ou turnutils
  - Vérifier credentials `TURN_USERNAME` / `TURN_PASSWORD`
  - Voir que les ports (3478, 5349) sont ouverts

- [ ] **Supabase Backup**: Dernier backup validé
  - Via Dashboard Supabase → Backups
  - Tester une restauration de backup sur une DB de test

#### ✅ 1.2 Environnement de Staging

- [ ] Copier `.env.production.example` → `.env.staging`
- [ ] Remplir avec values de staging (pas de vraies clés API)
- [ ] Déployer Phase 6 en complet sur staging
- [ ] Valider 24h sur staging: logs, monitoring, pas d'erreurs

---

### **PHASE 2: Migration Base de Données (T-0, T-30min)**

**⚠️ Fenêtre de maintenance: Prévoir 30-45 minutes**

#### ✅ 2.1 Backup Immédiat (T-0)

```bash
# Via Supabase CLI
supabase db dump -f backup-pre-phase6-$(date +%Y%m%d-%H%M%S).sql

# Stocker le backup en sécurisé
aws s3 cp backup-*.sql s3://your-backup-bucket/vibe-db/
```

#### ✅ 2.2 Exécuter Migration SQL

```bash
# Connexion à Supabase via psql
psql "postgresql://postgres:password@db.supabase.co:5432/postgres" \
  -f migrations/004-phase-6-tables.sql

# OU via Supabase Dashboard → SQL Editor → Copier/coller contenu
```

**Points de vérification:**
- Pas d'erreur de syntax
- Toutes les tables créées: `\dt` dans psql
- Tous les index créés: `\di` dans psql
- RLS activé sur chaque table

#### ✅ 2.3 Vérifier Intégrité

```sql
-- Vérifier toutes les tables existent
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%operation%' 
OR table_name LIKE '%moderation%' 
OR table_name LIKE '%video%'
OR table_name LIKE '%recommendation%';

-- Vérifier RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('operation_history', 'moderation_queue', 'video_calls');
```

---

### **PHASE 3: Configuration Variables d'Environnement (T+15min)**

#### ✅ 3.1 Production `.env` Configuration

Copier `.env.production.example` → `.env.production` et remplir:

```bash
# En sécurité (utiliser secrets manager, pas git!)
# Pour Vercel / Heroku / AWS Lambda: Configurer via Dashboard

SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ELASTICSEARCH_URL=https://elasticsearch.vibegay.ca:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=[SECURE_PASSWORD]

OPENAI_API_KEY=sk-[SECURE_KEY]
OPENAI_MODERATION_MODEL=text-moderation-latest

TURN_SERVER_URL=turn:turn.vibegay.ca:3478
TURN_USERNAME=vibe-rtc
TURN_PASSWORD=[SECURE_PASSWORD]

# Feature flags: Tous à TRUE par défaut
FEATURE_FLAG_REALTIME_COLLAB=true
FEATURE_FLAG_ADVANCED_SEARCH=true
FEATURE_FLAG_RECOMMENDATIONS=true
FEATURE_FLAG_MOBILE_APP=true
FEATURE_FLAG_WEBRTC_VIDEO=true
FEATURE_FLAG_NLP_MODERATION=true
```

#### ✅ 3.2 Vérifier Accès aux Services

```javascript
// test-connections.js — À run avant déploiement
const testConnections = async () => {
  // Test Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  console.log('✅ Supabase OK' || '❌ Supabase FAIL');

  // Test Elasticsearch
  const { Client } = require('@elastic/elasticsearch');
  const es = new Client({ node: process.env.ELASTICSEARCH_URL });
  await es.info().then(() => console.log('✅ Elasticsearch OK'));

  // Test OpenAI
  const axios = require('axios');
  await axios.get('https://api.openai.com/v1/models', {
    headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
  }).then(() => console.log('✅ OpenAI OK'));
};

testConnections();
```

---

### **PHASE 4: Déploiement Backend (T+45min)**

#### ✅ 4.1 Code Review Final

- [ ] Tous les imports Phase 6 intégrés dans `index.js`
- [ ] Toutes les routes Phase 6 enregistrées (`/api/webrtc/*`, `/api/moderation/*`, etc.)
- [ ] Pas de code de debug ou console.log() en production
- [ ] Tous les error handlers en place

#### ✅ 4.2 Build & Deploy

**Sur Vercel / Heroku:**
```bash
git push origin main
# Déploiement auto ou via Dashboard
# Vérifier logs en temps réel
```

**Sur serveur dédié:**
```bash
ssh deploy@vibegay.ca
cd /var/www/vibe
git pull origin main
npm install --production
npm run build
pm2 restart vibe
pm2 logs vibe # Vérifier pas d'erreur
```

#### ✅ 4.3 Vérifier Endpoints

```bash
# Tester endpoints critiques
curl -X GET https://api.vibegay.ca/health
# Response: { "status": "ok", "phase6": "active" }

curl -X POST https://api.vibegay.ca/search/advanced \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "type": "full_text"}'

curl -X GET https://api.vibegay.ca/recommendations/hybrid \
  -H "Authorization: Bearer $TOKEN"
```

---

### **PHASE 5: Déploiement Frontend (T+1h30)**

#### ✅ 5.1 Build Frontend

```bash
npm run build
# Vérifier pas d'erreur de build
# Taille du bundle dans limites acceptables
```

#### ✅ 5.2 Déployer Assets

**Sur CDN (Cloudflare, AWS S3):**
```bash
aws s3 sync dist/ s3://vibe-cdn/phase-6/
```

**Sur serveur web:**
```bash
ssh deploy@vibegay.ca
cd /var/www/vibe/public
rm -rf /* # Backup avant!
cp -r /build/dist/* .
nginx -s reload
```

#### ✅ 5.3 Vérifier Accès Frontend

- [ ] `https://vibegay.ca/` charge sans erreur
- [ ] Console du navigateur: Pas d'erreur JavaScript
- [ ] Onglet Network: Tous les assets loadent (200 HTTP status)
- [ ] Onglet Application: LocalStorage/IndexedDB OK

---

### **PHASE 6: Smoke Tests Critiques (T+2h)**

**Durée: 15-20 minutes**

#### ✅ 6.1 Test Realtime Collaboration

```
1. Ouvrir document en 2 onglets différents
2. Écrire du texte dans onglet 1
3. Vérifier synchronisation instantanée en onglet 2
4. Éditer texte en simultané
5. Vérifier pas d'erreur de transformation OT
```

#### ✅ 6.2 Test Recherche Avancée

```
1. POST /search/advanced → recherche full-text
2. POST /search/semantic → recherche par embedding
3. POST /search/hybrid → recherche combinée
4. Vérifier Elasticsearch logs: Pas d'erreur
```

#### ✅ 6.3 Test Recommandations

```
1. GET /recommendations/hybrid pour utilisateur de test
2. Vérifier réponse JSON (>= 5 recommandations)
3. Vérifier scores entre 0 et 1
4. Vérifier pas de duplicates
```

#### ✅ 6.4 Test Modération NLP

```
1. POST /moderation/check avec contenu normal
   → Action: approve
2. POST /moderation/check avec contenu haineux
   → Action: reject ou review
3. Vérifier logs dans moderation_queue
```

#### ✅ 6.5 Test WebRTC Basique

```
1. Accéder à /video/test (page de test)
2. Initialiser appel test
3. Vérifier ICE candidates échangés
4. Vérifier pas d'erreur CORS ou permission
```

#### ✅ 6.6 Test Paiements (Régression)

```
1. Acheter un billet (flow complet)
2. Vérifier webhook Stripe reçu
3. Vérifier transaction dans moderation_logs
4. Vérifier pas de collision avec Phase 6
```

#### ✅ 6.7 Monitoring & Alertes

- [ ] Sentry: Pas d'erreur nouvelle
- [ ] Logs: Vérifier niveau ERROR / CRITICAL
- [ ] Datadog: CPU < 70%, Mémoire < 80%
- [ ] Elasticsearch: Health = GREEN

---

### **PHASE 7: Validation Finale (T+2h30)**

#### ✅ 7.1 Checklist Client

- [ ] UI responsive (mobile + desktop)
- [ ] Tous les boutons cliquables
- [ ] Pas de contenu cassé ou mal affiché
- [ ] Performance acceptable (< 3s chargement)
- [ ] Erreurs user-facing claires et actionnables

#### ✅ 7.2 Communication Utilisateurs

```markdown
📢 Annonce:
"VIBE Phase 6 est LIVE! 🚀
✨ Édition collaborative en temps réel
🔍 Recherche avancée avec IA
💬 Recommandations intelligentes
📱 App mobile bientôt disponible
🎥 Appels vidéo P2P
🛡️ Modération avec IA

Merci pour votre patience! 💙"
```

---

## 🛡️ Plan de Rollback (En Cas de Problème Critique)

### **Option 1: Désactiver une Brique (Rapide, <5min)**

```bash
# Désactiver modération NLP
export FEATURE_FLAG_NLP_MODERATION=false

# Désactiver WebRTC
export FEATURE_FLAG_WEBRTC_VIDEO=false

# Redémarrer service
pm2 restart vibe
```

**Impact:** Feature désactivée, reste de la plateforme OK

### **Option 2: Rollback Complet (Modéré, 15-20min)**

```bash
# Revenir au commit précédent
git revert HEAD
git push origin main

# Redéployer (auto ou manual)
# Attendre redéploiement ~5-10 min

# Vérifier santé
curl https://api.vibegay.ca/health
```

### **Option 3: Restauration DB (Dernier Recours, 30-45min)**

```bash
# Via Supabase Dashboard → Backups
# Restaurer DB de backup (T-1h avant déploiement)
# Données Phase 6 perdues, mais cœur intact
```

### **Décision Matrix**

| Problème | Sévérité | Action | Temps |
|----------|----------|--------|-------|
| NLP bogue sur contenu sensible | 🟡 Moyen | Feature flag OFF | 2 min |
| WebRTC appels ne se connectent pas | 🟡 Moyen | Feature flag OFF | 2 min |
| Recherche Elasticsearch lente | 🟡 Moyen | Rollback commit | 15 min |
| DB corrompue après migration | 🔴 Critique | Restaurer backup | 45 min |
| Paiements non reçus (régressions) | 🔴 Critique | Rollback complet | 20 min |

---

## 📊 Monitoring Post-Déploiement

### **Première Semaine (Vigilance Renforcée)**

- [ ] Vérifier logs **chaque heure** (Sentry, Datadog)
- [ ] Vérifier **moderation_queue** (contenu bloqué à revue?)
- [ ] Vérifier **video_calls** (appels réussis?)
- [ ] Vérifier **search_logs** (requêtes OK?)
- [ ] Vérifier **recommendation_logs** (algo OK?)
- [ ] Vérifier **Elasticsearch disk** (pas de saturation?)

### **Deuxième Semaine**

- [ ] Réduire vigilance à 2x par jour
- [ ] Vérifier trends vs pré-déploiement
- [ ] Recueillir feedback utilisateurs

### **Métriques Clés à Tracker**

```
✅ API Latency (Phase 6 endpoints): < 500ms
✅ Error Rate: < 0.1%
✅ Moderation Accuracy: > 95%
✅ WebRTC Connection Success: > 98%
✅ Search Response Time: < 200ms
✅ DB Query Time: < 100ms
```

---

## 🚀 Checklist Déploiement Final

- [ ] Tous les backups validés
- [ ] Toutes les variables d'environnement configurées
- [ ] Migration SQL testée sur staging
- [ ] Code review complétée
- [ ] Tests smoke tous passés
- [ ] Monitoring & alertes configurés
- [ ] Plan de rollback validé avec team
- [ ] Communication utilisateurs prête
- [ ] Fenêtre de maintenance confirmée
- [ ] Responsable on-call désigné

---

## 📞 Escalade En Cas de Problème

**Pascal Laurendeau** (Fondateur)
- Décisions critiques
- Autorisation rollback complet

**Marc Reid** (Directeur Opérations)
- Supervision déploiement
- Communication utilisateurs

**Tech Lead**
- Exécution technique
- Troubleshooting

---

**Status:** 🟡 En Préparation  
**Dernière Maj:** 2026-08-27  
**Prochaine Étape:** Tester toutes les dépendances externes
