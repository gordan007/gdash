# FlowKeep — evidencija servisa i troškova

> **Sigurnost:** Ova datoteka je u Git repou. Za **stvarne** lozinke i API ključeve koristi `SERVICES.private.md` (gitignored). Prvi put: `cp SERVICES.private.example.md SERVICES.private.md`

**Zadnje ažuriranje:** 2026-05-22 (auto-popunjeno iz repoa, `.env.local`, live provjera `flowkeep.dev`)  
**Tajne (API ključevi, lozinke):** [`SERVICES.private.md`](./SERVICES.private.md) — gitignored  
**Prod domena:** https://flowkeep.dev  
**Support email:** support@flowkeep.dev  
**Lokalni repo folder:** `FlowKeep` · **GitHub remote:** `gordan007/flowkeep-app` (private)

### Što je auto-popunjeno (2026-05-22)

Iz repoa: URL-ovi, GitHub org, env vrijednosti, bundle ID, verzije, Plausible script ID, status live stranica.  
U **`SERVICES.private.md`**: puni `RESEND_API_KEY` i env blok za Vercel.

| Još **moraš** sam (nema u Gitu) | |
|--------------------------------|--|
| Apple ID, Team ID, app-specific password | |
| Login za Vercel / Resend / Plausible / Lemon Squeezy | |
| Registrar domene, MX za support@ | |
| Mjesečni iznosi s faktura | |
| Zamijeniti `REPLACE` u Lemon Squeezy checkout URL | |
| Sparkle ED25519 ključevi | |

**Revizija #3 (2026-05-22):** ponovno pregledano svih **22 Swift** datoteka u `FlowKeep/` (samo `Sparkle` + Apple frameworki), **cijeli** `landing/` (jedini vanjski script = Plausible), `.github/workflows/ci.yml`, `project.yml`, `Info.plist`, `AppConfig.swift`, env primjer — **nema skrivenog trećeg SaaS-a u kodu.**

---

## Sažetak mjesečnih troškova

| Stavka | Plan (poznato) | Mjesečno (EUR) | Godišnje (EUR) | Napomena |
|--------|----------------|----------------|----------------|----------|
| Apple Developer Program | Individual | _upiši_ | 99 | Team ID još `YOUR_TEAM_ID` |
| Vercel (landing) | _upiši_ | _upiši_ | | Projekt `flowkeep-app`, live na `.dev` |
| Resend | Free (pretpostavka) | 0 | | Audience ID u env |
| Plausible Analytics | _upiši_ | _upiši_ | | Script aktivan na produkciji |
| Lemon Squeezy | Store | _% od prodaje_ | | Checkout `/buy/REPLACE` |
| GitHub (+ Actions) | Free (gordan007) | 0 | | Private repo `flowkeep-app` |
| Domena `flowkeep.dev` | _upiši registrar_ | _upiši_ | _upiši_ | Vercel hosting potvrđen |
| Email (support@) | _upiši_ | _upiši_ | | Adresa fiksna u kodu |
| Google Search Console | Besplatno | 0 | | Planirano |
| Vercel Analytics | — | 0 | | Planirano |
| **UKUPNO (fiksno)** | | **_upiši_** | **99+** | Cijene planova samo u dashboardima |

---

## Master tablica — svi servisi

| # | Servis | Svrha u projektu | URL / dashboard | Username / email | Lozinka / secret | Env var / lokacija | Plan | Mjesečno | Godišnje | Obnova | Status |
|---|--------|------------------|-----------------|------------------|------------------|-------------------|------|----------|----------|--------|--------|
| 1 | **Apple Developer** | Signing, notarizacija, Developer ID | https://developer.apple.com | **gordan.valenta@gmail.com** | → `SERVICES.private.md` | `ExportOptions.plist` → `YOUR_TEAM_ID` | $99/god | — | 99 EUR | godišnje | ☐ |
| 2 | **Vercel** | Hosting Next.js landinga | https://flowkeep.dev · https://flowkeep-app.vercel.app | **gordan.valenta@gmail.com** | Env ×4 → private | `flowkeep-app`, region **fra1** | _plan upiši_ | _upiši_ | | | ✅ Live |
| 3 | **Resend** | Waitlist / audience | https://resend.com/api-keys | **gordan.valenta@gmail.com** | `re_Hg4ax…` → **private** | Audience `40bab1f1-0f56-499e-af4d-859c184b58a7` | Free? | 0 | | | 🔄 |
| 4 | **Plausible** | Analytics | https://plausible.io/flowkeep.dev | **gordan.valenta@gmail.com** | Script ID (javno u kodu) | `pa-tQW_Cq_UV3Sg2asjsBMHO.js` | _plan upiši_ | _upiši_ | | | ✅ |
| 5 | **Lemon Squeezy** | Plaćanja + licence **€19** | https://flowkeep.lemonsqueezy.com | **gordan.valenta@gmail.com** | Store API → private | `…/buy/REPLACE` (još placeholder) | % fee | var. | | | 🔄 |
| 6 | **GitHub** | Source + CI | https://github.com/gordan007/flowkeep-app | **gordan007** | PAT → private | `git@` remote: `…/flowkeep-app.git` | Free? | 0 | | | ✅ |
| 7 | **GitHub Releases** | DMG + appcast | https://github.com/gordan007/flowkeep-releases | **gordan007** | — | Public repo; **još nema releasea** (DMG 404) | Free | 0 | | | ⚠️ |
| 8 | **Domena** | `flowkeep.dev` | https://flowkeep.dev | _registrar → private_ | — | NS: `vercel-dns.com` · HTTP 200 | _upiši_ | _upiši_ | godišnje | ✅ |
| 9 | **Email hosting** | support@flowkeep.dev | **support@flowkeep.dev** | _provider → private_ | — | MX _upiši_ | _upiši_ | | | ☐ |
| 10 | **Sparkle** | Auto-update | https://github.com/gordan007/flowkeep-releases (feed) | — | ED25519 → private | `REPLACE_WITH_GENERATED_ED25519_PUBLIC_KEY` | OSS | 0 | | | ☐ |
| 11 | **Next.js / Node** | Landing stack | — | — | — | Next **14.2.5**, Node **20** (`package.json`, CI) | OSS | 0 | | | ✅ |
| 12 | **XcodeGen** | Generiranje .xcodeproj | https://github.com/yonaskolb/XcodeGen | — | — | `brew install xcodegen` | OSS | 0 | | | ✅ |
| 13 | **GitHub Actions** | CI macOS + landing build | `.github/workflows/ci.yml` | — | — | `macos-15` + `ubuntu-latest` | Ovisi o planu | | | | ✅ |
| 14 | **Apple Notary Service** | Notarizacija DMG | https://developer.apple.com/notary | Apple ID | App-specific password | `xcrun notarytool` | Uklj. u Dev Program | — | 99 | — | ☐ |
| 15 | **npm Registry** | `npm ci` / dependencies | https://www.npmjs.com | — | — | `landing/package-lock.json` | Besplatno | 0 | | | ✅ |
| 16 | **Google Fonts (Inter)** | Tipografija landingu | https://fonts.google.com | — | — | `next/font/google` u `layout.tsx` | Self-host na build | 0 | | | ✅ |
| 17 | **Homebrew** | Dev: XcodeGen | https://brew.sh | — | — | `Makefile`, README | Besplatno | 0 | | | ✅ |
| 18 | **Xcode** | Build macOS app | App Store / developer.apple.com | — | — | Lokalno | Besplatno | 0 | | | ✅ |
| 19 | **Swift Package Manager** | Sparkle dependency | https://github.com/sparkle-project/Sparkle | — | — | `project.yml` | Besplatno | 0 | | | ✅ |

**Legenda statusa:** ☐ nije postavljeno · 🔄 u tijeku · ✅ aktivno

### Planirano (strategija / checklist, još nije u kodu)

| Servis | Svrha | Gdje spomenuto | Status |
|--------|-------|----------------|--------|
| **Google Search Console** | SEO, indeksacija `flowkeep.dev` | `PRODUCT_STRATEGY.md` checklist | ☐ |
| **Vercel Analytics** | Sekundarna web analitika | `PRODUCT_STRATEGY.md` checklist | ☐ |
| **Mac App Store Connect** | App Store distribucija (IOPM-only build) | `PRODUCT_STRATEGY.md` Part 10 | ☐ budućnost |
| **Vercel Edge Middleware** | A/B testovi landingu | `PRODUCT_STRATEGY.md` §9 | ☐ budućnost |
| **iCloud** | Sync postavki (V2.0) | `PRODUCT_STRATEGY.md` roadmap | ☐ budućnost |

### Marketing kanali (računi za lansiranje — **nema API u kodu**)

| Kanal | U strategiji | Napomena |
|-------|-------------|----------|
| Product Hunt | Da | Launch listing (može imati trošak “Ship”) |
| Hacker News | Da | Organski post |
| Reddit | `/r/macapps`, itd. | Organski |
| Google SEO | Da | + Search Console (planirano) |
| Twitter/X | Dev community | OG meta u `layout.tsx` (preview kartice) |

### Eksplicitno **nije** u projektu (ne dodavati u troškove)

Gumroad, Stripe (direktno), Supabase, Firebase, Auth0, Sentry, PostHog, Mixpanel, GA4, Cloudflare Workers, SendGrid, Mailchimp — nema integracije u kodu.

---

## Detalji po servisu

### 1. Apple Developer Program

| Polje | Vrijednost |
|-------|------------|
| Apple ID | **gordan.valenta@gmail.com** |
| Team ID | `YOUR_TEAM_ID` (`ExportOptions.plist` — **još nije postavljen**) |
| Bundle ID | `com.flowkeep.app` |
| App verzija | `1.0.0` (build `1`) — `Info.plist` |
| App-specific password | Za `xcrun notarytool` |
| Developer ID cert | Xcode → Settings → Accounts |
| Godišnja cijena | **99 USD/EUR** (Apple naplata) |
| Renewal datum | |

**Korištenje u projektu:** notarizacija DMG, `ExportOptions.plist`, hardened runtime, `Release-Direct` / `Release-AppStore` konfiguracije u `project.yml`.

**Pod-servisi (isti Apple račun):**

| Pod-servis | Alat / URL |
|------------|------------|
| Code signing | Xcode, Developer ID Application cert |
| Notary Service | `xcrun notarytool submit` → `notary.apple.com` |
| Stapling | `xcrun stapler staple` |
| App Store Connect | Buduća Mac App Store verzija (15–30% provizija po prodaji) |

---

### 2. Vercel

| Polje | Vrijednost |
|-------|------------|
| Projekt | `flowkeep-app` |
| Production URL | https://flowkeep.dev (live, HTTP 200) |
| Preview URL | https://flowkeep-app.vercel.app (live) |
| Vercel region (header) | `fra1` (Frankfurt) |
| Git repo povezan | `https://github.com/gordan007/flowkeep-app.git` |
| Deploy | `npx vercel` |

**Environment variables (vrijednosti iz `landing/.env.local` — kopirati na Vercel Production):**

| Varijabla | Trenutna vrijednost | Tajna? |
|-----------|---------------------|--------|
| `RESEND_API_KEY` | postavljen lokalno — puni ključ u `SERVICES.private.md` | Da |
| `RESEND_AUDIENCE_ID` | `40bab1f1-0f56-499e-af4d-859c184b58a7` | Da (ID) |
| `NEXT_PUBLIC_DOWNLOAD_URL` | `https://github.com/gordan007/flowkeep-releases/releases/latest/download/FlowKeep.dmg` | Ne (public) |
| `NEXT_PUBLIC_LEMON_SQUEEZY_URL` | `https://flowkeep.lemonsqueezy.com/buy/REPLACE` | Ne (public, **još REPLACE**) |

| Polje | Vrijednost |
|-------|------------|
| Plan | |
| Mjesečna cijena | |
| Billing email | |
| TLS / SSL cert | Automatski (Let's Encrypt preko Vercela) |
| Edge Middleware | Nije implementirano (plan u strategiji) |
| Vercel Analytics | Nije uključeno u kod (planirano) |
| Deploy alat | **Vercel CLI** (`npx vercel`) — koristi se za deploy, nije u `package.json` |
| Node.js runtime | 20+ (lokalno + GitHub Actions + Vercel serverless) |

**Landing rute (Next.js App Router):**

| Ruta | Svrha |
|------|-------|
| `/` | Marketing landing |
| `/eula` | EULA (Lemon Squeezy + budući App Store) |
| `/api/subscribe` | POST → Resend audience |
| `/sitemap.xml`, `/robots.txt` | SEO |

---

### 3. Resend

| Polje | Vrijednost |
|-------|------------|
| Dashboard | https://resend.com |
| API Key | `re_Hg4axEAY_…1SXi` (puni ključ samo u **`SERVICES.private.md`**) |
| Audience ID | `40bab1f1-0f56-499e-af4d-859c184b58a7` |
| Audience naziv | _upiši iz Resend dashboarda_ |
| DPA / GDPR | https://resend.com/legal/dpa |
| Plan | Free (do 3k/mj) / Pro |
| Mjesečno | 0 (free) |
| API endpoint | `https://api.resend.com` (`contacts.create`) |
| Šalje email kampanje? | **Ne** — samo pohrana kontakta u audience |
| Verifikacija domene | Potrebna tek ako kasnije šalješ mail **s** `noreply@flowkeep.dev` |

**Lokalno:** `landing/.env.local` (gitignored)  
**Primjer:** `landing/.env.local.example`  
**Kod:** `landing/app/api/subscribe/route.ts`, `landing/components/ui/EmailCapture.tsx` (GDPR checkbox)

---

### 4. Plausible Analytics

| Polje | Vrijednost |
|-------|------------|
| Site ID / domena | `flowkeep.dev` |
| Script URL (u kodu) | `https://plausible.io/js/pa-tQW_Cq_UV3Sg2asjsBMHO.js` |
| Custom events | `download_click`, `buy_click`, `email_subscribe`, **`faq_expand`** |
| Plan | |
| Mjesečno | |
| Cookie banner | Nije potreban (cookieless) |
| Dashboard login | https://plausible.io |

**Eventi u kodu** (`landing/lib/analytics.ts`):

| Event | Gdje se pali |
|-------|----------------|
| `download_click` | Hero, Pricing, FinalCTA (preko `Button` `trackAs`) |
| `buy_click` | Pricing (Lemon Squeezy link) |
| `email_subscribe` | `EmailCapture` nakon uspješnog POST-a |
| `faq_expand` | `FAQ.tsx` — props: `{ question: faq.q }` |

**Pageview:** automatski (Plausible script). **Nema** Vercel Analytics u kodu.

---

### 5. Lemon Squeezy

| Polje | Vrijednost |
|-------|------------|
| Store URL | https://flowkeep.lemonsqueezy.com |
| Checkout URL | `https://flowkeep.lemonsqueezy.com/buy/REPLACE` (env + `AppConfig.swift` — **zamijeni REPLACE**) |
| Product | FlowKeep, one-time **€19** |
| License API (app) | `api.lemonsqueezy.com/v1/licenses/activate` + `/validate` |
| Store API key | Dashboard (ako treba server-side) — **private** |
| Provizija | % po transakciji (vidi LS pricing) |
| **Stripe (sub-procesor)** | Lemon Squeezy procesira kartice preko Stripea — poveži Stripe u LS dashboardu (nema direktne Stripe integracije u kodu) |
| Merchant of Record | Lemon Squeezy (PDV/VAT handling) |

**macOS app:** validacija licence iz `LicenseValidator.swift` (bez secret key u app bundleu). Offline grace period kod mrežne greške.  
**Lemon Squeezy aktivacija:** `instance_name=FlowKeep-macOS` u POST bodyju.

**Runtime pozivi iz aplikacije (korisnik mora imati internet pri aktivaciji):**

| Endpoint | Metoda |
|----------|--------|
| `https://api.lemonsqueezy.com/v1/licenses/activate` | POST |
| `https://api.lemonsqueezy.com/v1/licenses/validate` | POST (fallback na 422) |

**Webhook:** nije implementiran u repou.

---

### 6. GitHub

| Repo | Vidljivost | Svrha |
|------|------------|-------|
| `gordan007/flowkeep-app` | Private | Source kod |
| `gordan007/flowkeep-releases` | Public | DMG, `appcast.xml`, Sparkle feed |

| Polje | Vrijednost |
|-------|------------|
| GitHub username | gordan007 |
| Personal Access Token | Za CI signing (budućnost) — **private** |
| Actions secrets | `APPLE_*`, `SPARKLE_*` kad dodaješ signing u CI |
| Plan | Free / Team |
| Mjesečno | |

**CI:** `.github/workflows/ci.yml`

| Job | Runner | Koraci |
|-----|--------|--------|
| `build-macos` | `macos-15` | checkout → brew xcodegen → `make gen` → xcodebuild (bez signinga) → unit testovi |
| `build-landing` | `ubuntu-latest` | checkout → Node 20 → `npm ci` → `npm run build` |

**Marketplace akcije:** `actions/checkout@v4`, `actions/setup-node@v4`

**Napomena o trošku:** `flowkeep-app` je **private** → macOS Actions minuti se naplaćuju nakon free allowancea (provjeri GitHub Billing).

**Sparkle / korisnik preuzima s:**

| Asset | URL |
|-------|-----|
| DMG | https://github.com/gordan007/flowkeep-releases/releases/latest/download/FlowKeep.dmg |
| appcast.xml | https://github.com/gordan007/flowkeep-releases/releases/latest/download/appcast.xml |

---

### 7. Domena `flowkeep.dev`

| Polje | Vrijednost |
|-------|------------|
| Registrar | _npr. Namecheap, Cloudflare, Porkbun…_ |
| Login | |
| DNS provider | |
| A/CNAME → Vercel | |
| WHOIS renewal | |
| Godišnja cijena | |
| Istek registracije | |
| Subdomena LS | `flowkeep.lemonsqueezy.com` (Lemon Squeezy DNS, ne registrar) |

**Napomena:** Stara domena `flowkeep.app` više **nije** u kodu (migrirano na `.dev`). Ako još posjeduješ `.app`, dodaj kao zaseban redak u privatnoj evidenciji.

---

### 8. Email — support@flowkeep.dev

| Polje | Vrijednost |
|-------|------------|
| Provider | _Google Workspace, Fastmail, Cloudflare Email Routing…_ |
| Inbox login | |
| Forwarding | |
| Mjesečno | |

---

### 9. Sparkle (auto-update)

| Polje | Vrijednost |
|-------|------------|
| SPM verzija | `2.6.0+` (`project.yml`) |
| Runtime u appu | `MenuBarController.swift` — `SPUStandardUpdaterController`, “Check for Updates” |
| Appcast feed URL | `https://github.com/gordan007/flowkeep-releases/releases/latest/download/appcast.xml` |
| Public key (`SUPublicEDKey`) | `REPLACE_WITH_GENERATED_ED25519_PUBLIC_KEY` (**još placeholder**) |
| Private key | **Nikad u Git** — password manager |
| `sign_update` tool | Nakon builda DMG-a (Sparkle distribucija) |
| Korisnik → update check | Sparkle → GitHub appcast + enclosure URL |

---

### 10. Google Fonts + Next.js font pipeline

| Polje | Vrijednost |
|-------|------------|
| Font | Inter (400, 500, 600, 700) |
| Import | `landing/app/layout.tsx` — `next/font/google` |
| Produkcija | Next **self-hosta** font na buildu (nema `fonts.googleapis.com` u runtime) |
| Build-time | Preuzimanje s Google pri `npm run build` |
| GDPR | Spomenuto u Privacy sekciji uz Plausible |

---

### 11. npm Registry

| Polje | Vrijednost |
|-------|------------|
| Registry | https://registry.npmjs.org |
| Lockfile | `landing/package-lock.json` |
| Direktne prod ovisnosti | `next`, `react`, `resend`, `framer-motion`, `clsx` |
| Dev | `typescript`, `tailwindcss`, `postcss`, `autoprefixer` |

---

## Runtime mrežni pozivi (što stvarno ide van Maca)

| Izvor | Destinacija | Kada |
|-------|-------------|------|
| Landing (browser) | `flowkeep.dev` | Pregled stranice |
| Landing (browser) | `plausible.io` | Analytics script |
| Landing (server) | `api.resend.com` | POST `/api/subscribe` |
| Landing (link) | `api.lemonsqueezy.com` / checkout URL | Buy CTA |
| Landing (link) | `github.com/.../FlowKeep.dmg` | Download CTA |
| macOS app | `api.lemonsqueezy.com` | Aktivacija / validacija licence |
| macOS app | `github.com/gordan007/flowkeep-releases` | Sparkle update check + DMG |
| macOS app | `flowkeep.dev` | Privacy policy, fallback buy URL (browser) |
| macOS app | **nema** telemetrije / crash reportinga u cloud | `CrashLogger.swift` → lokalni disk |

---

## GDPR — sub-procesori (landing + prodaja)

| Sub-procesor | Podaci | Svrha |
|--------------|--------|-------|
| Vercel | IP (server logovi), hosting | Landing |
| Plausible | Anonimizirani pageview/eventi | Analytics |
| Resend | Email adresa (audience) | Waitlist |
| Lemon Squeezy + Stripe | Email kupca, plaćanje, license key | Prodaja |
| GitHub | — (samo download DMG-a, bez PII u appu) | Distribucija |

**macOS app (normalan rad):** nema cloud telemetrije; licence → Lemon Squeezy API; update → GitHub.

---

## macOS platforma (Apple, bez SaaS računa)

| API / feature | Datoteka | Napomena |
|---------------|----------|----------|
| IOPMAssertion | `IOPMActivityProvider.swift` | Power management |
| CGEvent | `CGEventActivityProvider.swift` | Zahtijeva Accessibility |
| SMAppService (Launch at Login) | `PreferencesManager.swift` | App mora biti u `/Applications/` |
| Accessibility prefs deep link | `PermissionsManager.swift` | `x-apple.systempreferences:…` |
| Keychain | `LicenseManager.swift` | `licenseKey`, `installFingerprint` · service `com.flowkeep.app` |
| Crash log | `CrashLogger.swift` | `~/Library/Application Support/FlowKeep/crash.log` (lokalno, bez clouda) |
| App Sandbox | `FlowKeep.entitlements` | **`false`** (direct distribucija) |

---

## Mapiranje tajni — gdje što živi

| Tajna | Gdje spremiti | U Git repou? |
|-------|---------------|--------------|
| Resend API key | Vercel Prod + `landing/.env.local` | ❌ |
| Resend audience ID | isto | ❌ |
| Lemon Squeezy checkout URL | Vercel + `AppConfig.swift` | ✅ (URL nije tajna) |
| Lemon Squeezy store API key | Dashboard / private doc | ❌ |
| Apple app-specific password | Keychain / private doc | ❌ |
| Sparkle ED25519 private key | Password manager | ❌ |
| Sparkle public key | `Info.plist` | ✅ |
| GitHub PAT | GitHub Secrets / private doc | ❌ |
| Apple Team ID | `ExportOptions.plist` | ⚠️ nije tajna, ali osobno |
| npm token | Rijetko potrebno | ❌ |
| Plausible account password | Dashboard | ❌ |
| Lemon Squeezy dashboard login | Dashboard | ❌ |

---

## Kalendar obnove

| Servis | Sljedeća obnova | Podsjetnik |
|--------|-----------------|------------|
| Apple Developer | | 30 dana prije |
| Domena flowkeep.dev | | 30 dana prije |
| Vercel (ako plaćeno) | | |
| Plausible | | |
| Resend (ako Pro) | | |
| npm (ako plaćaš org) | | |
| GitHub Actions (macOS minuti) | | |

---

## Lokalni / dev alati (bez SaaS računa)

| Alat | Uloga | U projektu |
|------|-------|------------|
| Sparkle (framework) | Auto-update | SPM u `project.yml` |
| XcodeGen | Generira `.xcodeproj` | `make gen` |
| Next.js, React, Tailwind, Framer Motion | Landing UI | `landing/` |
| Swift / Xcode | macOS app | `FlowKeep/` |
| Homebrew | Instalacija xcodegen | README |
| Python 3 + Pillow | `generate_icons.sh` | Lokalno generiranje ikona (`pip3 install Pillow`) |
| Make | Build shortcuts | `Makefile` |
| Vercel CLI | Deploy landingu | `npx vercel` (iz dev okruženja) |
| Apple Keychain | License key storage | `LicenseManager.swift` |
| macOS APIs | IOPMAssertion, CGEvent, Accessibility | Nema cloud troška |

**Opcionalno (tvoj workflow, nije u produkcijskom kodu):** Cursor IDE, Claude — `.claude/settings.local.json` (ne utječe na korisnike appa).

---

## Checklist pri launchu

- [ ] Apple Developer + Developer ID cert + Team ID u `ExportOptions.plist`
- [ ] Sparkle ključevi generirani, `SUPublicEDKey` u Info.plist
- [ ] DMG notariziran i na `flowkeep-releases`
- [ ] Vercel env vars (sva 4) na Production
- [ ] Resend audience + API key
- [ ] Lemon Squeezy product + checkout URL u env i `AppConfig.swift`
- [ ] Plausible site za `flowkeep.dev`
- [ ] DNS `flowkeep.dev` → Vercel
- [ ] support@flowkeep.dev radi
- [ ] `SERVICES.private.md` popunjen i backup u password manageru
- [ ] Google Search Console — verifikacija domene
- [ ] (Opcija) Vercel Analytics uključen
- [ ] GitHub Actions billing provjeren za private repo
- [x] OG slika `landing/public/og-image.png` — **1200×630 PNG** (u repou)
- [ ] Prvi GitHub Release na `flowkeep-releases` (DMG URL u env trenutno **404**)
- [ ] MX zapisi za support@ (trenutno **nema MX** na domeni)

---

## Audit log (što je provjereno)

| Područje | Datoteke / izvor |
|----------|------------------|
| Git remote | `origin` → `https://github.com/gordan007/flowkeep-app.git` |
| macOS mreža | `AppConfig.swift`, `LicenseValidator.swift`, `Info.plist`, svi `FlowKeep/**/*.swift` |
| Landing env | `landing/.env.local.example`, `subscribe/route.ts` |
| Landing linkovi / CTA | `Hero`, `Pricing`, `FinalCTA`, `Footer`, `Navigation`, `eula`, `not-found` |
| Analytics | `layout.tsx`, `lib/analytics.ts`, `Button.tsx`, `EmailCapture.tsx`, **`FAQ.tsx` (`faq_expand`)** |
| CI | `.github/workflows/ci.yml` |
| Dependencies | `landing/package.json`, `package-lock.json`, `project.yml` |
| Strategija / plan | `PRODUCT_STRATEGY.md`, `README.md` |
| Ikone | `generate_icons.sh` |
| Entitlements | `FlowKeep.entitlements` (sandbox off) |
| Export / signing | `ExportOptions.plist` |
| Dev alati u sesiji | `.claude/settings.local.json` (`npx vercel`, Resend curl) — nije produkcija |

**Revizija #2:** `faq_expand`, Stripe↔LS, Vercel CLI, Node runtime, GDPR sub-procesori, macOS API tablica, marketing kanali, iCloud plan, OG slika status.  
**Revizija #3:** granice evidencije, potvrda svih Swift `import`-ova, Sparkle `SPUStandardUpdaterController` + verzija 2.6.0.  
**Revizija #4 (2026-05-22):** kontrolna lista pokrivenosti (ispod) — potvrda da svaka vanjska ovisnost iz koda ima odjeljak u dokumentu.

---

## Kontrolna lista — je li sve iz repoa u dokumentu?

Svaki red = jedna stvar pronađena u kodu. **Odjeljak** = gdje je opisano u ovom dokumentu.

| # | Što postoji u repou | Odjeljak | U dokumentu? |
|---|---------------------|----------|--------------|
| 1 | `api.resend.com` + `RESEND_*` env | §3 Resend, Vercel env tablica | ✅ |
| 2 | `plausible.io` script + eventi | §4 Plausible | ✅ |
| 3 | `api.lemonsqueezy.com` + checkout URL | §5 Lemon Squeezy | ✅ |
| 4 | `instance_name=FlowKeep-macOS` (licenca) | §5 (runtime) | ✅ dodano |
| 5 | Stripe (preko LS, ne direktno) | §5 Stripe sub-procesor | ✅ |
| 6 | `github.com/gordan007/flowkeep-*` | §6–7 GitHub | ✅ |
| 7 | `flowkeep.dev` + sitemap/robots | §2 Vercel, §7 domena | ✅ |
| 8 | `flowkeep-app.vercel.app` | §2 Vercel | ✅ |
| 9 | Sparkle SPM + `SPUStandardUpdaterController` | §9–10, master #10 | ✅ |
| 10 | `SUFeedURL` / appcast na GitHub | §9 Sparkle | ✅ |
| 11 | Apple signing / notary / `ExportOptions` | §1, #14 | ✅ |
| 12 | `Release-Direct` / `Release-AppStore` | §1 Apple | ✅ |
| 13 | Keychain `com.flowkeep.app` + licence | macOS platforma | ✅ |
| 14 | `SMAppService` Launch at Login | macOS platforma | ✅ |
| 15 | IOPM + CGEvent + Accessibility URL | macOS platforma | ✅ |
| 16 | `CrashLogger` → `~/Library/.../FlowKeep/` | macOS platforma (lokalno) | ✅ dodano |
| 17 | Next.js 14.2.5 + npm paketi | #11, #15, §11 npm | ✅ |
| 18 | `next/font` Inter (Google Fonts build) | #16 | ✅ |
| 19 | GitHub Actions `macos-15` / Node 20 | #13 | ✅ |
| 20 | `support@flowkeep.dev` | §8, header | ✅ |
| 21 | OG/Twitter meta `/og-image.png` | Checklist (asset nedostaje u repou) | ✅ |
| 22 | Planirano: GSC, Vercel Analytics, App Store | Planirano tablica | ✅ |
| 23 | Gumroad, Sentry, Supabase, … | „Nije u projektu” | ✅ (namjerno isključeno) |

**Zaključak revizije #4:** u repou **nema** četvrtog SaaS-a koji nedostaje u dokumentu. Prazna polja u tablicama = podaci **izvan repoa** (login, cijene, registrar), ne zaboravljen servis.

### Što **nije** servis (ne treba u master tablici)

| Stavka | Zašto |
|--------|--------|
| Microsoft Teams / Slack / Zoom | Ciljani use-case korisnika, nema integracije |
| `CrashLogger` / Keychain / UserDefaults | Lokalno na Macu, bez cloud računa |
| Framer Motion, Tailwind, clsx | npm biblioteke (pokriveno pod #11/#15) |
| `PRODUCT_STRATEGY.md`, `README.md` | Interna dokumentacija |
| Cursor / Claude (`.claude/`) | Tvoj dev alat, ne produkcija |
| `localhost:3000` | Lokalni dev server |

---

## Kako koristiti ovaj dokument

1. **Struktura i URL-ovi** — ostaju u `SERVICES.md` (commit u Git).
2. **Lozinke i API ključevi** — upiši u `SERVICES.private.md` (kopiraj strukturu iz tablica gore).
3. **Mjesečne iznose** — ažuriraj redak „Sažetak mjesečnih troškova” nakon svake fakture.
4. **Kvartalno** — provjeri Plausible + Resend + Vercel usage i Lemon Squeezy payout.
