# C++ DSA Notes — deployment guide

This is a small Next.js website with two parts:

- **Public site** (`/`) — the sidebar + reader anyone can visit.
- **Admin panel** (`/admin`) — password-protected, where you manage categories,
  sections, topics, and notes (headings, paragraphs, code blocks with colors).

Data is stored in a **Supabase** Postgres database (free tier). The site is
hosted on **Vercel** (free tier), which also connects to your existing domain.

You do not need to install anything on your own computer for this — every
step below happens in a web browser.

---

## Part 1 — Create the database (Supabase)

1. Go to https://supabase.com and sign up (free).
2. Click **New project**. Pick any name, set a database password (save it
   somewhere safe), pick a region close to you, and click **Create project**.
   Wait a minute or two while it provisions.
3. In the left sidebar, click **SQL Editor** → **New query**.
4. Open the file `supabase/schema.sql` from this project, copy its entire
   contents, paste it into the SQL editor, and click **Run**.
   This creates the table that stores all your notes.
5. In the left sidebar, click **Project Settings** (gear icon) → **API**.
   You'll need three values from this page in Part 3:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "Reveal" to see it — keep this one secret)

---

## Part 2 — Put the code on GitHub

Vercel deploys code from a GitHub repository.

1. Go to https://github.com and sign up if you don't have an account.
2. Click the **+** icon (top right) → **New repository**. Name it
   `cpp-dsa-notes`, keep it **Private**, and click **Create repository**.
3. On the next page, click **uploading an existing file**.
4. Drag in every file and folder from this project (keep the folder
   structure intact — `app/`, `components/`, `lib/`, `supabase/`, plus
   `package.json`, `next.config.mjs`, `.gitignore`, `.env.example`).
   Do **not** upload a `.env` or `.env.local` file if you ever create one —
   your real secrets go into Vercel directly in Part 3, not into GitHub.
5. Scroll down and click **Commit changes**.

---

## Part 3 — Deploy (Vercel)

1. Go to https://vercel.com and sign up using your GitHub account — this
   makes the next step automatic.
2. Click **Add New** → **Project**.
3. Find `cpp-dsa-notes` in the list and click **Import**.
4. Before clicking Deploy, open **Environment Variables** and add these
   (values come from Part 1, step 5, plus two you make up yourself):

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |
   | `ADMIN_PASSWORD` | a password you choose, for logging into `/admin` |
   | `ADMIN_TOKEN` | any long random string (e.g. generate one at 1password.com/password-generator) |

5. Click **Deploy**. After a minute you'll get a live URL like
   `cpp-dsa-notes-yourname.vercel.app` — your site is now online.
6. Visit `yourdomain.vercel.app/admin`, log in with your `ADMIN_PASSWORD`,
   and add your first category/section/topic. It'll immediately be visible
   on the public homepage.

---

## Part 4 — Connect your existing domain

1. In your Vercel project, go to **Settings** → **Domains**.
2. Type in your domain (e.g. `dsanotes.com` or a subdomain like
   `notes.yourdomain.com`) and click **Add**.
3. Vercel will show you one or two DNS records to add — usually an **A
   record** (for the root domain) or a **CNAME record** (for a subdomain).
4. Log into wherever you bought your domain (GoDaddy, Namecheap, Google
   Domains, etc.), find the **DNS settings**, and add the exact record(s)
   Vercel showed you.
5. Come back to Vercel — the domain will show "Valid" once DNS propagates
   (usually a few minutes, sometimes a few hours).

Your site is now live at your own domain, with a real database behind it.

---

## Making changes later

- **Content** (topics, notes): just log into `/admin` — no redeploying needed.
- **Design/code changes**: edit files in your GitHub repo (or ask me to make
  the changes and I'll give you updated files) — Vercel automatically
  redeploys every time the repo changes.

## Notes on the admin login

This uses one shared password for a single admin — simple and fine for a
personal course site. If you later want individual logins for multiple
instructors, that's a bigger change (real user accounts via Supabase Auth) —
just ask and I can build that version.
