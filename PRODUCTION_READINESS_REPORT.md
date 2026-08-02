# Production Readiness Report — AL-MUNJIZ (almunjiz.store)

**Re-audit date:** 2026-08-01
**Environment tested:** `npx next start -p 3000` (production build, Next.js 16.2.11) against the **live** Neon Postgres DB and production build
**Scope:** re-verification of all previously-flagged C1–C5 / H1–H4 issues, functional commerce flows, admin/dashboard, SEO/i18n, PWA, and post-audit data cleanup

---

## Verdict

> **CONDITIONAL YES — code is production-ready; ship after deployment configuration.**

Every code-level blocking issue from the initial audit (C1 price tampering, C2 forged webhooks, C3 provider resolution, C4 open CMS APIs, H1 tracking leak, H3 wrong lang/dir, H4 missing SEO) has been **fixed and re-verified live**. What remains before launch is **configuration, not code**: a valid Resend email key and real payment-gateway credentials (secret keys / webhook secrets) that must be supplied in the deployment environment. Two low-severity code items (order-create idempotency, CSP for payment SDKs) are noted for follow-up but are not launch-blocking.

---

## Scores (0–10)

| Domain | Score | Notes |
|---|---|---|
| Security | **8/10** | C1–C4 fixed & re-verified live; remaining nits: order-create idempotency, public blob URLs if leaked |
| Commerce / Payments | **7/10** | Server-priced orders work; webhooks fail closed; needs real gateway credentials to go live |
| Authentication | **6/10** | Login/register/session + role cookie verified; OTP/email still blocked on Resend key (config) |
| UX / Responsive | **8/10** | 0 overflow at 7 viewports, dark mode OK, no broken links |
| SEO | **9/10** | Per-page titles/descriptions, canonical, hreflang (ar/en/x-default), correct `lang`/`dir`, sitemap, robots |
| Performance | **6/10** | Rebuild clean; bundle size to re-check post-fix (2.7 MB baseline from initial audit) |
| Reliability | **7/10** | Emails/payments blocked only by missing deployment credentials |
| **Overall** | **7.5/10** | |

---

## Previously CRITICAL — status

### C1. Server-side price tampering — ✅ FIXED (verified live)
- `src/app/api/orders/route.ts` now computes pricing server-side from `service.price` + validated coupon via `computeOrderPricing` (`src/lib/pricing.ts`) and writes only those values to the order/invoice.
- Client-supplied `amount` / `total` are accepted only if they match the server price (`amountsMatch`, tolerance for tax/rounding); otherwise `400 Price validation failed`.
- `service.isActive` is now checked (rejects ordering deactivated services).
- **Live proof:** tampered order (`amount:0.01`) → `400`; legit order → `201` order `AM-MS9QWCRU-FICA` at server price 250 SAR + invoice `INV-1785550890667-9598`.

### C2. Forged payment webhooks — ✅ FIXED (fail-closed, verified live)
- `src/lib/payment-providers/base.ts:89-92` `verifyWebhookSignature` now returns `false`; `verifyHmacSignature` returns `false` when no `webhookSecret` is configured. No provider returns `true` unconditionally anymore.
- Webhook route returns **401** on missing/invalid signature and validates webhook amount against the order total (`amount mismatch` → 400).
- **Live proof:** unsigned POST to `/api/webhooks/tabby---buy-now-pay-later` → **401**; Tamara same.

### C3. Payment gateways cannot process payments — ✅ FIXED (verified live)
- `src/lib/payment-providers/index.ts` `createPaymentProvider` now resolves on `provider` (TABBY/TAMARA) before falling back to `slug`, and `resolveProviderSlug` normalizes `tabby---buy-now-pay-later` → `tabby`.
- Webhook route also matches gateway by `provider` in addition to `slug`.
- **Live proof:** `POST /api/payments/process` now reaches the Tabby provider (returns provider-level `HTTP 401` from Tabby due to placeholder secret — **no more "Unknown payment provider" crash**). Wiring confirmed; credentials required at deploy.

### C4. Admin/CMS API data exposed without auth — ✅ FIXED (verified live)
- All CMS routes (`banners`, `faqs`, `homepage`, `news`, `notifications`, `offers`, `pages`, `reviews`, `seo`, `services`, `settings`, `social`, `coupons` incl. `[id]` variants) now call `requireAdmin()` in **every** handler, including GET.
- **Live proof:** unauthenticated `GET /api/cms/notifications`, `/api/cms/services`, `/api/cms/coupons` → **401**; with admin session → 200.

### C5. Invalid email key — ❌ BLOCKED on deployment config
- `RESEND_API_KEY` is still the placeholder (`re_YOUR_RESEND_API_KEY_HERE`).
- **Live proof:** `POST /api/otp/send` → `{"error":"API key is invalid"}` (HTTP 500).
- All transactional emails (order, invoice, payment success, welcome) silently `.catch()`.
- **Action:** put a valid Resend key (or SMTP fallback) in the deployment env. No code change required.

---

## Previously HIGH — status

### H1. Unauthenticated order tracking leak — ✅ FIXED (verified live)
- `src/app/api/track/[orderNumber]/route.ts` now returns **basic** status/timeline only when unauthenticated; customer name, invoice, and file attachments are returned **only** to the order owner, an admin, or the holder of the order's `trackingToken`.
- Rate limited via `trackLimiter`.
- **Live proof:** no token → basic; wrong token → basic; owner/admin token → full PII + invoice + files; partial order number → 404.

### H2. Files in public blob container — ✅ MITIGATED
- Uploads still live in a public Vercel Blob container, but they are served through the auth-checked `/api/files/[id]` (ownership enforced; unauthenticated → 401) and PII/file URLs are no longer returned by the public track endpoint.
- **Remaining hardening (optional):** migrate to private blob storage + server proxy. Not launch-blocking given the ownership checks.

### H3. `/en` pages served with `lang="ar" dir="rtl"` — ✅ FIXED (verified live)
- `src/app/layout.tsx` now reads `x-pathname` (set by `src/proxy.ts`) and renders `lang="en" dir="ltr"` for `/en`, `lang="ar" dir="rtl"` for `/ar`, server-side.
- **Live proof:** `/en` → `lang=en dir=ltr`; `/ar` → `lang=ar dir=rtl`.

### H4. No page-level SEO metadata — ✅ FIXED (verified live)
- `src/app/[locale]/layout.tsx` `generateMetadata` provides per-page title/description, canonical, and **hreflang** (`ar`, `en`, `x-default`) for all static pages, each service page (from DB), and each blog post.
- noindex applied to checkout/request/payment/admin/dashboard.
- OG + Twitter tags present. Breadcrumb JSON-LD on all locale pages.
- **Live proof:** per-page `<title>` + canonical + `hreflang` verified on `/services`, blog, service detail; `robots.txt` + `sitemap.xml` (32 URLs, correct) served.

---

## MEDIUM

- **M2. Duplicate-submission idempotency on order create — still open (low risk).** `payments/process` has idempotency-key dedup, but a double-click on "place order" can create two orders. Recommend a client-supplied idempotency key or unique `(userId, orderNumber)` guard.
- **M6. CSP `connect-src`/`script-src` missing payment-provider domains — still open (only relevant once payments go live).** `frame-src` already allows `*.tabby.ai` / `*.tamara.co`, but `connect-src`/`script-src` do not yet list their SDK/API hosts.
- **M5. Performance — re-verify after fixes.** Initial audit measured 2.7 MB JS / 470 KB single chunk; recommend a fresh audit on the fixed build.

---

## LOW / Nits

- **Blog "soft 404":** non-existent blog slugs return the "Article Not Found" UI with HTTP **200** (client-component page). Prefer a true 404.
- **`output: standalone` + `next start` warning** — `next start` warns it does not support `output: standalone`; production deployment should run `node .next/standalone/server.js` (the warning is benign locally but should be addressed at deploy).
- **Public blob URLs remain directly downloadable** if a URL leaks outside the app (see H2).
- Language toggle updates UI state but does not change the URL (no `/en` ⇄ `/ar` link swap) — minor shareability/SEO nit.

---

## Also fixed during this re-audit

- **PWA manifest 404 (blocker for PWA install):** `/manifest.json` was 307-redirecting to `/ar/manifest.json` → HTML 404. Fixed in `src/proxy.ts` (`/manifest.json`, `/site.webmanifest` added to public paths; `.json`/`.webmanifest` treated as static assets). Verified: `/manifest.json` → 200 `application/json; charset=UTF-8` with correct Arabic; `/icons/*` → 200.
- **Audit-log FK violation (LOW):** `writeAuditLog` wrote `userId: 'system'` which violates `audit_logs_userId_fkey` → every system-context audit entry (e.g. webhook.received/failed) was silently dropped. Fixed by making `AuditLog.userId` nullable in the schema + code (`userId: params.userId || null`), applied via `prisma db push` to the live DB, and verified with a real null-user write.

---

## What works well (re-verified live)

- All public pages 200 in both locales (/, services, service detail, checkout, contact, about, faq, offers, blog + blog posts, terms, privacy, track-order, payment success/failed/callback).
- Auth routing verified: `/admin/*` → `/admin/login`, `/dashboard/*` → `/login`, `/request/*` → `/login` (307s), pages render when authenticated.
- Register → 200 (user + token); login → 200 (HMAC-signed `almunjiz-role` cookie); NextAuth session (`__Secure-next-auth.session-token`) obtained via CSRF + credentials callback.
- Admin UI: all pages 200 with session (admin, orders, services, gateways, coupons, reviews, faqs, notifications, audit-logs, banners, customers, employees, invoices, news, offers, pages, payments, permissions, reports, settings); redirect to login without.
- Customer dashboard: dashboard, orders, order detail, invoices, payments, files, notifications, profile, settings, chat — all 200 with session.
- Full order flow: place order (server-priced) → invoice created → file upload (blob URL) → `GET /api/files/[id]` ownership (302 own / 401 anon) → invoice ownership (200 own / 401 anon).
- Rate limiting active on auth, orders, track endpoints.
- DB (Neon Postgres) reachable; server-side DML verified.
- Test data fully cleaned (see below); only real `admin@gmail.com` (SUPER_ADMIN), 18 active services, 2 gateways, 35 settings remain.

---

## Data cleanup performed (before handover)

Per client instruction, all test data was removed from the production DB:

- **Users deleted (3):** `audit5-20260801@test.local`, `ibrahemmr76@gmail.com`, `bsu050@gmail.com` (all no-order accounts; `admin@gmail.com` retained).
- **Orders deleted (3):** `AM-MS6YNG06-E8E3`, `AM-MS6Z9KJ4-9R0X`, `AM-MS9QWCRU-FICA` (+ their invoices, order timelines, notifications).
- **Invoices (3)**, **file attachments (3)** + the 3 uploaded Vercel-blob objects deleted from storage.
- **Notifications (34)**, **audit logs (19)**, **OTP codes (11)**, **contacts (3)** (all test), and the inactive **"Test Service"** removed.
- **Post-cleanup verification:** users = 1 (admin only), orders = 0, invoices = 0, files = 0, notifications = 0, audit logs = 0, OTPs = 0, contacts = 0, services = 18 (real only), gateways = 2, settings = 35. Snapshot of all removed rows kept in `C:\Users\Admin\AppData\Local\Temp\opencode\almunjiz-db-snapshot-before-cleanup.json`.

---

## Remaining before launch (deployment config)

1. **Resend email key** (or SMTP) in env → unblocks OTP, order/invoice/payment emails. (C5)
2. **Payment gateway credentials** for Tabby/Tamara: `secretKey` + `webhookSecret` (PRODUCTION) in the gateway settings/DB → unblocks live payments and webhook confirmation. (C2/C3 wiring already correct)
3. Deploy with the standalone server (`node .next/standalone/server.js`) rather than `next start`.
4. Optional follow-ups: M2 order-create idempotency, M6 CSP payment-SDK hosts, blog true-404, private blob storage.

---

## Remediation summary (initial → now)

| ID | Initial | Now |
|---|---|---|
| C1 Price tampering | 0.01 SAR exploit | ✅ fixed + live-tested |
| C2 Forged webhooks | accepted | ✅ 401 fail-closed + amount check |
| C3 Provider resolution | crashed | ✅ resolves & reaches provider |
| C4 Open CMS APIs | 31 records exposed | ✅ 401 unauthenticated |
| C5 Email key | invalid | ❌ needs valid key (config) |
| H1 Tracking leak | PII public | ✅ token/owner-gated |
| H2 Public blob files | unguarded | ✅ mitigated (auth proxy) |
| H3 Wrong lang/dir | `/en` ar/rtl | ✅ server-side correct |
| H4 No SEO meta | generic | ✅ per-page + hreflang |
| PWA manifest | 404 | ✅ 200 + icons |
| Audit-log FK | dropped rows | ✅ nullable + live-pushed |

**Next step:** supply the two sets of deployment credentials (Resend, payment gateways), redeploy with the standalone server, and run a final smoke test of a live payment + email delivery.
