# 🚀 Déploiement Rapide vers vibegay.ca - Guide 30 Minutes

## ⏱️ Timeline

- **DNS Configuration**: 5 minutes (+ 24-48h propagation)
- **SSL Setup**: 5 minutes
- **Build Production**: 3 minutes
- **Nginx Config**: 10 minutes
- **Tests Finaux**: 7 minutes

**Total actif**: ~30 minutes de travail

---

## 📋 Prérequis

✅ Vous avez accès au panneau DNS de vibegay.ca  
✅ Vous avez un serveur Linux avec sudo access  
✅ Port 80 et 443 ouverts sur le serveur  

---

## 🚀 Étapes Rapides

### 1️⃣ DNS (5 min)

Dans votre panneau DNS (GoDaddy, Namecheap, etc.):

```
Type A : vibegay.ca → <VOTRE_IP_SERVEUR>
Type A : www.vibegay.ca → <VOTRE_IP_SERVEUR>
```

💡 **Astuce**: La propagation DNS prend 24-48h, mais souvent c'est plus rapide (2-4h)

---

### 2️⃣ SSL Certificate (5 min)

```bash
# Installer Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d vibegay.ca -d www.vibegay.ca
```

✅ Suivez les prompts, choisissez redirect HTTP → HTTPS

---

### 3️⃣ Build Production (3 min)

```bash
# Mettre à jour l'URL
cd /app/frontend
nano .env
# Changer: REACT_APP_BACKEND_URL=https://vibegay.ca

# Build
yarn build
```

---

### 4️⃣ Nginx Configuration (10 min)

```bash
# Créer la config
sudo nano /etc/nginx/sites-available/vibegay.ca
```

Coller cette configuration:

```nginx
server {
    listen 80;
    server_name vibegay.ca www.vibegay.ca;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name vibegay.ca www.vibegay.ca;
    
    ssl_certificate /etc/letsencrypt/live/vibegay.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vibegay.ca/privkey.pem;
    
    root /app/frontend/build;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Activer:
```bash
sudo ln -s /etc/nginx/sites-available/vibegay.ca /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 5️⃣ Supabase CORS (2 min)

1. Aller sur https://app.supabase.com
2. Settings → API
3. Ajouter dans **Allowed Origins**:
   ```
   https://vibegay.ca
   https://www.vibegay.ca
   ```
4. Save

---

### 6️⃣ Tests Finaux (7 min)

```bash
# Test 1: HTTPS fonctionne
curl -I https://vibegay.ca

# Test 2: HTTP redirect
curl -I http://vibegay.ca

# Test 3: WWW redirect
curl -I https://www.vibegay.ca
```

Ouvrir dans le navigateur:
- ✅ https://vibegay.ca
- ✅ Toutes les sections chargent
- ✅ Animations fonctionnent
- ✅ Login/Signup opérationnels

---

## 🎯 Checklist Rapide

```
✅ DNS pointé vers serveur
✅ SSL certificate actif
✅ .env mis à jour avec vibegay.ca
✅ Build production créé
✅ Nginx configuré et reloadé
✅ CORS Supabase autorisé
✅ Tests HTTPS passés
✅ Site accessible publiquement
```

---

## 🐛 Troubleshooting Rapide

### Site pas accessible?
```bash
# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Vérifier logs
sudo tail -f /var/log/nginx/error.log
```

### SSL ne fonctionne pas?
```bash
# Re-run certbot
sudo certbot --nginx -d vibegay.ca -d www.vibegay.ca --force-renewal
```

### Build error?
```bash
# Réinstaller dépendances
cd /app/frontend
rm -rf node_modules
yarn install
yarn build
```

---

## 📞 Support Urgence

**Documentation complète**: `/app/DEPLOYMENT.md`  
**Liste bogues corrigés**: `/app/BUGFIXES.md`  
**Contact**: vibeqbc2026@hotmail.com

---

## 🎉 C'est tout!

Une fois ces étapes complétées, **VIBE 2026** sera en ligne sur vibegay.ca! 🚀

---

<div align="center">

**✦ Fierté · Sécurité · Communauté ✦**

🏳️‍🌈 **VIBE 2026 · Québec, Canada** 🏳️‍🌈

</div>
