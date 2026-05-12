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

Use sandbox/test credentials only. This is separate from CI/unit tests and validates end-to-end integrations with PriceLabs, Stripe, and Resend in non-production mode.

### Required local env vars

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `HOST_EMAIL`
- `PRICELABS_API_KEY`
- `STUDIO_ICAL_URL`
- `ONEBR_ICAL_URL`

### Start the app

```bash
pnpm dev
```

### Start Stripe webhook forwarding (separate shell)

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

Use the printed `whsec_...` value as `STRIPE_WEBHOOK_SECRET`.

### Checkout smoke (PriceLabs + Stripe)

1. Go through booking in the UI (or `POST /api/checkout`) with valid unit, dates, and guest info.
2. Open the returned Stripe Checkout URL.
3. Pay with Stripe test card `4242 4242 4242 4242` (any future expiry/CVC).

### Webhook + email smoke (Stripe webhook + Resend)

After successful test payment, Stripe sends `checkout.session.completed`.

`/api/webhooks/stripe` should verify signature and send:

- guest confirmation email
- host notification email (`HOST_EMAIL`)

### Contact smoke (Resend direct)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "content-type: application/json" \
  -d '{"name":"Smoke Tester","email":"delivered@resend.dev","message":"API smoke test","dates":"2026-06-10 to 2026-06-12"}'
```

Expected response: `{"success":true}` and delivery in your test inbox flow.

### Env naming note

If only `*_TEST_*` env names are set in Vercel, duplicate them to the canonical runtime names above.

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
