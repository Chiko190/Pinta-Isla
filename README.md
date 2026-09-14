# Pinta Isla — Painting & Artwork Marketplace

A marketplace for painters and artists to sell original artwork, take on custom commissions,
and build a following — with dedicated customer, artist, and admin experiences.

This build is the **foundation layer**: authentication, roles, artist approval, artwork
upload + moderation, and public browsing are fully wired to a real database. Cart/checkout,
orders, commissions, messaging, reviews, and posts are structured but intentionally left as
labeled "Coming soon" placeholders — see [What's built vs. placeholder](#whats-built-vs-placeholder).

## Stack

- **Frontend**: React + Vite, React Router, Tailwind CSS v4
- **Backend**: Node.js + Express, Sequelize ORM
- **Database**: SQLite (file-based, zero setup) — the dialect lives in one file
  (`server/src/db.js`), so pointing this at Postgres or MySQL later is a config change,
  not a rewrite
- **Auth**: JWT + bcrypt (12 salt rounds), role-based middleware (`customer` / `artist` / `admin`),
  optional Google Sign-In
- **Uploads**: multer, stored under `server/uploads/`, served statically

## Google Sign-In (optional)

Both login and customer registration show a "Continue with Google" button once configured —
if you skip this, the app works exactly as before with email/password only.

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth consent screen (External, testing mode is fine) if you haven't already
3. **Create Credentials → OAuth client ID → Web application**
4. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (local dev)
   - your production URL, e.g. `https://pinta-isla.onrender.com`
5. Copy the **Client ID** it gives you
6. Set it in **both** places (must be the identical value):
   - `server/.env` → `GOOGLE_CLIENT_ID=...`
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID=...`
7. On Render: set `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` in the service's Environment tab,
   then trigger a redeploy (Vite bakes `VITE_` vars in at build time, so setting them alone
   without redeploying won't take effect)

Artist registration stays email-only, since it requires the full application/portfolio review
flow that a one-click Google signup can't fill in.

## Security

- Passwords hashed with bcrypt (12 rounds); Google accounts have no password on file at all
- Password policy: 10+ characters, at least 3 of {lowercase, uppercase, number, symbol}
- Login is rate-limited (10 attempts / 15 min per IP) and accounts auto-lock for 15 minutes
  after 5 consecutive failed password attempts
- Registration and password-reset requests are rate-limited to deter spam/enumeration abuse
- Generic error messages on login/forgot-password so responses don't reveal which
  emails/usernames exist
- `helmet` (HSTS, standard security headers) + JSON/urlencoded body size caps against payload-flood
- Google ID tokens are verified server-side (`google-auth-library`) against Google's own keys —
  the client-supplied token is never trusted as-is
- `JWT_SECRET` is auto-generated per Render deploy; `DATABASE_URL` uses TLS to Postgres

## Getting started

```bash
npm run install:all   # installs server + client dependencies
npm run seed           # creates the database and demo accounts (see below)
npm run dev             # runs the API (http://localhost:4000) and the app (http://localhost:5173)
```

If a dev server ever stops responding, restart it directly:

```bash
# API
cd server && npm run dev

# App
cd client && npm run dev
```

### Seeded accounts

`npm run seed` wipes and rebuilds the database with demo data flagged `isSeed: true`
(separable from real production data). Credentials:

| Role     | Email                          | Password        | Notes                     |
|----------|----------------------------------|------------------|---------------------------|
| Admin    | admin@pintaisla.art               | Admin@12345      | Full platform access       |
| Artist   | mara.delacruz@pintaisla.art       | Artist@12345     | Approved, verified         |
| Artist   | jun.santos@pintaisla.art          | Artist@12345     | Approved, verified         |
| Artist   | liwayway.reyes@pintaisla.art      | Artist@12345     | Approved                   |
| Artist   | ken.villareal@pintaisla.art       | Artist@12345     | **Pending** admin approval |
| Customer | ana.lopez@pintaisla.art           | Customer@12345   | —                           |

## What's built vs. placeholder

**Fully functional, database-backed:**
- Customer & artist registration (artist applications go to `pending_approval` and require
  admin sign-off), login, forgot/reset password
- Role-based dashboards and route protection (customer/artist/admin)
- Artist artwork CRUD with image upload → admin moderation → public listing
- Public marketplace: search, filters, sorting, pagination, artwork detail, artist profiles
- Wishlist and Follow
- Admin: artist application review, artwork moderation, user suspend/restore, category CRUD,
  audit log, dashboard stats (all real counts, no fabricated numbers)
- Notifications for artist-approval and artwork-approval/rejection events

**Explicit "Coming soon" placeholders** (visible in the UI, never faked):
Cart, checkout/payments, orders + tracking, commissions workflow, messaging, reviews,
artist posts, reports, admin analytics charts, featured-content management, admin settings.

## Project structure

```
server/   Express API, Sequelize models, seed script
client/   React app (Vite + Tailwind)
```
