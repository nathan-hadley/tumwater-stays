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

> ⚠️ A bare `pnpm dev` uses the **production** keys in the root `.env` and will charge real cards. Use `scripts/checkout-smoke.sh`.

Run from your own terminal — 1Password only serves the `.env` pipe to your interactive shell, not sandboxed/agent shells:

```bash
brew install stripe/stripe-cli/stripe   # one-time
scripts/checkout-smoke.sh up            # approve the 1Password prompt when it appears
# drive a booking through the UI; pay with Stripe test card 4242 4242 4242 4242
scripts/checkout-smoke.sh down
```

`up` writes `.env.test-profile.local` from the `*_TEST_*` values, starts `stripe listen`, and boots the dev server with the test overlay. Verify in the log paths it prints: `checkout.session.completed [200]` in the stripe log, no `Resend error:` in the dev log.

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
