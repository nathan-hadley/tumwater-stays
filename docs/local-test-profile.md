# Local Test-Profile Workflow

This workflow starts local development with test Stripe/Resend/host-email values without editing your default `.env.local` values.

## 1) Create the local test-profile file

```bash
cp env/test-profile.local.example .env.test-profile.local
```

Then fill `.env.test-profile.local` with your real sandbox values.

Required canonical keys:
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `HOST_EMAIL`
- `STRIPE_WEBHOOK_SECRET`

Also required for this repo's runtime env validation:
- `PRICELABS_API_KEY`
- `STUDIO_ICAL_URL`
- `ONEBR_ICAL_URL`

If your test values are stored under non-canonical names (for example `STRIPE_TEST_SECRET_KEY`, `RESEND_TEST_API_KEY`, `HOST_TEST_EMAIL`), copy those values into the canonical runtime keys above.

## 2) Start local dev with the test profile loaded

```bash
./scripts/dev-test-profile.sh
```

What this does:
- Loads `.env.local` first (if present)
- Overlays `.env.test-profile.local` values on top
- Runs `pnpm dev` with the overlaid environment for this process

For webhook parity, run Stripe forwarding in a separate terminal and ensure the resulting `whsec_...` value is the one set in `.env.test-profile.local`:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

## 3) Switch back to normal local env

Stop the server and run the default command:

```bash
pnpm dev
```

No `.env.local` edits or renames are needed.
