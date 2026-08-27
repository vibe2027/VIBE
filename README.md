# 🌊 VIBE - Authentic Connection for LGBTQ+ Community

**VIBE** is a complete, production-ready web platform designed specifically for the LGBTQ+ community. It combines real-time communication (chat salons), community moderation (tribunal system), advertising capabilities (pubs), and a unique billing system (billets) into one cohesive, respectful, and inclusive platform.

## ✨ Key Features

### 🔐 Authentication & Roles
- Email/password authentication with Supabase
- Three roles: User, Co-Founder, Admin
- Automatic role detection based on email
- Email verification required
- Session management with JWT

### 💬 Real-Time Communication
- **4 Community Salons**:
  - **Flottant**: General conversation
  - **Voix**: Serious topics & announcements
  - **Fantômes**: Private/anonymous messages
  - **Tribunal**: Moderation discussions
- Live message updates via Supabase Realtime
- Edit & soft-delete functionality

### ⚖️ Tribunal System
- Community-driven moderation
- Case types: harassment, inappropriate content, scam, other
- Admin resolution with detailed notes
- Automated notifications to all parties
- Transparent case history

### 💸 Billets Currency System
- Internal platform currency
- Monthly limits (co-founder: 1000/month max)
- Hidden billets for co-founders
- Full transaction audit trail
- Admin adjustment capability

### 📢 Advertising System
- Users can create promotional content (pubs)
- Target specific salons
- Admin approval workflow
- Billet-based cost system

### 👨‍💼 Admin Dashboard
- User management
- Tribunal case resolution
- Pubs approval/rejection
- Billets adjustment
- Activity monitoring & analytics

### 🔑 Co-Founder Dashboard
- Restricted access (1000 billets/month)
- Hidden from public (6-12 months)
- Send billets to community
- Create & manage pubs
- Transaction history

## 🚀 Quick Start

### 1. Setup (5 minutes)

```bash
npm install express cors supabase nodemailer stripe dotenv
cp .env.example .env
# Edit .env with your Supabase, Email, Stripe credentials
```

### 2. Database

Run SQL schema in Supabase dashboard - see `sql/complete-schema.sql`

### 3. Start Server

```bash
node server.js
# Visit http://localhost:3000/login.html
```

### 4. Create Admin Accounts (Optional)

```bash
node setup-admins.js
```

Creates:
- Admin: vibeqbc2026@hotmail.com
- Co-Founder: jmarcreid@gmail.com

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup & configuration  
- **[docs/MANUSCRIPT.md](docs/MANUSCRIPT.md)** - Complete 4000+ line manuscript with full API reference, database schema, security architecture, and deployment instructions

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth + JWT
- **Real-time**: Supabase Realtime
- **Email**: Nodemailer + Gmail SMTP
- **Frontend**: HTML5 + CSS3 + Vanilla JS

### Database (10 Tables)
1. **users** - Accounts with roles
2. **billets** - Currency system
3. **billet_transactions** - Audit trail
4. **tribunal_cases** - Moderation
5. **tribunal_votes** - Community voting
6. **salons_messages** - Real-time chat
7. **pubs** - Advertising
8. **user_profiles** - Extended profiles
9. **email_logs** - Email audit
10. **blocked_users** - Blocking

## 🎨 Frontend URLs

| URL | Purpose |
|-----|---------|
| `/login.html` | Login/signup |
| `/admin-dashboard-ui.html` | Admin panel |
| `/co-founder-dashboard.html` | Co-founder panel |
| `/index.html` | Main app |

## 🔌 API Endpoints

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/verify-email` - Verify email
- `POST /auth/send-billets` - Send billets
- `POST /auth/tribunal-case` - Create case

### Admin (requires x-user-role: admin)
- `GET /admin/stats` - Dashboard
- `GET /admin/users` - List users
- `PUT /admin/users/:id/role` - Change role
- `POST /admin/users/:id/suspend` - Suspend
- `GET /admin/tribunal` - View cases
- `PUT /admin/tribunal/:id/resolve` - Resolve case
- `GET /admin/pubs` - List pubs
- `PUT /admin/pubs/:id/approve` - Approve
- `PUT /admin/pubs/:id/reject` - Reject
- `POST /admin/billets/:id/adjust` - Adjust
- `GET /admin/activity` - Activity log

### Pubs
- `POST /pubs` - Create pub
- `GET /pubs/my` - User's pubs
- `GET /pubs/active/:salon` - Active pubs
- `DELETE /pubs/:id` - Delete

## 🔐 Security

- Supabase Auth with RLS
- Role-based access control
- HMAC-SHA256 webhook verification
- Environment variable protection
- Database constraints & indexes
- Session tokens

## 📧 Email System

Automated emails for:
- Account verification
- Role confirmation
- Tribunal notifications
- Pubs approval

**Provider**: Gmail SMTP

## 🌍 Deployment

### Local
```bash
npm install
node server.js
```

### Production (Heroku/Railway/Render)
See [SETUP.md](SETUP.md) for detailed instructions

## 📊 File Structure

```
VIBE/
├── server.js                    # Express server
├── sql/complete-schema.sql      # Database
├── auth/                        # Authentication
│   ├── auth-service.js
│   └── auth-routes.js
├── dashboard/                   # Admin dashboard
│   ├── admin-dashboard.js
│   └── admin-routes.js
├── pubs/                        # Advertising
│   └── pubs-routes.js
├── login.html                   # Login UI
├── admin-dashboard-ui.html      # Admin panel
├── co-founder-dashboard.html    # Co-founder panel
├── index.html                   # Main app
├── docs/MANUSCRIPT.md           # Full documentation
├── QUICKSTART.md                # Quick start
├── SETUP.md                     # Setup guide
├── setup-admins.js              # Setup script
└── README.md                    # This file
```

## 🛡️ Special Features

### Hidden Co-Founder Access
- Account hidden from public (6-12 months)
- Billets hidden via `is_co_founder_hidden` flag
- Only admin can see true status

### Monthly Billet Limits
- Co-founder: 1000/month maximum
- Enforced in API
- Reset at UTC midnight
- Full transaction tracking

## 🤝 Contributing

Platform values:
- **Humilité Totale** (Complete Humility)
- **Respect** (LGBTQ+ community)
- **Authenticité** (Real connections)

## 📝 License

VIBE Platform © 2026 - All rights reserved

## 📞 Support

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Setup**: [SETUP.md](SETUP.md)
- **Full Docs**: [docs/MANUSCRIPT.md](docs/MANUSCRIPT.md)

---

## 🌊 VIBE - Avec Humilité et Respect

*Authentic Connection for LGBTQ+ Community*

**Start Today**: http://localhost:3000/login.html

---

**Version**: 1.0.0  
**Created**: August 27, 2026  
**Status**: Production Ready ✅

Built with Node.js, Express, Supabase, PostgreSQL, and ❤️
