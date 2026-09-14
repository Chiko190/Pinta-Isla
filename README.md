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
- **Auth**: JWT + bcrypt, role-based middleware (`customer` / `artist` / `admin`)
- **Uploads**: multer, stored under `server/uploads/`, served statically

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
