# Kamai Wholesale — Wholesaler Webapp

The wholesaler-facing frontend for Kamai Wholesale: a B2B commerce platform
for the Indian bakery industry. Wholesalers use this app to onboard, build
their product catalogue, and manage incoming bakery orders. It talks to the
[Kamai Sourcing backend](../../../Kamai-wholesale-backend) (a separate
Fastify/Prisma service) over a typed HTTP client.

## Stack

- **[Next.js 16](https://nextjs.org/)** (App Router) + **React 19** + TypeScript
- **Tailwind CSS v4** — custom design tokens, see [Design system](#design-system)
- **[lucide-react](https://lucide.dev/)** for icons
- No client-side state library, no server actions to a separate backend —
  all data access goes through `src/lib/api/*` via `fetch`, cookie-based
  session auth (see [Auth](#auth))

> **Note:** this Next.js version pins to a pre-release with breaking API
> changes from what most training data reflects — see `AGENTS.md` /
> `node_modules/next/dist/docs/` before assuming familiar App Router
> behavior.

## Project layout

```
src/
  app/
    page.tsx                     # Login (send OTP)
    verify/page.tsx               # OTP verification
    onboarding/                   # Setup wizard — only reachable while status != ACTIVE
      layout.tsx                    #   guard: redirects ACTIVE wholesalers to /dashboard
      step-1..4/page.tsx             #   business profile → fulfilment → payment policy → catalogue
      add-product/page.tsx           #   manual product entry during step 4
      import-review/page.tsx         #   review/edit AI-extracted or file-parsed catalogue rows
      go-live/page.tsx               #   final confirmation → POST /go-live
    (app)/                         # Main app — only reachable once status == ACTIVE
      layout.tsx                    #   guard: redirects non-ACTIVE wholesalers to /onboarding/step-1
      dashboard/page.tsx             #   home screen — key metrics
      catalogue/page.tsx             #   product list/management
      catalogue/import/page.tsx      #   catalogue file/photo upload
      orders/page.tsx                #   order list
      orders/[id]/page.tsx           #   order detail — status transitions, advance payment, notes
      settings/page.tsx              #   settings hub
      settings/business-profile/page.tsx
      settings/fulfilment/page.tsx    #   delivery/pickup policy
      settings/payment/page.tsx       #   advance-payment %
  components/ui/                  # Shared components: Navbar, BottomNav, Button, ProductForm,
                                    #   AddProductSheet, MasterCatalogueSearchSheet, ImportRowCard
  lib/
    api/
      client.ts                     # apiFetch — the one place that knows about auth/refresh/errors
      types.ts                       # every request/response shape, mirrors the backend's Zod schemas
      auth.ts  onboarding.ts  profile.ts  notifications.ts
      catalogue.ts  products.ts  orders.ts  dashboard.ts
    theme.tsx                      # light/dark ThemeProvider (manual toggle, no OS/localStorage sync)
    hooks/useDebouncedValue.ts
```

Each `lib/api/*.ts` file is a thin, typed wrapper around one backend
resource — e.g. `orders.ts` exports `listOrders`, `getOrder`,
`updateOrderStatus`, `updateOrderAdvancePayment`, `updateOrderNotes`, each
just calling `apiFetch` with the matching `/api/sourcing/...` path. There is
no data-fetching library (no React Query/SWR) — pages call these functions
directly in `useEffect`/event handlers.

## Auth

Session state is **entirely HttpOnly cookies** — the app never reads,
stores, or attaches a bearer token itself:

1. `POST /api/auth/send-otp` (`Login`, `src/app/page.tsx`) → 6-digit email OTP
2. `POST /api/auth/verify-otp` (`src/app/verify/page.tsx`) → backend sets
   `wholesaler_access_token` (15 min) and `wholesaler_refresh_token` (7 days,
   scoped to `/api/auth`) cookies
3. Every subsequent request goes through `apiFetch` (`src/lib/api/client.ts`)
   with `credentials: "include"`

`apiFetch` centralizes all the auth failure-mode handling so individual
pages don't have to think about it:

- On a `401` from any non-`/api/auth` endpoint, it calls
  `POST /api/auth/refresh` once (deduplicated across concurrent 401s so a
  page firing several requests at once doesn't trigger multiple refreshes),
  then retries the original request exactly once.
- If refresh fails (`REFRESH_TOKEN_INVALID`/`REFRESH_TOKEN_REUSED`, or no
  refresh token at all), it clears local app state and hard-redirects to `/`.
- Every error response is thrown as a typed `ApiError` (`code`, `message`,
  optional field-level `details`) — `fieldErrorsFrom(err)` turns Zod
  validation `details` into a `{ fieldName: message }` map for inline form
  errors.

Two route guards enforce onboarding as a one-way gate, both driven by
`GET /api/sourcing/profile`'s `status` field:

- `src/app/onboarding/layout.tsx` — if `status === "ACTIVE"`, redirect to `/dashboard` (setup is done, can't re-enter)
- `src/app/(app)/layout.tsx` — if `status !== "ACTIVE"`, redirect to `/onboarding/step-1` (nothing to show yet)

## Design system

A mobile-first layout: the whole app renders inside a fixed `max-w-[414px]`
column (see `src/app/layout.tsx`), centered with a shadow on wider viewports
— it's built as a phone-width webapp, not a responsive desktop site.

Colors, typography, and spacing are defined in `../DESIGN.md` (one level up
from this project — "Kamai Artisanal System": a Material-3-derived token set
with `primary`/`surface`/`on-surface`/etc. roles, mapped into Tailwind theme
classes like `text-headline-xl`, `bg-surface`, `text-text-secondary`).
Fonts: Plus Jakarta Sans (UI) and Source Serif 4 (headlines), loaded via
`next/font/google`. Light/dark is a manual toggle (`useTheme()` from
`src/lib/theme.tsx`) that only flips a `.dark` class — it does not persist
to `localStorage` or follow `prefers-color-scheme`, matching the sibling
baker-facing webapp (`kamai_webapp_frontend`) on purpose.

## Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the Kamai Sourcing backend, no trailing slash (e.g. `http://localhost:4000`) |

## Running locally

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at a running backend

npm run dev
```

Requires the [Sourcing backend](../../../Kamai-wholesale-backend) running
(default `http://localhost:4000`) — this app has no server-side data layer
of its own, every screen depends on that API.

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Local dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Lint the project |

## API reference

`API_REFERENCE.md` in this directory documents the backend's auth flow,
error envelope, and endpoint-by-endpoint request/response shapes in detail.
**Treat it as a starting point, not ground truth** — it was written against
an earlier backend snapshot and explicitly notes gaps (e.g. "no
baker-facing API", "no order-creation endpoint") that the backend has since
closed. For current behavior, check the backend's own README and
`GET /docs` (its live OpenAPI/Swagger UI) instead.

## Related repos

- [`Kamai-wholesale-backend`](https://github.com/anynomous001/kamai_wholesale_backend) — the Sourcing API this app talks to
- `kamai_webapp_frontend` / `kamai_webapp_backend` — the baker-facing side of the platform (separate service/database; connected only via the Sourcing backend's public API)
