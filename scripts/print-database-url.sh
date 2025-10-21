#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${HOME}/Documents/dev/credentials-keychain.sh" ]]; then
  # shellcheck source=/dev/null
  source "${HOME}/Documents/dev/credentials-keychain.sh"
fi

if [[ -z "${SUPABASE_PROJECT_ID:-}" || -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  cat <<'EOF' >&2
Missing SUPABASE_PROJECT_ID or SUPABASE_DB_PASSWORD.
Run `source ~/Documents/dev/credentials-keychain.sh` and ensure both secrets exist in the keychain.
EOF
  exit 1
fi

cat <<EOF
DATABASE_URL=postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres?sslmode=require
EOF
