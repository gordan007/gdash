# gdash — UI design spec (Katteb-style)

**Referenca:** Katteb dashboard (light SaaS, rounded cards, sidebar, KPI row, charts).  
**Zadnje ažuriranje:** 2026-05-22 (iOS target)

Ovaj dokument je **obavezna** smjernica za sve UI ekrane gdash lokalne aplikacije.

### Ikone i zabranjeni emoji (obavezno)

- **Jedina ikon biblioteka:** [`lucide-react`](https://lucide.dev) — line icons, stroke 1.5–2, veličine `16` / `20` / `24`.
- **Zabrana:** emoji (Unicode emoji, Slack-style `:smile:`, emoji u labelama, statusima, gumbima, toastovima, praznim stanjima).
- **Status i checklist:** uvijek **Lucide ikona + tekst** (npr. `CircleCheck` + „Active“, `CircleAlert` + „Warning“, `Circle` + „Pending“).
- **Integracije / servisi:** brand gdje postoji u Lucide (`Github`, `Cloud`); inače generičke (`Server`, `Database`, `CreditCard`).
- **Jedan wrapper:** `components/ui/icon.tsx` — `size`, `className`, `aria-hidden` / `aria-label` za pristupačnost.

---

## Visual thesis

Čist, svijetli produkcijski dashboard: puno whitespacea, bijele kartice na svijetlo sivoj podlozi, crni primarni CTA, pastelni akcenti samo za grafove i status ikone — profesionalno kao moderni SaaS, ne „dev tool“ terminal estetika.

---

## Platforme (Mac + iPhone)

| Platforma | Shell | Instalacija |
|-----------|--------|-------------|
| **macOS** (primarno) | **Tauri 2** | `.app` u Applications |
| **iOS** (iPhone 14 Pro i noviji) | **Capacitor 6** | Xcode → TestFlight / Ad Hoc / (kasnije) App Store |

**Zajednički kod:** jedan `packages/ui` (React) — isti Katteb layout, Lucide, bez emojija.  
**Razdvojeno po platformi:** storage (Keychain), filesystem, „Pokreni dev“, poll scheduler u pozadini.

Nema javnog hosta gdasha na internetu. API pozivi idu **izravno s uređaja** (Mac ili iPhone) prema Vercel/GitHub/… — gdash sam ne naplaćuje ništa.

**Besplatni stack (cijeli proizvod):** open-source alati (Tauri, Capacitor, React, Lucide, Recharts) — **$0** licenca za app.

### Što radi na iPhoneu

| Funkcija | iOS |
|----------|-----|
| Home + projektni dashboard | Da (responsive) |
| Wizard / postavke projekta | Da |
| Osvježi metrike (API poll) | Da (foreground + Background Fetch ograničen) |
| Push obavijesti (CI failed, deploy error) | Faza 2 (APNs) |
| Otvori vanjski dashboard (Safari) | Da |
| Pokreni dev server u repo folderu | **Ne** (samo Mac) |
| Čitanje lokalnog `crash.log` (FlowKeep) | **Ne** (samo Mac) |
| Auto-detect repo putanje | **Ne** — ručni unos ili sync s Maca |

### Sync Mac ↔ iPhone (preporuka)

Projekti i (opcionalno) šifrirani config:

1. **iCloud Drive** — mapa `gdash/config.enc` koju Mac piše, iPhone čita (jedan Apple ID), ili  
2. **Ručno** — export/import QR ili datoteka pri prvom setupu na telefonu.

Tajne: **iOS Keychain** + Face ID; ne u plain JSON u iCloud bez enkripcije.

### iOS distribucija — besplatno za korisnika (prioritet)

**Pravilo:** gdash ne smije zahtijevati **novu** plaćenu pretplatu (nema gdash SaaS, nema obaveznog Apple računa samo za gdash).

| Način | Trošak | Kvaliteta na iPhoneu |
|--------|--------|----------------------|
| **A) PWA** — „Add to Home Screen“ | **0 €** | Isti React UI; ograničen background; idealno uz Mac na istom Wi‑Fi-u ili sync configa |
| **B) Xcode + besplatni Apple ID** | **0 €** | Pravi `.app` na uređaju; certifikat ~**7 dana**, pa ponovni build/sign (ručno) |
| **C) TestFlight** (postojeći plaćeni Developer račun) | **0 € dodatno** ako već plaćaš $99/god za CAPTIVE/FlowKeep | Najbolje iskustvo; **nije novi trošak** ako račun već imaš |

**Preporuka za „besplatno“:** MVP na iPhoneu = **PWA** (A); Mac = **Tauri** (besplatno). TestFlight (C) samo ako već koristiš isti Apple Developer Program — ne uvoditi novi trošak zbog gdasha.

**Zabranjeno za besplatni model:** obavezni Vercel/Supabase za sam gdash; plaćeni push servis samo za gdash; App Store listing s naplatom.

### Responsive UI (iPhone)

- **< 768px:** sidebar → **bottom tab bar** ili **hamburger drawer** (Lucide `Menu`, `LayoutDashboard`, `FolderKanban`, `Settings`).  
- KPI red: **2×2 grid** umjesto 4 u jednom redu.  
- Chartovi: puna širina, manja visina (220–260px).  
- Touch target min. **44×44 pt**.  
- Safe area: `env(safe-area-inset-*)` za Dynamic Island / home indicator.

---

## Tech stack (UI)

| Sloj | Izbor | Razlog |
|------|--------|--------|
| Shell (Mac) | **Tauri 2** | Lokalna `.app`, webview |
| Shell (iOS) | **Capacitor 6** | Native wrapper, App Store / TestFlight |
| UI | **React 19 + TypeScript** | Zajednički za Mac + iOS |
| Styling | **Tailwind CSS 4** | Responsive breakpoints |
| Komponente | **shadcn/ui** (customized) | Sidebar / drawer ovisno o platformi |
| Font | **Inter** (`@fontsource/inter`) | Isti na obje platforme |
| Grafikoni | **Recharts** | ResponsiveContainer na mobitelu |
| Ikone | **`lucide-react`** (jedini dopušteni set) | Bez emojija |
| Monorepo (predložak) | `apps/desktop` (Tauri) · `apps/ios` (Capacitor) · `packages/ui` | Jedan dizajn, dva shella |

---

## Design tokens

```css
/* Surfaces */
--bg-app: #f8f9fa;
--bg-sidebar: #ffffff;
--bg-card: #ffffff;
--bg-muted: #f1f3f5;

/* Text */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-muted: #9ca3af;

/* Borders & shadow */
--border-subtle: #e5e7eb;
--shadow-card: 0 1px 3px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.04);

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;

/* Primary actions */
--btn-primary-bg: #111827;
--btn-primary-fg: #ffffff;

/* Status accents (charts & badges only) */
--accent-blue: #93c5fd;
--accent-green: #86efac;
--accent-orange: #fdba74;
--accent-purple: #c4b5fd;
--accent-red: #fca5a5;

/* Semantic */
--status-ok: #16a34a;
--status-warn: #ca8a04;
--status-error: #dc2626;
```

**Pravilo:** pozadina aplikacije = `--bg-app`. Kartice = bijele + `--shadow-card` + `--radius-lg`. Ne koristiti tamnu temu u MVP-u.

---

## Layout shell (svaki ekran)

```
┌──────────────┬────────────────────────────────────────────────┐
│   Sidebar    │  Top bar: naslov | Settings | Bell | Refresh | Share* │
│   (240px)    ├────────────────────────────────────────────────┤
│              │  Main (max-width ~1280px, padding 24–32px)     │
│  Logo gdash  │  [ Hero / banner opcionalno ]                  │
│  Search ⌘K   │  [ KPI row — 4 kartice ]                     │
│              │  [ Grid: chart + side widget ]                 │
│  Nav         │  [ Bottom row: integracije / checklist ]       │
│              │                                                │
│  + Projekt   │                                                │
│  ─────────   │                                                │
│  User card   │                                                │
└──────────────┴────────────────────────────────────────────────┘
```

\* Share = opcionalno (export snapshot JSON / screenshot kasnije).

---

## Informacijska arhitektura

| Ruta | Ekran | Svrha |
|------|--------|--------|
| `/` | **Home** | Kartice svih projekata (agregat iz cachea) |
| `/projects/new` | **Wizard** | Setup projekta korak po korak |
| `/projects/:slug` | **Projektni dashboard** | Metrike + integracije tog projekta |
| `/projects/:slug/settings` | **Postavke projekta** | Connectori, ključevi, repo putanja |
| `/costs` | **Troškovi (global)** | Svi projekti — fiksno + varijabilno + ukupno |
| `/projects/:slug/costs` | **Troškovi projekta** | Stavke po servisu, plan, obnova, povijest |
| `/settings` | **Global** | Tema, poll interval, Keychain |

**Navigacija (sidebar):**

- MAIN: Dashboard (home), Projects (lista), **Costs** (`Wallet` / `Receipt`), + New Project
- PROJECT CONTEXT (kad je projekt odabran): Overview, Integrations, Checklist, **Costs**, Settings
- BOTTOM: status sync + verzija app

---

## Komponente (mapa na Katteb)

| Referenca (Katteb) | gdash komponenta | Sadržaj |
|--------------------|------------------|---------|
| Hero gradient card | `ProjectHero` | Naziv projekta, prod URL, CTA „Osvježi“, „Otvori repo“ |
| 4× KPI cards | `MetricCard` | Site status, CI, posjeti 7d, AI spend MTD |
| Traffic line chart | `TimeSeriesChart` | Plausible / Vercel Analytics (kad ima podataka) |
| Trending bar card | `ConnectorStatusCard` | Status po integraciji (Vercel, GitHub, …) |
| AI Tools row | `QuickActionCard` | Pokreni dev, Otvori dashboard, Dnevnik |
| Assistant list | `ChecklistPanel` | Stavke iz `SERVICES.md` (mapirano na ikone: pending / warning / ok) |
| Sažetak troškova | `CostSummaryRow` | Fiksno / mjesečno / godišnje / procjena varijabilno (Katteb KPI stil) |
| Tablica servisa | `CostServiceTable` | Red iz master tablice: servis, plan, €/mj, €/god, obnova, status |
| Povijest | `CostMonthlyLedger` | Mjesečna tablica iz private evidencije |
| Trend | `CostTrendChart` | Recharts — opcionalno kad ima ≥2 mjeseca podataka |
| Sidebar search | `CommandPalette` | ⌘K: skok na projekt, osvježi, settings |
| User card | `AppFooterCard` | „Last sync 8 min ago“, offline banner |

---

## Troškovi (Costs) — obavezna sekcija

Svaki projekt ima **Troškovi** u sidebaru. Globalni **Costs** zbraja sve projekte. Isti Katteb vizual (KPI kartice + tablica + opcionalni chart). **Bez emojija** — Lucide `Wallet`, `Receipt`, `TrendingUp`, `Calendar`.

### Izvori podataka (prioritet)

| Izvor | Što donosi | Gdje živi |
|-------|------------|-----------|
| **`SERVICES.md`** (javno u repou projekta) | Master tablica servisa, planovi, statusi, **procjene** (npr. „~$6–11/mj“) | Putanja repoa u wizardu |
| **`SERVICES.private.md`** (gitignored) | Stvarni iznosi, fakture, mjesečna povijest | Lokalno — putanja u postavkama projekta |
| **Ručni unos u gdash** | Ako nema private datoteke — forma u UI | `~/.config/gdash/projects/<slug>/costs.json` |
| **API (opcionalno, faza 2)** | Anthropic/OpenAI usage MTD, Vercel billing hint | Samo read; **ne obavezno** za MVP |

**Pravilo:** MVP = parsiranje markdown tablica + private file; **ne** zahtijevati plaćene billing API-je.

### Wizard — korak Troškovi

- Putanja do `SERVICES.md` (auto ako je repo root točan).
- Putanja do `SERVICES.private.md` (opcionalno; gumb „Kreiraj iz example“).
- Valuta po projektu (EUR / USD) — za prikaz i zbrojeve.

### Projektni ekran `/projects/:slug/costs`

1. **`CostSummaryRow`** (4 kartice, kao KPI):
   - **Fiksno mjesečno** (suma poznatih fiksnih stavki)
   - **Godišnje amortizirano** (npr. Apple $99 → ~$8/mj prikaz + puni $99/god)
   - **Varijabilno (procjena)** — AI, LS %, IAP provizija (label „procjena“ ako nije iz private)
   - **Ukupno** — fiksno + procjena varijabilno (jasno označeno)

2. **`CostServiceTable`** — jedan red po servisu iz master tablice:
   - Servis, plan, mjesečno, godišnje, datum obnove, status integracije (Lucide)
   - Link **Otvori billing** (`ExternalLink`) — otvara dashboard URL iz SERVICES (Safari), ne scrape

3. **`CostMonthlyLedger`** — stupci: Mjesec | Stavka | Iznos | Valuta | Faktura/link  
   - Prazno stanje: „Dodaj prvi mjesec“ + gumb Uredi (forma, lokalno)

4. **`CostTrendChart`** (kad ima podatke) — stacked bar ili line po mjesecima

### Globalni ekran `/costs`

- KPI: **Ukupno sve projekte** (fiksno / varijabilno / godišnje obveze)
- Tablica projekata: FlowKeep | AI Rules | CAPTIVE | … + zbroj po projektu
- Filter: valuta, „samo fiksno“, „samo s upisanim iznosima“

### Uređivanje (lokalno, besplatno)

- **Uredi stavku** — dialog: servis, plan, mjesečno, godišnje, obnova, napomena
- **Dodaj mjesečni red** — za privatnu evidenciju (sync u `costs.json` + opcionalno export u `SERVICES.private.md` format)
- Promjene **ne** idu automatski u Git — korisnik ručno kopira u repo ako želi

### Mapiranje iz postojećih dokumenata (gdash repo)

| Datoteka u gdash | Projekt |
|------------------|---------|
| `SERVICES.md` | FlowKeep |
| `SERVICES 2.md` | AI Rules Generator |
| `SERVICES 3.md` | CAPTIVE |

Pri importu projekta u wizardu: odabir predloška učitava odgovarajući SERVICES markdown kao početnu tablicu.

### iPhone (PWA)

- Isti **Costs** ekran — tablica scroll, KPI 2×2
- Read-only dovoljno u MVP; uređivanje može ostati Mac-only (faza 2: forma na mobitelu)

### Besplatno

- Nema gdash naplate za ovu sekciju
- Billing dashboardi servisa ostaju na njihovim stranicama (link), osim gdje API usage već imaš (Anthropic) — opcionalno

---

## KPI kartica (spec)

```
┌─────────────────────────────┐
│  Label (text-secondary)     │
│  42        +12%  (zeleno)   │  ← veliki broj + delta
│  Last 7 days                │
│  ▁▂▃▅ sparkline (pastel)      │
└─────────────────────────────┘
```

- **Loading:** skeleton pulse na broju i sparklineu (ne blokiraj cijelu stranicu).
- **Stale:** mali badge „prije 12 min“ u `--text-muted`.
- **Error:** crveni rub ili ikona; label ostaje; vrijednost „—“.

---

## Projektni dashboard — redoslijed sadržaja

1. `ProjectHero` — gradient blagi (zeleno/plava kao referenca), bez 3D ilustracije u MVP-u (ikon projekta ili inicijali).
2. Red od 4 `MetricCard` — samo connectori koji su konfigurirani; prazno = „Dodaj integraciju“.
3. Grid 2/3 + 1/3: lijevo `TimeSeriesChart` ili `ActivityFeed` (zadnji deployi/CI); desno `ConnectorStatusCard`.
4. `QuickActionCard` red — akcije dopuštene u manifestu.
5. `ChecklistPanel` — import iz SERVICES / ručni checklist.
6. Link **Troškovi** → `/projects/:slug/costs` (ili sažetak KPI „€/mj“ na hero ako ima podataka).

**Refresh UX (hibrid):** pri ulasku odmah render iz cachea; svaka kartica ima vlastiti loading state pri pozadinskom poll-u. Troškovi se osvježavaju iz lokalnih datoteka (bez API poll-a) osim opcionalnog AI usage u fazi 2.

---

## Wizard (novi projekt) — isti vizualni jezik

- Koraci u **horizontal stepperu** ispod top bara (ne odvojen „wizard UI“ stil).
- Svaki korak = jedna bijela kartica (`--radius-lg`), forma s rounded inputima.
- Zadnji korak: **„Test & Create“** — lista connectora s `CircleCheck` / `CircleX` (Lucide) prije otvaranja dashboarda.
- Nakon uspjeha → redirect na `/projects/:slug` s kratkim toastom „Projekt spreman“.

**Predlošci koraka (tip projekta):**

| Tip | Wizard skraćuje |
|-----|-----------------|
| `next-vercel-supabase` | AI Rules |
| `expo-firebase` | CAPTIVE |
| `macos-landing` | FlowKeep |

---

## Home (globalni dashboard)

- Isti shell, ali umjesto jednog hero → **grid kartica projekata** (mini Katteb KPI: 3–4 brojke + status chip).
- Klik kartice → `/projects/:slug`.
- Gumb „+ New Project“ u sidebaru i kao prazna dashed kartica u gridu.

---

## Tipografija

| Uloga | Inter | Veličina |
|-------|-------|----------|
| Page title | 600 | 24–28px |
| Card title | 600 | 16–18px |
| KPI value | 700 | 32–36px |
| Body | 400 | 14px |
| Caption | 400 | 12px `--text-secondary` |

---

## Interakcije

- Hover na kartici: blagi `translateY(-1px)` + jača sjena (150ms ease).
- Stagger fade-in pri prvom loadu dashboarda (50ms između KPI kartica).
- Command palette ⌘K (obavezno u MVP-u).
- Bez teških animacija na chartovima.

---

## Ikone — mapiranje (Lucide)

| Kontekst | Ikona | Boja (opcionalno) |
|----------|--------|-------------------|
| OK / success | `CircleCheck` | `--status-ok` |
| Warning / partial | `CircleAlert` | `--status-warn` |
| Error / failed | `CircleX` ili `AlertCircle` | `--status-error` |
| Pending / not configured | `Circle` ili `CircleDashed` | `--text-muted` |
| Loading | `Loader2` + `animate-spin` | `--text-muted` |
| Refresh | `RefreshCw` | inherit |
| Settings | `Settings` | inherit |
| Notifications | `Bell` | inherit |
| Search / ⌘K | `Search` | inherit |
| New project | `Plus` | inherit |
| External link | `ExternalLink` | inherit |
| Repo / GitHub | `Github` | inherit |
| Deploy / hosting | `Cloud` | inherit |
| Database | `Database` | inherit |
| Analytics | `LineChart` | inherit |
| Offline | `WifiOff` | `--status-warn` |
| Troškovi (nav) | `Wallet` ili `Receipt` | inherit |
| Faktura / zapis | `FileText` | inherit |
| Trend troškova | `TrendingUp` | inherit |

Sidebar nav: `LayoutDashboard`, `FolderKanban`, `Wallet`, `Plug`, `ListChecks`, `Settings`.

---

## Pristupačnost

- Kontrast teksta min. WCAG AA na bijeloj kartici.
- Status ne samo bojom: **Lucide ikona + tekst** („CI failed“).
- Focus ring na sidebar linkovima i gumbima.
- Ikone uz tekst: `aria-hidden` na dekorativnim; samostalne gumb-ikone imaju `aria-label`.

---

## Što namjerno **ne** kopiramo

- „Premium Now“ promo kartica (nema smisla za lokalni alat).
- 3D ilustracije u hero — opcionalno kasnije.
- Tamna tema — izvan MVP-a.
- **Emoji** bilo gdje u UI-u (vidi gore).
- Druge ikon biblioteke (Heroicons, Font Awesome, emoji fontovi, PNG ikone u navu).

---

## Verifikacija prije mergea UI PR-a

1. Screenshot home + projektni dashboard uz referentnu sliku (side-by-side).
2. Loading / error / empty state za barem jednu `MetricCard`.
3. Sidebar + ⌘K paleta funkcionalni.
4. UI prolazi bez emoji znakova; sve status indikatore pokrivaju Lucide ikone.
5. Costs: projektni + globalni ekran s tablicom servisa i KPI zbrojevima.

---

## Povezani dokumenti

- `SERVICES.md` — FlowKeep checklist & servisi  
- `SERVICES 2.md` — AI Rules  
- `SERVICES 3.md` — CAPTIVE  

Implementacija koda:

- `apps/desktop/` — Tauri + React  
- `apps/ios/` — Capacitor + isti `packages/ui`  
- `packages/ui/` — dashboard, wizard, design tokens  

Dodati kad scaffold krene.
