# PLASU Plug — Full-Stack Marketplace

Next.js 14 (App Router) + PostgreSQL + Prisma + NextAuth full-stack build.

## Stack
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (credentials + Google OAuth), JWT sessions
- **Images:** Vercel Blob
- **Styling:** Tailwind CSS
- **Deploy target:** Vercel

## How seller verification is enforced (read this first)

This is the core requirement from the spec: **an unverified seller cannot
post a product by any route, including going around the UI.**

- `prisma/schema.prisma` — `SellerProfile.verificationStatus` is the single
  source of truth (`UNSUBMITTED | PENDING | VERIFIED | REJECTED`).
- `lib/authz.ts` — `requireVerifiedSeller()` re-reads that field from
  Postgres on every call. It is **not** based on the session/JWT, which is
  only a convenience cache for the UI and can be stale.
- `app/api/products/route.ts` (`POST`) and `app/api/products/[id]/route.ts`
  (`PATCH`) both call `requireVerifiedSeller()` before touching the
  database. There is no code path to create or edit a listing without it.
- `app/api/admin/sellers/[id]/verify/route.ts` is the **only** place in the
  codebase that can set `verificationStatus = VERIFIED`, and it's gated by
  `requireAdmin()`, which itself re-checks the caller's role from the DB.
- The marketplace read endpoints (`GET /api/products`, the homepage, the
  marketplace page) additionally filter to
  `sellerProfile.verificationStatus === "VERIFIED"` so an unverified
  seller's products are invisible even if one somehow existed.
- `middleware.ts` blocks page loads for `/seller/dashboard` and `/admin/*`
  based on role — this is a UX nicety only; it is backed up, not replaced,
  by the API-level checks above.

If you extend this app, any new mutation a seller can perform should call
`requireVerifiedSeller()` (or `requireRole`/`requireAdmin` as appropriate)
rather than trusting `session.user.sellerVerified`.

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
npx prisma db push     # or: npm run db:migrate
npm run db:seed        # creates categories + an admin login
npm run dev
```

Generate `NEXTAUTH_SECRET` with:
```bash
openssl rand -base64 32
```

Seeded admin login: `admin@plasuplug.test` / `Admin12345!` — **change this
password (or delete the seed user) before going to production.**

### Getting a Postgres database
Any of these work — just paste the connection string into `DATABASE_URL`:
- [Neon](https://neon.tech) (generous free tier, serverless Postgres)
- [Supabase](https://supabase.com)
- [Vercel Postgres](https://vercel.com/storage/postgres)

### Image uploads
Create a Blob store in your Vercel project dashboard (Storage → Blob),
copy the `BLOB_READ_WRITE_TOKEN` into `.env`. Locally, `vercel env pull`
after linking the project also works.

## Project structure

```
app/
  api/                  # all backend routes (see authz notes above)
  (auth)/login, register
  marketplace/           # browse + search + filter
  product/[id]/          # single listing, contact seller, report
  seller/onboarding/      # submit for verification
  seller/dashboard/       # seller's own listings + status banner
  admin/dashboard/        # verification queue (approve/reject)
  admin/reports/          # moderation queue
  messages/               # buyer/seller inbox
lib/
  authz.ts               # ★ server-side authorization — read this first
  auth.ts                # NextAuth config
  prisma.ts              # Prisma client singleton
  validation.ts           # zod schemas for every API input
prisma/
  schema.prisma
  seed.ts
components/
  layout/                 # navbar, footer
  marketplace/             # product card, verified badge, uploader, forms
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the env vars from `.env.example` in the Vercel project settings
   (use your production `DATABASE_URL`, a fresh `NEXTAUTH_SECRET`, your
   real `NEXTAUTH_URL`, Google OAuth creds, and the Blob token).
4. Add a Vercel Postgres or Neon database and run `npx prisma db push`
   against it (or wire up `prisma migrate deploy` in the build step once
   you're past prototyping).
5. Deploy.

## What's intentionally left as a next step
- Rate limiting on `/api/messages` and `/api/admin/reports` (basic abuse
  prevention — e.g. `@upstash/ratelimit` works well on Vercel).
- Real-time messaging (currently polling-friendly REST; swap in
  Pusher/Ably/websockets if you want live delivery).
- Pagination UI on the marketplace grid (the API already supports `page`).
- Email verification / password reset flows.
