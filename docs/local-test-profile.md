# Local Test-Profile Workflow

End-to-end checkout smoke test against Stripe / Resend / PriceLabs sandboxes, without touching production credentials.

## Why this exists

The repo's root `.env` is a 1Password-managed named pipe holding **production** keys under the canonical names (`STRIPE_SECRET_KEY=sk_live_…`). A bare `pnpm dev` would charge real cards. This workflow overlays the `*_TEST_*` sandbox values onto the canonical names for a single dev process.

1Password only serves the `.env` pipe to processes it trusts — your own interactive shell works, sandboxed/agent shells get a silent empty read. **Run this from your own terminal.**

## Setup (one-time)

```bash
brew install stripe/stripe-cli/stripe
```

## Run

```bash
scripts/checkout-smoke.sh up       # start stripe listen + dev server with the test overlay
scripts/checkout-smoke.sh status   # show what's running
scripts/checkout-smoke.sh down     # tear it all down
```

`up` sources the 1Password `.env` once (approve the prompt when it appears), derives the `*_TEST_*` values, writes `.env.test-profile.local`, starts `stripe listen`, captures the `whsec_…`, and boots the dev server. If it exits with `Missing STRIPE_TEST_SECRET_KEY …`, you didn't approve the 1Password prompt in time — approve and re-run.

## Exercise + verify

With the environment up, drive a booking through the UI (or POST to `/api/checkout`), then pay with Stripe test card `4242 4242 4242 4242` (any future expiry, any CVC, any ZIP).

Check the log paths `up` printed:

- stripe-listen log shows `checkout.session.completed` with a matching `[200] POST …/api/webhooks/stripe`
- dev log has no `Resend error:` lines (means both confirmation emails fired)
- browser lands on `/booking/success`
