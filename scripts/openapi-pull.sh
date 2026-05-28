#!/usr/bin/env bash
# Fetches the latest OpenAPI v3 spec from the running Go backend and
# saves it to openapi.json at the project root.
# Run this whenever the backend schema changes, then follow up with:
#   pnpm openapi:gen

set -euo pipefail

BASE_URL="${API_URL:-http://localhost:8080}"
OUT="$(dirname "$0")/../openapi.json"

echo "Pulling spec from $BASE_URL/openapi.json ..."
curl -sf "$BASE_URL/openapi.json" -o "$OUT"
echo "Saved to openapi.json — run 'pnpm openapi:gen' to regenerate types."
