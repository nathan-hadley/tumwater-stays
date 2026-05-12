#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT_DIR"

PROFILE_FILE=".env.test-profile.local"

if [ ! -f "$PROFILE_FILE" ]; then
  printf '%s\n' "Missing $PROFILE_FILE. Copy env/test-profile.local.example and fill your test values." >&2
  exit 1
fi

set -a
if [ -f ".env.local" ]; then
  . ".env.local"
fi
. "$PROFILE_FILE"
set +a

require_var() {
  var_name="$1"
  eval "var_value=\${$var_name-}"
  if [ -z "$var_value" ]; then
    printf '%s\n' "Missing required env var after profile load: $var_name" >&2
    exit 1
  fi
}

require_var STRIPE_SECRET_KEY
require_var RESEND_API_KEY
require_var HOST_EMAIL
require_var PRICELABS_API_KEY
require_var STUDIO_ICAL_URL
require_var ONEBR_ICAL_URL
require_var STRIPE_WEBHOOK_SECRET

printf '%s\n' "Loaded $PROFILE_FILE with canonical runtime vars for test profile: STRIPE_SECRET_KEY, RESEND_API_KEY, HOST_EMAIL."

exec pnpm dev
