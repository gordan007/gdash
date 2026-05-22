# gdash

Local dashboard for product health and costs (FlowKeep, AI Rules, CAPTIVE). No cloud hosting for gdash itself — reads your existing SaaS APIs and `SERVICES*.md` docs.

See [PLAN.md](./PLAN.md) and [DESIGN.md](./DESIGN.md).

## Requirements

- Node.js 20+
- npm 10+
- macOS: Rust + Xcode tools (for Tauri desktop only)

## Quick start (web / PWA)

```bash
cd /Users/gordanvalenta/Sites/gdash
npm install
npm run dev
```

Open http://localhost:5173

- **Import presets** on first launch (loads three projects from bundled `services-docs/`).
- Add API tokens under **Settings** (GitHub, Vercel, Plausible) — stored in localStorage only.

### iPhone (free)

1. Run dev server on your Mac (same Wi‑Fi).
2. Open the URL in Safari on iPhone.
3. Share → **Add to Home Screen**.

Production PWA build:

```bash
npm run build -w @gdash/web-pwa
npm run preview -w @gdash/web-pwa
```

## Desktop (Tauri, macOS)

```bash
npm install
npm run dev:desktop
```

Build `.app`:

```bash
npm run build:desktop
```

## Project structure

| Path | Role |
|------|------|
| `packages/core` | Types, storage, SERVICES parsers, costs |
| `packages/connectors` | HTTP, GitHub, Vercel, Plausible, … |
| `packages/ui` | React UI (Katteb style, Lucide icons) |
| `apps/web-pwa` | Vite + PWA |
| `apps/desktop` | Tauri shell |
| `services-docs/` | Reference SERVICES markdown per product |

## Data location

- **Browser/PWA:** `localStorage` key `gdash-data-v1` and `gdash-secret:*`
- **Future:** `~/.config/gdash/` for Tauri-native file storage

## Cost

gdash is free (open-source stack). Your Vercel/GitHub/Anthropic/etc. bills are unchanged — gdash only displays them.
