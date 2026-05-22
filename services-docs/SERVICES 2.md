# AI Rules Generator — evidencija servisa i troškova

> **Sigurnost:** Ova datoteka je u Git repou — **bez** stvarnih lozinki i API ključeva.  
> Za credentials i privatne iznose: **`SERVICES.private.md`** (gitignored).  
> Prvi put: `cp SERVICES.private.example.md SERVICES.private.md`

**Zadnje ažuriranje:** 2026-05-22 (revizija 4 — puni audit: kod + scrum + env + dead code)  
**Produkt:** AI Rules Generator (`ai-rules-generator`)  
**Repo:** https://github.com/gordan007/ai-rules-generator  
**Produkcija (live):** https://ai-rules.dev  
**Vercel default hostname:** https://ai-rules-generator.vercel.app (redirect na custom domenu)  
**Lokalno:** http://localhost:3000

---

## 0. Kanonski popis — svi računi i servisi (ništa izvan ovoga)

Svaki red = jedan login ili jedan API ključ. Detalji i tajne → `SERVICES.private.md`.

| # | Račun / servis | Dashboard | Obavezno za MVP | Status (22.5.2026) | Što spremiti u private |
|---|----------------|-----------|-----------------|---------------------|------------------------|
| 1 | **Vercel** (hosting) | https://vercel.com | Da | ✅ Live deploy | Team/email, plan, $/mj |
| 2 | **Vercel Domains** (`ai-rules.dev`) | Vercel → Domains | Da | ✅ Kupljeno na Vercelu | Renewal, $/god |
| 3 | **Vercel Analytics** | Vercel → Analytics | Da | ✅ U kodu | — (uključeno) |
| 4 | **Supabase** (EU) | https://supabase.com/dashboard | Da | ✅ Projekt + tablice | Ref, region, svi ključevi, DB lozinka |
| 5 | **GitHub** (osobni `gordan007`) | https://github.com | Da | ✅ Repo + deploy | PAT samo ako treba CI |
| 6 | **GitHub OAuth App** | https://github.com/settings/developers | Da | ✅ + Supabase provider | Client ID `Ov23liRi0raY6M00XfxA`; Secret u private |
| 7 | **Anthropic** | https://console.anthropic.com | Da | ✅ Lokalno + Vercel prod | API key, spend limiti |
| 8 | **OpenAI** | https://platform.openai.com | Preporučeno | ✅ Lokalno + Vercel prod | API key, prepaid/limit |
| 9 | **Lemon Squeezy** (MoR) | https://app.lemonsqueezy.com | Da za plaćanja | ⚠️ **Bloker** T-01.9 | Store, API, webhook, variant IDs, payout |
| 10 | **Google račun** (za GSC) | https://accounts.google.com | Ne za runtime | ☐ | Email za Search Console |
| 11 | **Google Search Console** | https://search.google.com/search-console | SEO | ☐ | Property `ai-rules.dev` |
| 12 | **Kontakt Gmail** | — | Legal stranice | ✅ U kodu | `gordan.valenta@gmail.com` |
| 13 | **npm registry** | https://www.npmjs.com | Ne (consume only) | ✅ | Nema računa osim publish |

**Nema zasebnih računa za:** Stripe, Resend, Redis/Upstash, Sentry, PostHog, Plausible, Cloudflare, Neon, Vercel AI Gateway, email hosting (još).

---

## Operativni status (iz `docs/scrum-mvp-plan.md`)

| Područje | Stanje |
|----------|--------|
| App na https://ai-rules.dev | ✅ Live, smoke test OK |
| Domena + DNS na Vercelu | ✅ |
| Supabase env na Vercel Production | ✅ |
| `NEXT_PUBLIC_APP_URL=https://ai-rules.dev` | ✅ Production |
| GitHub OAuth + Supabase Auth URL-ovi | ✅ Na `ai-rules.dev` |
| Anthropic + OpenAI na Vercelu | ✅ |
| DB schema (`users`, `generations`, `payments`) | ✅ |
| Privacy + Terms stranice | ✅ (LS store approval čeka račun) |
| Lemon Squeezy account + produkt + webhook | ⚠️ **Bloker** — env lokalno prazan |
| RLS ručna provjera u prod bazi | ☐ T-15.2 |
| GSC property | ☐ |
| Vercel Preview env (AI keys) | ☐ Pending u scrum planu |

---

## Okruženja — gdje postaviti env

| Varijabla | Lokalno `.env.local` | Vercel Preview | Vercel Production |
|-----------|----------------------|----------------|-------------------|
| Sve iz `.env.example` | Da | Da (scrum: još provjeri) | Da ✅ |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Preview URL ili `ai-rules.dev` | `https://ai-rules.dev` |
| GitHub OAuth callback | Supabase + localhost | Isti Supabase callback URL | `https://<ref>.supabase.co/auth/v1/callback` |
| LS webhook | ngrok / skip | Preview URL | `https://ai-rules.dev/api/lmsqueezy/webhook` |

Vercel automatski dodaje `VERCEL_URL`, `VERCEL_ENV` — ne dokumentiraj u private (sistem).

---

## npm skripte i DB CLI

| Naredba | Servis / svrha |
|---------|----------------|
| `npm run dev` | Lokalni Next.js |
| `npm run build` | Production build |
| `npm run start` | Lokalni production server |
| `npm run lint` | ESLint |
| `npm run verify:lemonsqueezy` | Lemon Squeezy API (`api.lemonsqueezy.com`) |
| `npx drizzle-kit push` | Supabase direct :5432 |
| `npx drizzle-kit studio` | Supabase Studio (lokalni UI) |

---

## Javne stranice i API (cijeli App Router)

| Putanja | Vrsta | Vanjski servis |
|---------|-------|----------------|
| `/` | Marketing | Supabase auth read (SSR) |
| `/generate` | App | Anthropic preko `/api/generate` |
| `/pricing` | Marketing | LS checkout link (Pro) |
| `/privacy`, `/terms` | Legal | — |
| `/login` | Auth | GitHub OAuth |
| `/api/generate` | API POST | Anthropic stream |
| `/api/user/stats` | API GET | ⚠️ **Nema UI poziva** — podaci SSR na `/generate` |
| `/api/user/generations` | API GET | Pro history (`generation-history.tsx`) |
| `/api/lmsqueezy/webhook` | API POST | Lemon Squeezy |
| `/auth/callback` | Auth | Supabase |
| `/sitemap.xml`, `/robots.txt` | SEO | — |
| `robots` disallow | — | `/api/`, `/auth/` |

---

## Sažetak mjesečnih troškova

Popuni stvarne iznose u `SERVICES.private.md`; ovdje su **procjene** iz `docs/MASTER-DOCUMENT.md` (MVP / rani rast).

| Stavka | Plan (MVP) | Mjesečno (USD) | Godišnje (USD) | Napomena |
|--------|------------|----------------|----------------|----------|
| Vercel | Hobby → Pro | 0 → 20 | — | Analytics uključen na Hobby |
| Supabase | Free | 0 | — | Pro ~$25/mj kad prerasteš free tier |
| Anthropic API | Pay-as-you-go | ~5 | — | Hard limit preporuka: $50/mj |
| OpenAI API | Pay-as-you-go (fallback) | 0–5 | — | Samo kad Anthropic padne |
| Lemon Squeezy | MoR | varijabilno | — | ~5% + $0.50 po transakciji, nema fiksne pretplate |
| GitHub | Free | 0 | — | Source + OAuth provider |
| Domena `ai-rules.dev` | Vercel Domains | ~1–2 | ~12–20 | **Aktivno** — kupljeno/connectano na Vercel (22.5.2026) |
| Google Search Console | Free | 0 | — | SEO, bez SaaS troška |
| Kontakt email (Gmail) | Legal / support u privacy & terms | 0 | — | Nije Workspace; `gordan.valenta@gmail.com` u kodu |
| **UKUPNO (fiksno, MVP)** | | **~$6–11** | **~$12** | + varijabilni AI i LS fee |

**Što namjerno ne koristimo** (overkill za MVP): Resend, Plausible, Upstash Redis, Sentry, PostHog, Ahrefs, Vercel AI Gateway, email SaaS — vidi `docs/MASTER-DOCUMENT.md`.

---

## Master tablica — svi servisi

| # | Servis | Svrha u projektu | Dashboard | Username / račun | Tajna / credential | Env / konfiguracija | Plan | Mjesečno | Godišnje | Obnova | Status |
|---|--------|------------------|-----------|------------------|-------------------|---------------------|------|----------|----------|--------|--------|
| 1 | **Vercel** | Hosting Next.js, preview deploys | https://vercel.com | _upiši_ | — (deploy preko Git) | Project env vars | Hobby / Pro | | | mjesečno | ☐ |
| 2 | **Vercel Analytics** | Cookieless page views + custom events | Vercel → Analytics | — | — | `src/app/layout.tsx`, `track()` | Uklj. u Vercel | 0 | | — | ✅ |
| 3 | **Supabase** | Postgres, Auth (GitHub OAuth), RLS | https://supabase.com/dashboard/project/sbtnpwqjcexoyaltpeht | org `jqwapennckidoxcgiiff` | Service role key → **private** | `.env.local`, Vercel | Free / Pro | | | mjesečno | ☐ |
| 4 | **GitHub (repo)** | Source code, CI (ako dodaš) | https://github.com/gordan007/ai-rules-generator | gordan007 | PAT (ako treba) → **private** | — | Free | 0 | | — | ☐ |
| 5 | **GitHub OAuth App** | Login preko Supabase Auth | https://github.com/settings/developers | Client ID `Ov23liRi0raY6M00XfxA` | Secret → **private** / Supabase | Supabase → Auth → GitHub | Free | 0 | | — | ✅ |
| 6 | **Anthropic** | Primarni LLM (`claude-haiku-4-5`) | https://console.anthropic.com | _upiši_ | `ANTHROPIC_API_KEY` | `.env.local`, Vercel | Pay-as-you-go | | | — | ☐ |
| 7 | **OpenAI** | Fallback LLM (`gpt-4o-mini`) | https://platform.openai.com | _upiši_ | `OPENAI_API_KEY` | `.env.local`, Vercel | Pay-as-you-go | | | — | ☐ |
| 8 | **Lemon Squeezy** | Lifetime Pro checkout + webhook | https://app.lemonsqueezy.com | _upiši_ | API key, webhook secret → **private** | vidi tablicu ispod | % po prodaji | | | — | ☐ |
| 9 | **Domena `ai-rules.dev`** | Produkcijski brand URL | Vercel → Domains | _upiši_ | — | DNS na Vercelu, `NEXT_PUBLIC_APP_URL` | ~$12–20/god | ~1–2 | ~12–20 | godišnje | ✅ Live |
| 10 | **Google Search Console** | SEO indeksiranje | https://search.google.com/search-console | _upiši_ | — | Verifikacija domene | Free | 0 | | — | ☐ |
| 11 | **npm** | Paketi | https://www.npmjs.com | — | — | `package.json` | Free | 0 | | — | ✅ |
| 12 | **Drizzle ORM** | Schema + migracije | https://orm.drizzle.team | — | — | `drizzle.config.ts`, `src/db/` | OSS | 0 | | — | ✅ |
| 13 | **Next.js / React** | App framework | https://nextjs.org | — | — | `src/app/` | OSS | 0 | | — | ✅ |
| 14 | **Supabase DB lozinka** | Postgres korisnik `postgres` u connection stringu | Supabase → Settings → Database | — | U `DATABASE_*` → **private** | `.env.local`, Vercel | Uklj. u projekt | 0 | | — | ☐ |
| 15 | **Google Fonts (Geist)** | Fontovi preko `next/font/google` | https://fonts.google.com | — | — | `src/app/layout.tsx` | Free | 0 | | — | ✅ |
| 16 | **GitHub Avatars CDN** | Slike profila nakon OAuth | `avatars.githubusercontent.com` | — | — | `next.config.ts` `images.remotePatterns` | Free | 0 | | — | ✅ |
| 17 | **Drizzle Kit** | Migracije / `drizzle-kit push` | https://orm.drizzle.team | — | `DATABASE_DIRECT_URL` | `drizzle.config.ts`, `supabase/migrations/` | OSS | 0 | | — | ✅ |
| 18 | **Node.js (Vercel runtime)** | Serverless funkcije | Vercel | — | — | `package.json` engines 22+ | Uklj. u Vercel | 0 | | — | ✅ |

**Legenda statusa:** ☐ nije postavljeno · 🔄 u tijeku · ✅ aktivno

### Vanjski API pozivi u runtimeu (što aplikacija zove)

| Endpoint / domena | Servis | Gdje u kodu | Napomena |
|-------------------|--------|-------------|----------|
| `*.supabase.co` (+ `wss://`) | Supabase Auth + REST | `middleware.ts`, `@supabase/ssr` | Session refresh na svakom requestu |
| Postgres pooler `:6543` | Supabase DB | `src/db/index.ts` (Drizzle) | **Ne** PostgREST — direktan SQL |
| `api.anthropic.com` (preko AI SDK) | Anthropic | `src/app/api/generate/route.ts` | Jedini provider u generate ruti danas |
| `api.openai.com` (preko AI SDK) | OpenAI | `src/lib/ai.ts` | Env postoji; **fallback još nije u** `/api/generate` |
| `app.lemonsqueezy.com` | Lemon Squeezy | Checkout redirect | Korisnik napušta stranicu |
| `api.lemonsqueezy.com` | Lemon Squeezy | `npm run verify:lemonsqueezy` | Store API validacija |
| `{APP_URL}/api/lmsqueezy/webhook` | Lemon Squeezy → mi | `src/app/api/lmsqueezy/webhook/` | Dolazni webhook |
| `va.vercel-scripts.com` | Vercel Analytics | CSP `script-src` | `next.config.ts` |
| `vitals.vercel-insights.com` | Vercel Web Vitals | CSP `connect-src` | U paru s Analytics |
| `avatars.githubusercontent.com` | GitHub | CSP `img-src`, OG avatari | Nakon prijave |

**Napomena:** AI pozivi (`Anthropic`/`OpenAI`) idu **server-side** iz `/api/generate` — nisu u browser CSP `connect-src` (klijent zove samo `/api/generate`).

### Naše API rute (Next.js App Router)

| Ruta | Metoda | Auth | Vanjski servis |
|------|--------|------|----------------|
| `/api/generate` | POST | Opcionalno (anon 1×) | Anthropic (stream) |
| `/api/user/stats` | GET | GitHub session | Supabase Auth + Postgres |
| `/api/user/generations` | GET | GitHub session | Supabase Auth + Postgres |
| `/api/lmsqueezy/webhook` | POST | HMAC `x-signature` | Lemon Squeezy → webhook |
| `/auth/callback` | GET | OAuth code | Supabase Auth |
| `/login` | GET/POST | — | Redirect na GitHub OAuth |

Klijentski `fetch` u browseru: samo `/api/generate`, `/api/user/generations` (ne direktno AI API).

### Supabase — proizvodi koje **ne** koristimo

| Proizvod | Status |
|----------|--------|
| Supabase Realtime | ❌ |
| Supabase Storage | ❌ |
| Supabase Edge Functions | ❌ |
| Email / magic link auth | ❌ (samo GitHub OAuth) |
| Supabase PostgREST iz browsera za DB | ❌ (Drizzle + `DATABASE_URL`) |

### Plaćanja — Stripe i alternative

| Servis | Status |
|--------|--------|
| Stripe | ❌ nije u projektu |
| Lemon Squeezy | ✅ jedini MoR / checkout |

### Konfiguracija: URL fallback (usklađeno u kodu)

| Datoteka | Fallback ako nema `NEXT_PUBLIC_APP_URL` |
|----------|----------------------------------------|
| `src/app/layout.tsx` (OG) | `https://ai-rules.dev` |
| `src/app/sitemap.ts`, `robots.ts` | `https://ai-rules.dev` |

Na Vercelu **mora** biti postavljen `NEXT_PUBLIC_APP_URL=https://ai-rules.dev` (prema scrum planu — već postavljeno). Fallback u kodu je samo sigurnosna mreža.

> **Stari kandidati** `airules.dev` / `editorrules.dev` iz strategije — **nisu** aktivna domena; kanonska je **`ai-rules.dev`**.

---

## Environment varijable (kompletan popis)

Izvor: `.env.example` · Lokalno: `.env.local` (gitignored) · Produkcija: Vercel → Settings → Environment Variables.

| Varijabla | Servis | Opis | U kodu (primjer) |
|-----------|--------|------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Project URL | `src/lib/supabase/*.ts`, `middleware.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Anon key (browser-safe) | isto |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Admin operacije — **nikad u browser** | `src/lib/supabase/admin.ts` |
| `DATABASE_URL` | Supabase | Pooled Postgres (port **6543**) | `src/db/index.ts` |
| `DATABASE_DIRECT_URL` | Supabase | Direct (port **5432**) — samo Drizzle CLI | `drizzle.config.ts` |
| `ANTHROPIC_API_KEY` | Anthropic | Primarni AI | `src/lib/ai.ts`, `src/app/api/generate/` |
| `OPENAI_API_KEY` | OpenAI | Fallback AI | isto |
| `LEMONSQUEEZY_API_KEY` | Lemon Squeezy | Store API | `src/lib/lmsqueezy.ts`, `scripts/verify-lemon-squeezy.mjs` |
| `LEMONSQUEEZY_STORE_ID` | Lemon Squeezy | Store ID | isto |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Lemon Squeezy | HMAC webhook | `src/app/api/lmsqueezy/webhook/route.ts` |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Lemon Squeezy | Lifetime Pro ($29) | `src/lib/lmsqueezy.ts`, generate paywall |
| `LEMONSQUEEZY_POWER_VARIANT_ID` | Lemon Squeezy | Power tier ($9/mo) — opcionalno | isto |
| `NEXT_PUBLIC_APP_URL` | App | Canonical URL (OAuth, OG, webhook) | `layout.tsx`, `auth`, `sitemap.ts` |

**GitHub OAuth** (Client ID / Secret) **nije** u `.env` — upisuje se u **Supabase → Authentication → Providers → GitHub**.

**Supabase Auth URL-ovi** (dashboard, ne env):

| Postavka | Tipična vrijednost |
|----------|-------------------|
| Site URL | `NEXT_PUBLIC_APP_URL` |
| Redirect URLs | `{APP_URL}/auth/callback`, localhost za dev |
| JWT / session | Cookie preko `@supabase/ssr` (`middleware.ts`) |

**Baza — tri pristupa u projektu:**

| Način | Credential | RLS | Koristi se za |
|-------|------------|-----|----------------|
| Drizzle + `DATABASE_URL` | Postgres lozinka (pooler :6543) | Zaobilazi RLS (postgres role) | API rute, auth callback upsert |
| Drizzle + `DATABASE_DIRECT_URL` | Ista lozinka (direct :5432) | Zaobilazi RLS | `drizzle-kit push`, migracije |
| Supabase JS client | Anon key + cookies | RLS na tablicama | Auth session, `getUser()` |
| Service role (`admin.ts`) | `SUPABASE_SERVICE_ROLE_KEY` | Zaobilazi RLS | Pripremljeno; **još nema poziva u kodu** |

SQL migracije + RLS politike: `supabase/migrations/0001_initial_schema.sql`.

---

## Detalji po servisu

### 1. Vercel

| Polje | Vrijednost |
|-------|------------|
| Projekt | _npr. `ai-rules-generator`_ |
| Production URL | _iz `NEXT_PUBLIC_APP_URL`_ |
| Git integration | `gordan007/ai-rules-generator` |
| Deploy | Auto na push `main` |

**Env na Production + Preview:** sve varijable iz tablice gore (isti nazivi kao `.env.example`).

| Polje | Vrijednost |
|-------|------------|
| Plan | Hobby / Pro |
| Mjesečna cijena | _private_ |
| Billing email | _private_ |

---

### 2. Vercel Analytics

| Polje | Vrijednost |
|-------|------------|
| Integracija | `@vercel/analytics` |
| Komponenta | `<Analytics />` u `src/app/layout.tsx` |
| Custom events (u kodu) | `signup_completed`, `generation_started`, `generation_completed`, `generation_copied`, `generation_downloaded`, `limit_reached`, `payment_completed` |
| Cookie banner | Nije potreban (anonymised, bez cookies po privacy copyju) |
| Plan | Uključeno u Vercel projekt |
| Mjesečno | $0 (Hobby limits) |

---

### 3. Supabase

| Polje | Vrijednost |
|-------|------------|
| Project name | `AiRulesGenerator` |
| Region | `eu-west-1` (West EU — Ireland) |
| Project ref | `sbtnpwqjcexoyaltpeht` |
| Status | `ACTIVE_HEALTHY` (2026-05-20) |
| Postgres | `17.6.1.121` |
| Auth providers | Email u Supabase uključen · **login u appu = GitHub** |
| Tabele | `users`, `generations`, `payments` (Drizzle schema) |
| Database password | Settings → Database → **reset/copy** → u `DATABASE_URL` |
| Region / pooler | npr. `aws-0-eu-west-1.pooler.supabase.com` (provjeri u dashboardu) |
| Migracije | `supabase/migrations/*.sql` + `npx drizzle-kit push` |

**Connection strings:**

| Tip | Port | Koristi |
|-----|------|---------|
| Pooled | 6543 | `DATABASE_URL` — runtime (Vercel + `npm run dev`) |
| Direct | 5432 | `DATABASE_DIRECT_URL` — `npx drizzle-kit push` |

**Runtime driver (`src/db/index.ts`):** `postgres` paket s `{ prepare: false }` — **obavezno** za Supabase pooler (transaction mode).

| Polje | Vrijednost |
|-------|------------|
| Compute (scrum) | EU, MICRO tier |
| Plan | Free / Pro |
| Studio | https://supabase.com/dashboard (pregled tablica) |
| Mjesečno | _private_ |

---

### 4. GitHub OAuth (preko Supabase)

| Polje | Vrijednost |
|-------|------------|
| OAuth App | https://github.com/settings/developers |
| Client ID | `Ov23liRi0raY6M00XfxA` |
| Client Secret | Supabase dashboard → **private doc** (ne u Git) |
| Homepage URL | `https://ai-rules.dev` (`NEXT_PUBLIC_APP_URL`) |
| Supabase callback | `https://sbtnpwqjcexoyaltpeht.supabase.co/auth/v1/callback` |
| App redirect allow list | `https://ai-rules.dev/auth/callback`, `http://localhost:3000/auth/callback`, `https://ai-rules-generator.vercel.app/auth/callback` |
| App flow u kodu | `signInWithGitHub` → `/auth/callback` |

Kad promijeniš domenu ili Vercel URL, ažuriraj **oba**: GitHub OAuth App **i** Supabase Site URL / Redirect URLs.

---

### 5. Anthropic

| Polje | Vrijednost |
|-------|------------|
| Model (free tier) | `claude-haiku-4-5` |
| Model (power tier) | `claude-sonnet-4-5` |
| Cost controls | Warning $20/mj, hard stop $50/mj (preporuka u README) |

---

### 6. OpenAI

| Polje | Vrijednost |
|-------|------------|
| Uloga | Fallback (README); `getModel(..., "openai")` u `ai.ts` |
| Model (free) | `gpt-4o-mini` |
| Model (power) | `gpt-4o` |
| Status u produkciji | `/api/generate` trenutno zove **samo** `getModel("free")` → Anthropic |

---

### 7. Lemon Squeezy

| Polje | Vrijednost |
|-------|------------|
| Store subdomain | _npr. `ai-rules-generator.lemonsqueezy.com`_ |
| Produkt Pro | Lifetime **$29** one-time |
| Produkt Power | **$9/mo** (opcionalno, MVP može biti disabled) |
| Webhook URL | `{NEXT_PUBLIC_APP_URL}/api/lmsqueezy/webhook` |
| Webhook header | `x-signature` (HMAC-SHA256) |
| Webhook event (kod) | Samo `order_created` → upgrade na `pro` |
| Checkout custom data | `checkout[custom][user_id]` + `checkout[email]` u `buildCheckoutUrl()` |
| Test mode | LS dashboard (dev prije live) |
| Setup vodič | `docs/lemon-squeezy-setup.md` |
| Provjera env | `npm run verify:lemonsqueezy` → `api.lemonsqueezy.com/v1/users/me`, store, variant |
| SDK helper | `validateLemonSqueezySetup()` u `lmsqueezy.ts` — **nije pozvan** iz app ruta |

Provizija: vidi LS pricing (~5% + fiksna po transakciji) — nije fiksni mjesečni trošak.

---

### 8. Domena `ai-rules.dev` (aktivna)

| Polje | Vrijednost |
|-------|------------|
| Produkcijski URL | https://ai-rules.dev |
| Nabava | Vercel Domains (T-01.5 u scrum planu) |
| DNS | Upravlja Vercel (connect na projekt) |
| Godišnja cijena | _upiši u private doc_ |
| Obavezno održavati usklađeno | `NEXT_PUBLIC_APP_URL`, GitHub OAuth homepage, Supabase Site URL + redirects, LS webhook + legal URL-ovi, GSC property |
| Alternativne domene (ne korištene) | `airules.dev`, `editorrules.dev` — samo u staroj strategiji |

---

### 9. Google Search Console

| Polje | Vrijednost |
|-------|------------|
| Property | Production domena |
| Sitemap | `{APP_URL}/sitemap.xml` (`src/app/sitemap.ts`) |
| robots.txt | `src/app/robots.ts` |

---

### 10. Kontakt email (privatni Gmail)

| Polje | Vrijednost |
|-------|------------|
| Adresa u kodu | `gordan.valenta@gmail.com` (`privacy/page.tsx`, `terms/page.tsx`) |
| Uloga | Support / GDPR kontakt na legal stranicama |
| Trošak | $0 (nije Google Workspace) |
| Kasnije | Opcionalno `support@` na custom domeni + email hosting |

---

### 11. Prva-stranačka logika (nije SaaS, ali bitno za evidenciju)

| Mehanizam | Datoteka | Napomena |
|-----------|----------|----------|
| Anon. limit 1 gen | Cookie `x-anon-gen-count` | HttpOnly, 30 dana |
| Free user 5 gen | `MAX_FREE_GENERATIONS` + DB | Server-side |
| Rate limit 10/min | In-memory `Map` u `generate/route.ts` | **Nema** Redis; reset na cold start |
| Session | Supabase Auth cookies | `middleware.ts` refresh |

### 12. Pripremljeno u kodu, još bez produkcijske upotrebe

| Datoteka / simbol | Namjena |
|-------------------|---------|
| `src/lib/supabase/client.ts` | Browser Supabase client — **nema importa** u `src/` (samo server client) |
| `src/lib/supabase/admin.ts` | `createAdminClient()` — **nema poziva** |
| `validateLemonSqueezySetup()` | LS SDK auth test — koristi `npm run verify:lemonsqueezy` umjesto toga |
| `getUserByGithubId` / `upsertUser` | `payments.ts` — **nema poziva** (upsert u `auth/callback`) |
| `/api/user/stats` | Ruta postoji — UI koristi SSR na `/generate`, ne `fetch` |
| `RATE_LIMITS.GENERAL_PER_MINUTE` | Konstanta u `constants` — **nije korištena** u rutama |
| `next-themes` | U `package.json`; layout forsira `theme="dark"` na Toaster — nema `ThemeProvider` |
| Team tier `$49` | `PRICING.TEAM_LIFETIME_USD` + DB enum — **nema** LS variant / checkout |
| `subscription_created` webhook | MASTER doc spominje Power tier — **nije** u `webhook/route.ts` |

### 13. Procesori trećih strana (usklađeno s Privacy Policy §4)

| Procesor | U `privacy/page.tsx` | U ovom docu |
|----------|----------------------|-------------|
| Supabase (DB + Auth, EU) | ✅ | ✅ |
| Vercel (hosting + analytics) | ✅ | ✅ |
| Lemon Squeezy (MoR) | ✅ | ✅ |
| Anthropic / OpenAI | ✅ | ✅ |
| Google Search Console | ❌ (nije procesor osobnih podataka) | ✅ ops |

---

## Mapiranje tajni — gdje što živi

| Tajna | Gdje spremiti | U Git repou? |
|-------|---------------|--------------|
| Supabase anon + URL | Vercel + `.env.local` | ✅ URL/anon OK u timu; rotiraj ako cure |
| Supabase service role | Vercel + `.env.local` + **private doc** | ❌ |
| **Supabase database password** | Ugrađen u `DATABASE_URL` + `DATABASE_DIRECT_URL` | ❌ |
| `DATABASE_URL` / `DATABASE_DIRECT_URL` | Vercel + `.env.local` | ❌ |
| Supabase Auth URL-ovi | Supabase dashboard | ❌ (konfiguracija) |
| GitHub OAuth Client ID | Supabase dashboard + **private doc** | ❌ secret |
| Anthropic / OpenAI API keys | Vercel + `.env.local` + **private doc** | ❌ |
| Lemon Squeezy API + webhook secret | Vercel + `.env.local` + **private doc** | ❌ |
| LS variant IDs | Vercel + `.env.local` | ⚠️ nisu tajne, ali poslovno osjetljive |
| GitHub OAuth Client Secret | Supabase dashboard + **private doc** | ❌ |
| GitHub PAT (ako CI treba) | GitHub Secrets + **private doc** | ❌ |
| Vercel / registrar lozinke | Password manager + **private doc** | ❌ |

---

## Evidencija troškova po mjesecima

Vodi u **`SERVICES.private.md`** (tablica „Troškovi po mjesecima”). Ovdje samo predložak strukture:

| Mjesec | Vercel | Supabase | Anthropic | OpenAI | LS fees | Domena | Ostalo | **Ukupno** |
|--------|--------|----------|-----------|--------|---------|--------|--------|------------|
| 2026-05 | | | | | | | | |

---

## Kalendar obnove

| Servis | Sljedeća obnova | Podsjetnik |
|--------|-----------------|------------|
| Domena `ai-rules.dev` | | 30 dana prije |
| Vercel (ako Pro) | | |
| Supabase (ako Pro) | | |
| Anthropic / OpenAI | — | Provjeri usage limite mjesečno |
| Lemon Squeezy payout / KYC | | |

---

## Servisi / alati koji se ne naplaćuju

| Alat | Uloga |
|------|-------|
| Next.js 16, React 19, Tailwind v4 | UI + App Router |
| Drizzle ORM | DB layer |
| shadcn/ui, Framer Motion | Komponente / animacije |
| AI SDK (`ai`, `@ai-sdk/*`) | Streaming; ključevi iz env (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) |
| `postgres` (npm) | Postgres driver za Drizzle → Supabase |
| ESLint, TypeScript, PostCSS, Tailwind | Dev tooling |
| Google Fonts (Geist) | `next/font/google` (self-host nakon builda) |
| shadcn CLI + `ui.shadcn.com` | Samo pri `npx shadcn add` (dev) |
| Framer Motion, Lucide, Base UI, Zod, sonner | Runtime biblioteke, bez SaaS |
| `npx drizzle-kit studio` | Lokalni DB preglednik (README) |
| Vercel CLI | Opcionalno deploy/env (`npm i -g vercel`) — nije u `package.json` |

---

## Planirano / nije u kodu (ne vodi trošak dok ne aktiviraš)

| Stavka | Dokumentacija | Napomena |
|--------|---------------|----------|
| Email hosting `support@ai-rules.dev` | `SERVICES.md` §10 | Domena postoji; inbox još Gmail |
| GitHub Actions CI | — | Nema `.github/workflows` u repou |
| OpenAI fallback u generate | README | Samo Anthropic u `route.ts` |
| `createAdminClient()` | `src/lib/supabase/admin.ts` | Spremno, nekorišteno |
| Ahrefs / paid ads | `docs/MASTER-DOCUMENT.md` | Post-MVP marketing |
| Power tier ($9/mo) | `LEMONSQUEEZY_POWER_VARIANT_ID` | Opcionalno, landing može biti disabled |
| Team tier ($49) | `constants` / schema | Produkt u LS još nije obavezan |

---

## Checklist MVP launch

**Produkcija (već gotovo prema scrum planu):**

- [x] Supabase projekt + DB lozinka u `DATABASE_URL` / `DATABASE_DIRECT_URL`
- [x] Schema (`supabase/migrations/0001_initial_schema.sql`)
- [x] Supabase Auth na `https://ai-rules.dev` + GitHub provider
- [x] GitHub OAuth App + callback na Supabase
- [x] Env na Vercel **Production** (Supabase, DB, AI, `NEXT_PUBLIC_APP_URL`)
- [x] Domena `ai-rules.dev` (Vercel Domains)
- [x] App live + smoke test
- [x] Anthropic + OpenAI ključevi (lokalno + Vercel prod)
- [x] Privacy + Terms stranice

**Još otvoreno:**

- [ ] RLS ručno provjeren u Supabase produkciji (T-15.2)
- [ ] Lemon Squeezy račun + store + Pro $29 + webhook + `verify:lemonsqueezy`
- [ ] LS legal URL-ovi → `https://ai-rules.dev/privacy` i `/terms`
- [ ] `SERVICES.private.md` popunjen + password manager
- [ ] GSC za `ai-rules.dev`
- [ ] Vercel Preview env (AI keys) ako koristiš preview deploye
- [ ] Budget alerti Anthropic (+ OpenAI) ručno u dashboardima

---

## Kako koristiti ovaj dokument

1. **`SERVICES.md`** — struktura, URL-ovi, env mapa, procjene (commit u Git).
2. **`SERVICES.private.md`** — lozinke, API ključevi, stvarni iznosi, fakture (gitignored).
3. Nakon svake fakture — ažuriraj sažetak i mjesečnu tablicu u private datoteci.
4. Kvartalno — provjeri Supabase usage, Vercel billing, AI spend, LS payouts.

**Povezana dokumentacija:** [`README.md`](README.md) · [`docs/lemon-squeezy-setup.md`](docs/lemon-squeezy-setup.md) · [`docs/MASTER-DOCUMENT.md`](docs/MASTER-DOCUMENT.md)

---

## Audit pokrivenosti (revizija 4 — 2026-05-22)

**Metoda:** 101 datoteka u repou · grep `process.env`, `https://`, `fetch(`, `track(` · čitanje svih API ruta · `package.json` + lockfile prod deps · `scrum-mvp-plan.md` · `privacy` §4 · usporedba s `.env.example`.

| # | Provjera | Rezultat |
|---|----------|----------|
| 1 | Plaćeni SaaS iz koda/env | 9 aktivnih + GSC ops + Gmail — vidi §0 |
| 2 | Eksplicitno isključeni SaaS | Stripe, Resend, Redis, Sentry, PostHog, Plausible, AI Gateway |
| 3 | Supabase pod-proizvodi nekorišteni | Realtime, Storage, Edge, email auth |
| 4 | Svi env iz `.env.example` (13) | Mapirani u tablici |
| 5 | GitHub OAuth izvan `.env` | Supabase dashboard |
| 6 | `prepare: false` + pooler :6543 | Dokumentirano §3 |
| 7 | Dead code / neiskorištene rute | §12 prošireno |
| 8 | Domena `ai-rules.dev` + scrum status | § Operativni status |
| 9 | `.env.example` zastarjelost | **Ispravljeno u rev. 4** |
| 10 | Kanonski popis §0 | **Novo u rev. 4** |

**Zaključak:** Za ovaj repozitorij **nema 14. plaćenog servisa** koji nedostaje u §0. Jedini produkcijski bloker je **Lemon Squeezy** (operativno, ne u kodu). Evidenciju troškova i lozinki moraš držati u `SERVICES.private.md` — to nije u Gitu i agent je ne vidi u potpunosti.
