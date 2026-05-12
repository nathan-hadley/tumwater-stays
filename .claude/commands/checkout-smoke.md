---
description: Run the full Stripe checkout smoke test against sandbox credentials, end-to-end with browser drive + cleanup.
---

# Checkout smoke test

Drive the booking → Stripe Checkout → webhook → email flow end-to-end against **sandbox** credentials, then tear everything down. Use this to verify the booking path after Stripe/PriceLabs/Resend/webhook changes.

You MUST follow every step. Do not skip the verification or teardown steps even on success.

## 0. Prerequisites

- The repo's `.env` is populated by the 1Password desktop app and contains `STRIPE_TEST_SECRET_KEY`, `RESEND_TEST_API_KEY`, `HOST_TEST_EMAIL`, etc.
- `stripe` CLI is installed (`brew install stripe/stripe-cli/stripe`).
- Playwright MCP browser tools are available for driving the Stripe Checkout page.

If `stripe` is not on PATH, ask the user to install it before continuing.

## 1. Bring up the environment

Run `scripts/checkout-smoke.sh up`. The script is idempotent: it scaffolds `.env.test-profile.local` from `.env`, starts `stripe listen`, captures `whsec_…`, writes it back to the env file, and starts the dev server with the test overlay.

**Human-in-the-loop:** the repo's `.env` is a 1Password named pipe. The user must approve the 1Password prompt (biometric / desktop notification) the moment the script sources `.env`. If the script exits with `Missing STRIPE_TEST_SECRET_KEY …`, tell the user to approve in 1Password and then re-run — do not retry without involving them.

On success it prints `checkout smoke env ready` followed by the dev URL, stripe forward URL, log paths, and the `whsec_…` value. **Capture those log paths** — you'll need them in step 4. If it fails for any other reason, surface the error and stop — do not try to claim success.

## 2. Create a Checkout session

POST to the local checkout API with valid test data:

```bash
curl -sS -X POST http://localhost:3000/api/checkout \
  -H "content-type: application/json" \
  -d '{
    "unit":"studio",
    "checkIn":"<DATE+60>",
    "checkOut":"<DATE+62>",
    "guests":{"adults":2,"children":0},
    "guestName":"Smoke Tester",
    "guestEmail":"<user-email-from-HOST_TEST_EMAIL-or-asked>"
  }'
```

Use dates ~60 days out so PriceLabs returns rates. Extract the `url` from the response. If the response is not 200 or has no `url`, dump the dev server log (`/tmp/tumwater-dev.log`) and stop.

## 3. Drive the Stripe Checkout page

Use the Playwright MCP browser tools to:

1. Navigate to the returned Stripe Checkout URL. If this is the second run in the same session, close the existing browser context first (`browser_close`, then `browser_navigate`) so Stripe's localStorage doesn't replay the previous AI-disclosure state.
2. Check the "I am an AI agent acting on behalf of someone else" disclosure (use `browser_evaluate` to scroll-and-click if the checkbox is out of viewport).
3. Fill the form: card `4242 4242 4242 4242`, expiry `12 / 34`, CVC `123`, cardholder `Smoke Tester`, country `United States`, ZIP `98826`.
4. Click "Pay".
5. Wait for the page to redirect to `http://localhost:3000/booking/success?session_id=cs_test_…` showing **Booking Confirmed!**

If the page does not redirect to `/booking/success` within ~15s, screenshot/snapshot the Stripe page, dump the logs, and stop.

## 4. Verify webhook + emails

Read the log paths printed by `scripts/checkout-smoke.sh up` in step 1 (they live under `$TMPDIR/tumwater-checkout-smoke-<uid>/`):

- The stripe-listen log MUST contain `checkout.session.completed` with a matching `[200] POST http://localhost:3000/api/webhooks/stripe`.
- The dev log MUST NOT contain `Resend error:` lines for the test run (this is the exact prefix used by `src/app/api/webhooks/stripe/route.ts` when `resend.emails.send` throws). If the webhook returns 500 or that prefix appears, mark the run as FAILED and surface the relevant log lines.

Both guest and host emails go to the addresses configured in `.env.test-profile.local` — note in your report that delivery should be visually confirmed by the user in their inbox; the local logs only prove Resend accepted the API call.

## 5. Tear down

Close the Playwright browser, then run `scripts/checkout-smoke.sh down`. Verify with `scripts/checkout-smoke.sh status` that both processes are stopped.

## 6. Report

Summarise to the user:
- PASS/FAIL with the specific evidence (HTTP statuses, webhook event id, presence/absence of `Resend error:`).
- Which dates and amounts were exercised.
- Reminder to check guest + host inboxes for the two confirmation emails.

If any step failed, include the relevant log excerpt and stop here — do not retry blindly.
