# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js 16)
npm run build    # Production build
npm run lint     # ESLint check
```

No test suite is configured.

## Environment

Requires a `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Architecture

**CRM for perfume boutiques** ("La Niche" partner stores). Single-tenant per auth user: one Supabase auth user = one shop.

### Auth & layout flow

`RootLayout` → `AuthProvider` → page content (via `children`).

`AuthProvider` ([src/components/AuthProvider.tsx](src/components/AuthProvider.tsx)) handles the full auth gate: it renders the login/signup screen if there's no session, and the app shell (`Sidebar` + `children`) if authenticated. No separate `/login` route exists — auth is entirely managed in this component.

### Data layer

All data access is direct Supabase client calls (no API routes). The client is a singleton at [src/lib/supabase.ts](src/lib/supabase.ts).

**Schema** (defined in [supabase_schema.sql](supabase_schema.sql)):
- `shops` — one row per auth user (id = auth.uid()), auto-created by a DB trigger on signup
- `perfumes` — inventory items scoped to `shop_id` (= auth.uid()), with `is_sale` / `sale_price` for private sales

RLS is enabled on both tables. Every query must scope to `shop_id = auth.uid()` — the pages retrieve `session.user.id` from `supabase.auth.getSession()` and use it as `shop_id`.

### Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard with KPI cards and recharts graphs |
| `/inventory` | Full CRUD on `perfumes` table; CSV import via PapaParse |
| `/sales` | Read-only view of `is_sale = true` perfumes (the "ventes privées" catalogue) |
| `/ai-insights` | Static marketing/teaser page for upcoming AI features |
| `/contact` | Static contact page |

### Remotion animations

Decorative background animations used in `AuthProvider` and `/ai-insights`. They use `@remotion/player` (not rendered server-side). Components live in [src/remotion/](src/remotion/) and use `AbsoluteFill` + `useCurrentFrame` from `remotion`.

Always import `Player` from `@remotion/player` and animation components from `@/remotion/` — they are not auto-imported.

### Styling

Tailwind CSS v4 with `@theme` variables in [src/app/globals.css](src/app/globals.css). Token names: `--color-primary`, `--color-accent`, `--color-secondary`, `--color-border`, `--color-muted-foreground`. Google Fonts (Outfit) is loaded via `@import url(...)` in globals.css.

Dark mode is managed by `next-themes` through [src/components/ThemeProvider.tsx](src/components/ThemeProvider.tsx) with `attribute="class"`.
