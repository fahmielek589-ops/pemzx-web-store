# PEMZX — Digital Portfolio Platform

Public developer portfolio + authenticated admin CMS for managing videos,
products, projects, and contact messages.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL via Prisma (tested against Supabase / Neon)
- **Auth:** Custom session-based auth — Argon2id password hashing,
  server-side sessions, `HttpOnly` + `Secure` cookies. No third-party
  auth provider.
- **Validation:** Zod on every API route
- **Styling:** Tailwind CSS + hand-written component CSS (dark/cyan
  design system)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (Supabase, Neon, Railway, etc.) |
| `SESSION_SECRET` | Random 32+ byte secret — generate with `openssl rand -base64 48` |
| `ADMIN_EMAIL` | Email for the initial admin account (used once, by the seed script) |
| `ADMIN_PASSWORD` | Password for the initial admin account (used once, by the seed script) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed site URL |

**`.env` is git-ignored.** Nothing in the codebase reads a username or
password from source code — every credential-shaped value comes from
this file at runtime, and `ADMIN_PASSWORD` is only ever used once, by
the seed script below, to compute a hash.

## 3. Set up the database

```bash
npm run db:push      # creates tables from prisma/schema.prisma
npm run db:seed       # creates the initial admin account
```

The seed script (`scripts/seed-admin.ts`) reads `ADMIN_EMAIL` and
`ADMIN_PASSWORD` from `.env`, hashes the password with Argon2id, and
stores only the hash. After it runs once, you can delete
`ADMIN_PASSWORD` from `.env` — the plaintext value was never written
anywhere. From then on, change the password from `/admin/settings`.

## 4. Run locally

```bash
npm run dev
```

- Public site: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin` (redirects to `/login` if not
  authenticated)

## 5. Deploy (Vercel / Netlify)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import it into Vercel or Netlify.
3. Add the same environment variables from `.env` in the platform's
   dashboard (**never commit `.env`**).
4. Point `DATABASE_URL` at your production Postgres instance (Supabase
   or Neon both work well with serverless deployments).
5. Run `npm run db:push` and `npm run db:seed` once against the
   production database (from your local machine with `DATABASE_URL`
   pointed at production, or via the platform's CLI).
6. Deploy.

### A note on file uploads in production

`src/lib/storage.ts` writes uploaded images/videos to
`/public/uploads` on local disk by default. This works for local
development but **is not durable on Vercel/Netlify** — their
filesystems are ephemeral at runtime. Before going to production,
swap the body of `saveUpload()` for a call to an object storage
provider (Vercel Blob, Supabase Storage, S3, Cloudinary, etc.). The
function signature and all validation logic (MIME sniffing, size
limits) stay the same — nothing else in the codebase needs to change.

## Security notes

- Passwords are hashed with **Argon2id** (OWASP's current
  recommendation), never stored in plain text.
- Sessions are opaque random tokens; the database stores only a
  SHA-256 hash of each token, never the token itself.
- Every `/admin/*` route is protected twice: a fast-path middleware
  redirect, and a full server-side `role === "ADMIN"` check against
  the database on every request (`src/lib/auth.ts`,
  `requireAdmin()`). The middleware check alone is never treated as
  the security boundary.
- Every admin API route calls `withAdminAuth()` before touching any
  data — the UI never being the only thing "hiding" an action.
- Login is rate-limited (5 failed attempts per email+IP per 15
  minutes), tracked server-side in the database.
- File uploads are validated by sniffing magic bytes, not by
  trusting the client-supplied extension or `Content-Type`.
- No credential — username, password, or API secret — appears
  literally anywhere in the source code. Everything comes from
  environment variables or is generated/hashed at runtime.

## Project structure

```
prisma/schema.prisma       Database models
scripts/seed-admin.ts      One-time admin account creation
src/lib/                   auth, db, validation, storage, rate-limit
src/middleware.ts          Fast-path route protection for /admin/*
src/app/(public)/          Public portfolio (home, about, skills, …)
src/app/login/             Cinematic login page
src/app/admin/             Admin dashboard (protected)
src/app/api/                Public + admin API routes
src/components/            UI, layout, login, home, admin components
```
