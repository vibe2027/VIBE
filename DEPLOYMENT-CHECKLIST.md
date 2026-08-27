# 🚀 VIBE Phase 6 — Checklist Déploiement Vercel

**Branche:** `claude/vibe-v1-architecture-53i2dd`  
**Status:** ✅ Code PRÊT | ⏳ Infrastructure EN COURS

---

## ✅ CODE VERIFICATION (COMPLÉTÉE)

- [x] Zero personal identifiers exposed
- [x] support@vibegay.ca configured everywhere
- [x] @sendgrid/mail dependency added
- [x] vercel.json configured for Node.js
- [x] All routes mounted correctly
- [x] Static files accessible
- [x] Contact form integrated
- [x] Search API endpoints ready
- [x] Privacy compliance (Loi 25 + NEQ 2282352097)

---

## 🔧 VERCEL SETUP (À FAIRE)

### 1️⃣ **Connecter le Repo à Vercel**
```
1. Go to https://vercel.com/new
2. Import from Git → GitHub → vibe2027/VIBE
3. Select branch: claude/vibe-v1-architecture-53i2dd
4. Framework: Other (Node.js)
5. Build Command: npm run build
6. Start Command: npm start
```

### 2️⃣ **Configurer les Variables d'Environnement** ⚠️ CRITIQUE
Vercel Dashboard → Settings → Environment Variables

**À ajouter:**
```
NODE_ENV=production
APP_URL=https://vibegay.ca

# Supabase
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET

# SendGrid (Contact Form)
SENDGRID_API_KEY=SG.YOUR_API_KEY
SENDGRID_FROM_EMAIL=noreply@vibegay.ca

# Base URL for Stripe webhooks
BASE_URL=https://vibegay.ca
```

**⚠️ IMPORTANT:** Vérifier que **TOUS** les .env vars ont les bonnes valeurs!

---

## 📧 EMAIL SETUP (À FAIRE)

### Créer support@vibegay.ca (Zoho Mail)
```
1. Go to https://mail.zoho.com/
2. Create account with vibegay.ca domain
3. Add email: support@vibegay.ca
4. Password: [SECURE PASSWORD]
5. Configure:
   - Forwarding to vibeqbc2026@hotmail.com
   - Auto-reply template
```

### DNS Configuration (Namecheap)
1. **MX Records** → Point to Zoho Mail
2. **SPF Record** → For SendGrid:
   ```
   v=spf1 sendgrid.net ~all
   ```
3. **DKIM Record** → From SendGrid dashboard
4. **Domain Verification** → Zoho + SendGrid

---

## 🧪 TESTING (À FAIRE)

### 1. Contact Form Test
- [ ] Visit https://vibegay.ca/contact.html
- [ ] Fill form with test data
- [ ] Submit
- [ ] Verify email received at support@vibegay.ca

### 2. Static Files Test
- [ ] https://vibegay.ca/conditions.html → should load
- [ ] https://vibegay.ca/confidentialite.html → should load
- [ ] https://vibegay.ca/contact.html → should load

### 3. Privacy Test
- [ ] Search results show "VIBE" (not personal name)
- [ ] No founder email exposed in API responses
- [ ] support@vibegay.ca appears correctly

### 4. API Routes Test
- [ ] GET /health → responds with status
- [ ] POST /api/contact → accepts form data
- [ ] GET /api/search/trending → returns results
- [ ] Stripe webhook endpoint responding

### 5. Performance Test
- [ ] Page loads in < 2 seconds
- [ ] Contact form responds instantly
- [ ] No console errors

---

## 🔒 SECURITY CHECKLIST

- [ ] No hardcoded secrets in code
- [ ] Environment variables ONLY for sensitive data
- [ ] HTTPS enabled (Vercel default)
- [ ] CORS properly configured
- [ ] Stripe webhook signature verified
- [ ] Rate limiting enabled (if needed)

---

## 📋 FINAL VERIFICATION

**Before going live:**

```bash
# 1. Verify all files committed
git status

# 2. Check latest commits
git log --oneline -5

# 3. Verify branch is up to date
git fetch origin
git status

# 4. All environment variables set? 
# → Check Vercel dashboard

# 5. All DNS records configured?
# → Check Namecheap + Zoho + SendGrid

# 6. Ready to deploy?
# → Click "Deploy" on Vercel
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Code merged to main (or auto-deployed from branch)
- [ ] Vercel build successful
- [ ] Environment variables ALL set
- [ ] DNS records configured
- [ ] support@vibegay.ca email working
- [ ] Contact form tested end-to-end
- [ ] Static pages loading
- [ ] Privacy verified (no personal info exposed)
- [ ] APIs responding correctly
- [ ] Stripe webhook configured
- [ ] Monitor logs for 24 hours

---

## 🎯 GO LIVE

**When everything is ✅:**

1. Click "Deploy" on Vercel
2. Wait for build (5-10 min)
3. Test live site: https://vibegay.ca
4. Monitor errors in Vercel logs
5. Check support@vibegay.ca for test emails
6. **Celebrate!** 🎉

---

## 📞 Support

**For questions/issues:**
- Vercel Logs: https://vercel.com/dashboard
- Email: support@vibegay.ca (once configured)
- GitHub Issues: https://github.com/vibe2027/VIBE/issues

---

**Last Updated:** 2026-08-27  
**Phase 6 Status:** ✅ READY FOR PRODUCTION
