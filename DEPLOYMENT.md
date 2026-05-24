# Configuration pour vibegay.ca

## 🌐 Guide de Déploiement Production

Ce document explique comment configurer vibegay.ca pour l'application VIBE 2026.

---

## 📋 Prérequis

- [ ] Domaine vibegay.ca acheté et accessible
- [ ] Accès au panneau de configuration DNS
- [ ] Serveur de production ou plateforme d'hébergement
- [ ] Certificat SSL/TLS (ou Let's Encrypt)
- [ ] Compte Supabase configuré

---

## 🔧 Étape 1: Configuration DNS

### Option A: Serveur Direct (IP Statique)

```
Type  | Nom  | Valeur                    | TTL
------|------|---------------------------|-----
A     | @    | <votre-ip-serveur>       | 3600
A     | www  | <votre-ip-serveur>       | 3600
```

### Option B: CDN/Proxy (Cloudflare, etc.)

```
Type  | Nom  | Valeur                    | Proxy
------|------|---------------------------|-------
CNAME | @    | vibegay.ca               | ✅
CNAME | www  | vibegay.ca               | ✅
```

**Temps de propagation DNS**: 24-48 heures (max)

---

## 🔐 Étape 2: Configuration SSL/TLS

### Option A: Let's Encrypt (Gratuit, Recommandé)

```bash
# yInstaller Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d vibegay.ca -d www.vibegay.ca

# Renouvellement automatique
sudo certbot renew --dry-run
```

### Option B: Certificat Commercial
- Acheter certificat SSL auprès d'un fournisseur
- Installer selon les instructions du fournisseur

---

## ⚙️ Étape 3: Configuration Variables d'Environnement

Mettre à jour `/app/frontend/.env`:

```env
# URL de Production
REACT_APP_BACKEND_URL=https://vibegay.ca

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://fhksytcoyjtcrkmhnoyw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoa3N5dGNveWp0Y3JrbWhub3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTkzODIsImV4cCI6MjA5MjE3NTM4Mn0.nW9xgEQSuXlq96d53AFE7jUADmr04YdMoD9hCNmw64k

# Founder Configuration
REACT_APP_FOUNDER_EMAIL=vibeqbc2026@hotmail.com

# Stripe Payment Link
REACT_APP_STRIPE_FOUNDER_LINK=https://buy.stripe.com/28E3cx85P6UI9YM6xm3wQ01

# tConfiguration Serveur
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## 🏗️ Étape 4: Build de Production

```bash
# Naviguer vers le frontend
cd /app/frontend

# Installer les dépendances (si nécessaire)
yarn install

# Créer le build optimisé
yarn build

# Les fichiers seront dans /app/frontend/build/
```

**Taille du build**: ~2-3 MB (gzipped)  
**Temps de build**: ~2-3 minutes

---

## 🚀 Étape 5: Déploiement

### Option A: Nginx (Recommandé)

1. **Installer Nginx**
```bash
sudo apt-get update
sudo apt-get install nginx
```

2. **Configuration Nginx**

Créer `/etc/nginx/sites-available/vibegay.ca`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name vibegay.ca www.vibegay.ca;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name vibegay.ca www.vibegay.ca;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/vibegay.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vibegay.ca/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Root directory
    root /app/frontend/build;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router - SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

3. **Activer le site**
```bash
sudo ln -s /etc/nginx/sites-available/vibegay.ca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Apache

Configuration similaire disponible sur demande.

### Option C: Plateforme Cloud (Vercel, Netlify, etc.)

1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

---

## 🔍 Étape 6: Configuration Supabase

### Autoriser le Domaine

Dans Supabase Dashboard → Settings → API:

**Allowed Origins (CORS)**:
```
https://vibegay.ca
https://www.vibegay.ca
```

### Webhooks (Optionnel)

Configurer des webhooks pour événements:
- Nouveau membre inscrit
- Signalement créé
- etc.

---

## 📊 Étape 7: Monitoring & Analytics

### Google Analytics (Recommandé)

1. Créer une propriété GA4
2. Ajouter le tracking code dans `/public/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Error Tracking (Sentry)

```bash
cd /app/frontend
yarn add @sentry/react
```

Configurer dans `src/index.js`:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "votre-dsn-sentry",
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

Services recommandés:
- **UptimeRobot** (gratuit)
- **Pingdom**
- **StatusCake**

Configuration:
```
URL à monitorer: https://vibegay.ca/health
Intervalle: 5 minutes
Alertes: Email + SMS
```

---

## 🔒 Étape 8: Sécurité

### Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Rate Limiting (Nginx)

Ajouter à la config Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

server {
    location / {
        limit_req zone=one burst=20 nodelay;
        # ...
    }
}
```

### DDOS Protection

Utiliser Cloudflare (gratuit):
- Protection DDOS automatique
- CDN global
- Cache intelligent

---

## 💾 Étape 9: Backup & Restore

### Base de Données (Supabase)

Supabase fait des backups automatiques, mais pour plus de contrôle:

```bash
# Installer pg_dump
sudo apt-get install postgresql-client

# Backup quotidien
pg_dump -h db.fhksytcoyjtcrkmhnoyw.supabase.co \
        -U postgres \
        -d postgres \
        -f backup_$(date +%Y%m%d).sql
```

### Code Source

Utiliser Git avec branches:
```bash
# Branch production
git checkout -b production
git push origin production

# Tags pour releases
git tag -a v1.0.0 -m "Release 1.0.0"
git push --tags
```

---

## 🧪 Étape 10: Tests Post-Déploiement

### Checklist Fonctionnelle

- [ ] **Homepage**: https://vibegay.ca charge correctement
- [ ] **WWW redirect**: www.vibegay.ca → vibegay.ca
- [ ] **HTTPS**: Certificat SSL valide et actif
- [ ] **Canvas**: Toutes les animations fonctionnent
- [ ] **Navigation**: Smooth scroll vers toutes sections
- [ ] **Modals**: Login/Signup s'ouvrent correctement
- [ ] **Formulaires**: Inscription fonctionne
- [ ] **Stripe**: Lien de paiement fondateur opérationnel
- [ ] **Responsive**: Mobile/Tablet/Desktop OK
- [ ] **Performance**: Lighthouse score > 90

### Tests Techniques

```bash
# Test SSL
curl -I https://vibegay.ca

# Test HTTPS redirect
curl -I http://vibegay.ca

# Test compression
curl -I -H "Accept-Encoding: gzip" https://vibegay.ca

# Test health endpoint
curl https://vibegay.ca/health
```

### Performance Tests

Utiliser Google Lighthouse:
```
Objectifs:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90
```

---

## 📈 Métriques de Succès

### Semaine 1
- [ ] 0 erreurs 500
- [ ] 100% uptime
- [ ] < 2s temps de chargement
- [ ] > 10 inscriptions

### Mois 1
- [ ] > 500 membres inscrits
- [ ] > 50 fondateurs
- [ ] 99.9% uptime
- [ ] 0 incidents sécurité

---

## 🆘 Support & Maintenance

### Logs

```bash
# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Supabase logs
# Via dashboard: https://app.supabase.com
```

### Contacts Urgence

- **Développeur**: [Email du dev]
- **Hébergeur**: [Support technique]
- **DNS**: [Registrar support]
- **Supabase**: support@supabase.io

### Plan d'Urgence

En cas de panne:
1. Vérifier status services (Nginx, DNS, Supabase)
2. Consulter logs d'erreur
3. Rollback si nécessaire: `git checkout <previous-tag>`
4. Notifier les utilisateurs via réseaux sociaux

---

## ✅ Checklist Finale de Production

### Avant Lancement
- [ ] Variables d'environnement configurées
- [ ] Build production créé et testé
- [ ] DNS configuré et propagé
- [ ] SSL certificate actif
- [ ] Nginx/Apache configuré
- [ ] CORS Supabase autorisé
- [ ] Monitoring configuré
- [ ] Backups automatiques activés
- [ ] Firewall configuré
- [ ] Tests fonctionnels passés

### Post-Lancement
- [ ] Lighthouse audit effectué
- [ ] Google Analytics tracking
- [ ] Social media annonce
- [ ] Email fondateur envoyé
- [ ] Support chat configuré (optionnel)
- [ ] Documentation équipe disponible

---

## 🎉 Félicitations!

Une fois toutes ces étapes complétées, **VIBE 2026** sera officiellement en ligne sur **vibegay.ca** ! 

**Le monde surveille. VIBE protège.** ✦

---

## 📞 Besoin d'Aide?

**Email**: vibeqbc2026@hotmail.com  
**Documentation**: /app/README.md  
**Rapport bogues**: /app/BUGFIXES.md

---

<div align="center">
  <p><strong>Fierté · Sécurité · Communauté</strong></p>
  <p>✦ VIBE 2026 · Québec, Canada ✦</p>
</div>
