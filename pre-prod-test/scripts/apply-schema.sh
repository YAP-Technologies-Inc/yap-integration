#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
sql="$here/db/schema.sql"

echo "▶ Applying schema to preprod DB…"
docker compose -f "$here/docker-compose.yml" exec -T db \
  psql -U yapuser -d yapdb -f /dev/stdin < "$sql"
echo "-----Schema applied.-----"
