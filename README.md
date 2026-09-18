# ZORAEL & CO. — Luxury Fashion House

A production-quality, editorial luxury fashion e-commerce site and PWA, built to the
brand spec in `CLAUDE.md` and its supporting files (`DESIGN-SYSTEM.md`, `PAGES.md`,
`COMPONENTS.md`, `CONTENT.md`, `PWA.md`, `PROMPT.md`).

## Stack

- **Next.js 16** (App Router, Server Components by default) + **TypeScript**
- **Tailwind CSS v4** with brand design tokens
- **shadcn/ui + Base UI** primitives, **Lucide** icons
- Installable **PWA** — manifest, generated icons, service worker, offline fallback

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint
```

## Pages

`/` · `/shop` (filterable by category) · `/shop/[slug]` (product) · `/search` ·
`/collections` + `/collections/[slug]` · `/about` · `/journal` + `/journal/[slug]` ·
`/bag` · `/checkout` · `/account` + `/account/wishlist` · `/offline`

## Content & imagery — the single swap point

All demo photography resolves through **`src/lib/images.ts`** (Unsplash by default).
Replace the photo ids or point `img()` at your own CDN/`/public` assets and nothing
else needs to change. The `<Media>` component degrades to an on-brand placeholder if
an image fails, so the layout is never broken while assets are swapped in.

Products, collections and journal content live in `src/lib/products.ts`,
`src/lib/collections.ts` and `src/lib/journal.ts`. Site/navigation config is in
`src/lib/site.ts`.

## State

Bag and wishlist are client-side (`StoreProvider`, persisted to `localStorage`).
The account area is a front-end shell (no auth backend yet).

## Backend & payments

The checkout is backed by real API routes with a **provider-agnostic** payment
layer. Switching gateways is a config change — no application code changes.

**Choose a provider** with `PAYMENT_PROVIDER` in `.env.local` (see `.env.example`):

| Value      | Behaviour                                                                 |
| ---------- | ------------------------------------------------------------------------- |
| `mock`     | Default. Full checkout works locally with no real money.                  |
| `http`     | Generic REST provider — set `PAYMENT_API_URL` ("just replace the URL").   |
| `razorpay` | Ready example (INR / UPI / cards) — set `RAZORPAY_KEY_ID`/`_SECRET`.      |
| `stripe`   | Scaffolded; implement `StripeGateway` to enable.                          |

**How to add your own gateway:** implement the `PaymentGateway` interface in
`src/lib/payments/types.ts` (see `razorpay-gateway.ts` as a template) and register
it in `src/lib/payments/index.ts`. Everything else stays the same.

**API routes**

- `POST /api/checkout` — prices the cart **server-side** (client prices are never
  trusted), creates a gateway order, stores it. COD skips the gateway.
- `POST /api/checkout/verify` — verifies the payment signature, marks the order paid.
- `POST /api/webhooks/payment` — gateway webhook (signature-verified); set this URL
  in your provider dashboard.
- `GET /api/orders/[id]` — order status. `GET /api/products[?category=&q=]` and
  `GET /api/products/[slug]` — catalog.
- `POST /api/checkout/mock-pay` — mock-only helper that simulates the provider
  callback; refuses to run unless `PAYMENT_PROVIDER=mock`.

**Persistence:** orders use an in-memory `OrderStore` (`src/lib/orders/store.ts`)
so the flow runs with no external services. Swap it for a DB-backed implementation
(Prisma/Drizzle/etc.) behind the same interface — the API routes don't change.

**Security notes:** amounts are always recomputed from the catalog on the server;
signatures/webhooks are verified with HMAC and constant-time comparison; secrets
live only in env vars and never reach the browser.

## Notes

- Per `COMPONENTS.md`, the mobile bottom navigation is exactly **Home / Shop / Search /
  Bag** (Search emphasized); **Account** lives in the header and the mobile menu.
- No glassmorphism / frosted glass — all surfaces are solid, per the design system.
