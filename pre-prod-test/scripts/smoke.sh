#!/usr/bin/env bash
set -euo pipefail

FE="${FE_HOST:-http://localhost:3001}"
API="${API_HOST:-http://localhost:4001}"
FILE="${ENDPOINTS_FILE:-$(dirname "$0")/endpoints.txt}"

echo "▶ FE health"
fe=$(curl -sfI http://localhost:3001/health >/dev/null 2>&1 && echo 200 || echo 0)
if [ "$fe" != "200" ]; then
  curl -sfI http://localhost:3001/ >/dev/null  
fi

echo "▶ API /api/health"; curl -sfI "$API/api/health" >/dev/null

echo "▶ CORS sanity on /api/health (≤1 ACAO)"
ACAO="$(curl -s -D - -o /dev/null -H "Origin: $FE" "$API/api/health" \
  | awk 'tolower($0) ~ /^access-control-allow-origin:/{print}' | wc -l)"
[ "$ACAO" -le 1 ] || { echo "duplicate ACAO ($ACAO)"; exit 1; }

echo "▶ Route checks ($FILE)…"
while read -r method path expected; do
  [ -z "${method:-}" ] && continue
  case "$method" in \#*) continue ;; esac

  base="$API"
  [[ "$path" == /health ]] && base="$FE"
  code="$(curl -sk -o /dev/null -w "%{http_code}" -X "$method" "$base$path")"

  if [ -n "${expected:-}" ]; then
    ok=1
    IFS=, read -ra allow <<< "$expected"
    for c in "${allow[@]}"; do [ "$code" = "$c" ] && ok=0; done
    [ $ok -eq 0 ] || { echo "$method $path -> $code (wanted: $expected)"; exit 1; }
  else
    [ "$code" -lt 500 ] || { echo "$method $path -> $code"; exit 1; }
  fi
  echo "✓ $method $path -> $code"
done < "$FILE"

echo "-----Smoke passed.------"
