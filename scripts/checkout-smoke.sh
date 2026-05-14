#!/usr/bin/env sh
# Local Stripe checkout smoke test.
#
# The repo's .env is the 1Password "tumwater-stays-dev" environment — sandbox
# keys under the canonical names — so `pnpm dev` is safe by default. This script
# only wires up webhook forwarding: it starts `stripe listen`, captures the
# webhook secret (which rotates every session) into .env.local, and runs the
# dev server.
#
# One-time setup: `brew install stripe/stripe-cli/stripe` then `stripe login`.
#
# Usage:
#   scripts/checkout-smoke.sh up       # start stripe listen + dev server
#   scripts/checkout-smoke.sh down     # tear everything down
#   scripts/checkout-smoke.sh status   # show what's running

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Per-uid 0700 state dir so logs aren't readable by other users.
STATE_DIR="${TMPDIR:-/tmp}/tumwater-checkout-smoke-$(id -u)"
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

STRIPE_LOG="$STATE_DIR/stripe-listen.log"
DEV_LOG="$STATE_DIR/dev.log"
DEV_PORT="${DEV_PORT-3000}"
STRIPE_FORWARD_URL="http://localhost:$DEV_PORT/api/webhooks/stripe"

cmd="${1-up}"

# Free the dev port by killing whatever holds it. SIGTERM, wait, then SIGKILL.
free_dev_port() {
  port_pid="$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)"
  [ -z "$port_pid" ] && return 0
  kill $port_pid 2>/dev/null || true
  i=0
  while [ $i -lt 10 ]; do
    sleep 0.2
    port_pid="$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)"
    [ -z "$port_pid" ] && return 0
    i=$((i + 1))
  done
  kill -9 $port_pid 2>/dev/null || true
}

cmd_down() {
  # Scope by the exact forward URL so we don't kill another repo's stripe listener.
  pkill -f "stripe listen.*--forward-to $STRIPE_FORWARD_URL" 2>/dev/null || true
  free_dev_port
  printf '%s\n' "checkout smoke env stopped."
}

cmd_status() {
  if pgrep -f "stripe listen.*--forward-to $STRIPE_FORWARD_URL" >/dev/null 2>&1; then
    printf 'stripe listen: running (log %s)\n' "$STRIPE_LOG"
  else
    printf 'stripe listen: stopped\n'
  fi
  if [ -n "$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)" ]; then
    printf 'dev server: running on :%s (log %s)\n' "$DEV_PORT" "$DEV_LOG"
  else
    printf 'dev server: stopped\n'
  fi
}

cmd_up() {
  command -v stripe >/dev/null 2>&1 || {
    printf '%s\n' "stripe CLI not found. Install: brew install stripe/stripe-cli/stripe" >&2
    exit 1
  }

  # Tear down any prior run so this is idempotent, then wait for the port to free.
  cmd_down >/dev/null 2>&1 || true
  i=0
  while [ $i -lt 20 ]; do
    [ -z "$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)" ] && break
    sleep 0.2
    i=$((i + 1))
  done

  # stripe listen authenticates via stored `stripe login` creds and defaults to
  # test-mode events.
  : > "$STRIPE_LOG"
  chmod 600 "$STRIPE_LOG"
  stripe listen --forward-to "$STRIPE_FORWARD_URL" > "$STRIPE_LOG" 2>&1 &

  whsec=""
  i=0
  while [ $i -lt 20 ]; do
    sleep 1
    whsec="$(grep -o 'whsec_[a-zA-Z0-9]*' "$STRIPE_LOG" 2>/dev/null | head -1 || true)"
    [ -n "$whsec" ] && break
    i=$((i + 1))
  done
  if [ -z "$whsec" ]; then
    printf '%s\n' "stripe listen did not emit a webhook secret. Log:" >&2
    cat "$STRIPE_LOG" >&2
    printf '%s\n' "If this says you're not logged in, run: stripe login" >&2
    cmd_down >/dev/null 2>&1 || true
    exit 1
  fi

  # The webhook secret rotates every `stripe listen` session, so it can't live in
  # 1Password. Write just this one var to .env.local — gitignored, and Next.js
  # loads it over .env.
  if [ -f .env.local ] && grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local; then
    awk -v whsec="$whsec" '
      /^STRIPE_WEBHOOK_SECRET=/ { print "STRIPE_WEBHOOK_SECRET=" whsec; next }
      { print }
    ' .env.local > .env.local.tmp
    mv .env.local.tmp .env.local
  else
    printf 'STRIPE_WEBHOOK_SECRET=%s\n' "$whsec" >> .env.local
  fi
  chmod 600 .env.local

  # pnpm dev reads .env (the 1Password test environment). 1Password will prompt
  # once for approval — that's the only human step.
  : > "$DEV_LOG"
  chmod 600 "$DEV_LOG"
  pnpm dev > "$DEV_LOG" 2>&1 &

  i=0
  while [ $i -lt 30 ]; do
    if curl -sf -o /dev/null "http://localhost:$DEV_PORT" 2>/dev/null; then
      printf '%s\n' "checkout smoke env ready"
      printf '  dev:     http://localhost:%s (log: %s)\n' "$DEV_PORT" "$DEV_LOG"
      printf '  stripe:  forwarding to %s (log: %s)\n' "$STRIPE_FORWARD_URL" "$STRIPE_LOG"
      printf '  whsec:   %s\n' "$whsec"
      printf '%s\n' "stop with: scripts/checkout-smoke.sh down"
      exit 0
    fi
    sleep 1
    i=$((i + 1))
  done

  printf '%s\n' "dev server did not become ready in time. Log:" >&2
  tail -40 "$DEV_LOG" >&2
  cmd_down >/dev/null 2>&1 || true
  exit 1
}

case "$cmd" in
  up) cmd_up ;;
  down) cmd_down ;;
  status) cmd_status ;;
  *)
    printf '%s\n' "Usage: $0 [up|down|status]" >&2
    exit 2
    ;;
esac
