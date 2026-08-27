# Manuel Opérationnel VIBE — Directeur des Opérations

**Version**: 1.0  
**Date**: 2026-08-27  
**Pour**: Marc Reid, Directeur des opérations  
**Autorité finale**: Pascal Laurendeau (CEO & Fondateur)

---

## 📋 Table des Matières

1. [Contacts & Domaines](#contacts--domaines)
2. [Gestion des Billets](#gestion-des-billets)
3. [Gestion des Pubs](#gestion-des-pubs)
4. [Gestion de la Clientèle](#gestion-de-la-clientèle)
5. [Problèmes Plateforme](#problèmes-plateforme)
6. [Procédures d'Escalade](#procédures-descalade)
7. [Checklist Problèmes Courants](#checklist-problèmes-courants)

---

## 🌐 Contacts & Domaines

### **Domaines VIBE**

| Domaine | Propriétaire | Registrar | Statut |
|---------|------------|-----------|--------|
| **vibegay.ca** | VIBE Network | Namecheap | ✅ Actif |
| **vibegay.com** | (si applicable) | (registrar) | À vérifier |
| **vibe.app** | (si applicable) | (registrar) | À vérifier |

**Accès Namecheap**:
- Email: jmarcreid@gmail.com
- Mot de passe: [Demander à Pascal]
- Accès: DNS, redirects, email forwarding
- **ℹ️ NE PAS modifier sans accord Pascal**

### **Contacts Clés**

| Rôle | Nom | Email | Téléphone | Disponibilité |
|------|-----|-------|-----------|-----------------|
| **CEO & Fondateur** | Pascal Laurendeau | [À ajouter] | [À ajouter] | Décisions finales |
| **Directeur Opérations** | Marc Reid | jmarcreid@gmail.com | [À ajouter] | Jour-à-jour |
| **Support Technique** | [TBD] | support@vibegay.ca | [À ajouter] | Problèmes techniques |

### **Fournisseurs Critiques**

| Service | Fournisseur | Contact | Statut SLA |
|---------|-------------|---------|-----------|
| **Base de données** | Supabase | [URL dashboard] | 99.9% uptime |
| **Authentification** | Supabase Auth | [URL dashboard] | 99.9% uptime |
| **Hébergement** | GitHub Pages | github.com/vibe2027/VIBE | 99.95% uptime |
| **Domaine** | Namecheap | namecheap.com | Renouvellement auto |
| **Paiements** | Stripe | dashboard.stripe.com | 99.99% uptime |
| **Paiements** | PayPal | paypal.com/business | Support standard |
| **SMS** | Twilio | console.twilio.com | Mode Ange Gardien |
| **Analytics** | Vercel Analytics | vercel.com/analytics | Monitoring |

---

## 💰 Gestion des Billets

### **Qu'est-ce qu'un Billet?**

Le billet est la **monnaie interne de VIBE**:
- Utilisateurs les gagnent en participant (messages, tribunal, etc.)
- Utilisateurs les dépensent pour publier des pubs/annonces
- Système de récompense pour engagement communautaire

### **Procédure: Créer/Émettre des Billets**

**Scenario 1: Utilisateur gagne des billets**
```
✅ TU PEUX le faire sans accord

Étapes:
1. Ouvrir dashboard Supabase (voir section Accès)
2. Aller à table "billets" ou "user_billets"
3. Ajouter entrée:
   - user_id: [ID utilisateur]
   - amount: [nombre de billets]
   - reason: "message_sent" / "tribunal_vote" / "community_help" / etc.
   - created_at: NOW()
4. Enregistrer

Exemple: Utilisateur envoie 10 messages
→ +10 billets automatiquement (ou manuel si bugué)
```

**Scenario 2: Bonus/Correction de billets**
```
⚠️ CONFIRMER AVEC PASCAL si montant > 1000 billets

Étapes:
1. Note ce qui s'est passé (pourquoi correction?)
2. Envoyer message Pascal avec:
   - Utilisateur concerné
   - Montant de billets
   - Raison
3. Attendre approbation
4. Faire la correction dans Supabase
```

**Scenario 3: Utilisateur perd des billets (pub créée)**
```
✅ TU PEUX le faire

Étapes:
1. Utilisateur crée pub (coûte X billets)
2. Vérifier dans table "pubs" que pub est créée
3. Vérifier dans table "user_billets" que billets ont été débités
4. Si non débité → manuelle:
   - Supabase → user_billets
   - Soustraire le montant
   - reason: "pub_created"
```

### **Monitoring des Billets**

**Vérifier équilibre utilisateur**:
```sql
-- Dans Supabase SQL Editor
SELECT 
  user_id,
  SUM(amount) as total_billets,
  COUNT(*) as transactions
FROM user_billets
WHERE user_id = 'user-id-here'
GROUP BY user_id;
```

**Voir top utilisateurs par billets**:
```sql
SELECT 
  user_id,
  SUM(amount) as total,
  COUNT(*) as transactions
FROM user_billets
GROUP BY user_id
ORDER BY total DESC
LIMIT 20;
```

### **Problème Billet: Utilisateur dit avoir perdu des billets**

1. **Chercher dans logs**:
   ```sql
   SELECT * FROM user_billets 
   WHERE user_id = 'user-concerned'
   ORDER BY created_at DESC
   LIMIT 50;
   ```

2. **Vérifier si transaction existe**:
   - Si oui → c'est normal, explique à l'utilisateur
   - Si non → bug possible

3. **Si bug confirmé**:
   - Note: date, montant, explication
   - Contact Pascal: "Bug billet pour user X, besoin accord pour correction"
   - Attendre approbation avant agir

---

## 📢 Gestion des Pubs

### **Qu'est-ce qu'une Pub?**

Les **pubs** (annonces/publicités) sont:
- Créées par utilisateurs avec billets
- Visibles dans salon "Pubs"
- Durée limitée (7 jours, 30 jours, etc.)
- Peuvent être signalées si violation

### **Procédure: Accepter/Rejeter une Pub**

**Table: `pubs` dans Supabase**

Colonnes importantes:
```
- id: UUID
- user_id: UUID (créateur)
- title: TEXT (titre de la pub)
- description: TEXT (description)
- status: TEXT ('pending', 'approved', 'rejected', 'expired')
- billets_cost: INT (coût en billets)
- created_at: TIMESTAMP
- approved_at: TIMESTAMP
- approved_by: UUID (toi)
```

**Étapes pour approuver une pub**:
```
1. Vérifier dans Supabase:
   SELECT * FROM pubs WHERE status = 'pending'

2. Lire titre + description
   → Conforme? (pas de spam, pas de contenu interdit)

3. Si APPROUVER:
   UPDATE pubs 
   SET status = 'approved', 
       approved_at = NOW(), 
       approved_by = 'marc-reid-id'
   WHERE id = 'pub-id';

4. Si REJETER:
   UPDATE pubs 
   SET status = 'rejected', 
       approved_at = NOW(), 
       approved_by = 'marc-reid-id'
   WHERE id = 'pub-id';
   
   → Rembourser billets à l'utilisateur!
   INSERT INTO user_billets 
   (user_id, amount, reason) 
   VALUES ('user-id', 'montant-original', 'pub_rejected_refund');
```

### **Pub Problématique: Signalement/Violation**

**Checklist avant action**:
- [ ] Pub contient spam?
- [ ] Pub contient contenu illégal?
- [ ] Pub contient hate speech?
- [ ] Pub contient escroquerie?
- [ ] Pub contient contact non-autorisé?

**Si OUI à une question**:

1. **Note le problème exactement**
2. **Contact Pascal**: "Pub ID [xxx] viole politique, recommandation: supprimer"
3. **Attendre réponse**
4. **Agir selon directive**

**Action possible**:
```
SUPPRIMER pub:
UPDATE pubs 
SET status = 'removed' 
WHERE id = 'pub-id';

Rembourser utilisateur:
INSERT INTO user_billets 
(user_id, amount, reason) 
VALUES ('user-id', montant, 'pub_removed_violation_refund');

Notifier utilisateur:
Email ou message interne: "Votre pub a été supprimée pour [raison]. 
Billets remboursés. Si question, contact [Pascal]"
```

---

## 👥 Gestion de la Clientèle

### **Types de Requêtes Clients**

| Type | Qui gère? | Procédure |
|------|-----------|-----------|
| **Problème billet** | Toi | Vérifier logs, corriger si bug |
| **Problème pub** | Toi | Approuver/rejeter, gérer violations |
| **Problème plateforme** | Toi + Pascal | Signaler, voir section Problèmes |
| **Problème paiement** | Pascal | Escalade à Pascal |
| **Demande spéciale** | Pascal | Toujours escalader |
| **Plainte modération** | Pascal | Escalade à Pascal |

### **Procédure: Répondre à un Client**

**Contact client par email/message**:

```
Ton rôle: Marc Reid, Directeur des opérations

Template réponse rapide:
─────────────────────────────
Bonjour [Prénom],

Merci de nous avoir contacté. J'ai examiné votre demande concernant [sujet].

[Explication de ce qui s'est passé]

Action prise / Action à prendre:
[Détail]

Si vous avez des questions, contactez-moi à jmarcreid@gmail.com

Bien à vous,
Marc Reid
Directeur des opérations, VIBE
─────────────────────────────
```

### **Escalade Client à Pascal**

**Toujours escalader à Pascal** si:
- ❌ Demande de remboursement financier
- ❌ Plainte légale / menace de procès
- ❌ Violation grave des conditions
- ❌ Incident de sécurité/données
- ❌ Demande spéciale hors politique

**Format escalade**:
```
À: Pascal
Sujet: [ESCALADE] Problème [client name] - [brève description]

Contexte:
- Client: [nom/email]
- Problème: [description précise]
- Mes actions: [ce que j'ai fait]
- Recommandation: [ce que je propose]
- Urgence: [haute/normale/basse]

Pièces jointes:
- Logs pertinents
- Messages du client
- Preuves du problème
```

---

## ⚠️ Problèmes Plateforme

### **Niveau 1: Plateforme LENTE**

**Comment détecter**:
- Utilisateurs disent "site lent"
- Pages prennent > 5 secondes à charger
- Chats ne mettent à jour pas en temps réel

**Diagnostic**:
1. Vérifier dashboard Vercel Analytics:
   - URL: vercel.com (project VIBE)
   - Regarder Response Time
   - Normal: < 200ms

2. Vérifier Supabase status:
   - URL: status.supabase.com
   - Chercher "VIBE" ou "us-east-1"
   - Si rouge: problème Supabase

3. Vérifier GitHub Pages:
   - URL: github.com/vibe2027/VIBE/actions
   - Chercher build récent
   - Si "failed": problème déploiement

**Actions**:
- Si Vercel lent: contact Pascal (peut être surge de traffic)
- Si Supabase down: attendre (c'est leur infra), notifier utilisateurs
- Si GitHub down: rare, contact Pascal

**Notifier utilisateurs**:
```
Message plateforme VIBE (dans index.html ou banner):
"⚠️ VIBE connaît des ralentissements. 
On travaille sur le problème. 
Merci de votre patience!"
```

### **Niveau 2: ERREUR (404, 500, etc.)**

**Utilisateur rapporte**: "J'ai une erreur, écran rouge"

**Diagnostic**:
1. Demander exactement quel erreur:
   - Quel écran?
   - Quel code erreur? (404, 500, etc.)
   - Quel navigateur?

2. Reproduire:
   ```
   - Ouvre vibegay.ca
   - Essaye la même action
   - Tu as l'erreur aussi?
   ```

3. Si tu reproduis:
   - Note exactement quoi faire pour la reproduire
   - Prends screenshot
   - Envoie à Pascal: "Erreur reproduction: [étapes]"

4. Si tu ne reproduis pas:
   - Cache de navigateur: demande à utilisateur vider cache
   - Incognito: demande navigateur privé
   - Autre device: demande tester ailleurs

### **Niveau 3: DONNEES PERDUES**

**Utilisateur dit**: "Mon message a disparu!" / "Mes billets ont disparu!"

**ACTIONS IMMÉDIATE**:
1. ⚠️ **NE PAS modifier données**
2. Demander:
   - Quand exactement ça s'est passé?
   - Preuve? (screenshot)
   - ID du message/billet?

3. Chercher dans Supabase:
   ```sql
   SELECT * FROM messages 
   WHERE id = 'message-id'
   LIMIT 1;
   
   -- Si rien: vraiment disparu
   -- Si existe: perte de sync, utilisateur doit refresh
   ```

4. **ESCALADER À PASCAL IMMÉDIATEMENT**
   ```
   Sujet: [CRITIQUE] Perte de données signalée
   
   Détail du problème:
   - Type: [message/billet/autre]
   - Utilisateur: [ID/email]
   - Quand: [date/heure]
   - Preuve: [screenshot]
   - Trouvé dans DB: [oui/non]
   
   Possibilité: Bug sérieux / Hack / Corruption données
   Besoin: Décision immédiate
   ```

---

## 🆘 Procédures d'Escalade

### **Quand Escalader à Pascal**

**TOUJOURS escalader** pour:

| Situation | Urgence | Exemple |
|-----------|---------|---------|
| Perte de données | 🔴 CRITIQUE | Messages/billets disparus |
| Paiement problème | 🔴 CRITIQUE | Charge sans livraison |
| Sécurité | 🔴 CRITIQUE | Compte piraté / données exposées |
| Utilisateur mécontent | 🟠 HAUTE | Menace procès / très en colère |
| Plateforme down | 🟠 HAUTE | Impossible login / messages |
| Billet montant > 1000 | 🟠 HAUTE | Correction importante |
| Pub violation | 🟠 HAUTE | Contenu illégal |
| Question politique | 🟠 HAUTE | "Quoi faire dans ce cas?" |

### **Format Escalade Standard**

```
À: [Email Pascal]
Sujet: [ESCALADE - URGENCE] [Catégorie] - [Brève description]

CONTEXTE:
────────
Problème: [Description précise]
Utilisateur: [Nom/Email/ID]
Quand: [Date/Heure]
Fréquence: [Une fois / Récurrent / ???]

ACTIONS PRISES:
────────────────
[Liste de ce que tu as vérifié/fait]
- Vérification 1: [résultat]
- Vérification 2: [résultat]

RECOMMANDATION:
─────────────
[Qu'est-ce que tu penses qu'on devrait faire?]

PIÈCES JOINTES:
────────────────
- logs.txt
- screenshot.png
- [autre preuve]

Urgent? OUI / NON
Besoin réponse avant: [date/heure]
```

### **Temps de Réponse Attendu**

| Urgence | Réponse Pascal | Toi = Attendre? |
|---------|---|---|
| 🔴 CRITIQUE | < 1h | OUI (pause tout) |
| 🟠 HAUTE | < 4h | OUI (prépare escalade) |
| 🟡 NORMALE | < 24h | NON (continue travail) |

---

## ✅ Checklist Problèmes Courants

### **Problème: Utilisateur ne peut pas login**

```
☐ Erreur spécifique? (oubli MDP / email invalide / autre?)
☐ Essayer avec autre email? (typo?)
☐ Essayer incognito? (cache?)
☐ Vérifier Supabase Auth status? (ok?)
☐ Utilisateur existe dans DB? (SELECT * FROM users...)
☐ Compte suspendu? (CHECK status column)

Action:
- Si compte existe → problème technique → escalader Pascal
- Si compte n'existe pas → utilisateur doit s'inscrire d'abord
- Si suspendu → explique suspension, escalader pour levée
```

### **Problème: Chat/Messages figent / ne mettent pas à jour**

```
☐ Utilisateur a actualisé page? (F5)
☐ Vérifier Supabase Realtime status? (ok?)
☐ WebSocket connection ok? (dev tools → Network)
☐ Problème utilisateur seul ou tous?

Action:
- Page refresh = 90% des cas (solution rapide)
- Si persiste → cache datas → escalader Pascal
- Si tous les utilisateurs → Supabase down → attendre récupération
```

### **Problème: Billet ne s'ajoute pas après action**

```
☐ Action vraiment complétée? (message posté?)
☐ Attendre 5 secondes? (délai sync)
☐ Actualiser page? (refresh)
☐ Chercher dans DB? (SELECT user_billets...)

Action:
- 95% = rafraîchir résout
- Si DB vide → transaction perdue → correction manuelle + escalader
```

### **Problème: Pub n'apparaît pas après création**

```
☐ Status = 'pending'? (attend approbation?)
☐ Status = 'approved'? (visible?)
☐ Actualiser page? (refresh)
☐ Utilisateur avait assez de billets? (CHECK balance)
☐ Billets débités? (CHECK user_billets logs)

Action:
- Si pending → normal, doit attendre toi
- Si billets débités mais pas créée → bug → correction manuelle
```

### **Problème: Utilisateur reçoit email 2 fois**

```
☐ Vraiment 2x ou impression?
☐ Timestamps identiques? (double send ou 2 actions)
☐ Fréquent ou une fois?

Action:
- Normalement: utilisateur fat doigt 2x → explique
- Si fréquent → bug email → escalader Pascal
- NE PAS modifier logs email (audit trail)
```

### **Problème: Utilisateur rapporte contenu offensant**

```
☐ Quel contenu exactement? (message/pub/profil?)
☐ Viole quelle règle? (hate/spam/harcel?)
☐ Signalé aussi dans app? (via bouton report)

Action:
- Note: qui, quoi, pourquoi
- Escalader Pascal immédiatement
- Pascal décide: supprimer / avertir / suspendre
- Toi = exécute la décision
```

---

## 📞 Résumé Rapide: Qui Appeler Quand?

```
PROBLEM          → APPELLE               → ESCALADE
─────────────────────────────────────────────────
Billet manquant  → Toi (vérifier logs)   → Pascal si bug
Pub à approuver  → Toi (approuver)       → Pascal si violation
Chat figé        → Toi (refresh)         → Pascal si persiste
Perte données    → Pascal IMMÉDIATEMENT  → 🔴 CRITIQUE
Paiement bug     → Pascal IMMÉDIATEMENT  → 🔴 CRITIQUE
Utilisateur fâché→ Toi (répondre)        → Pascal si escalade
Plateforme down  → Vérifier status       → Pascal si continue
Doute sur quoi   → Pascal                → Demander AVANT agir
```

---

## 📝 Logging & Documentation

**Pour chaque problème important**:

1. **Créer ticket** (dans ton système):
   - Date/Heure
   - Description
   - Actions prises
   - Résolution
   - Temps résolution

2. **Garder historique**:
   - Emails/messages clients
   - Screenshots
   - Logs Supabase pertinents
   - Décisions Pascal

3. **Rapport mensuel**:
   - Nombre problèmes par type
   - Temps moyen résolution
   - Problèmes non-résolus
   - Recommandations

---

## 🚨 Urgence: Quoi Faire Immédiatement

**Si utilisateur dit**:
- "Compte hacké" → **Escalader Pascal IMMÉDIATEMENT**
- "Données exposées" → **Escalader Pascal IMMÉDIATEMENT**
- "Paiement volé" → **Escalader Pascal IMMÉDIATEMENT**
- "Contenu illégal sur plateforme" → **Escalader Pascal IMMÉDIATEMENT**

**Ne JAMAIS**:
- ❌ Modifier données sans vérifier 2x
- ❌ Donner accès utilisateur sans Pascal
- ❌ Supprimer logs/données
- ❌ Promettre remboursement (Pascal décide)
- ❌ Changer settings plateforme (Pascal only)

---

## 📚 Ressources Utiles

### **Dashboards à Consulter**

```
Supabase: https://app.supabase.com/
↳ Tables, logs, auth, monitoring

Vercel: https://vercel.com/
↳ Deployments, analytics, performance

GitHub: https://github.com/vibe2027/VIBE
↳ Code, commits, actions, issues

Namecheap: https://www.namecheap.com/
↳ Domaines, DNS, email

Stripe: https://dashboard.stripe.com/
↳ Paiements, clients, facturation

Twilio: https://console.twilio.com/
↳ SMS, Mode Ange Gardien
```

### **Commandes Utiles**

```sql
-- Vérifier utilisateur
SELECT * FROM users WHERE email = 'user@email.com';

-- Voir billets utilisateur
SELECT * FROM user_billets WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- Voir pubs en attente
SELECT id, user_id, title, status FROM pubs WHERE status = 'pending';

-- Voir problèmes de sync
SELECT * FROM messages WHERE created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC;
```

---

**Dernière mise à jour**: 2026-08-27  
**Validé par**: Pascal Laurendeau (CEO)  
**Questions?** Demander à Pascal avant agir

Avec Humilité et Respect 🌊
