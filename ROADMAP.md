# ZORAEL & CO. — Audit & Production Checklist

Audit date: 2026-10-08. `[x]` = done, `[~]` = partial / scaffolded, `[ ]` = pending.

## Audit summary

**Built:** storefront UI and all required routes, PWA (manifest, icons, service worker, offline page), order + payment abstraction (mock / Razorpay / generic HTTP), Drizzle schema (`products`, `orders`, `order_items`), Supabase client helpers (just added).

**Not built:** authentication, admin panel, real database wiring, PayU, SMS verification, emails, inventory, user-owned orders.

Key findings:
- Catalog is hardcoded (18 products in `src/lib/products.ts`); DB `products` table exists but the storefront doesn't read it.
- `/account` is a static menu; no sign-in, no orders, no addresses. Most links point back to `/account`.
- Cart and wishlist live only in browser state (`store-provider.tsx`); nothing is tied to a user.
- Orders have no user id, no inventory decrement, no fulfilment statuses (only created/pending/paid/failed).
- `GET /api/orders/[id]` and `/api/checkout/verify` have no ownership check — anyone with an order id can read it. Fix with auth.
- `/api/checkout` accepts guest checkout with no rate limiting or phone/email verification.
- Newsletter form only flips local state; the email is never saved.
- `/api/checkout/mock-pay` must be disabled/removed in production.
- Two DB paths exist (Drizzle over `DATABASE_URL`, and the new Supabase client). Pick one source of truth (see Phase 0).
- `.env.example` currently contains a Supabase DB hostname and a `[YOUR-PASSWORD]` placeholder; fine, but never commit real values.

---

## Phase 0 — Foundation decisions
- [ ] Decide: Supabase Auth + Postgres (recommended: one vendor) with Drizzle kept for typed queries on the Supabase DB.
- [x] Set real `DATABASE_URL` / `DIRECT_URL` (Supabase pooler for runtime, direct for migrations).
- [x] Run `db:migrate` against Supabase; run `db:seed`.
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (server only, never `NEXT_PUBLIC_`).
- [x] Enable Row Level Security on every table; write policies.
- [ ] Add `proxy.ts` (Next 16) to refresh Supabase sessions.
- [x] Supabase browser + server clients (`src/lib/supabase/`).

## Phase 1 — Data layer
- [x] Move catalog from `products.ts` to DB (`src/lib/catalog.ts`, static fallback). Caching/ISR tags still to add.
- [x] Extend schema: `categories`, `collections`, `product_variants` (size/color/SKU), `inventory`, `profiles`, `addresses`, `wishlists`, `coupons`, `reviews`, `newsletter_subscribers`, `order_events`.
- [x] Add `user_id` to `orders`; richer statuses (confirmed, packed, shipped, delivered, cancelled, returned, refunded).
- [ ] Product images in Supabase Storage (replace external image URLs).
- [x] Orders persisted via Drizzle store (verified: COD order written to Postgres).

## Phase 2 — User login & accounts
- [ ] Sign up / sign in pages (email + password, optional Google).
- [ ] Phone OTP verification for new users (see Phase 5).
- [ ] Password reset and email verification flows.
- [ ] Protected routes: `/account/*`, `/checkout` (or guest checkout with OTP).
- [ ] Account pages: profile, My Orders + order detail/tracking, address book, saved wishlist (synced to DB), settings.
- [ ] Merge guest cart/wishlist into the account on login.
- [ ] Remove "Payment Methods" (saved cards) menu item unless PayU tokenization is used; don't store card data ourselves.
- [ ] Ownership checks on `/api/orders/[id]` and verify route.

## Phase 3 — Cart, checkout, orders
- [~] Server-side pricing (`pricing.ts`) — good; add coupon support and tax/GST.
- [ ] Stock validation at checkout; reserve/decrement inventory on payment success.
- [ ] Address form with validation (PIN code, phone); pick from saved addresses.
- [ ] Order confirmation page + confirmation email.
- [ ] COD rules (limits, pincode serviceability, optional OTP confirm).
- [ ] Cancel / return / refund flow.
- [ ] Rate-limit and validate `/api/checkout` (zod schema).
- [ ] Remove `/api/checkout/mock-pay` from production builds.

## Phase 4 — PayU payment gateway
- [ ] Create PayU merchant account; get merchant key + salt (test mode first).
- [ ] Add `PayUGateway` implementing `PaymentGateway` (`src/lib/payments/`), register `payu` in `config.ts` / `index.ts`.
- [ ] Server-generated request hash (SHA-512: key|txnid|amount|productinfo|firstname|email|udf1-5||||||salt), auto-submitted form POST to PayU.
- [ ] Success/failure return URLs (`surl`/`furl`) that verify the response hash (reverse hash) before marking paid.
- [ ] Webhook / S2S callback to `/api/webhooks/payment` with hash verification; idempotent updates.
- [ ] Verify via PayU `verify_payment` API before fulfilling (don't trust the browser redirect alone).
- [ ] Refund API integration (admin-triggered).
- [ ] Env vars: `PAYMENT_PROVIDER=payu`, `PAYU_KEY`, `PAYU_SALT`, `PAYU_BASE_URL` (test vs live).
- [ ] Test matrix: success, failure, cancel, pending, duplicate callback, amount tampering.
- [ ] Go-live: switch to production key/salt, whitelist domain.

## Phase 5 — SMS / OTP verification (pending provider)
- [ ] Choose provider (India: MSG91, Twilio Verify, or Supabase phone auth with Twilio/MessageBird). DLT registration + sender ID + templates required for India.
- [ ] `SmsProvider` interface (like the payment gateway) so the provider can be swapped; mock provider for dev.
- [ ] OTP table or provider-managed verification; 6-digit, 5-min expiry, hashed, max attempts.
- [ ] Rate limits per phone and per IP; resend cooldown.
- [ ] Verification UI in signup (and optionally COD confirmation).
- [ ] Order status SMS (placed / shipped / delivered) once provider is live.

## Phase 6 — Admin panel (`/admin`, role-gated)
- [ ] Roles: `admin`, `staff` on `profiles`; enforce in proxy + server actions + RLS.
- [ ] Dashboard: revenue, orders today, low stock, recent orders.
- [ ] Products: list, create/edit, variants, images upload, publish/archive, bulk actions.
- [ ] Categories & collections management.
- [ ] Inventory: stock levels, adjustments, low-stock alerts.
- [ ] Orders: list/filter, detail, update status, add tracking number, cancel, refund, print invoice/packing slip.
- [ ] Customers: list, order history.
- [ ] Coupons & shipping settings (fee, free threshold).
- [ ] Journal/CMS posts (currently hardcoded in `journal.ts`).
- [ ] Newsletter subscribers export.
- [ ] Audit log of admin actions.

## Phase 7 — Content & marketing
- [ ] Persist newsletter signups (table + double opt-in email).
- [ ] Transactional email provider (Resend/SES): welcome, order confirmation, shipping, reset.
- [ ] Reviews & ratings tied to verified purchases.
- [ ] Real product photography and copy (CONTENT.md).

## Phase 8 — Quality, security, launch
- [ ] Input validation (zod) on every API route / server action.
- [ ] Security headers (CSP, HSTS), CSRF considerations, secrets audit.
- [ ] Error monitoring (Sentry), analytics, structured logging.
- [ ] Tests: pricing, payment hash/signature, order state transitions, auth guards; Playwright for checkout.
- [ ] Accessibility pass (keyboard, contrast, focus), Lighthouse ≥ 90 on mobile.
- [ ] SEO: sitemap, robots, product JSON-LD, OG images, canonical URLs.
- [ ] PWA: verify offline fallback, install prompt, never cache private routes (already excluded in `sw.js`).
- [ ] Legal pages: shipping, returns, privacy, terms (required for PayU approval).
- [ ] Production env + domain + backups + migration runbook.

## Suggested order
1. Phase 0 + 1 (DB truth) → 2. Auth (email) → 3. Orders tied to users → 4. PayU → 5. Admin panel → 6. SMS OTP once provider approved → 7. Emails/marketing → 8. Hardening & launch.
