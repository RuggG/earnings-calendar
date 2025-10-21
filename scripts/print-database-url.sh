#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${HOME}/Documents/dev/credentials-keychain.sh" ]]; then
  # shellcheck source=/dev/null
  source "${HOME}/Documents/dev/credentials-keychain.sh"
fi

if [[ -n "${DATABASE_URL:-}" ]]; then
  cat <<EOF
DATABASE_URL=${DATABASE_URL}
EOF
  exit 0
fi

if [[ -z "${SUPABASE_PROJECT_ID:-}" || -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  cat <<'EOF' >&2
Missing SUPABASE_PROJECT_ID or SUPABASE_DB_PASSWORD.
Run `source ~/Documents/dev/credentials-keychain.sh` and ensure both secrets exist in the keychain.
EOF
  exit 1
fi

ENCODED_PASSWORD="$(
  python3 - <<'PYCODE'
import os, urllib.parse
password = os.environ.get("SUPABASE_DB_PASSWORD", "")
print(urllib.parse.quote(password, safe=""))
PYCODE
)"

cat <<EOF
DATABASE_URL=postgresql://postgres:${ENCODED_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres?sslmode=no-verify
EOF
