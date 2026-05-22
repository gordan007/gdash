# CAPTIVE — evidencija servisa i troškova

> **Sigurnost:** Ova datoteka je u Git repou — **bez** stvarnih lozinki i API ključeva.  
> Za credentials i privatne iznose: **`SERVICES.private.md`** (gitignored).  
> Prvi put: `cp SERVICES.private.example.md SERVICES.private.md`

**Zadnje ažuriranje:** 2026-05-22 (revizija 5 — §0 statusi iz repoa + deploya)  
**Produkt:** CAPTIVE — AI caption generator (React Native + Expo)  
**Repo:** https://github.com/gordan007/Captive  
**Firebase project ID:** `captive-dfd7b` (iz `.firebaserc`)  
**Bundle ID:** `com.captiveapp`  
**EAS project ID:** `72e23176-401b-4fa2-854c-21fc3bdfb992` (iz `app.json`)  
**Legal stranice (u kodu):** https://captiveapp.pages.dev/  
**Legal draft (docs):** https://captiveapp.com/ — vidi § Usklađenost ispod

---

## 0. Kanonski popis — svi računi i servisi

Svaki red = jedan login ili jedan API ključ. Detalji i tajne → `SERVICES.private.md`.

**Legenda statusa (§0):**

| Simbol | Značenje |
|--------|----------|
| ✅ | Potvrđeno u **repou / deployu / kodu** |
| 🔶 | **Djelomično** — dev OK, production ili ručni korak nedostaje |
| ☐ | **Ručno** — nije u repou ili blokira App Store (`STATUS.md`) |
| ⏭ | PHASE-2 |

| # | Račun / servis | Dashboard | Obavezno za MVP | Status | Što spremiti u private |
|---|----------------|-----------|-----------------|--------|------------------------|
| 1 | **Firebase / Google Cloud** | https://console.firebase.google.com | Da | 🔶 | Project `captive-dfd7b` ✅ · CF deploy ✅ · Blaze billing ☐ |
| 2 | **Google Cloud Console** | https://console.cloud.google.com | Da | 🔶 | OAuth iOS+Web ✅ (plist/json) · Play Integrity ☐ |
| 3 | **Anthropic** | https://console.anthropic.com | Da | 🔶 | API key u `functions/.env` ✅ · `claudeProxy` live ✅ · spend limiti ☐ |
| 4 | **RevenueCat** | https://app.revenuecat.com | Da (iOS monetization) | 🔶 | SDK `test_…` ⚠️ · entitlement `premium` u kodu ✅ · webhook secret ☐ |
| 5 | **Apple Developer Program** | https://developer.apple.com/account | Da (iOS) | ☐ | Team ID, članarina $99/god — nije u repou |
| 6 | **App Store Connect** | https://appstoreconnect.apple.com | Da (iOS distribucija) | ☐ | IAP, TestFlight (T-085), screenshots (T-084), metadata |
| 7 | **Sign in with Apple** | Apple Developer → Identifiers / Keys | Da | 🔶 | Kod: `usesAppleSignIn` + `auth.ts` ✅ · Portal capability ☐ |
| 8 | **Google Sign-In** | Firebase Auth + Google Cloud OAuth | Da | ✅ | Web + iOS client ID u plist/json + `.env.local` |
| 9 | **Expo / EAS** | https://expo.dev | Da | 🔶 | Project `gordanvalenta` / ID u `app.json` ✅ · `EXPO_TOKEN` / prod build ☐ |
| 10 | **GitHub** | https://github.com/gordan007/Captive | Da | 🔶 | Repo + workflows ✅ · `EXPO_TOKEN` vrijednost ☐ |
| 11 | **Cloudflare Pages** | https://dash.cloudflare.com | Da (App Review URL-ovi) | ✅ | `captiveapp.pages.dev` live — privacy/terms/support |
| 12 | **Gmail** (trenutno u appu) | Google Account | Da (support u appu) | ✅ | `captiveapp.support@gmail.com` u `legal.ts` |
| 13 | **Planirani inboxi** (`@captiveapp.com`) | Email hosting (još) | Prije launcha (PLAN) | ☐ | `privacy@`, `support@`, `legal@` — vidi § Usklađenost |
| 14 | **npm** | https://www.npmjs.com | Ne (consume only) | ✅ | Consume only — nema publish računa u projektu |

**Planirano (PHASE-2):** Resend (T-108–T-112), Firebase Crashlytics, Maestro E2E u CI.  
**Nema zasebnih računa / integracija (MVP):** Stripe, Sentry, PostHog, Supabase, Vercel (app hosting), OpenAI, Instagram/TikTok/LinkedIn/X **API** (samo UI copy za platforme captiona).

---

## Usklađenost URL-ova i emailova (provjeri prije App Store)

U repou postoje **tri razine** — uskladi prije submita:

| Izvor | Privacy / Terms / Support URL | Kontakt email |
|-------|------------------------------|---------------|
| **`src/constants/legal.ts`** (što app otvara) | `https://captiveapp.pages.dev/...` | `captiveapp.support@gmail.com` |
| **`docs/legal/*.md`** (draft za web) | `https://captiveapp.com/...` | `privacy@captiveapp.com`, `legal@captiveapp.com` |
| **PLAN.md / Sprint 6** (cilj launcha) | `captiveapp.com` | `support@`, `privacy@`, `legal@` |

**Akcija:** Jedan kanonski set za ASC, Cloudflare Pages i `legal.ts`. Dokumentiraj odluku u `SERVICES.private.md`.

**Napomena:** `deleteAccountUrl` u `legal.ts` trenutno = `support/` (ne zasebna `/delete-account` stranica iz PLAN.md). To je **usklađenost sadržaja**, ne novi servis.

**PLAN.md greška:** unsubscribe URL piše `captive-app` — stvarni Firebase project je **`captive-dfd7b`** (`.firebaserc`).

---

## Sažetak mjesečnih troškova (procjene)

Popuni stvarne iznose u `SERVICES.private.md`.

| Stavka | Plan (MVP) | Mjesečno (USD) | Godišnje (USD) | Napomena |
|--------|------------|----------------|----------------|----------|
| Firebase (Blaze) | Spark → Blaze | 0–25 | — | Firestore, Functions, Scheduler |
| Anthropic API | Pay-as-you-go | 5–50 | — | Preporuka: warning $20, hard stop $50 |
| RevenueCat | Free tier | 0 | — | % nakon $2.5k MTR; **nema** fiksne pretplate |
| Apple Developer | Obavezno iOS | ~8 | **99** | Članarina |
| **Apple IAP provizija** | 15–30% prihoda | varijabilno | — | Nije zaseban račun — odbitak od pretplata |
| Expo / EAS | Free / Production | 0–29 | — | Extra buildovi na plaćenom planu |
| Cloudflare Pages | Free | 0 | — | Legal static site |
| GitHub Actions | Free | 0 | — | `pr.yml` + `main.yml` + `release.yml` |
| Google Play Console | Android launch | — | 25 (jednokratno) | `com.captiveapp` u `app.json` |
| Resend | PHASE-2 | 0 | — | 3k email/mj free |
| Email hosting `@captiveapp.com` | Kad kupiš domenu | 0–6 | — | Google Workspace / Zoho / CF Email Routing |
| **UKUPNO (fiksno, MVP iOS)** | | **~$13–40** | **~$99+** | + AI varijabilno + Apple % od IAP |

---

## Master tablica — svi servisi

Ista legenda kao §0. **Napomena:** ✅ ovdje = integracija u kodu/deployu, ne nužno „launch ready“.

| # | Servis | Svrha | Dashboard | Credential / env | Plan | Status |
|---|--------|-------|-----------|----------------|------|--------|
| 1 | **Firebase** | Auth, Firestore, Analytics, RC, CF, Scheduler | console.firebase.google.com | plist/json; CF env u Functions | Blaze | 🔶 |
| 2 | **Google Cloud** | Isti projekt kao Firebase; OAuth, Play Integrity | console.cloud.google.com | OAuth u GC + Firebase Auth | Uklj. u Firebase | 🔶 |
| 3 | **Anthropic** | AI captions / hashtags | console.anthropic.com | `ANTHROPIC_API_KEY` (CF + skripte) | Pay-as-you-go | 🔶 |
| 4 | **RevenueCat** | IAP, entitlements | app.revenuecat.com | iOS key (test ⚠️), webhook secret | Free → % | 🔶 |
| 5 | **Apple Developer** | Certifikati, Sign in with Apple, članarina | developer.apple.com | .p8, profiles → EAS | $99/god | ☐ |
| 6 | **App Store Connect** | TestFlight, IAP, metadata, review | appstoreconnect.apple.com | IAP SKU-evi, legal URL-ovi | Uklj. u Apple | ☐ |
| 7 | **StoreKit (Apple)** | Naplata pretplata | (preko RC SDK) | — | 15–30% provizija | ✅ |
| 8 | **Google Sign-In** | Login | Firebase + `@react-native-google-signin` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Free | ✅ |
| 9 | **Expo / EAS** | Build, OTA, push project ID | expo.dev | `EXPO_TOKEN`, `EXPO_PUBLIC_EAS_PROJECT_ID` | Free/Prod | 🔶 |
| 10 | **Expo Push API** | `limitReset` push | exp.host | — | Uklj. u Expo | ✅ |
| 11 | **GitHub** | Git + CI | github.com/gordan007/Captive | `EXPO_TOKEN` secret | Free | 🔶 |
| 12 | **Cloudflare Pages** | Hosted legal HTML | dash.cloudflare.com | Deploy iz `docs/legal/` ili statički | Free | ✅ |
| 13 | **Resend** | Email sekvence | resend.com | `RESEND_API_KEY`, `RESEND_FROM` (PHASE-2) | 3k/mj free | ⏭ |
| 14 | **Gmail** | Support u appu (mailto) | — | `captiveapp.support@gmail.com` | Free | ✅ |
| 15 | **npm / OSS** | RN, Expo, Jest, Maestro (lokalno) | npmjs.com | — | Free | ✅ |

---

## Treće strane — obrada podataka (usklađeno s `docs/legal/privacy-policy.md`)

| Procesor | Što radi | Podaci |
|----------|----------|--------|
| Firebase / Google | Auth, Firestore, Analytics, App Check | UID, email, usage, analytics (opt-in) |
| Anthropic | Generiranje captiona | Topic u promptu (server-side, ne u analytics) |
| RevenueCat | Pretplata | Subscription status |
| Expo | Push token + slanje | Expo push token u `/users` |
| Apple | IAP, Sign in with Apple | Apple ID (preko Firebase) |

**Nije procesor osobnih podataka:** Instagram, TikTok, LinkedIn, X — samo **cilj platforme** u UI/promptu, bez API poziva.

---

## Cloud Functions (Firebase) — `captive-dfd7b`

| Funkcija | Datoteka | Vanjski poziv | Secrets / env |
|----------|----------|---------------|---------------|
| `claudeProxy` | `functions/src/claudeProxy.ts` | `api.anthropic.com` | `ANTHROPIC_API_KEY`, `FREE_TIER_MODEL`; Firestore `/rate_limits/{uid}` (10 req/60s) |
| `revenuecatWebhook` | `functions/src/revenuecatWebhook.ts` | RevenueCat → POST | `REVENUECAT_WEBHOOK_SECRET` |
| `limitReset` | `functions/src/limitReset.ts` | `https://exp.host/--/api/v2/push/send` | Cloud Scheduler (00:05 UTC) |
| `welcomeEmail` | PHASE-2 | Resend API | `RESEND_API_KEY` |
| `valueNudgeEmail` | PHASE-2 | Resend | isto |
| `reEngagementEmail` | PHASE-2 | Resend | isto |
| `unsubscribe` | PHASE-2 (PLAN) | HTTP GET token | Firestore `email_sequence` |

**Deploy:** `firebase deploy --only functions,firestore:rules,firestore:indexes`  
**Region CF:** `us-central1`  
**Production URL-ovi (Cloud Run gen2, `us-central1`, deploy potvrđen):**

| Funkcija | URL |
|----------|-----|
| `claudeProxy` | `https://claudeproxy-290750023698.us-central1.run.app` (`.env.local` može imati i hash-suffixed alias) |
| `revenuecatWebhook` | `https://revenuecatwebhook-290750023698.us-central1.run.app` → postavi u RevenueCat dashboard |
| `limitReset` | Scheduler (nema javnog klijentskog poziva) |

Zastarjeli oblik `cloudfunctions.net` ne koristi za v2 deploy.

---

## Klijentski servisi (`src/services/`)

| Modul | Vanjski servis | Napomena |
|-------|----------------|----------|
| `firebase.ts` | Firebase native SDK | `GoogleService-Info.plist` / `google-services.json` (gitignored) |
| `anthropic.ts` | `claudeProxy` | Bearer ID token + `X-Firebase-AppCheck`; retry na 5xx |
| `revenuecat.ts` | RevenueCat → StoreKit | `configure` jednom, zatim `logIn(uid)` |
| `database.ts` | Firestore | `/users`, `/captions`, `/usage`, `/caption_reports` (create-only) |
| `auth.ts` | Firebase Auth | Anonymous, **email/password**, Google, Apple |
| `analytics.ts` | Firebase Analytics | Opt-in; bez topic/email u eventima |
| `remoteConfig.ts` | Remote Config | Limiti, model, paywall, chips |
| `appCheck.ts` | App Check | iOS App Attest + DeviceCheck; Android Play Integrity |
| `notifications.ts` | Expo Notifications | Token → Firestore `expoPushToken` |

---

## Firebase Auth — provideri u kodu

| Provider | Kod | Konfiguracija |
|----------|-----|---------------|
| Anonymous | `signInAnonymously()` | Firebase Console → Anonymous |
| Email / password | `createUserWithEmailAndPassword` | Firebase → Email/Password |
| Google | `signInWithGoogle()` | Firebase Google + `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` |
| Apple | `signInWithApple()` | Apple capability + Firebase Apple provider |

**Transakcijski email (MVP, bez Resend):** `sendPasswordResetEmail()` u `auth.ts` / Settings — šalje **Firebase Auth** (predlošci u Firebase Console → Authentication → Templates). Marketing/welcome emaili = PHASE-2 (Resend).

---

## RevenueCat webhook — eventi u kodu

| Event | Akcija na `/users/{uid}` |
|-------|--------------------------|
| `INITIAL_PURCHASE`, `RENEWAL` | `isPremium: true` |
| `BILLING_ISSUE` | `isPremium: true`, `isInGracePeriod: true` |
| `EXPIRATION`, `CANCELLATION` | `isPremium: false` |
| Ostalo | 200 OK, bez write |

Header: `x-revenuecat-signature` (HMAC-SHA256).

---

## App Check (T-134)

| Platforma | Native provider | Console |
|-----------|-----------------|---------|
| iOS | `appAttestWithDeviceCheckFallback` | Firebase → App Check → App Attest |
| Android | `playIntegrity` | Firebase + Play Integrity API (Google Cloud) |
| Dev | Debug token | `FIREBASE_APP_CHECK_DEBUG_TOKEN` — **nikad u produkcijskom buildu** |

`claudeProxy` trenutno **samo logira** missing token u produkciji (hard 401 kasnije).

---

## Environment varijable

| Datoteka | Svrha |
|----------|--------|
| `.env.example` | Predložak za Expo app |
| `functions/.env.example` | Predložak za lokalni CF emulator |
| EAS Secrets | Production/preview build env |
| Firebase Functions config / Secret Manager | `ANTHROPIC_API_KEY`, webhook secret |
| GitHub `EXPO_TOKEN` | OTA + EAS build u Actions |

### Root (Expo app) — iz `.env.example` + kod

| Varijabla | Servis | Gdje |
|-----------|--------|------|
| `EXPO_PUBLIC_FIREBASE_*` (6×) | Firebase | Native + mirror u env |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Sign-In | `auth.ts` |
| `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` | RevenueCat | `revenuecat.ts` |
| `EXPO_PUBLIC_CLAUDE_PROXY_URL` | CF | `anthropic.ts` |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | Expo push | `notifications.ts` |
| `FIREBASE_APP_CHECK_DEBUG_TOKEN` | App Check dev | Native debug provider |

**Napomena:** `ANTHROPIC_API_KEY` u root `.env.example` je za **lokalne skripte** (`npm run translate`) — ne smije ući u EAS client bundle. U produkciji samo u Functions.

**Root `.env.example` redovi 19–22** (`RESEND_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `FREE_TIER_MODEL`): namijenjeni **lokalnom CF emulatoru** (`functions/.env` ili kopija) — na produkciji postavi preko **Firebase Functions secrets**, ne preko EAS client env.

**Još nema u kodu (Android):** `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` — dodaj kad aktiviraš Play Store.

### Cloud Functions — iz `functions/.env.example`

| Varijabla | Servis |
|-----------|--------|
| `ANTHROPIC_API_KEY` | Anthropic |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat webhook HMAC |
| `FREE_TIER_MODEL` | Model fallback |
| `RESEND_API_KEY` | PHASE-2 |
| `RESEND_FROM` | PHASE-2 (PLAN: `Captive <noreply@captiveapp.com>`) |

---

## Firebase — proizvodi

| Proizvod | Status |
|----------|--------|
| Authentication | ✅ |
| Cloud Firestore | ✅ |
| Analytics | ✅ |
| Remote Config | ✅ |
| App Check | ✅ |
| Cloud Functions v2 | ✅ |
| Cloud Scheduler (via `onSchedule`) | ✅ |
| Cloud Storage | ❌ |
| FCM | ❌ — push = **Expo Push API** |
| Crashlytics | ❌ (post-MVP) |
| Firebase Emulator Suite | ✅ dev/test (`firestore`, `auth`, `functions`) |

**Firestore kolekcije (iz `firestore.rules` + kod):**

| Putanja | Tko piše | Tko čita (client) |
|---------|----------|-------------------|
| `/users/{uid}` | Client (bez `isPremium` / `isInGracePeriod`) | Owner |
| `/captions/{id}` | Client | Owner |
| `/usage/{uid}/daily/{date}` | **Samo CF** (`claudeProxy`) | Owner read |
| `/usage/{uid}/demo/*` | **Samo CF** | Owner read |
| `/usage/{uid}` | — | Owner delete (account delete) |
| `/rate_limits/{uid}` | **Samo CF** (`claudeProxy`) | ❌ client |
| `/caption_reports/{id}` | Client create (hash, ne raw text) | ❌ client read |
| `/email_sequence/{uid}` | **Samo CF** (PHASE-2 Resend) | ❌ client |

---

## RevenueCat + Apple IAP

| Polje | Vrijednost |
|-------|------------|
| Entitlement | `premium` |
| Monthly | `com.captiveapp.premium.monthly` — $9.99/mj |
| Annual | `com.captiveapp.premium.annual` — $79.99/god (7-day trial u PLAN) |
| Webhook | `revenuecatWebhook` |
| Flow | `docs/PREMIUM_FLOW.md` |
| Upravljanje pretplatom u appu | `https://apps.apple.com/account/subscriptions` |

---

## Expo / EAS

| Profil | Kanal | Namjena |
|--------|-------|---------|
| `development` | `development` | Simulator + dev client |
| `preview` | `preview` | Internal / TestFlight |
| `production` | `production` | App Store + OTA |

| Workflow | Trigger | Što radi |
|----------|---------|----------|
| `pr.yml` | PR → `main` | typecheck, lint, unit tests (bez tajni) |
| `main.yml` | push `main` | `eas update --channel production` (`EXPO_TOKEN`) |
| `release.yml` | `workflow_dispatch` | `eas build` iOS production (`EXPO_TOKEN`) |

**EAS Submit:** `eas.json` → `submit.production` — upload u **App Store Connect** (npr. `eas submit` nakon builda).

**Kanali OTA:** `development`, `preview`, `production` (usklađeno s `eas.json` build profilima).

**Paketi:** `expo-dev-client` (dev buildovi), `expo-notifications` (push). Nema `expo-updates` u `package.json` — OTA ide preko **EAS CLI** u CI.

**Push credentials (operativno, isti Expo račun):** iOS **APNs key/cert** i Android **FCM** postavljaš u Expo projektu (`expo.dev` → Credentials). Nije zaseban SaaS račun, ali bez toga production push ne radi (limitReset šalje na `exp.host`).

**Preview build:** `resourceClass: m-medium` na iOS — može utjecati na EAS billing kad pređeš free tier.

---

## Legal hosting

| URL u `legal.ts` | Izvor sadržaja u repou |
|----------------|------------------------|
| `/privacy/` | `docs/legal/privacy-policy.md` |
| `/terms/` | `docs/legal/terms-of-service.md` |
| `/support/` | PLAN / store metadata |

Deploy na Cloudflare Pages — **nije** u `firebase.json`.

---

## Vanjski API pozivi u runtimeu

| Endpoint | Tko zove |
|----------|----------|
| `{EXPO_PUBLIC_CLAUDE_PROXY_URL}` | App |
| `api.anthropic.com` | CF `claudeProxy`; lokalno `scripts/translate.ts` |
| RevenueCat SDK + Apple StoreKit | App (`api.revenuecat.com` preko SDK-a) |
| Firebase (`*.googleapis.com`, Firestore, Auth) | App native |
| Google Sign-In (OAuth tokeni) | App native SDK |
| `exp.host/--/api/v2/push/send` | CF `limitReset` |
| `apps.apple.com/account/subscriptions` | App (Settings / DunningBanner) |
| `captiveapp.pages.dev` | App (legal linkovi) |
| `mailto:captiveapp.support@gmail.com` | App (support / export) |

---

## Dev / CI alati (bez SaaS troška)

| Alat | Uloga |
|------|-------|
| `firebase-tools` CLI | Deploy rules, functions, emulator |
| Firebase Emulator | Planirano za `npm run test:integration` — **nema** `src/__tests__/integration/` datoteka još |
| Maestro | E2E plan (T-120) — `e2e/` **još prazan** |
| Husky + lint-staged | Pre-commit |
| Jest + RNTL | 15 unit test datoteka u `src/__tests__/unit/` |
| `xcpretty` | iOS build log (skripta u package.json) |
| Lokalni fontovi | `assets/fonts/` — nema Google Fonts CDN |
| `scripts/translate.ts` | Lokalno → **Anthropic** (odvojeno od app runtime) |
| `scripts/check-translations.ts` | Lokalno, bez vanjskog API-ja |
| `scripts/pseudolocalize.ts` | Lokalno, bez vanjskog API-ja |
| Xcode + iOS Simulator | Lokalni build (`npm run ios:sim`) — nije SaaS |
| `plugins/withFirebaseModularHeaders.js` | Native build (Firebase 12.x + Expo 54) |
| `store-listings/`, `docs/store/` | ASC copy — nije zaseban SaaS |
| `design-system/` | Interni design doc — nije SaaS |

---

## Mapiranje tajni

| Tajna | Gdje | Git? |
|-------|------|------|
| `GoogleService-Info.plist` | Root | ❌ |
| `google-services.json` | Root (Android) | ❌ |
| `*.p8`, `*.p12`, `*.keystore` | Lokalno / EAS | ❌ |
| `EXPO_PUBLIC_*` (Firebase, RC iOS, Google web) | EAS + `.env` | ⚠️ public keys |
| `ANTHROPIC_API_KEY` | Functions + lokalno translate | ❌ |
| `REVENUECAT_WEBHOOK_SECRET` | Functions | ❌ |
| `EXPO_TOKEN` | GitHub Actions | ❌ |
| App Store Connect API key | EAS credentials | ❌ |
| App Check debug token | `.env` dev only | ❌ |
| Dashboard lozinke | Password manager + **SERVICES.private.md** | ❌ |

---

## Evidencija troškova po mjesecima

Vodi u **`SERVICES.private.md`**.

| Mjesec | Firebase | Anthropic | Apple (1/12) | RC fee | Expo | CF Pages | Email host | **Ukupno** |
|--------|----------|-----------|--------------|--------|------|----------|------------|------------|
| 2026-05 | | | | | | | | |

---

## Kalendar obnove

| Servis | Podsjetnik |
|--------|------------|
| Apple Developer ($99) | 30 dana prije |
| `captiveapp.com` domena | Kad registriraš |
| Firebase Blaze invoice | Mjesečno |
| Anthropic spend | Mjesečno |
| Expo plan | Ako pređeš free build limit |
| RevenueCat | Kad prijeđeš MTR prag |
| Cloudflare Pages | Free — nema obnove osim domene |

---

## Planirano / nije aktivno

| Stavka | Napomena |
|--------|----------|
| Resend + email CF | U `package.json`, nije u `functions/src/index.ts` export |
| Crashlytics | PLAN post-MVP |
| Maestro E2E | T-120, folder `e2e/` prazan |
| `captiveapp.com` + Workspace emaili | PLAN vs trenutni Gmail + Pages |
| Android RC key + Play launch | `app.json` android spreman |
| Hard App Check 401 na proxy | Nakon TestFlight |
| OpenAI fallback | **Nema** u CAPTIVE (za razliku od drugih projekata) |

---

## Checklist launch

- [ ] Firebase `captive-dfd7b`: Blaze, Auth provideri, rules/indexes deploy
- [ ] `claudeProxy` live; `EXPO_PUBLIC_CLAUDE_PROXY_URL` na EAS
- [ ] Anthropic spend limiti
- [ ] RevenueCat + ASC IAP + webhook URL
- [ ] Apple: Sign in with Apple, ASC legal URL = `legal.ts`
- [ ] EAS production build + TestFlight
- [ ] Cloudflare Pages = URL-ovi u `legal.ts`
- [ ] Email strategija: Gmail vs `@captiveapp.com` — jedan kanonski set
- [ ] `SERVICES.private.md` popunjen
- [ ] App Check debug (dev) → enforce (prod) kad spreman

---

## Kako koristiti

1. **`SERVICES.md`** — struktura i audit (Git).  
2. **`SERVICES.private.md`** — lozinke, ključevi, USD, datumi (gitignored).  
3. Nakon fakture — ažuriraj mjesečnu tablicu u private.  
4. Kad promijeniš URL/email — ažuriraj **§ Usklađenost** i ASC.

**Povezano:** [`CLAUDE.md`](CLAUDE.md) · [`docs/LIMIT_POLICY.md`](docs/LIMIT_POLICY.md) · [`docs/PREMIUM_FLOW.md`](docs/PREMIUM_FLOW.md) · [`STATUS.md`](STATUS.md) · [`docs/legal/privacy-policy.md`](docs/legal/privacy-policy.md)

---

## Audit pokrivenosti (revizija 3 — 2026-05-22)

**Metoda:** cijeli `src/`, `functions/src/`, `scripts/`, `firestore.rules`, `app.json`, `eas.json`, `.firebaserc`, `.env.example`, `functions/.env.example`, `.github/workflows/*`, `package.json` (deps), `docs/legal/*`, `src/constants/legal.ts`, `store-listings/`, grep `process.env` · `https://` · `fetch(` · `Linking.openURL` · Firestore putanje.

| # | Provjera | Rezultat |
|---|----------|----------|
| 1 | Firebase project ID | ✅ `captive-dfd7b` |
| 2 | `src/services/*.ts` | ✅ 9/9 modula |
| 3 | Aktivne CF (export iz `index.ts`) | ✅ 3 |
| 4 | PHASE-2 CF (email + unsubscribe) | ✅ dokumentirano, nije exportano |
| 5 | Auth provideri | ✅ anonymous, email, Google, Apple |
| 6 | Password reset email | ✅ Firebase Auth (ne Resend) |
| 7 | Sve env varijable u kodu | ✅ mapirane; `EAS_PROJECT_ID` u `.env.example` |
| 8 | CF secrets u root `.env.example` | ✅ napomena: emulator / Firebase secrets |
| 9 | Gitignored tajne | ✅ |
| 10 | URL/email tri razine | ⚠️ § Usklađenost (nije novi SaaS) |
| 11 | Firestore sve kolekcije u rules | ✅ uklj. `rate_limits`, `caption_reports`, `email_sequence` |
| 12 | `claudeProxy` rate limit | ✅ `/rate_limits/{uid}` |
| 13 | RC webhook eventi | ✅ 6 tipova u switchu |
| 14 | Vanjski HTTPS u `src/` | ✅ samo legal, Apple subscriptions, mailto |
| 15 | Vanjski HTTPS u `functions/` | ✅ Anthropic + exp.host |
| 16 | EAS build + OTA + submit | ✅ |
| 17 | Social platform API | ✅ **nema** |
| 18 | Integration test datoteke | ⚠️ skripta postoji, folder **prazan** |
| 19 | Maestro `e2e/` | ⚠️ prazan (T-120) |
| 20 | Android RC env | ⚠️ budućnost |
| 21 | Expo device API (clipboard, haptics) | ✅ nije SaaS |
| 22 | NetInfo | ✅ nije SaaS |
| 23 | `react-native-paper` | ✅ **nije** u projektu (CLAUDE.md zastarjelo) |
| 24 | Cloudflare wrangler u repou | ✅ nema — deploy vjerojatno ručno/Git u CF dashboardu |
| 25 | PLAN marketing (BetaFamily, društvene mreže) | ✅ nije integrirano u app — izvan SERVICES |

**Zaključak (rev. 4):** Da — **siguran sam** za popis **plaćenih SaaS računa** koje app + CF koriste danas (tablica §0 + master tablica). Treći audit nije našao novi servis.

**Nije “falio servis”, nego obavezna postavka na već poznatim računima:** APNs/FCM credentials (Expo), IAP produkti (ASC), Firebase Auth email predlošci, webhook URL u RevenueCat.

**Izvan popisa SaaS (namjerno):** Apple/Google **billing/OAuth serveri** (dio Apple/Google/RC), `design-system/` Google Fonts link (samo design doc, app koristi lokalne fontove), test alati bez cloud računa.
