#!/usr/bin/env sh
# Bring up (or tear down) the local checkout smoke-test environment:
# scaffolds .env.test-profile.local from 1Password's .env, starts stripe listen,
# captures the webhook secret, and starts the dev server with the test overlay.
#
# Usage:
#   scripts/checkout-smoke.sh up       # bring everything up; idempotent
#   scripts/checkout-smoke.sh down     # tear everything down
#   scripts/checkout-smoke.sh status   # show what's running

set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Per-uid 0700 state dir so logs (whsec, sourced secrets on errors) aren't readable by others.
STATE_DIR="${TMPDIR:-/tmp}/tumwater-checkout-smoke-$(id -u)"
mkdir -p "$STATE_DIR"
chmod 700 "$STATE_DIR"

STRIPE_PID_FILE="$STATE_DIR/stripe-listen.pid"
STRIPE_LOG="$STATE_DIR/stripe-listen.log"
DEV_LOG="$STATE_DIR/dev.log"
DEV_PORT="${DEV_PORT-3000}"
STRIPE_FORWARD_URL="http://localhost:$DEV_PORT/api/webhooks/stripe"

cmd="${1-up}"

kill_pidfile() {
  pf="$1"
  [ -f "$pf" ] || return 0
  pid="$(cat "$pf" 2>/dev/null || true)"
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
  fi
  rm -f "$pf"
}

# Free the dev port by killing whatever holds it. Tries SIGTERM, waits, then SIGKILL.
# We don't track a PID for the dev server because dev-test-profile.sh exec's `pnpm dev`,
# which then spawns `next dev` as a grandchild — a wrapper-shell PID would miss the real process.
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
  kill_pidfile "$STRIPE_PID_FILE"
  # Scope by the exact forward URL so we don't kill another repo's stripe listener.
  pkill -f "stripe listen.*--forward-to $STRIPE_FORWARD_URL" 2>/dev/null || true

  free_dev_port

  printf '%s\n' "checkout smoke env stopped."
}

cmd_status() {
  if [ -f "$STRIPE_PID_FILE" ] && kill -0 "$(cat "$STRIPE_PID_FILE")" 2>/dev/null; then
    printf 'stripe listen: running (pid %s, log %s)\n' "$(cat "$STRIPE_PID_FILE")" "$STRIPE_LOG"
  else
    printf 'stripe listen: stopped\n'
  fi
  port_pid="$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)"
  if [ -n "$port_pid" ]; then
    printf 'dev server: running on :%s (pid %s, log %s)\n' "$DEV_PORT" "$port_pid" "$DEV_LOG"
  else
    printf 'dev server: stopped\n'
  fi
}

require_var() {
  var_name="$1"
  eval "var_value=\${$var_name-}"
  if [ -z "$var_value" ]; then
    printf '%s\n' "Missing $var_name after sourcing .env." >&2
    printf '%s\n' "  The 1Password local-env-file is a named pipe; 1Password needs your approval each time a process opens it." >&2
    printf '%s\n' "  Click the 1Password notification (or open the linked item) and re-run this command." >&2
    exit 1
  fi
}

# Guard against the LIVE-keys-under-canonical-names trap: refuse to scaffold if the vault item
# was edited so that *_TEST_* slots hold non-test values.
require_test_prefix() {
  var_name="$1"
  expected="$2"
  eval "val=\${$var_name-}"
  case "$val" in
    "$expected"*) ;;
    *)
      printf '%s\n' "Refusing to continue: $var_name does not start with '$expected'." >&2
      printf '%s\n' "  Check the 1Password vault item — a live key may have been pasted into the test slot." >&2
      exit 1
      ;;
  esac
}

cmd_up() {
  command -v stripe >/dev/null 2>&1 || {
    printf '%s\n' "stripe CLI not found. Install: brew install stripe/stripe-cli/stripe" >&2
    exit 1
  }
  # .env is typically a 1Password-managed named pipe, so use -e (any file type), not -f.
  [ -e .env ] || {
    printf '%s\n' ".env missing — open 1Password desktop and link the env item, or generate one manually." >&2
    exit 1
  }

  # Load the 1Password-generated .env so we can read *_TEST_* values.
  # The pipe drains on this single open; the user must approve in 1Password each time.
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a

  require_var STRIPE_TEST_SECRET_KEY
  require_var NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
  require_var RESEND_TEST_API_KEY
  require_var HOST_TEST_EMAIL
  require_var PRICELABS_API_KEY
  require_var STUDIO_ICAL_URL
  require_var ONEBR_ICAL_URL

  require_test_prefix STRIPE_TEST_SECRET_KEY "sk_test_"
  require_test_prefix NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY "pk_test_"

  # Tear down any prior run so this is idempotent.
  cmd_down >/dev/null 2>&1 || true

  # Wait for the dev port to be free before launching anything new.
  i=0
  while [ $i -lt 20 ]; do
    [ -z "$(lsof -ti tcp:"$DEV_PORT" 2>/dev/null || true)" ] && break
    sleep 0.2
    i=$((i + 1))
  done

  # Scaffold .env.test-profile.local if missing. If the user has customised it,
  # leave their content alone (we only refresh STRIPE_WEBHOOK_SECRET below).
  if [ ! -f .env.test-profile.local ]; then
    (
      umask 077
      cat > .env.test-profile.local <<EOF
# Generated by scripts/checkout-smoke.sh from .env on $(date -u +%Y-%m-%dT%H:%M:%SZ)
STRIPE_SECRET_KEY=$STRIPE_TEST_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_TEST_PUBLISHABLE_KEY
RESEND_API_KEY=$RESEND_TEST_API_KEY
HOST_EMAIL=$HOST_TEST_EMAIL
PRICELABS_API_KEY=$PRICELABS_API_KEY
STUDIO_ICAL_URL=$STUDIO_ICAL_URL
ONEBR_ICAL_URL=$ONEBR_ICAL_URL
NEXT_PUBLIC_SITE_URL=http://localhost:$DEV_PORT
STRIPE_WEBHOOK_SECRET=whsec_pending
EOF
    )
    chmod 600 .env.test-profile.local
    printf '%s\n' "Wrote .env.test-profile.local"
  fi

  # Pass the API key via env (STRIPE_API_KEY is honored by the stripe CLI) so it never
  # appears on argv where `ps` could leak it.
  : > "$STRIPE_LOG"
  chmod 600 "$STRIPE_LOG"
  STRIPE_API_KEY="$STRIPE_TEST_SECRET_KEY" stripe listen \
    --forward-to "$STRIPE_FORWARD_URL" \
    > "$STRIPE_LOG" 2>&1 &
  printf '%s\n' "$!" > "$STRIPE_PID_FILE"

  whsec=""
  i=0
  while [ $i -lt 20 ]; do
    sleep 1
    whsec="$(grep -o "whsec_[a-zA-Z0-9]*" "$STRIPE_LOG" 2>/dev/null | head -1 || true)"
    [ -n "$whsec" ] && break
    i=$((i + 1))
  done
  if [ -z "$whsec" ]; then
    printf '%s\n' "stripe listen did not emit a webhook secret. Log:" >&2
    cat "$STRIPE_LOG" >&2
    cmd_down >/dev/null 2>&1 || true
    exit 1
  fi

  # Refresh (or append) STRIPE_WEBHOOK_SECRET in the env file with the new whsec.
  if grep -q '^STRIPE_WEBHOOK_SECRET=' .env.test-profile.local; then
    awk -v whsec="$whsec" '
      /^STRIPE_WEBHOOK_SECRET=/ { print "STRIPE_WEBHOOK_SECRET=" whsec; next }
      { print }
    ' .env.test-profile.local > .env.test-profile.local.tmp
    mv .env.test-profile.local.tmp .env.test-profile.local
  else
    printf 'STRIPE_WEBHOOK_SECRET=%s\n' "$whsec" >> .env.test-profile.local
  fi
  chmod 600 .env.test-profile.local

  : > "$DEV_LOG"
  chmod 600 "$DEV_LOG"
  ./scripts/dev-test-profile.sh > "$DEV_LOG" 2>&1 &

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
