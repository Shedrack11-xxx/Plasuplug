# Deploying PLASU Plug

Covers: connecting a real Postgres database, deploying to Vercel, and
logging in as admin. Do these roughly in order.

## 1. Set up your database (Neon)

1. Go to https://neon.tech and sign up (free tier is enough to start).
2. Create a new project — name it `plasu-plug`.
3. On the project dashboard, copy the **connection string** shown
   (starts with `postgresql://...`). Make sure "Pooled connection" is
   selected if offered — it's the one Vercel serverless functions need.
4. Save that string — you'll paste it into `DATABASE_URL` in two places:
   your local/Codespace `.env` and your Vercel project's environment
   variables.

Supabase or Vercel Postgres work the same way if you prefer those instead.

## 2. Push the schema and seed data

Wherever you're running the project (Codespace or local terminal):

```bash
cp .env.example .env
# paste your Neon connection string into DATABASE_URL in .env
# generate a secret: openssl rand -base64 32, paste into NEXTAUTH_SECRET

npx prisma db push     # creates all tables in your Neon database
npm run db:seed        # creates categories + the admin account
```

## 3. Log in as admin

The seed script creates one admin account:

- **Email:** `admin@plasuplug.test`
- **Password:** `Admin12345!`

Log in with these at `/login`, and you'll see "Admin" in the navbar
linking to `/admin/dashboard` (seller verification queue) and
`/admin/reports` (moderation queue).

**Change this before real users touch the site.** Easiest way: log in as
admin once, then update the password directly in your database (Neon has
a SQL editor), or add a "change password" form later. At minimum, do not
leave `Admin12345!` active in production.

## 4. Deploy to Vercel

1. Push your project to a GitHub repo if you haven't already (same repo
   you may have used for Codespaces works fine).
2. Go to https://vercel.com, sign in with GitHub, click **Add New →
   Project**, and import the `plasu-plug` repo.
3. Vercel auto-detects Next.js — leave the build settings as default.
4. Before deploying, open **Environment Variables** and add:
   - `DATABASE_URL` — your Neon connection string
   - `NEXTAUTH_URL` — your production URL, e.g. `https://plasu-plug.vercel.app`
     (you'll know this after the first deploy — update it and redeploy)
   - `NEXTAUTH_SECRET` — a fresh one, generate with `openssl rand -base64 32`
     (use a different one from local, don't reuse)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — only if you're using
     Google sign-in (optional; credentials login works without it)
   - `BLOB_READ_WRITE_TOKEN` — see step 5 below
5. Click **Deploy**.

## 5. Set up image uploads (Vercel Blob)

1. In your Vercel project dashboard, go to **Storage → Create Database →
   Blob**.
2. Once created, Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your
   project's environment variables — no manual copy-paste needed.
3. Redeploy (Vercel → Deployments → ⋯ → Redeploy) so the new env var is
   picked up.

## 6. After first deploy

- Visit your live URL, confirm the homepage loads.
- Log in as admin, confirm `/admin/dashboard` loads.
- Register a test seller account, submit onboarding, then verify it from
  the admin queue to confirm the full flow works end-to-end.
- Go back to your Vercel env vars and correct `NEXTAUTH_URL` to your real
  deployed URL if you hadn't set it yet, then redeploy.

## Troubleshooting

- **500 error / "Environment variable not found: DATABASE_URL"** — the
  env var isn't set in Vercel, or you forgot to redeploy after adding it.
- **Login redirects loop** — `NEXTAUTH_URL` doesn't match your actual
  deployed domain.
- **Images fail to upload** — Blob store isn't created yet, or you
  deployed before `BLOB_READ_WRITE_TOKEN` was added.
- **"relation does not exist" errors** — you haven't run
  `npx prisma db push` against the Neon database Vercel is using. Run it
  locally/in Codespace with the *same* `DATABASE_URL` your Vercel project
  uses.
