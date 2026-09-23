# Smart Budget Planner

**Your Money. Your Plan. Your Future.**

A commercial personal-finance SaaS — a smarter way to organize income, expenses, savings, bills, and financial goals in one beautiful budgeting workspace. Built with Next.js 15, TypeScript, Tailwind CSS v4, MongoDB (Mongoose), and Auth.js, monetized through Lemon Squeezy prepaid access periods.

## Features

- **Dashboard** — live stat cards with month-over-month trends, income vs. expenses, spending breakdown, budget progress, cash-flow and savings charts. All computed from real data — nothing hard-coded.
- **Transactions** — income / expense / savings / bill / debt records with filters, search, pagination, and full CRUD.
- **Budgets** — per-category monthly limits with under / near / over status; one-click copy from last month.
- **Bills** — recurring bills with frequencies and reminders; marking paid records the transaction and advances the schedule.
- **Calendar** — month grid combining bill due dates (auto-generated) with custom events.
- **Savings goals** — targets, contributions, deadlines, projected completion.
- **Debt tracking** — balances, payments, and a debt-reduction trend chart.
- **Priorities** — spending rolled up by Essential → Avoidable tiers.
- **Reports** — any period, category/budget/cash-flow views, CSV export.
- **Settings** — 8 currencies, 2 date formats, light/dark/system theme, custom categories, notification controls.
- **Notifications** — deduplicated bill-due, budget-alert, and savings-milestone alerts.
- **Marketing site** — landing, features, pricing, FAQ.

## Monetization model

- New accounts get a **free trial** (`TRIAL_DAYS`, default 14) — full access, no card.
- Access is **prepaid, never a subscription**: 1 Year or 2 Years via Lemon Squeezy. No auto-renewal, no stored cards.
- **Renewals extend from the current expiry date** — users never lose paid days.
- Payment confirmation comes **only** from a signature-verified Lemon Squeezy webhook — never from the browser or URL parameters. Webhook processing is idempotent (unique index on `providerOrderId`).
- On expiry the workspace pauses with a restore screen; **data is never deleted**.

Until Lemon Squeezy credentials are configured, purchase buttons show a friendly "checkout not configured" error — nothing is ever faked.

## Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster (or any MongoDB URI)
- (Optional) A Lemon Squeezy store for payments

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env — at minimum set MONGODB_URI and AUTH_SECRET

# 3. Generate an auth secret if you don't have one
openssl rand -base64 32   # paste into AUTH_SECRET

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000, register an account, and complete the onboarding wizard (choose **Start with sample data** to explore with a realistic example month).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `AUTH_SECRET` | ✅ | Auth.js session signing secret |
| `AUTH_TRUST_HOST` | — | Set `true` for local/dev |
| `NEXT_PUBLIC_APP_URL` | — | Base URL used for checkout redirects |
| `TRIAL_DAYS` | — | Free trial length (default `14`) |
| `NEXT_PUBLIC_ONE_YEAR_PRICE` | — | Displayed 1-year price (default `29`) |
| `NEXT_PUBLIC_TWO_YEAR_PRICE` | — | Displayed 2-year price (default `49`) |
| `LEMON_SQUEEZY_API_KEY` | — | Enables checkout creation |
| `LEMON_SQUEEZY_STORE_ID` | — | Your LS store id |
| `LEMON_SQUEEZY_ONE_YEAR_VARIANT_ID` | — | Variant for the 1-year plan |
| `LEMON_SQUEEZY_TWO_YEAR_VARIANT_ID` | — | Variant for the 2-year plan |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | — | HMAC-SHA256 secret for webhook verification |
| `NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_MODE` | — | `test` to create test-mode checkouts |
| `RESEND_API_KEY` | — | Enables password-reset emails |
| `RESEND_FROM` | — | Sender shown on those emails, e.g. `Smart Budget Planner <noreply@yourdomain.com>` |

Never commit `.env` — only `.env.example` belongs in version control.

### Optional integrations and what happens without them

Both integrations are **config-ready**: fully built, switched on by environment variables, and honest about their state when the variables are missing. Nothing is ever faked.

| Integration | Variables | Without them |
|---|---|---|
| Lemon Squeezy | `LEMON_SQUEEZY_*` | Purchase buttons return a "checkout not configured" message. The free trial still works. |
| Password reset email (Resend) | `RESEND_API_KEY`, `RESEND_FROM` | The forgot-password page says email isn't configured and points to support, instead of claiming a message was sent. |

### Password reset

`/forgot-password` mints a single-use token, stores only its SHA-256 hash, and emails a `/reset-password?token=…` link that expires in **1 hour**. Redeeming it marks the token used and deletes any other outstanding link for that account. The response is identical whether or not the address is registered, so the form can't be used to discover who has an account.

### Demo account / seed data

```bash
npm run seed
```

Creates (or resets) an isolated demo user — **demo@smartbudgetplanner.app / demo1234** — with six months of realistic transactions, bills, goals, debt, and budgets. The demo user is flagged `isDemo` and shows a "Demo Mode" banner.

### Enabling payments (Lemon Squeezy)

1. Create a store and two products (or one product with two variants) in Lemon Squeezy — 1 Year and 2 Years.
2. Copy the API key, store id, and variant ids into `.env`.
3. In the Lemon Squeezy dashboard, add a webhook pointing at `https://your-domain.com/api/webhooks/lemonsqueezy` with the **Order created** and **Order refunded** events, and set the same signing secret as `LEMON_SQUEEZY_WEBHOOK_SECRET`.
4. Pricing shown on the site comes from `NEXT_PUBLIC_ONE_YEAR_PRICE` / `NEXT_PUBLIC_TWO_YEAR_PRICE` — keep them in sync with your variant prices.

## Deploy to Vercel

1. Push the repo to GitHub (Vercel installs dependencies and builds with `npm run build`).
2. Import the project in Vercel and add all environment variables (Production + Preview).
3. Set `NEXT_PUBLIC_APP_URL` to your production URL and add it to the allowed redirect origins.
4. Point the Lemon Squeezy webhook at your production URL.
5. Whitelist Vercel's egress IPs in MongoDB Atlas (or allow `0.0.0.0/0` with a strong password + SCRAM).

## Security model

- User identity is **always derived server-side** from the verified JWT session; a `userId` sent by the browser is never trusted.
- Every server action and API route verifies ownership (`{_id, userId}`) before reading or writing.
- `src/middleware.ts` redirects signed-out visitors to `/login?callbackUrl=…` (and signed-in users away from the auth pages). It is a **convenience layer only** — `requireUser()` / `requireOnboardedUser()` inside each page and action are authoritative. Post-login redirects accept same-site relative paths only, so the login form can't become an open redirect.
- Zod validation runs on the client **and** the server.
- Lemon Squeezy credentials and MongoDB credentials are server-only; webhook payloads are verified with a timing-safe HMAC-SHA256 comparison of the raw request body, and invalid signatures get `401`.
- Passwords are hashed with bcrypt (cost 12) and the hash is `select: false`, so it is only ever loaded by the two places that verify it; raw database errors are never surfaced to users.
- Password-reset tokens are stored as SHA-256 hashes, expire in 1 hour, are single-use, and are removed by a TTL index.

## Project structure

```
src/
├── app/
│   ├── (marketing)/        # /, /pricing, /features, /faq
│   ├── (auth)/             # /login, /register, /forgot-password
│   ├── (app)/              # authenticated workspace (10 sections)
│   ├── onboarding/         # 6-step setup wizard
│   ├── checkout/           # success / cancel
│   ├── settings/billing/   # billing & purchase history
│   └── api/                # auth, checkout, webhook, access, reports export
├── actions/                # server actions (transactions, budgets, bills, ...)
├── services/               # analytics, access, billing, notifications, seed
├── models/                 # 11 Mongoose models, all scoped by userId
├── lib/                    # mongodb, auth, mailer, lemonsqueezy, validations, utils
├── components/             # ui/, layout/, dashboard/, charts/, forms, ...
└── types/
scripts/seed.ts             # demo account seeder
```
