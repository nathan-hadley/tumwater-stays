This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, copy the example env file and fill in the required values:

```bash
cp .env.example .env.local
```

See [`.env.example`](./.env.example) for the full list of required and optional variables. Server-side variables are validated at build/start time via `src/lib/env.ts`; missing required vars will fail the build with a clear error.

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Real-API Smoke Test (Sandbox Only)

End-to-end booking flow (PriceLabs → Stripe Checkout → webhook → Resend emails) against sandbox credentials. Separate from CI/unit tests.

The repo's `.env` is the 1Password **`tumwater-stays-test`** environment — sandbox keys under the canonical names — so `pnpm dev` is safe by default. Production keys live in Vercel, not locally.

One-time setup:

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Run the smoke test from your own terminal (1Password only serves the `.env` pipe to your interactive shell, not agent/sandboxed shells):

```bash
scripts/checkout-smoke.sh up            # approve the 1Password prompt when it appears
# drive a booking through the UI; pay with Stripe test card 4242 4242 4242 4242
scripts/checkout-smoke.sh down
```

`up` starts `stripe listen`, writes the rotating webhook secret to `.env.local`, and boots `pnpm dev`. Verify in the log paths it prints: `checkout.session.completed [200]` in the stripe log, no `Resend error:` in the dev log.

> ⚠️ The `tumwater-stays-test` 1Password environment must contain only `sk_test_` / `pk_test_` keys. If the production environment ever gets linked to `.env`, `pnpm dev` will use live keys and charge real cards.

### Contact smoke (Resend direct)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "content-type: application/json" \
  -d '{"name":"Smoke Tester","email":"delivered@resend.dev","message":"API smoke test","dates":"2026-06-10 to 2026-06-12"}'
```

Expected: `{"success":true}` and delivery via your test Resend inbox.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
